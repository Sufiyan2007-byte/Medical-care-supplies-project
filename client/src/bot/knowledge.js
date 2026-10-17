/**
 * MedBot answers, tips, and quick replies.
 * Edit the text in this file. Each entry has `en` and `ar`.
 * Do not invent delivery times or certifications — leave [DELIVERY TIME] as a placeholder.
 *
 * Matching: a short key (one word, 4 characters or fewer) must match a whole word.
 * A longer key matches when a word starts with it, or when the phrase appears.
 * A longer, more specific key beats a shorter one.
 */

export const GREETING = {
  en: "Hi! I'm MedBot 👋 Hover over anything and I'll explain it, or click me to ask a question.",
  ar: 'مرحباً! أنا ميدبوت 👋 مرّر المؤشر على أي عنصر وسأشرحه، أو اضغط عليّ لطرح سؤال.',
};

export const UI = {
  online: 'MEDBOT · ONLINE',
  open: { en: 'Open MedBot', ar: 'فتح ميدبوت' },
  close: { en: 'Close MedBot', ar: 'إغلاق ميدبوت' },
  title: { en: 'MedBot', ar: 'ميدبوت' },
  placeholder: { en: 'Ask about an instrument or a quote…', ar: 'اسأل عن أداة أو عن عرض السعر…' },
  send: { en: 'Send', ar: 'إرسال' },
  typing: { en: 'MedBot is typing', ar: 'ميدبوت يكتب' },
  turnOff: { en: 'Turn off tips', ar: 'إيقاف النصائح' },
  addQuote: { en: 'Add to quote', ar: 'أضف إلى عرض السعر' },
  messages: { en: 'MedBot messages', ar: 'رسائل ميدبوت' },
};

export const TIPS = {
  search: {
    en: 'Search by instrument name or catalogue reference.',
    ar: 'ابحث باسم الأداة أو مرجع الكتالوج.',
  },
  categories: {
    en: 'Open a specialty or instrument type to browse that group.',
    ar: 'افتح تخصصاً أو نوع أداة لتصفح تلك المجموعة.',
  },
  filters: {
    en: 'Narrow the list by instrument type. The count updates with your choice.',
    ar: 'ضيّق القائمة حسب نوع الأداة. يتحدّث العدد مع اختيارك.',
  },
  quote: {
    en: 'Add instruments here, then send one price-quote request to sales.',
    ar: 'أضف الأدوات هنا، ثم أرسل طلب عرض سعر واحد إلى المبيعات.',
  },
  cart: {
    en: 'The cart is for priced consumables. Surgical instruments use the quote list.',
    ar: 'السلة للمستهلكات المسعّرة. الأدوات الجراحية تُضاف إلى قائمة عرض السعر.',
  },
  wishlist: {
    en: 'Save instruments to compare later. Saved items stay in this browser.',
    ar: 'احفظ الأدوات للمقارنة لاحقاً. تبقى العناصر المحفوظة في هذا المتصفح.',
  },
  language: {
    en: 'Switch the site between English and Arabic.',
    ar: 'بدّل الموقع بين الإنجليزية والعربية.',
  },
  product: {
    en: 'Open the card for sizes and material. Use Add to quote to include it in your list.',
    ar: 'افتح البطاقة للمقاسات والخامة. استخدم «أضف إلى عرض السعر» لإضافتها إلى قائمتك.',
  },
};

export const QUICK_REPLIES = [
  { id: 'find', intent: 'find', en: 'Find an instrument', ar: 'ابحث عن أداة' },
  { id: 'categories', intent: 'categories', en: 'Browse categories', ar: 'تصفح الفئات' },
  { id: 'quote', intent: 'quote', en: 'How do quotes work?', ar: 'كيف يعمل عرض السعر؟' },
  { id: 'delivery', intent: 'delivery', en: 'Delivery', ar: 'التوصيل' },
  { id: 'contact', intent: 'contact', en: 'Contact sales', ar: 'تواصل مع المبيعات' },
  { id: 'language', intent: 'language', en: 'العربية', ar: 'English' },
];

