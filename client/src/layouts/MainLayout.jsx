import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaInstagram, FaXTwitter, FaWhatsapp } from 'react-icons/fa6';
import { useAuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useQuoteCart } from '../context/QuoteCartContext';
import { useWishlist } from '../context/WishlistContext';
import CartPanel from '../components/CartPanel';
import QuoteCartPanel from '../components/QuoteCartPanel';
import WishlistPanel from '../components/WishlistPanel';
import './MainLayout.css';
import { logoSrc } from '../utils/themes';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/* ── Inline SVG icons (no extra dep) ─────────────────────────────────────── */
const Icon = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
  contact: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  cart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  quote: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
      <line x1="9" y1="11" x2="12" y2="11"/>
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
    </svg>
  ),
  login: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  lang: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  chevronDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  shieldCheck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 5v3h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  headset: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
  ),
};

/* Trust badges shown above the footer — quick, scannable reassurance for
   hospital/clinic procurement buyers deciding whether to trust the site. */
const TRUST_BADGES = [
  { icon: 'shieldCheck', titleKey: 'footer.badge_certified_title', titleDefault: 'SFDA & ISO Certified', textKey: 'footer.badge_certified_text', textDefault: 'Every product meets Saudi & international standards' },
  { icon: 'lock', titleKey: 'footer.badge_secure_title', titleDefault: 'Secure Checkout', textKey: 'footer.badge_secure_text', textDefault: 'Encrypted payments & protected customer data' },
  { icon: 'truck', titleKey: 'footer.badge_delivery_title', titleDefault: 'Fast KSA Delivery', textKey: 'footer.badge_delivery_text', textDefault: 'Express shipping to hospitals & clinics nationwide' },
  { icon: 'headset', titleKey: 'footer.badge_support_title', titleDefault: '24/7 Specialist Support', textKey: 'footer.badge_support_text', textDefault: 'Real specialists on call or email, anytime' },
];

