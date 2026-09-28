// Site colour themes. The actual colours live in src/index.css (search "THEMES").
// Add a theme: 1) add a [data-theme="id"] block in index.css  2) list it here.
//
// Default theme: mist-navy (previous default: steel-soft, use ?theme=steel-soft). Preview others without a switcher:  any page + ?theme=midnight (or graphite-gold, etc.)
// The choice is remembered in this browser (localStorage). Use ?theme=default to reset.

export const THEMES = [
  { id: 'midnight',      name: 'Midnight Navy' },
  { id: 'graphite-gold', name: 'Graphite & Champagne Gold' },
  { id: 'steel-soft', name: 'Steel Blue & Platinum — Soft' },
  { id: 'steel-platinum', name: 'Steel Blue & Platinum' },
  { id: 'ivory-bronze',   name: 'Ivory & Bronze (light)' },
  { id: 'pearl-navy', name: 'Pearl & Navy (light)' },
  { id: 'blush-rose', name: 'Blush & Rose (light)' },
  { id: 'cloud-burgundy', name: 'Cloud Grey & Burgundy (light)' },
  { id: 'champagne-espresso', name: 'Champagne & Espresso (light)' },
  { id: 'sand-terracotta', name: 'Sand & Terracotta (light)' },
  { id: 'silver-charcoal', name: 'Silver White & Charcoal (light)' },
  { id: 'sky-steel', name: 'Sky & Steel Blue (light)' },
  { id: 'lavender-plum', name: 'Lavender Mist & Plum (light)' },
  { id: 'powder-indigo', name: 'Powder Blue & Indigo (light)' },
  { id: 'mist-navy', name: 'Mist Blue & Navy (light)' },
  { id: 'greige-bronze', name: 'Greige & Bronze (light)' },
  { id: 'peach-cocoa', name: 'Peach & Cocoa (light)' },
  { id: 'lilac-violet', name: 'Lilac & Deep Violet (light)' },
  { id: 'stone-slate', name: 'Stone & Slate Blue (light)' },
  { id: 'gold-charcoal', name: 'Soft Gold & Charcoal (light)' },
];

export const DEFAULT_THEME = 'mist-navy';
const KEY = 'medportal_theme';

export function applyTheme(id) {
  const ok = THEMES.some((t) => t.id === id) ? id : DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', ok);
  document.documentElement.setAttribute('data-logo', logoIsThemed(ok) ? 'steel' : 'original');
  return ok;
}

export function initTheme() {
  let id = DEFAULT_THEME;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('theme');
    if (fromUrl === 'default') localStorage.removeItem(KEY);
    else if (fromUrl && THEMES.some((t) => t.id === fromUrl)) localStorage.setItem(KEY, fromUrl);
    const saved = localStorage.getItem(KEY);
    if (saved && THEMES.some((t) => t.id === saved)) id = saved;
  } catch { /* storage blocked: fall back to default */ }
  return applyTheme(id);
}

// ---- Logo -------------------------------------------------------------------
// 'themed'   : on the dark themes the header/footer/login use /logo_steel.png (white + sky-blue,
//              matches the blue look). Light themes always use the original-colour /logo.png.
// 'original' : always use the original-colour /logo.png everywhere.  <- set this to switch BACK.
export const LOGO_STYLE = 'original';
const DARK_THEMES = ['midnight', 'graphite-gold', 'steel-soft', 'steel-platinum'];

function logoIsThemed(id) {
  return LOGO_STYLE === 'themed' && DARK_THEMES.includes(id);
}

export function logoSrc() {
  const id = document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
  return logoIsThemed(id) ? '/logo_steel.png' : '/logo.png';
}
