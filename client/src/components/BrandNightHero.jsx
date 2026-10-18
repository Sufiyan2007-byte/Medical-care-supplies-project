import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const GROUPS = [
  { id: 'clamps', en: 'Haemostats & Clamps', ar: 'ملاقط وقف النزيف والكلابات', cats: ['Haemostats & Clamps'], icon: 'clamp' },
  { id: 'probes', en: 'Probes & Dilators', ar: 'مجسات وموسعات', cats: ['Probes & Dilators'], icon: 'probe' },
  { id: 'forceps', en: 'Forceps', ar: 'ملاقط', cats: ['Forceps'], icon: 'forceps' },
  { id: 'scissors', en: 'Scissors', ar: 'مقصات', cats: ['Scissors'], icon: 'scissors' },
  { id: 'retractors', en: 'Retractors', ar: 'مبعدات', cats: ['Retractors'], icon: 'retractor' },
  { id: 'needles', en: 'Needle Holders & Passers', ar: 'حاملات الإبر', cats: ['Needle Holders & Passers'], icon: 'needle' },
  { id: 'hooks', en: 'Hooks & Spatulas', ar: 'خطافات وملاوق', cats: ['Hooks & Spatulas'], icon: 'hook' },
  { id: 'cannulas', en: 'Cannulas & Trocars', ar: 'قنوات ومبازل', cats: ['Suction Tubes', 'Cannulas & Trocars'], icon: 'cannula' },
];

function Art({ name }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'clamp') {
    return (
      <svg viewBox="0 0 280 120" aria-hidden="true">
        <path {...common} d="M34 86c-12 10-22 10-30 2 10-2 16-10 18-20" />
        <path {...common} d="M36 94c-10 8-20 8-28 1 10 0 16-8 20-16" />
        <path {...common} d="M40 72 L168 48 L252 40" />
        <path {...common} d="M42 82 L168 66 L250 74" />
        <circle {...common} cx="166" cy="57" r="5" />
      </svg>
    );
  }
  if (name === 'scissors') {
    return (
      <svg viewBox="0 0 120 70" aria-hidden="true">
        <circle {...common} cx="18" cy="18" r="8" />
        <circle {...common} cx="18" cy="52" r="8" />
        <path {...common} d="M24 22 L104 58 M24 48 L104 14" />
      </svg>
    );
  }
  if (name === 'forceps') {
    return (
      <svg viewBox="0 0 120 70" aria-hidden="true">
        <path {...common} d="M8 58 C30 58 40 20 110 16" />
        <path {...common} d="M8 62 C32 50 48 28 110 24" />
      </svg>
    );
  }
  if (name === 'probe') {
    return (
      <svg viewBox="0 0 120 70" aria-hidden="true">
        <path {...common} d="M8 40 H92" />
        <circle {...common} cx="100" cy="40" r="8" />
        <path {...common} d="M18 40 v14 M34 40 v10" />
      </svg>
    );
  }
  if (name === 'retractor') {
    return (
      <svg viewBox="0 0 120 70" aria-hidden="true">
        <path {...common} d="M16 52 H78 L96 18" />
        <path {...common} d="M90 18 h18" />
      </svg>
    );
  }
  if (name === 'needle') {
    return (
      <svg viewBox="0 0 120 70" aria-hidden="true">
        <path {...common} d="M18 50 L70 22 L104 22" />
        <path {...common} d="M18 54 L66 36" />
        <circle {...common} cx="16" cy="52" r="6" />
      </svg>
    );
  }
  if (name === 'hook') {
    return (
      <svg viewBox="0 0 120 70" aria-hidden="true">
        <path {...common} d="M16 20 H86 Q104 20 104 40 Q104 58 84 58" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 70" aria-hidden="true">
      <path {...common} d="M12 36 H70 L96 22 M70 36 L96 50" />
      <path {...common} d="M20 28 v16" />
    </svg>
  );
}

