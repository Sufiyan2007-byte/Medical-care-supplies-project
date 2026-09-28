// Order emails: one for the customer (Arabic or English), one alert for the shop owner.
const esc = (v) => String(v ?? '').replace(/"/g, '&quot;');
const money = (n, lang) =>
  n == null ? null : `${Number(n).toFixed(2)} ${lang === 'ar' ? 'ر.س' : 'SAR'}`;

const PAYMENT_LABEL = {
  en: { cod: 'Cash on delivery', bank_transfer: 'Bank transfer' },
  ar: { cod: 'الدفع عند الاستلام', bank_transfer: 'تحويل بنكي' },
};

function itemsTable(items, lang) {
  const rows = items
    .map((i) => {
      const price = i.unit_price != null ? money(i.line_total, lang) : (lang === 'ar' ? 'السعر عند الطلب' : 'Price on request');
      return `<tr>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${esc(i.name)}${i.sku ? `<br><span style="color:#6b7280;font-size:12px;">${esc(i.sku)}</span>` : ''}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">${i.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:end;white-space:nowrap;">${price}</td>
      </tr>`;
    })
    .join('');
  const h = lang === 'ar' ? ['الصنف', 'الكمية', 'المبلغ'] : ['Item', 'Qty', 'Amount'];
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <thead><tr style="background:#f3f4f6;">
      <th style="padding:10px;text-align:start;">${h[0]}</th>
      <th style="padding:10px;">${h[1]}</th>
      <th style="padding:10px;text-align:end;">${h[2]}</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
}

function totalsBlock(order, lang) {
  if (order.total == null) return '';
  const L = lang === 'ar'
    ? { sub: 'المجموع قبل الضريبة', vat: 'ضريبة القيمة المضافة (15%)', total: 'الإجمالي' }
    : { sub: 'Subtotal', vat: 'VAT (15%)', total: 'Total' };
  const note = order.needs_quote
    ? `<p style="color:#b45309;font-size:13px;">${lang === 'ar'
        ? 'المبالغ أعلاه تشمل الأصناف المسعّرة فقط، وسيؤكد فريقنا السعر النهائي.'
        : 'The amounts above cover priced items only. Our team will confirm the final price.'}</p>`
    : '';
  return `<table style="width:100%;margin-top:8px;">
    <tr><td>${L.sub}</td><td style="text-align:end;">${money(order.subtotal, lang)}</td></tr>
    <tr><td>${L.vat}</td><td style="text-align:end;">${money(order.vat, lang)}</td></tr>
    <tr><td style="font-weight:bold;">${L.total}</td><td style="text-align:end;font-weight:bold;">${money(order.total, lang)}</td></tr>
  </table>${note}`;
}

function bankBlock(bank, lang) {
  if (!bank) return '';
  const rows = [
    [lang === 'ar' ? 'البنك' : 'Bank', bank.bank_name],
    [lang === 'ar' ? 'اسم الحساب' : 'Account name', bank.account_name],
    ['IBAN', bank.iban],
  ].filter(([, v]) => v);
  if (!rows.length) return '';
  return `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px;margin:16px 0;">
    <strong>${lang === 'ar' ? 'بيانات التحويل البنكي' : 'Bank transfer details'}</strong>
    ${rows.map(([k, v]) => `<div style="margin-top:6px;">${k}: <strong>${esc(v)}</strong></div>`).join('')}
    <div style="margin-top:8px;font-size:13px;color:#374151;">${lang === 'ar'
      ? 'يرجى ذكر رقم الطلب في التحويل وإرسال إيصال التحويل إلينا.'
      : 'Please include the order number in the transfer and send us the receipt.'}</div>
  </div>`;
}

export function generateCustomerOrderEmail(order, bank) {
  const lang = order.lang === 'en' ? 'en' : 'ar';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const T = lang === 'ar'
    ? { hi: 'شكراً لطلبك', intro: 'استلمنا طلبك وسيتواصل معك فريقنا قريباً لتأكيده.', num: 'رقم الطلب', pay: 'طريقة الدفع', ship: 'عنوان التوصيل' }
    : { hi: 'Thank you for your order', intro: 'We received your order and our team will contact you shortly to confirm it.', num: 'Order number', pay: 'Payment method', ship: 'Delivery address' };
  return `<div dir="${dir}" style="font-family:Tahoma,Arial,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
    <h2 style="color:#1d4ed8;">${T.hi}, ${esc(order.customer_name)}</h2>
    <p>${T.intro}</p>
    <p><strong>${T.num}:</strong> ${esc(order.order_number)}<br>
       <strong>${T.pay}:</strong> ${PAYMENT_LABEL[lang][order.payment_method] || ''}<br>
       <strong>${T.ship}:</strong> ${esc(order.city)}, ${esc(order.address)}</p>
    ${itemsTable(order.items, lang)}
    ${totalsBlock(order, lang)}
    ${order.payment_method === 'bank_transfer' ? bankBlock(bank, lang) : ''}
  </div>`;
}

export function generateOwnerOrderEmail(order) {
  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;">
    <h2 style="color:#1d4ed8;">New order ${esc(order.order_number)}</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px;font-weight:bold;width:130px;">Customer</td><td>${esc(order.customer_name)}</td></tr>
      <tr><td style="padding:6px;font-weight:bold;">Phone</td><td>${esc(order.customer_phone)}</td></tr>
      <tr><td style="padding:6px;font-weight:bold;">Email</td><td><a href="mailto:${esc(order.customer_email)}">${esc(order.customer_email)}</a></td></tr>
      <tr><td style="padding:6px;font-weight:bold;">Address</td><td>${esc(order.city)}, ${esc(order.address)}</td></tr>
      <tr><td style="padding:6px;font-weight:bold;">Payment</td><td>${PAYMENT_LABEL.en[order.payment_method] || ''}</td></tr>
      ${order.notes ? `<tr><td style="padding:6px;font-weight:bold;vertical-align:top;">Notes</td><td style="white-space:pre-wrap;">${esc(order.notes)}</td></tr>` : ''}
    </table>
    ${order.needs_quote ? '<p style="color:#b45309;font-weight:bold;">Some items have no price yet — please confirm the final price with the customer.</p>' : ''}
    ${itemsTable(order.items, 'en')}
    ${totalsBlock(order, 'en')}
  </div>`;
}
