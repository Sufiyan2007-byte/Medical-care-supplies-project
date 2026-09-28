import { useTranslation } from 'react-i18next';

const EN = {
  panel: 'Staff panel', admin: 'Admin', developer: 'Developer',
  nav_overview: 'Overview', nav_orders: 'Orders', nav_products: 'Products', nav_xelpov: 'Catalogue', nav_messages: 'Messages',
  nav_users: 'Users & roles', nav_system: 'System status', view_site: 'View website', sign_out: 'Sign out',
  menu: 'Menu', language: 'العربية',
  // login
  login_title: 'Staff sign in', login_sub: 'For admins and developers only.', email: 'Email', password: 'Password',
  show: 'Show', hide: 'Hide', sign_in: 'Sign in', signing_in: 'Signing in…',
  not_staff: "This account doesn't have staff access. Use a staff account.", fill_all: 'Enter your email and password.',
  signed_in_customer: "You're signed in as a customer. Sign in with a staff account to continue.",
  back_to_site: '← Back to website',
  // common
  loading: 'Loading…', retry: 'Try again', save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete',
  confirm_delete: 'Delete?', yes: 'Yes', search: 'Search…', none: 'Nothing here yet.', all: 'All', saved: 'Saved',
  failed: 'Could not save. Try again.', refresh: 'Refresh', details: 'Details', hide_details: 'Hide details',
  // overview
  ov_title: 'Overview', ov_hello: 'Welcome back', ov_pending: 'Pending orders', ov_today: 'Orders today',
  ov_total: 'All orders', ov_messages: 'Messages', ov_recent: 'Recent orders', ov_open_orders: 'Open orders',
  ov_needs_quote: 'Need a price', ov_quick: 'Quick links',
  ov_low_stock: 'Low stock', ov_low_stock_sub: 'Tracked products at 10 units or fewer.',
  ov_low_stock_empty: 'Nothing is running low right now.', ov_manage_products: 'Manage products',
  // orders
  or_title: 'Orders', or_sub: 'Every order placed on the website.', or_customer: 'Customer', or_date: 'Date',
  or_payment: 'Payment', or_total: 'Total', or_status: 'Status', or_cod: 'Cash on delivery', or_bank: 'Bank transfer',
  or_needs_quote: 'Price to confirm', or_items: 'Items', or_phone: 'Phone', or_email: 'Email', or_address: 'Address',
  or_notes: 'Notes', or_qty: 'Qty', or_on_request: 'On request', or_status_updated: 'Order status updated',
  or_subtotal: 'Subtotal', or_vat: 'VAT (15%)', or_grand: 'Total',
  // products
  pr_title: 'Products', pr_sub: 'Add products and set prices and stock.', pr_add: 'Add product', pr_name: 'Name',
  pr_category: 'Category', pr_sku: 'SKU', pr_price: 'Price (SAR)', pr_stock: 'Stock', pr_desc: 'Description',
  pr_price_hint: 'Leave empty for "Price on request"', pr_stock_hint: 'Leave empty to not track stock',
  pr_prices_hidden: 'Prices are currently hidden on the public website (it shows "Price on request"). Prices you set here are stored and go live when the website\'s prices are switched on.',
  pr_is_set: 'This is a surgical set', pr_pieces: 'Piece count', pr_material: 'Material', pr_steril: 'Sterilization', pr_tray: 'Tray / case',
  pr_add_title: 'Add product', pr_edit_title: 'Edit product', pr_created: 'Product added', pr_updated: 'Product updated',
  pr_deleted: 'Product deleted', pr_on_request: 'On request', pr_untracked: '—', pr_prev: 'Previous', pr_next: 'Next',
  pr_required: 'Name and category are required.',
  // messages
  ms_title: 'Messages', ms_sub: 'Messages sent through the contact form.', ms_reply: 'Reply by email',
  // users
  us_title: 'Users & roles', us_sub: 'Change who is a customer, admin or developer.', us_name: 'Name', us_email: 'Email',
  us_verified: 'Verified', us_joined: 'Joined', us_role: 'Role', us_you: 'You', us_role_updated: 'Role updated',
  role_user: 'Customer', role_admin: 'Admin', role_developer: 'Developer', us_verified_yes: 'Yes', us_verified_no: 'No',
  // system
  sy_title: 'System status', sy_sub: 'Health of the server, database and email. Secrets are never shown.',
  sy_server: 'Server', sy_database: 'Database', sy_email: 'Email', sy_payments: 'Payments', sy_security: 'Security', sy_data: 'Data',
  sy_ok: 'Running', sy_connected: 'Connected', sy_down: 'Not connected', sy_uptime: 'Uptime', sy_env: 'Environment',
  sy_latency: 'Response time', sy_brevo: 'Email service key (Brevo)', sy_admin_email: 'Contact-form email address',
  sy_order_email: 'New-order alert email address', sy_bank: 'Bank transfer details', sy_jwt: 'Custom login secret',
  sy_set: 'Set', sy_missing: 'Missing', sy_users: 'Accounts', sy_staff: 'Staff accounts', sy_products: 'Products',
  sy_orders: 'Orders', sy_pending: 'Pending orders', sy_messages: 'Messages', sy_min: 'min', sy_hours: 'h',
};

