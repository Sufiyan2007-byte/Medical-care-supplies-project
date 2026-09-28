import prisma from '../lib/prisma.js';
import { sendEmail } from '../services/emailService.js';
import {
  generateCustomerOrderEmail,
  generateOwnerOrderEmail,
} from '../services/templates/orderEmailTemplates.js';

const VAT_RATE = 0.15;
const PAYMENT_METHODS = ['cod', 'bank_transfer'];
const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const MAX_LINES = 100;
const MAX_QTY = 1000;

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function bankDetails() {
  const { BANK_NAME, BANK_ACCOUNT_NAME, BANK_IBAN } = process.env;
  if (!BANK_NAME && !BANK_ACCOUNT_NAME && !BANK_IBAN) return null;
  return { bank_name: BANK_NAME || '', account_name: BANK_ACCOUNT_NAME || '', iban: BANK_IBAN || '' };
}

function newOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `MCS-${ymd}-${Math.floor(10000 + Math.random() * 90000)}`;
}

/** Shape an order for the API (Decimals → numbers). */
function serialize(o) {
  const num = (v) => (v == null ? null : Number(v));
  return {
    id: o.id,
    order_number: o.order_number,
    status: o.status,
    payment_method: o.payment_method,
    customer_name: o.customer_name,
    customer_email: o.customer_email,
    customer_phone: o.customer_phone,
    city: o.city,
    address: o.address,
    notes: o.notes,
    subtotal: num(o.subtotal),
    vat: num(o.vat),
    total: num(o.total),
    needs_quote: o.needs_quote,
    created_at: o.created_at,
    items: (o.items || []).map((i) => ({
      id: i.id, sku: i.sku, name: i.name, quantity: i.quantity,
      unit_price: num(i.unit_price), line_total: num(i.line_total),
    })),
  };
}

/**
 * POST /api/orders
 * Prices are ALWAYS taken from the database (matched by SKU). Any price sent by the browser is ignored,
 * so a customer can't change what they pay. Items with no database price are marked "price on request"
 * and the order is flagged needs_quote so the shop confirms the final amount.
 */