/* ── Nav link definitions ─────────────────────────────────────────────────── */
// "cat" children filter the full catalogue by instrument type (mainCategory in the
// product data) instead of linking to a fixed specialty route.
const NAV_ITEMS = [
  { key: 'home',    to: '/',        labelKey: 'nav.home',     icon: 'home',     exact: true },
  { key: 'about',   to: '/about',   labelKey: 'nav.about',    icon: 'about'   },
  { key: 'consumables', to: '/products/medical-consumables', labelKey: 'nav.consumables', icon: 'products' },
  { key: 'instruments', to: '/catalogue/all', label: 'Shop by Instruments', labelAr: 'تسوق حسب الأداة', icon: 'products',
    // Mirrors xelpovsurgical.com's own "SHOP BY INSTRUMENTS" menu exactly. A few of its groups
    // combine several of our raw mainCategory tags (cats: [...] triggers an OR match); "Speculums"
    // is left out for now — we don't have any products tagged that way yet.
    children: [
      { cat: 'Ancillary Products and Accessories', fallback: 'Ancillary Products and Accessories' },
      { cat: 'Bougies & Sounds',            fallback: 'Bougies & Sounds'            },
      { cat: 'Curettes & Adenotomes',       fallback: 'Curettes & Adenotomes'       },
      { cats: ['Dissectors', 'Elevators & Levers', 'Dissectors, Elevators & Levers'], fallback: 'Dissectors, Elevators & Levers' },
      { cats: ['Files', 'Saws & Rasps', 'Files, Saws & Rasps'], fallback: 'Files, Saws & Rasps' },
      { cat: 'Forceps',                     fallback: 'Forceps'                     },
      { cat: 'Haemostats & Clamps',         fallback: 'Hemostats & Clamps'          },
      { cat: 'Hospital Receptacles',        fallback: 'Hospital Receptacles'        },
      { cat: 'Impactors',                   fallback: 'Impactors'                   },
      { cat: 'Indicators & Measurement',    fallback: 'Indicators & Measurement'    },
      { cats: ['Knives', 'Needles & Picks', 'Knives, Needles & Picks'], fallback: 'Knives, Needles & Picks' },
      { cat: 'Lightening & Visualization',  fallback: 'Lightening & Visualization'  },
      { cat: 'Manipulators',                fallback: 'Manipulators'                },
      { cat: 'Needle Holders & Passers',    fallback: 'Needle Holders & Passers'    },
      { cats: ['Osteotomes', 'Chisels & Gouges'], fallback: 'Osteotomes, Chisels & Gouges' },
      { cat: 'Pliers & Wire Cutters',       fallback: 'Pliers & Wire Cutters'       },
      { cat: 'Probes & Dilators',           fallback: 'Probes & Dilators'           },
      { cats: ['Retractors', 'Hooks & Spatulas'], fallback: 'Retractors, Hooks & Spatulas' },
      { cats: ['Rongeurs', 'Punches & Cutters'], fallback: 'Rongeurs, Punches & Cutters' },
      { cat: 'Scissors',                    fallback: 'Scissors'                    },
      { cat: 'Sterilization & Containers',  fallback: 'Sterilization & Container System' },
      { cats: ['Suction Tubes', 'Cannulas & Trocars'], fallback: 'Suction Tubes, Cannulas & Trocars' },
      { cat: 'Syringes',                    fallback: 'Syringes'                    },
      { q: 'Liposuction',                   fallback: 'Liposuction Cannulas & Accessories' },
    ],
  },
  { key: 'procedure', to: '/catalogue', label: 'Shop by Procedure', labelAr: 'تسوق حسب التخصص', icon: 'products',
    // Mirrors xelpovsurgical.com's "SHOP BY PROCEDURE" menu — our 20 specialty pages plus
    // "Liposuction" (our data has those products but hasn't tagged them with a specialty yet,
    // so it's a keyword search into the full catalogue instead of a dedicated route).
    children: [
      { to: '/catalogue/anaesthesia',             fallback: 'Anaesthesia'               },
      { to: '/catalogue/cardiovascular',          fallback: 'Cardiovascular'            },
      { to: '/catalogue/dental',                  fallback: 'Dental'                    },
      { to: '/catalogue/dermatology',             fallback: 'Dermatology'               },
      { to: '/catalogue/diagnostic',              fallback: 'Diagnostic'                },
      { to: '/catalogue/dressing-instruments',    fallback: 'Dressing Instruments'      },
      { to: '/catalogue/ent',                     fallback: 'ENT'                       },
      { to: '/catalogue/general-surgery',         fallback: 'General Surgery Instruments' },
      { to: '/catalogue/gynecology-obstetrics',   fallback: 'Gynecology & Obstetrics'   },
      { to: '/catalogue/mammaplasty',              fallback: 'Mammaplasty'               },
      { to: '/catalogue/microsurgery',            fallback: 'Microsurgery'              },
      { to: '/catalogue/neurosurgery-spine',      fallback: 'Neurosurgery / Spine'      },
      { to: '/catalogue/ophthalmic',              fallback: 'Ophthalmic'                },
      { to: '/catalogue/oral-maxillofacial',      fallback: 'Oral & Maxillofacial'      },
      { to: '/catalogue/orthopedic',              fallback: 'Orthopedic'                },
      { to: '/catalogue/plastic-surgery',         fallback: 'Plastic Surgery'           },
      { to: '/catalogue/podiatry-instruments',    fallback: 'Podiatry Instruments'      },
      { to: '/catalogue/post-mortem',             fallback: 'Post Mortem'               },
      { to: '/catalogue/skin-grafting',           fallback: 'Skin Grafting'             },
      { to: '/catalogue/stomach-intestine-rectum',fallback: 'Stomach, Intestine & Rectum' },
      { to: '/catalogue/urology',                 fallback: 'Urology'                   },
      { q: 'Liposuction',                         fallback: 'Liposuction'               },
    ],
  },
  { key: 'sets', to: '/catalogue/all', label: 'Suggested Sets & Trays', labelAr: 'أطقم وصواني مقترحة', icon: 'products',
    // Mirrors xelpovsurgical.com's "SUGGESTED SETS & TRAYS" menu, grouped by specialty the same
    // way. Our per-product specialty tags don't reliably cover these kit/set listings, so each
    // entry is a keyword search (pipe = OR) instead of the specialty route. "Dental Instrument
    // Sets" is left out for now — we don't have any dental-labelled set products yet.
    children: [
      { q: 'Cardiovascular Surgery Set|Coronary Artery Bypass|Open Heart Surgery|Cardiac Catheterization|AV Fistula', fallback: 'Cardiovascular Instrument Sets' },
      { q: 'Diagnostic Set|Otoscope Set',       fallback: 'Diagnostic Instrument Sets'   },
      { q: 'ENT Surgery Set|Nasal Surgery Set|Mastoid Surgery Set|Tympanoplasty|Throat Surgery Set|Ear Surgery Set', fallback: 'ENT Instrument Sets' },
      { q: 'General Surgery Set|Appendectomy|Cholecystectomy|Hand Surgery Set|Amputation Set|Tendon Repair Set|Hernia', fallback: 'General Surgery Instrument Sets' },
      { q: 'Gynecological Examination Set|Cesarean Section|Delivery Set|Episiotomy|Hysterectomy|Dilation & Curettage|Obstetrical Instruments|IUCD', fallback: 'Gynecology & Obstetrical Instrument Sets' },
      { q: 'Micro Fat Harvesting|Microsurgery Set', fallback: 'Microsurgery Instrument Sets' },
      { q: 'LASIK|Cataract Extraction|Corneal Graft|Chalazion|Eye Surgery Set', fallback: 'Ophthalmic Instrument Sets' },
      { q: 'Orthopedic Set|Basic Thoractomy',   fallback: 'Orthopedic Instrument Sets'   },
      { q: 'Plastic Surgery Set|Face Lift Set|Rhinoplasty Set|Blepharoplasty Set|Liposuction Set|Breast Augmentation|Abdominoplasty|Genioplasty|Cleft Lip|Nano Fat', fallback: 'Plastic Surgery Instrument Sets' },
      { q: 'Stomach Surgery Set|Gastro-Intestinal Surgery Set', fallback: 'Stomach, Intestine & Rectum Instrument Sets' },
      { q: 'Urological Surgery Set|Vasectomy|Kidney Transplant|Nephrectomy|Circumcision|Bladder Surgery|Hypospadias|Pyeiopiasty', fallback: 'Urology Instrument Sets' },
    ],
  },
  { key: 'contact', to: '/contact', labelKey: 'nav.contact',  icon: 'contact' },
];