const TOPICS = [
  {
    id: 'quote',
    priority: 80,
    keys: ['price quote', 'quotes', 'quote', 'عرض سعر', 'تسعير', 'طلب عرض'],
    en: 'Use Add to quote on an instrument. Open the quote list to set quantities, and add the hospital or clinic name, city, and deadline. Then choose Request price quote. Sales replies with the price. These pages do not show a fixed instrument price.',
    ar: 'استخدم «أضف إلى عرض السعر» على الأداة. افتح قائمة عرض السعر لضبط الكميات، وأضف اسم المستشفى أو العيادة والمدينة والموعد. ثم اختر «اطلب عرض سعر». يرد فريق المبيعات بالسعر. هذه الصفحات لا تعرض سعراً ثابتاً للأداة.',
    action: { type: 'scroll', selector: '[data-medbot="quote"]' },
  },
  {
    id: 'delivery',
    priority: 70,
    keys: ['delivery', 'shipping', 'deliver', 'توصيل', 'شحن'],
    en: 'We ship to hospitals and clinics. Lead time: [DELIVERY TIME]. Put the date you need in the quote notes, and sales will confirm what they can meet.',
    ar: 'نشحن إلى المستشفيات والعيادات. مدة التوريد: [DELIVERY TIME]. اكتب التاريخ المطلوب في ملاحظات عرض السعر، وسيتأكد فريق المبيعات مما يمكن تلبيته.',
    action: null,
  },
  {
    id: 'contact',
    priority: 75,
    keys: ['contact', 'sales', 'phone', 'email', 'whatsapp', 'تواصل', 'مبيعات', 'هاتف', 'بريد'],
    template: 'contact',
    action: { type: 'scroll', selector: '#site-contact', path: '/contact' },
  },
  {
    id: 'categories',
    priority: 50,
    keys: ['categories', 'category', 'browse', 'specialty', 'specialties', 'فئات', 'فئه', 'تخصص', 'تصفح'],
    en: 'Use Shop by Instruments or Shop by Procedure in the menu, or open the surgical catalogue. I can take you to the category list.',
    ar: 'استخدم «تسوق حسب الأداة» أو «تسوق حسب التخصص» في القائمة، أو افتح الكتالوج الجراحي. يمكنني نقلك إلى قائمة الفئات.',
    action: { type: 'scroll', selector: '#home-categories', path: '/catalogue' },
  },
  {
    id: 'find',
    priority: 40,
    keys: ['find', 'search', 'instrument', 'ابحث', 'بحث', 'اداه', 'ادوات'],
    en: 'Type an instrument name or its catalogue reference, and I will list up to three matches.',
    ar: 'اكتب اسم الأداة أو مرجع الكتالوج، وسأعرض حتى ثلاث نتائج مطابقة.',
    action: { type: 'focusSearch' },
  },
  {
    id: 'wishlist',
    priority: 45,
    keys: ['wishlist', 'saved', 'favourite', 'favorite', 'مفضل', 'محفوظ'],
    en: 'The heart icon saves an instrument in this browser so you can come back to it. It does not send a quote.',
    ar: 'أيقونة القلب تحفظ الأداة في هذا المتصفح لتعود إليها لاحقاً. الحفظ لا يرسل عرض سعر.',
    action: { type: 'scroll', selector: '[data-medbot="wishlist"]' },
  },
  {
    id: 'cart',
    priority: 45,
    keys: ['cart', 'basket', 'سله', 'سلة'],
    en: 'The cart is for priced consumables. Surgical instruments go on the quote list, because their price is sent by sales.',
    ar: 'السلة للمستهلكات التي لها سعر. الأدوات الجراحية تُوضع في قائمة عرض السعر، لأن السعر يرسله فريق المبيعات.',
    action: { type: 'scroll', selector: '[data-medbot="cart"]' },
  },
];

export const FALLBACK = {
  en: "I don't have an answer for that. Try an instrument name, or ask about quotes, delivery, or how to reach sales.",
  ar: 'ليس لدي جواب لهذا. جرّب اسم أداة، أو اسأل عن عرض السعر أو التوصيل أو كيفية التواصل مع المبيعات.',
};

