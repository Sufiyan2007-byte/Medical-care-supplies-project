/* ═══════════════════════════════════════════════════════
   SpecialtyIcons.jsx — clean line-art icons for each surgical
   specialty, replacing platform emoji (which render inconsistently
   across OS/browsers and read as unprofessional on a medical
   supplier site). One shared set used by Home, XelpovSpecialties
   and anywhere else a specialty needs an icon.
   ═══════════════════════════════════════════════════════ */

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const ICONS = {
  microsurgery: (
    <>
      <path d="M9 3v4M9 7c-2 0-3.5 1.6-3.5 4S7 15 9 15s3.5-1.6 3.5-4S11 7 9 7z" />
      <path d="M9 15v2.5M6 21h6" />
      <circle cx="9" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="M15 4l5 5-2 2-5-5z" />
      <path d="M13 13l5 5" />
    </>
  ),
  'plastic-surgery': (
    <>
      <circle cx="7" cy="6" r="2.2" />
      <circle cx="7" cy="18" r="2.2" />
      <path d="M8.7 7.5L18 17M8.7 16.5L18 7" />
    </>
  ),
  urology: (
    <path d="M12 3C9 7.5 6.5 11 6.5 14.5A5.5 5.5 0 0012 20a5.5 5.5 0 005.5-5.5C17.5 11 15 7.5 12 3z" />
  ),
  ophthalmic: (
    <>
      <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'stomach-intestine-rectum': (
    <path d="M8 3c-2 0-3.5 1.5-3.5 3.5S6 10 8 10s3-1.2 4.5-1.2 2.5 1 2.5 2.7-1.2 2.5-2.7 2.5-2.3-.8-3.6-.8A4.5 4.5 0 004.2 17.7 4.5 4.5 0 008.7 21c3 0 4-2 6.3-2 3 0 5-2.4 5-5.5 0-4-3-6-3-9" />
  ),
  'neurosurgery-spine': (
    <>
      <path d="M9 3c-1.7.4-2.5 1.6-2.2 3 .3 1.3-1.3 1.7-1.3 3.2 0 1.2 1.2 1.4 1 2.6-.2 1.3-1.6 1.6-1.3 3.1.3 1.4 1.8 1.8 1.6 3.1-.2 1.1.6 1.8 1.7 2" />
      <path d="M14 3c1.9.5 2.7 1.8 2.3 3.3-.4 1.4 1.3 1.8 1.4 3.3.1 1.3-1.2 1.5-.9 2.8.3 1.3 1.7 1.6 1.5 3.1-.2 1.4-1.9 1.9-1.7 3.2.2 1.1-.7 1.9-1.9 2.1" />
      <path d="M9.5 8.5h5M9.2 13h5.6M9.7 17.5h4.6" />
    </>
  ),
  'gynecology-obstetrics': (
    <>
      <circle cx="12" cy="8" r="5" />
      <path d="M12 13v8M8.5 18h7" />
    </>
  ),
  'oral-maxillofacial': (
    <path d="M6 5c0 8 1.5 14 3.5 14 1.5 0 1.3-3 2.5-3s1 3 2.5 3C16.5 19 18 13 18 5c-1.6 1.4-3 2-6 2s-4.4-.6-6-2z" />
  ),
  cardiovascular: (
    <path d="M12.5 20.5l-1-.9C6.4 15.7 3 12.6 3 8.8 3 5.7 5.4 3.5 8.3 3.5c1.7 0 3.3.8 4.2 2.1.9-1.3 2.5-2.1 4.2-2.1 2.9 0 5.3 2.2 5.3 5.3 0 3.8-3.4 6.9-8.5 10.9l-1 .8zM7 10.5h2.5l1.3-2.6 1.7 4.6 1.2-2h3" />
  ),
  'general-surgery': (
    <>
      <path d="M4 20L15 9" />
      <path d="M15 9l4.5-4.5a1.5 1.5 0 00-2-2L13 7" />
      <circle cx="5.3" cy="18.7" r="1.6" />
    </>
  ),
  ent: (
    <path d="M15 4a5 5 0 00-5 5c0 2 1 2.8 1 4.5A3.5 3.5 0 018.5 17 3.5 3.5 0 015 13.5" />
  ),
  dental: (
    <path d="M12 4c-1.6 0-2.4.9-3.5.9C7 4.9 5.5 5.8 5.5 8.3c0 2 .8 3 1.1 5.4.3 2.2.7 6.3 2.2 6.3 1.4 0 1.2-3.6 2-5 .4-.7.7-1 1.2-1s.8.3 1.2 1c.8 1.4.6 5 2 5 1.5 0 1.9-4.1 2.2-6.3.3-2.4 1.1-3.4 1.1-5.4 0-2.5-1.5-3.4-3-3.4-1.1 0-1.9-.9-3.5-.9z" />
  ),
  orthopedic: (
    <path d="M6.5 6.5a2.5 2.5 0 113.6 3.6l5.8 5.8a2.5 2.5 0 11-3.6 3.6 2.5 2.5 0 01-.5-2.8L6 11.3a2.5 2.5 0 01-2.8-.5 2.5 2.5 0 010-3.5 2.5 2.5 0 013.3-.3z" />
  ),
  'post-mortem': (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.3 15.3L21 21" />
    </>
  ),
  'podiatry-instruments': (
    <>
      <path d="M9 21c-1.7 0-3-1-3-2.6 0-2.6 2-3 2-6.4 0-2.3-1-3-1-5A3 3 0 0110 4c2 0 2.5 1.8 2.5 3.7 0 3 1.5 4.6 1.5 8.3 0 2.8-2 5-5 5z" />
      <circle cx="7.3" cy="6.3" r=".8" fill="currentColor" stroke="none" />
    </>
  ),
  'dressing-instruments': (
    <>
      <rect x="3" y="9" width="18" height="6" rx="3" />
      <path d="M9 9v6M15 9v6" />
    </>
  ),
  dermatology: (
    <path d="M5 3v9a3.5 3.5 0 007 0V6a2 2 0 114 0 2 2 0 002 2M12 12a5 5 0 005 5 3 3 0 003-3" />
  ),
  diagnostic: (
    <path d="M4 13h3l1.5-4L11 17l2-8 1.5 4H20" />
  ),
  'skin-grafting': (
    <>
      <rect x="4" y="4" width="10" height="10" rx="1.5" />
      <path d="M8.5 8.5h14v10a1.5 1.5 0 01-1.5 1.5h-11a1.5 1.5 0 01-1.5-1.5v-3" />
    </>
  ),
  anaesthesia: (
    <>
      <path d="M17.5 6.5L20 4M19 3l2 2M4 20l5.5-5.5" />
      <path d="M7 17l7-7 3 3-7 7a2.1 2.1 0 01-3-3z" />
      <path d="M11 7l6 6" />
    </>
  ),
  mammaplasty: (
    <>
      <path d="M12.5 20.5l-1-.9C6.4 15.7 3 12.6 3 8.8 3 5.7 5.4 3.5 8.3 3.5c1.7 0 3.3.8 4.2 2.1.9-1.3 2.5-2.1 4.2-2.1 2.9 0 5.3 2.2 5.3 5.3 0 3.8-3.4 6.9-8.5 10.9l-1 .8z" />
      <path d="M10.5 10h1.5v-1.5h1v1.5h1.5v1h-1.5V12.5h-1V11h-1.5z" fill="currentColor" stroke="none" />
    </>
  ),
};

const FALLBACK = <circle cx="12" cy="12" r="8" />;

/** Renders the line-icon for a given specialty slug. Pass a CSS size via
 * the `size` prop (defaults to 24) and color via currentColor (set `color`
 * on a parent, or pass `style`/`className`). */
export function SpecialtyIcon({ slug, size = 24, className, style }) {
  return (
    <svg
      {...base}
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
    >
      {ICONS[slug] || FALLBACK}
    </svg>
  );
}

export default SpecialtyIcon;