export async function createOrder(req, res) {
  try {
    const b = req.body || {};

    // Honeypot
    if (b.website) return res.status(201).json({ success: true, order: { order_number: 'MCS-0' } });

    const customer_name = clean(b.name, 120);
    const customer_email = clean(b.email, 160).toLowerCase();
    const customer_phone = clean(b.phone, 30);
    const city = clean(b.city, 80);
    const address = clean(b.address, 400);
    const notes = clean(b.notes, 1000) || null;
    const payment_method = b.payment_method;
    const lang = b.lang === 'en' ? 'en' : 'ar';

    const errors = {};
    if (customer_name.length < 2) errors.name = 'Name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) errors.email = 'A valid email is required.';
    if (!/^[+\d][\d\s-]{6,}$/.test(customer_phone)) errors.phone = 'A valid phone number is required.';
    if (!city) errors.city = 'City is required.';
    if (address.length < 5) errors.address = 'Address is required.';
    if (!PAYMENT_METHODS.includes(payment_method)) errors.payment_method = 'Choose a payment method.';
    if (!Array.isArray(b.items) || b.items.length === 0) errors.items = 'Your cart is empty.';
    else if (b.items.length > MAX_LINES) errors.items = 'Too many items in one order.';
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'Bad Request', message: Object.values(errors)[0], errors });
    }

    // Merge duplicate lines, validate quantities
    const lines = new Map();
    for (const raw of b.items) {
      const name = clean(raw?.name, 200);
      const sku = clean(raw?.sku, 80) || null;
      const quantity = Math.floor(Number(raw?.quantity));
      if (!name || !Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QTY) {
        return res.status(400).json({ error: 'Bad Request', message: 'Invalid item in cart.' });
      }
      const key = sku || `name:${name}`;
      const prev = lines.get(key);
      if (prev) prev.quantity += quantity;
      else lines.set(key, { name, sku, quantity });
    }
    const lineList = [...lines.values()];

    // Look up real prices / stock by SKU
    const skus = lineList.map((l) => l.sku).filter(Boolean);
    const products = skus.length
      ? await prisma.product.findMany({ where: { sku: { in: skus } }, select: { id: true, sku: true, price: true, stock: true } })
      : [];
    const bySku = new Map(products.map((p) => [p.sku, p]));

    let subtotal = 0;
    let pricedLines = 0;
    const itemData = lineList.map((l) => {
      const p = l.sku ? bySku.get(l.sku) : null;
      const unit = p?.price != null ? Number(p.price) : null;
      const lineTotal = unit != null ? round2(unit * l.quantity) : null;
      if (lineTotal != null) { subtotal += lineTotal; pricedLines += 1; }
      return { product_id: p?.id ?? null, sku: l.sku, name: l.name, quantity: l.quantity, unit_price: unit, line_total: lineTotal, _stock: p?.stock ?? null };
    });

    // Stock check for tracked products
    for (const it of itemData) {
      if (it._stock != null && it.quantity > it._stock) {
        return res.status(409).json({
          error: 'Conflict',
          message: `Only ${it._stock} left in stock for "${it.name}".`,
        });
      }
    }

    const needs_quote = pricedLines < itemData.length;
    const hasTotals = pricedLines > 0;
    subtotal = round2(subtotal);
    const vat = hasTotals ? round2(subtotal * VAT_RATE) : null;
    const total = hasTotals ? round2(subtotal + vat) : null;

    let order;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        order = await prisma.$transaction(async (tx) => {
          const created = await tx.order.create({
            data: {
              order_number: newOrderNumber(),
              user_id: req.user?.id ?? null,
              customer_name, customer_email, customer_phone, city, address, notes,
              payment_method, lang, needs_quote,
              subtotal: hasTotals ? subtotal : null,
              vat, total,
              items: { create: itemData.map(({ _stock, ...rest }) => rest) },
            },
            include: { items: true },
          });
          for (const it of itemData) {
            if (it.product_id && it._stock != null) {
              await tx.product.update({ where: { id: it.product_id }, data: { stock: { decrement: it.quantity } } });
            }
          }
          return created;
        });
        break;
      } catch (e) {
        if (e.code === 'P2002' && attempt < 3) continue; // order number collision — retry
        throw e;
      }
    }

    // Emails (never fail the order because of email problems)
    const plain = serialize(order);
    const emailOrder = { ...plain, lang, items: order.items.map((i) => ({ ...i })) };
    const bank = bankDetails();
    const ownerTo = process.env.ORDER_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;

    sendEmail(
      customer_email,
      lang === 'ar' ? `تأكيد استلام الطلب ${order.order_number}` : `Order received ${order.order_number}`,
      generateCustomerOrderEmail(emailOrder, bank)
    ).catch((e) => console.error('[createOrder] customer email failed:', e.message));

    if (ownerTo) {
      sendEmail(ownerTo, `New order ${order.order_number} — ${customer_name}`, generateOwnerOrderEmail(emailOrder))
        .catch((e) => console.error('[createOrder] owner email failed:', e.message));
    } else {
      console.warn('[createOrder] ORDER_NOTIFY_EMAIL is not set — owner was not emailed about this order.');
    }

    return res.status(201).json({
      success: true,
      order: plain,
      bank: payment_method === 'bank_transfer' ? bank : null,
    });
  } catch (err) {
    console.error('[createOrder] Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Could not place the order. Please try again.' });
  }
}

/** GET /api/orders/mine — orders of the logged-in customer */
export async function getMyOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      where: { user_id: req.user.id },
      include: { items: true },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
    res.json({ orders: orders.map(serialize) });
  } catch (err) {
    console.error('[getMyOrders] Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Could not load orders.' });
  }
}

/** GET /api/orders — admin: all orders, newest first */
export async function listOrders(req, res) {
  try {
    const status = STATUSES.includes(req.query.status) ? req.query.status : undefined;
    const orders = await prisma.order.findMany({
      where: status ? { status } : undefined,
      include: { items: true },
      orderBy: { created_at: 'desc' },
      take: 200,
    });
    res.json({ orders: orders.map(serialize) });
  } catch (err) {
    console.error('[listOrders] Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Could not load orders.' });
  }
}

/** PATCH /api/orders/:id/status — admin */
export async function updateOrderStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    if (!Number.isInteger(id) || !STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Bad Request', message: `Status must be one of: ${STATUSES.join(', ')}` });
    }
    const order = await prisma.order.update({ where: { id }, data: { status }, include: { items: true } });
    res.json({ order: serialize(order) });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not Found', message: 'Order not found.' });
    console.error('[updateOrderStatus] Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Could not update the order.' });
  }
}