export function pick(entry, lang) {
  if (!entry) return '';
  return lang === 'ar' ? entry.ar : entry.en;
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchTopic(input) {
  const text = normalize(input);
  if (!text) return null;
  const tokens = text.split(' ').filter(Boolean);
  let best = null;
  let bestScore = 0;

  for (const topic of TOPICS) {
    for (const rawKey of topic.keys) {
      const key = normalize(rawKey);
      if (!key) continue;
      const short = !key.includes(' ') && [...key].length <= 4;
      let hit = false;
      if (short) {
        hit = tokens.some((word) => word === key);
      } else if (key.includes(' ')) {
        hit = text.includes(key);
      } else {
        hit = tokens.some((word) => word === key || word.startsWith(key));
      }
      if (!hit) continue;
      const score = [...key].length * 10 + (topic.priority || 0);
      if (score > bestScore) {
        bestScore = score;
        best = topic;
      }
    }
  }
  return best;
}

export function searchProducts(products, query) {
  const q = normalize(query);
  if ([...q].length < 2) return [];
  const tokens = q.split(' ').filter((word) => [...word].length > 1);
  if (!tokens.length) return [];

  const scored = [];
  for (const product of products || []) {
    const name = normalize(product.name);
    const slug = normalize(product.slug);
    if (!name && !slug) continue;
    const nameWords = name.split(' ');
    const slugWords = slug.split(' ');
    let score = 0;
    if (slug === q || name === q) score += 50;
    if (name.includes(q) || slug.includes(q)) score += 20;
    for (const token of tokens) {
      if (nameWords.some((word) => word === token) || slugWords.some((word) => word === token)) score += 8;
      else if (nameWords.some((word) => word.startsWith(token)) || slug.startsWith(token)) score += 4;
      else if (name.includes(token) || slug.includes(token)) score += 1;
    }
    if (score >= 4) scored.push({ product, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((row) => row.product);
}

function contactAnswer(company, lang) {
  const phone = company?.phone || '+966 55 928 6613';
  const email = company?.email || 'Info@medicaresupplies.net';
  const address = company?.address || '2435 Khurais Road, 7737, Riyadh 14241, Saudi Arabia';
  if (lang === 'ar') {
    return `هاتف المبيعات: ${phone}. البريد: ${email}. العنوان: ${address}. يمكنك أيضاً فتح صفحة اتصل بنا.`;
  }
  return `Sales phone: ${phone}. Email: ${email}. Address: ${address}. You can also open the contact page.`;
}

function topicText(topic, lang, company) {
  if (topic.template === 'contact') return contactAnswer(company, lang);
  return pick(topic, lang);
}

/**
 * @returns {{ text: string, products: object[], action: object|null }}
 */
export function answerQuestion(raw, { lang, products, company, intent } = {}) {
  if (intent === 'language') {
    const next = lang === 'ar' ? 'en' : 'ar';
    return {
      text: next === 'ar'
        ? 'تم التبديل. الموقع الآن بالعربية.'
        : 'Switched. The site is now in English.',
      products: [],
      action: { type: 'language', lang: next },
    };
  }

  const topic = intent ? TOPICS.find((item) => item.id === intent) : matchTopic(raw);
  const lookingUp = !intent && raw && raw.trim().length > 1 && (!topic || topic.id === 'find');
  const matches = lookingUp ? searchProducts(products, raw) : [];

  if (topic && topic.id !== 'find') {
    return { text: topicText(topic, lang, company), products: [], action: topic.action || null };
  }

  if (matches.length) {
    const count = matches.length;
    const text = lang === 'ar'
      ? `وجدت ${count === 1 ? 'أداة مطابقة' : `${count} أدوات مطابقة`}. افتح البطاقة للتفاصيل، أو أضفها إلى عرض السعر.`
      : `I found ${count} match${count === 1 ? '' : 'es'}. Open a card for details, or add it to your quote.`;
    return { text, products: matches, action: null };
  }

  if (topic) {
    return { text: topicText(topic, lang, company), products: [], action: topic.action || null };
  }

  return { text: pick(FALLBACK, lang), products: [], action: null };
}