function childHref(child) {
  if (child.to) return child.to;
  if (child.cats) return `/catalogue/all?cat=${encodeURIComponent(child.cats.join(','))}`;
  if (child.cat) return `/catalogue/all?cat=${encodeURIComponent(child.cat)}`;
  return `/catalogue/all?q=${encodeURIComponent(child.q)}`;
}

const NAV_PILL_KEYS = new Set(['home', 'about']);
function navLinkClass(isActive, key, base = 'site-navbar-link') {
  const pill = NAV_PILL_KEYS.has(key) ? ` ${base}--pill` : '';
  return `${base}${pill}${isActive ? ' active' : ''}`;
}

/* ═══════════════════════════════════════════════════════════════════════════ */

function MainLayout() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthContext();
  const { cartCount, setIsCartOpen } = useCart();
  const { quoteCount, setIsQuoteOpen } = useQuoteCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();

  const [mobileOpen, setMobileOpen]     = useState(false);   // mobile drawer open
  const [openMenu, setOpenMenu]         = useState('');       // which mobile submenu is open
  const [megaOpen, setMegaOpen]         = useState('');       // key of the desktop mega menu that's open (if any)
  const [accountOpen, setAccountOpen]   = useState(false);    // desktop account dropdown
  const megaCloseTimer = useRef(null);
  const accountRef = useRef(null);

  // Real company contact details (email, phone, address) for the footer —
  // pulled from the same endpoint the Contact page uses, instead of the
  // placeholder text that used to be hardcoded here.
  const [companyInfo, setCompanyInfo] = useState(null);
  useEffect(() => {
    fetch(`${BASE_URL}/api/company`)
      .then(r => r.json())
      .then(data => setCompanyInfo(data.company || data.data))
      .catch(() => {});
  }, []);

  const closeAll = () => { setMobileOpen(false); setOpenMenu(''); setMegaOpen(''); setAccountOpen(false); };

  const openMega = (key) => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    setMegaOpen(key);
  };
  const scheduleCloseMega = () => {
    megaCloseTimer.current = setTimeout(() => setMegaOpen(''), 150);
  };

  // Close the account dropdown on outside click
  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [accountOpen]);

  /* ── Search ────────────────────────────────────────────────────────────── */
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/catalogue?q=${encodeURIComponent(q)}`);
    closeAll();
  };

  // Press "/" anywhere to jump to the search box
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (e.key !== '/' || tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('en') ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const isRTL = i18n.language.startsWith('ar');
  const isStaff = user?.role === 'admin' || user?.role === 'developer';
  const navLabel = (item) => item.labelKey ? t(item.labelKey) : (isRTL ? (item.labelAr || item.label) : item.label);

  return (
    <div className="site-wrapper">

      {/* ══ MOBILE TOP BAR ═════════════════════════════════════════════════ */}
      <header className="mobile-topbar">
        <Link to="/" className="mobile-topbar-logo" onClick={closeAll}>
          <img src={logoSrc()} alt="Logo" />
        </Link>

        <div className="mobile-topbar-actions">
          <button
            className="mobile-icon-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
          >
            <span className="nav-icon--cart" style={{ position: 'relative', display: 'inline-flex' }}>
              {Icon.cart}
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </span>
          </button>

          <button
            className="mobile-icon-btn"
            onClick={() => setIsQuoteOpen(true)}
            aria-label="Open quote list"
          >
            <span className="nav-icon--cart" style={{ position: 'relative', display: 'inline-flex' }}>
              {Icon.quote}
              {quoteCount > 0 && <span className="cart-badge">{quoteCount}</span>}
            </span>
          </button>

          <button
            className="mobile-icon-btn"
            onClick={() => setIsWishlistOpen(true)}
            aria-label="Open saved items"
          >
            <span className="nav-icon--cart" style={{ position: 'relative', display: 'inline-flex' }}>
              {Icon.heart}
              {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
            </span>
          </button>

          <button className="mobile-icon-btn" onClick={toggleLanguage} aria-label="Switch language">
            {i18n.language.startsWith('en') ? 'ع' : 'EN'}
          </button>

          <button
            className={`mobile-icon-btn hamburger-btn${mobileOpen ? ' open' : ''}`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? Icon.close : Icon.menu}
          </button>
        </div>
      </header>

      {/* ══ MOBILE DRAWER ══════════════════════════════════════════════════ */}
      {mobileOpen && (
        <div className="mobile-drawer-backdrop" onClick={closeAll} />
      )}
      <nav className={`mobile-drawer${mobileOpen ? ' open' : ''}`} aria-hidden={!mobileOpen}>
        {NAV_ITEMS.map(item => {
          const hasChildren = item.children?.length > 0;
          return (
            <div key={item.key} className="mobile-drawer-item-wrap">
              {hasChildren ? (
                <>
                  <button
                    className="mobile-drawer-link mobile-drawer-btn"
                    onClick={() => setOpenMenu(v => v === item.key ? '' : item.key)}
                  >
                    <span className="nav-icon">{Icon[item.icon]}</span>
                    {navLabel(item)}
                    <span className={`nav-sub-arrow${openMenu === item.key ? ' open' : ''}`}>
                      {Icon.chevronDown}
                    </span>
                  </button>
                  {openMenu === item.key && (
                    <div className="mobile-drawer-subnav">
                      {item.children.map(child => (
                        <NavLink
                          key={child.to || child.cat || (child.cats && child.cats.join(',')) || child.q}
                          to={childHref(child)}
                          className={({ isActive }) => `mobile-drawer-sublink${isActive ? ' active' : ''}`}
                          onClick={closeAll}
                        >
                          {t(child.labelKey, child.fallback)}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) => navLinkClass(isActive, item.key, 'mobile-drawer-link')}
                  onClick={closeAll}
                >
                  <span className="nav-icon">{Icon[item.icon]}</span>
                  {navLabel(item)}
                </NavLink>
              )}
            </div>
          );
        })}

        <div className="mobile-drawer-footer">
          {isStaff && (
            <NavLink to="/staff" className="mobile-drawer-link" onClick={closeAll}>
              <span className="nav-icon">{Icon.admin}</span>
              {isRTL ? 'لوحة الموظفين' : 'Staff panel'}
            </NavLink>
          )}
          {isAuthenticated && !isStaff && (
            <>
              <NavLink to="/account" end className="mobile-drawer-link" onClick={closeAll}>
                <span className="nav-icon">{Icon.user}</span>
                {isRTL ? 'حسابي' : 'My account'}
              </NavLink>
              <NavLink to="/account/orders" className="mobile-drawer-link" onClick={closeAll}>
                <span className="nav-icon">{Icon.orders}</span>
                {isRTL ? 'طلباتي' : 'My orders'}
              </NavLink>
            </>
          )}
          {isAuthenticated ? (
            <>
              <div className="mobile-drawer-user">
                <span className="nav-icon">{Icon.user}</span>
                {user?.name || user?.email}
              </div>
              <button className="mobile-drawer-link mobile-drawer-btn mobile-logout"
                onClick={() => { logout(); closeAll(); }}>
                <span className="nav-icon">{Icon.logout}</span>
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <NavLink to="/auth/login" className="mobile-drawer-signin" onClick={closeAll}>
              <span className="nav-icon">{Icon.login}</span>
              {t('nav.sign_in')}
            </NavLink>
          )}
        </div>
      </nav>

      {/* ══ DESKTOP TOP BAR (logo | search | actions) ═════════════════════ */}
      <div className="site-body">
        <header className="site-topbar">
          <Link to="/" className="site-topbar-brand" onClick={closeAll}>
            <img src={logoSrc()} alt="Medical Care Supplies" className="site-topbar-logo" />
            <span className="site-topbar-name">Medical Care Supplies</span>
          </Link>

          <form className="site-topbar-search" role="search" onSubmit={handleSearch}>
            <span className="site-topbar-search-icon" aria-hidden="true">{Icon.search}</span>
            <input
              ref={searchRef}
              type="search"
              className="site-topbar-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isRTL ? 'ابحث عن أداة جراحية أو رقم صنف…' : 'Search surgical instruments or SKU…'}
              aria-label={isRTL ? 'بحث في المنتجات' : 'Search products'}
            />
            <kbd className="site-topbar-search-kbd" aria-hidden="true">/</kbd>
          </form>

          <div className="site-topbar-actions">
            <button
              className="site-topbar-icon-btn site-topbar-lang-btn"
              onClick={toggleLanguage}
              aria-label="Switch language"
              title={i18n.language.startsWith('en') ? 'العربية' : 'English'}
            >
              {Icon.lang}
              <span className="site-topbar-lang-text">
                {isRTL ? (
                  <>
                    <span className="site-topbar-lang-current">عربي</span>
                    <span className="site-topbar-lang-sep">/</span>
                    <span className="site-topbar-lang-other">EN</span>
                  </>
                ) : (
                  <>
                    <span className="site-topbar-lang-current">EN</span>
                    <span className="site-topbar-lang-sep">/</span>
                    <span className="site-topbar-lang-other">عربي</span>
                  </>
                )}
              </span>
            </button>

            <Link to="/contact" className="site-topbar-contact">
              {isRTL ? 'اطلب عرض سعر' : 'Request a quote'}
            </Link>

            <button
              type="button"
              className="site-topbar-cart"
              onClick={() => setIsQuoteOpen(true)}
              aria-label={isRTL ? 'قائمة عروض الأسعار' : 'Quote list'}
              title={isRTL ? 'قائمة عروض الأسعار' : 'Quote list'}
            >
              {Icon.quote}
              {quoteCount > 0 && <span className="cart-badge">{quoteCount}</span>}
            </button>

            <button
              type="button"
              className="site-topbar-cart"
              onClick={() => setIsWishlistOpen(true)}
              aria-label={isRTL ? 'المفضلة' : 'Saved items'}
              title={isRTL ? 'المفضلة' : 'Saved items'}
            >
              {Icon.heart}
              {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
            </button>

            <button
              type="button"
              className="site-topbar-cart"
              onClick={() => setIsCartOpen(true)}
              aria-label={t('cart.title', 'Cart')}
            >
              {Icon.cart}
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {/* Account dropdown */}
            <div className="site-topbar-account" ref={accountRef}>
              <button
                className="site-topbar-account-btn"
                onClick={() => setAccountOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={accountOpen}
                aria-label={isAuthenticated ? (user?.name || user?.email) : (isRTL ? 'تسجيل الدخول' : 'Sign in')}
              >
                {isAuthenticated ? (
                  <span className="site-topbar-account-avatar" aria-hidden="true">
                    {(user?.name || user?.email || '?').trim().charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <span className="site-topbar-account-avatar site-topbar-account-avatar--guest" aria-hidden="true">
                    {Icon.user}
                  </span>
                )}
              </button>

              {accountOpen && (
                <div className="account-dropdown">
                  {isAuthenticated ? (
                    <>
                      <div className="account-dropdown-header">
                        <span className="account-dropdown-name">{user?.name || user?.email}</span>
                        {isStaff && <span className="account-dropdown-role">{isRTL ? 'موظف' : 'Staff'}</span>}
                      </div>
                      {isStaff ? (
                        <Link to="/staff" className="account-dropdown-link" onClick={closeAll}>
                          <span className="nav-icon">{Icon.admin}</span>
                          {isRTL ? 'لوحة الموظفين' : 'Staff panel'}
                        </Link>
                      ) : (
                        <>
                          <Link to="/account" className="account-dropdown-link" onClick={closeAll}>
                            <span className="nav-icon">{Icon.user}</span>
                            {isRTL ? 'حسابي' : 'My account'}
                          </Link>
                          <Link to="/account/orders" className="account-dropdown-link" onClick={closeAll}>
                            <span className="nav-icon">{Icon.orders}</span>
                            {isRTL ? 'طلباتي' : 'My orders'}
                          </Link>
                        </>
                      )}
                      <button className="account-dropdown-link account-dropdown-logout" onClick={() => { logout(); closeAll(); }}>
                        <span className="nav-icon">{Icon.logout}</span>
                        {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                    <Link to="/auth/login" className="account-dropdown-link" onClick={closeAll}>
                      <span className="nav-icon">{Icon.login}</span>
                      {t('nav.sign_in')}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ══ MAIN NAV BAR (Home / About / Shop by Instruments ▾ / Shop by Procedure ▾ / Contact) ═══════════ */}
        <nav className="site-navbar" aria-label="Main">
          <div className="site-navbar-inner">
            {NAV_ITEMS.map(item => {
              const hasChildren = item.children?.length > 0;
              if (!hasChildren) {
                return (
                  <NavLink
                    key={item.key}
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) => navLinkClass(isActive, item.key)}
                  >
                    {navLabel(item)}
                  </NavLink>
                );
              }
              const isOpen = megaOpen === item.key;
              return (
                <div
                  key={item.key}
                  className="site-navbar-item-mega"
                  onMouseEnter={() => openMega(item.key)}
                  onMouseLeave={scheduleCloseMega}
                >
                  <button
                    type="button"
                    className={`site-navbar-link site-navbar-link--mega${isOpen ? ' open' : ''}`}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={() => setMegaOpen(v => v === item.key ? '' : item.key)}
                  >
                    <span className={`nav-sub-arrow${isOpen ? ' open' : ''}`}>{Icon.chevronDown}</span>
                    {navLabel(item)}
                  </button>

                  {isOpen && (
                    <div className="mega-menu" onMouseEnter={() => openMega(item.key)} onMouseLeave={scheduleCloseMega}>
                      <div className="mega-menu-inner">
                        <div className="mega-menu-grid">
                          {item.children.map(child => (
                            <NavLink
                              key={child.to || child.cat || (child.cats && child.cats.join(',')) || child.q}
                              to={childHref(child)}
                              className={({ isActive }) => `mega-menu-link${isActive ? ' active' : ''}`}
                              onClick={closeAll}
                            >
                              {child.labelKey ? t(child.labelKey, child.fallback) : child.fallback}
                            </NavLink>
                          ))}
                        </div>
                        <Link to={item.to} className="mega-menu-viewall" onClick={closeAll}>
                          {isRTL ? 'عرض الكل' : 'View all'} {Icon.chevron}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <main className="site-main">
          <Outlet />
        </main>

        <footer className="site-footer">
          <div className="footer-trust-strip">
            {TRUST_BADGES.map((b) => (
              <div className="footer-trust-badge" key={b.icon}>
                <span className="footer-trust-icon">{Icon[b.icon]}</span>
                <div className="footer-trust-copy">
                  <strong>{t(b.titleKey, b.titleDefault)}</strong>
                  <span>{t(b.textKey, b.textDefault)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="footer-top">
            <div className="footer-brand">
              <Link to="/" className="site-logo">
                <div className="footer-logo-card">
                  <img src={logoSrc()} alt="Medical Care Supplies Logo" className="footer-logo-img" />
                </div>
              </Link>
              <p className="footer-address">
                {companyInfo?.address || t('contact.address_default', 'Medical City, Health Blvd, Riyadh, Saudi Arabia')}
              </p>
            </div>
            <div className="footer-nav">
              <Link to="/">{t('nav.home')}</Link>
              <Link to="/about">{t('nav.about')}</Link>
              <Link to="/products">{t('nav.products')}</Link>
              <Link to="/contact">{t('nav.contact')}</Link>
            </div>
            <div className="footer-contact">
              <div className="footer-socials">
                <a href={`mailto:${companyInfo?.email || 'Info@medicaresupplies.net'}`} className="social-icon email-link">
                  {companyInfo?.email || 'Info@medicaresupplies.net'}
                </a>
                <a href={`tel:${(companyInfo?.phone || '+966 55 928 6613').replace(/[^+\d]/g, '')}`} className="social-icon phone-link" dir="ltr">
                  {companyInfo?.phone || '+966 55 928 6613'}
                </a>
                <div className="social-icons-row">
                  <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon"><FaInstagram size={20} /></a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon"><FaXTwitter size={20} /></a>
                  <a
                    href={companyInfo?.phone ? `https://wa.me/${companyInfo.phone.replace(/[^\d]/g, '')}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                  >
                    <FaWhatsapp size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copyright">
              {t('footer.rights_reserved', { year: new Date().getFullYear() })}
            </div>
          </div>
        </footer>
      </div>

      <CartPanel />
      <QuoteCartPanel />
      <WishlistPanel />
    </div>
  );
}

export default MainLayout;
