import './orderStatus.css';

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const LABELS = {
  en: { pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' },
  ar: { pending: 'قيد المراجعة', confirmed: 'تم التأكيد', shipped: 'تم الشحن', delivered: 'تم التسليم', cancelled: 'ملغي' },
};

export const statusLabel = (isAr, status) => LABELS[isAr ? 'ar' : 'en'][status] || status;

export function fmtDate(isAr, value) {
  try {
    return new Date(value).toLocaleString(isAr ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return String(value);
  }
}

export const money = (isAr, n) => `${Number(n).toFixed(2)} ${isAr ? 'ر.س' : 'SAR'}`;
