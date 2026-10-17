function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Opens a print view so the buyer can save the list as a PDF. Arabic stays readable. */
export function downloadQuotePdf({ items, notes, lang }) {
  const win = window.open('', '_blank', 'noopener,noreferrer');
  if (!win) return false;
  const isAr = lang === 'ar';
  const title = isAr ? 'قائمة عرض السعر' : 'Quote list';
  const rows = items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(item.name)}</td>
      <td dir="ltr">${escapeHtml(item.slug)}</td>
      <td>${escapeHtml(item.quantity)}</td>
    </tr>`).join('');
  const facts = [
    [isAr ? 'المستشفى / العيادة' : 'Hospital / clinic', notes?.facility],
    [isAr ? 'المدينة' : 'City', notes?.city],
    [isAr ? 'الموعد المطلوب' : 'Deadline', notes?.deadline],
  ].filter(([, value]) => value)
    .map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`)
    .join('');

  win.document.write(`<!DOCTYPE html>
    <html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="utf-8" />
      <title>${title} — Medical Care Supplies</title>
      <style>
        body { font-family: "Segoe UI", Tahoma, sans-serif; margin: 32px; color: #142033; }
        h1 { font-size: 22px; margin: 0 0 4px; }
        p { margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #d5dbe6; padding: 8px; text-align: start; font-size: 13px; }
        th { background: #f3f6fb; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Medical Care Supplies</p>
      ${facts}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>${isAr ? 'الأداة' : 'Instrument'}</th>
            <th>${isAr ? 'المرجع' : 'Ref'}</th>
            <th>${isAr ? 'الكمية' : 'Qty'}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <script>window.addEventListener('load', function () { window.print(); });<\/script>
    </body>
    </html>`);
  win.document.close();
  return true;
}

export function whatsAppQuoteUrl({ items, notes, lang, phone }) {
  const digits = String(phone || '+966 55 928 6613').replace(/[^\d]/g, '');
  const isAr = lang === 'ar';
  const lines = [isAr ? 'طلب عرض سعر' : 'Price quote request'];
  if (notes?.facility) lines.push(`${isAr ? 'المستشفى / العيادة' : 'Hospital / clinic'}: ${notes.facility}`);
  if (notes?.city) lines.push(`${isAr ? 'المدينة' : 'City'}: ${notes.city}`);
  if (notes?.deadline) lines.push(`${isAr ? 'الموعد المطلوب' : 'Deadline'}: ${notes.deadline}`);
  lines.push('');
  items.forEach((item) => {
    lines.push(`• ${item.slug} × ${item.quantity} — ${item.name}`);
  });
  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join('\n'))}`;
}
