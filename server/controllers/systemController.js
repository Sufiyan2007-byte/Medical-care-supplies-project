import prisma from '../lib/prisma.js';

/** GET /api/system/status — developer only. Never returns secrets, only whether they are set. */
export async function getSystemStatus(req, res) {
  const started = Date.now();
  let db = { ok: false, latency_ms: null, error: null };
  const counts = {};
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = { ok: true, latency_ms: Date.now() - started, error: null };
    const [users, staff, products, orders, pendingOrders, messages] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { in: ['admin', 'developer'] } } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.contactMessage.count(),
    ]);
    Object.assign(counts, { users, staff, products, orders, pending_orders: pendingOrders, messages });
  } catch (err) {
    db = { ok: false, latency_ms: null, error: err.message.split('\n').pop().slice(0, 200) };
  }

  const set = (k) => Boolean(process.env[k]);
  res.json({
    server: {
      ok: true,
      node: process.version,
      environment: process.env.NODE_ENV || 'development',
      uptime_seconds: Math.round(process.uptime()),
      time: new Date().toISOString(),
    },
    database: db,
    counts,
    email: {
      brevo_api_key: set('BREVO_API_KEY'),
      sender: process.env.EMAIL_FROM || null,
      admin_email: set('ADMIN_EMAIL'),
      order_notify_email: set('ORDER_NOTIFY_EMAIL') || set('ADMIN_EMAIL'),
    },
    payments: {
      bank_details: set('BANK_IBAN') || set('BANK_NAME'),
    },
    security: {
      jwt_secret_custom: set('JWT_SECRET') && process.env.JWT_SECRET !== 'dev_jwt_secret_change_me_in_prod',
    },
  });
}