export default function BrandNightHero({
  specialtyLabel,
  products,
  selectedCategory,
  searchQuery,
  onSearch,
  onPick,
}) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');

  const groups = useMemo(() => {
    return GROUPS.map((group) => ({
      ...group,
      count: products.filter((product) => product.mainCategory?.some((cat) => group.cats.includes(cat))).length,
    })).filter((group) => group.count > 0);
  }, [products]);

  if (!groups.length) return null;

  const featured = groups.reduce((best, group) => (group.count > best.count ? group : best), groups[0]);
  const rest = groups.filter((group) => group.id !== featured.id);
  const cards = [featured, ...rest];
  const second = rest[0];
  const typeCount = groups.length;
  const nameOf = (group) => (isAr ? group.ar : group.en);

  return (
    <section className="bn" aria-label={specialtyLabel}>
      <div className="bn-hero">
        <div>
          <span className="bn-kicker">
            — {specialtyLabel} · {products.length.toLocaleString()} {isAr ? 'أداة' : 'instruments'} —
          </span>
          <h1 className="bn-title">
            {isAr ? (
              <>أدوات {specialtyLabel}،<br /><span>مصممة للدقة.</span></>
            ) : (
              <>{specialtyLabel}<br />instruments, built<br /><span>for precision.</span></>
            )}
          </h1>
          <p className="bn-browse">
            {t('brandNight.browse', 'Browse:')}{' '}
            <button type="button" onClick={() => onPick(featured.cats.join(','))}>
              {nameOf(featured)}
            </button>
          </p>
          <p className="bn-blurb">
            {t('brandNight.blurb', {
              specialty: specialtyLabel,
              defaultValue: 'Forceps, clamps, scissors and needle holders for {{specialty}}, each with its catalogue reference and specifications, ready to quote for your hospital.',
            })}
          </p>
          <form className="bn-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearch(event.target.value)}
              placeholder={t('brandNight.search_placeholder', 'Instrument name or item number…')}
              aria-label={t('brandNight.search_placeholder', 'Instrument name or item number…')}
            />
            <button type="submit">{t('brandNight.search', 'Search')}</button>
          </form>
          <ul className="bn-stats">
            <li>
              <strong>{products.length.toLocaleString()}</strong>
              <span>{t('brandNight.instruments', 'Instruments')}</span>
            </li>
            <li>
              <strong>{typeCount}</strong>
              <span>{t('brandNight.types', 'Instrument types')}</span>
            </li>
            <li>
              <strong className="bn-stat-bidi">EN · ع</strong>
              <span>{t('brandNight.bilingual', 'Bilingual support')}</span>
            </li>
          </ul>
        </div>

        <div className="bn-orbit" aria-hidden="true">
          <div className="bn-orbit-art"><Art name="clamp" /></div>
          <div className="bn-callout bn-callout--a">
            <strong>{featured.count}</strong>
            <span>{nameOf(featured)}</span>
          </div>
          {second && (
            <div className="bn-callout bn-callout--b">
              <strong>{second.count}</strong>
              <span>{nameOf(second)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bn-shop-head">
        <h2>{t('brandNight.shop', 'Shop by instrument')}</h2>
        <p>{t('brandNight.common', { specialty: specialtyLabel, defaultValue: 'The most common types in {{specialty}} surgery' })}</p>
      </div>

      <div className="bn-grid">
        {cards.map((group) => {
          const catKey = group.cats.join(',');
          const active = selectedCategory === catKey || selectedCategory === group.cats[0];
          const feature = group.id === featured.id;
          return (
            <button
              key={group.id}
              type="button"
              className={`bn-card${feature ? ' bn-card--feature' : ''}${active ? ' is-on' : ''}`}
              onClick={() => onPick(active ? '' : catKey)}
            >
              <span className="bn-card-name">{nameOf(group)}</span>
              <span className="bn-card-sub">
                {feature
                  ? t('brandNight.largest', { specialty: specialtyLabel, defaultValue: 'The largest range in {{specialty}}' })
                  : t('brandNight.count', { count: group.count, defaultValue: '{{count}} instruments' })}
              </span>
              {feature && <span className="bn-card-count">{group.count}</span>}
              <span className="bn-card-icon"><Art name={group.icon} /></span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