const AR = {
  panel: 'لوحة الموظفين', admin: 'مشرف', developer: 'مطوّر',
  nav_overview: 'نظرة عامة', nav_orders: 'الطلبات', nav_products: 'المنتجات', nav_xelpov: 'الكتالوج', nav_messages: 'الرسائل',
  nav_users: 'المستخدمون والصلاحيات', nav_system: 'حالة النظام', view_site: 'عرض الموقع', sign_out: 'تسجيل الخروج',
  menu: 'القائمة', language: 'English',
  login_title: 'دخول الموظفين', login_sub: 'للمشرفين والمطورين فقط.', email: 'البريد الإلكتروني', password: 'كلمة المرور',
  show: 'إظهار', hide: 'إخفاء', sign_in: 'تسجيل الدخول', signing_in: 'جارٍ الدخول…',
  not_staff: 'هذا الحساب ليس له صلاحية الموظفين. استخدم حساب موظف.', fill_all: 'أدخل البريد الإلكتروني وكلمة المرور.',
  signed_in_customer: 'أنت مسجّل كعميل. سجّل الدخول بحساب موظف للمتابعة.',
  back_to_site: 'العودة إلى الموقع →',
  loading: 'جارٍ التحميل…', retry: 'حاول مرة أخرى', save: 'حفظ', cancel: 'إلغاء', edit: 'تعديل', delete: 'حذف',
  confirm_delete: 'حذف؟', yes: 'نعم', search: 'بحث…', none: 'لا يوجد شيء هنا بعد.', all: 'الكل', saved: 'تم الحفظ',
  failed: 'تعذّر الحفظ. حاول مرة أخرى.', refresh: 'تحديث', details: 'التفاصيل', hide_details: 'إخفاء التفاصيل',
  ov_title: 'نظرة عامة', ov_hello: 'أهلاً بعودتك', ov_pending: 'طلبات قيد المراجعة', ov_today: 'طلبات اليوم',
  ov_total: 'كل الطلبات', ov_messages: 'الرسائل', ov_recent: 'أحدث الطلبات', ov_open_orders: 'عرض الطلبات',
  ov_needs_quote: 'تحتاج تسعير', ov_quick: 'روابط سريعة',
  ov_low_stock: 'مخزون منخفض', ov_low_stock_sub: 'المنتجات المتتبَّعة بمخزون 10 قطع أو أقل.',
  ov_low_stock_empty: 'لا يوجد نقص في المخزون حالياً.', ov_manage_products: 'إدارة المنتجات',
  or_title: 'الطلبات', or_sub: 'كل الطلبات المقدّمة من الموقع.', or_customer: 'العميل', or_date: 'التاريخ',
  or_payment: 'الدفع', or_total: 'الإجمالي', or_status: 'الحالة', or_cod: 'الدفع عند الاستلام', or_bank: 'تحويل بنكي',
  or_needs_quote: 'السعر يحتاج تأكيد', or_items: 'الأصناف', or_phone: 'الجوال', or_email: 'البريد', or_address: 'العنوان',
  or_notes: 'ملاحظات', or_qty: 'الكمية', or_on_request: 'عند الطلب', or_status_updated: 'تم تحديث حالة الطلب',
  or_subtotal: 'المجموع قبل الضريبة', or_vat: 'ضريبة القيمة المضافة (15%)', or_grand: 'الإجمالي',
  pr_title: 'المنتجات', pr_sub: 'أضف المنتجات وحدّد الأسعار والمخزون.', pr_add: 'إضافة منتج', pr_name: 'الاسم',
  pr_category: 'القسم', pr_sku: 'رمز الصنف', pr_price: 'السعر (ر.س)', pr_stock: 'المخزون', pr_desc: 'الوصف',
  pr_price_hint: 'اتركه فارغاً لعرض "السعر عند الطلب"', pr_stock_hint: 'اتركه فارغاً لعدم تتبع المخزون',
  pr_prices_hidden: 'الأسعار مخفية حالياً في الموقع العام (يظهر "السعر عند الطلب"). الأسعار التي تدخلها هنا تُحفظ وتظهر عند تفعيل الأسعار في الموقع.',
  pr_is_set: 'هذا طقم جراحي', pr_pieces: 'عدد القطع', pr_material: 'المادة', pr_steril: 'التعقيم', pr_tray: 'الصينية / الحقيبة',
  pr_add_title: 'إضافة منتج', pr_edit_title: 'تعديل المنتج', pr_created: 'تمت إضافة المنتج', pr_updated: 'تم تحديث المنتج',
  pr_deleted: 'تم حذف المنتج', pr_on_request: 'عند الطلب', pr_untracked: '—', pr_prev: 'السابق', pr_next: 'التالي',
  pr_required: 'الاسم والقسم مطلوبان.',
  ms_title: 'الرسائل', ms_sub: 'الرسائل المرسلة عبر نموذج التواصل.', ms_reply: 'الرد بالبريد',
  us_title: 'المستخدمون والصلاحيات', us_sub: 'حدّد من هو عميل أو مشرف أو مطوّر.', us_name: 'الاسم', us_email: 'البريد',
  us_verified: 'موثّق', us_joined: 'تاريخ التسجيل', us_role: 'الصلاحية', us_you: 'أنت', us_role_updated: 'تم تحديث الصلاحية',
  role_user: 'عميل', role_admin: 'مشرف', role_developer: 'مطوّر', us_verified_yes: 'نعم', us_verified_no: 'لا',
  sy_title: 'حالة النظام', sy_sub: 'حالة الخادم وقاعدة البيانات والبريد. لا تُعرض أي أسرار.',
  sy_server: 'الخادم', sy_database: 'قاعدة البيانات', sy_email: 'البريد', sy_payments: 'الدفع', sy_security: 'الأمان', sy_data: 'البيانات',
  sy_ok: 'يعمل', sy_connected: 'متصلة', sy_down: 'غير متصلة', sy_uptime: 'مدة التشغيل', sy_env: 'البيئة',
  sy_latency: 'زمن الاستجابة', sy_brevo: 'مفتاح خدمة البريد (Brevo)', sy_admin_email: 'بريد رسائل نموذج التواصل',
  sy_order_email: 'بريد تنبيهات الطلبات الجديدة', sy_bank: 'بيانات التحويل البنكي', sy_jwt: 'سر تسجيل الدخول المخصص',
  sy_set: 'مضبوط', sy_missing: 'غير مضبوط', sy_users: 'الحسابات', sy_staff: 'حسابات الموظفين', sy_products: 'المنتجات',
  sy_orders: 'الطلبات', sy_pending: 'طلبات قيد المراجعة', sy_messages: 'الرسائل', sy_min: 'دقيقة', sy_hours: 'ساعة',
};

/** Returns { s, isAr, lang } where s(key) is the translated staff-panel text. */
export function useS() {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');
  const dict = isAr ? AR : EN;
  return { s: (k) => dict[k] ?? EN[k] ?? k, isAr, i18n };
}
