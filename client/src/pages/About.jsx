import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './About.css';

/* ── SVG Icon set ─────────────────────────────────────────────────────────── */
/* Telescope — Vision: looking ahead, seeing the future */
const IconTelescope = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="12" r="3"/>
    <path d="M2 12h3M11 12h10"/>
    <path d="M5.5 9.5L3 6l14-4 2.5 4.5L5.5 9.5z"/>
    <path d="M11 15l-2 5M13 15l2 5"/>
  </svg>
);
/* Compass — Mission: direction, purpose, navigation */
const IconCompass = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconCertificate = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconHeadset = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0118 0v6"/>
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
  </svg>
);
const IconBuilding = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconPackage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

/* Stat/value CONTENT lives in translation.json (about.stat*_label, about.value*_title/text) —
   these arrays just pair each slot with its icon and translation-key prefix. */
const STATS = [
  { value: '1942', labelKey: 'about.stat1_label', labelDefault: 'Manufacturing Heritage' },
  { value: 'ISO 7376', labelKey: 'about.stat2_label', labelDefault: 'Laryngoscope Standard' },
  { valueKey: 'about.stat3_value', valueDefault: '4 Countries', labelKey: 'about.stat3_label', labelDefault: 'German, French & Japanese Alloys' },
  { value: '100%', labelKey: 'about.stat4_label', labelDefault: 'SFDA & CE Registered' },
];

const VALUES = [
  {
    Icon: IconShield,
    titleKey: 'about.value1_title', titleDefault: 'Heritage & Craft Since 1942',
    textKey: 'about.value1_text', textDefault: 'Founded by the Mehr family in 1942, our manufacturing lineage spans three generations of precision surgical craft, exporting worldwide with an unblemished reputation.',
  },
  {
    Icon: IconPackage,
    titleKey: 'about.value2_title', titleDefault: 'Premium Surgical Raw Materials',
    textKey: 'about.value2_text', textDefault: 'Our specialized production units exclusively employ the highest quality medical-grade stainless steel and optical components imported from Germany, France, Japan, and Pakistan.',
  },
  {
    Icon: IconCertificate,
    titleKey: 'about.value3_title', titleDefault: 'Certified ISO 7376 & SFDA',
    textKey: 'about.value3_text', textDefault: 'Certified under ISO 9001:2008, ISO 13485:2003, ISO 7376 Green Spec, CE Certificate, cGMP, and fully registered with the Saudi Food and Drug Authority (SFDA).',
  },
  {
    Icon: IconTruck,
    titleKey: 'about.value4_title', titleDefault: 'Direct KSA Supply & Support',
    textKey: 'about.value4_text', textDefault: 'Direct distribution across Saudi Arabia (+966 55 928 6613) providing hospitals, day surgery centers, and clinics with express fulfillment and specialist support.',
  },
];

function About() {
  const { t, i18n } = useTranslation();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${baseURL}/api/company`);
        if (!response.ok) throw new Error('Failed to fetch company profile');
        const data = await response.json();
        setCompany(data.company);
      } catch (err) {
        console.error(err);
        setError('Unable to load company information at this time.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyProfile();
  }, []);

  if (loading) {
    return (
      <div className="about-loading">
        <div className="about-spinner" />
        <p>{t('about.loading')}</p>
      </div>
    );
  }

  const isArabic = i18n.language && i18n.language.startsWith('ar');
  const displayAboutText = isArabic ? t('about.default_about_text') : (company?.about_text || t('about.default_about_text'));
  const displayVision    = isArabic ? t('about.default_vision')    : (company?.vision    || t('about.default_vision'));
  const displayMission   = isArabic ? t('about.default_mission')   : (company?.mission   || t('about.default_mission'));

  return (
    <div className="about-page">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-eyebrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent-color)" stroke="none"><circle cx="12" cy="12" r="12"/></svg>
            {t('about.eyebrow', 'About MedPortal')}
          </span>
          <h1>{t('about.header_title', 'Who We Are')}</h1>
          <p className="about-hero-lead">{displayAboutText}</p>
        </div>

        {/* Decorative grid pattern */}
        <div className="about-hero-decor" aria-hidden="true">
          {Array.from({ length: 48 }).map((_, i) => (
            <span key={i} className="decor-dot" />
          ))}
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────────────────────── */}
      <section className="about-stats-strip">
        {STATS.map((s, i) => (
          <div key={i} className="about-stat">
            <span className="about-stat-val">{s.valueKey ? t(s.valueKey, s.valueDefault) : s.value}</span>
            <span className="about-stat-label">{t(s.labelKey, s.labelDefault)}</span>
          </div>
        ))}
      </section>

      {/* ── Vision & Mission ──────────────────────────────────────────────── */}
      <section className="about-section about-vm-section">
        <div className="about-section-header">
          <span className="about-section-tag">{t('about.purpose_tag', 'Our Purpose')}</span>
          <h2>{t('about.vision_mission_title', 'Vision & Mission')}</h2>
          <p>{t('about.purpose_subtitle', 'The principles that guide everything we do.')}</p>
        </div>

        <div className="vm-grid">
          <div className="vm-card vm-card--vision">
            <div className="vm-card-icon">
              <IconTelescope />
            </div>
            <div className="vm-card-content">
              <h3>{t('about.vision_title', 'Our Vision')}</h3>
              <p>{displayVision}</p>
            </div>
          </div>
          <div className="vm-card vm-card--mission">
            <div className="vm-card-icon">
              <IconCompass />
            </div>
            <div className="vm-card-content">
              <h3>{t('about.mission_title', 'Our Mission')}</h3>
              <p>{displayMission}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────────────── */}
      <section className="about-section about-values-section">
        <div className="about-section-header">
          <span className="about-section-tag">{t('about.why_choose_us_tag', 'Why Choose Us')}</span>
          <h2>{t('about.commitment_title', 'Our Commitment to Excellence')}</h2>
          <p>{t('about.why_choose_us_subtitle', 'Four pillars that define our service to the healthcare community.')}</p>
        </div>

        <div className="values-grid">
          {VALUES.map(({ Icon, titleKey, titleDefault, textKey, textDefault }, i) => (
            <div key={i} className="value-card">
              <div className="value-card-icon">
                <Icon />
              </div>
              <h3>{t(titleKey, titleDefault)}</h3>
              <p>{t(textKey, textDefault)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Legal & Regulatory ────────────────────────────────────────────── */}
      {company && (
        <section className="about-section about-legal-section">
          <div className="about-section-header">
            <span className="about-section-tag">{t('about.legal_tag', 'Transparency')}</span>
            <h2>{t('about.legal_title', 'Legal & Regulatory')}</h2>
            <p>{t('about.legal_subtitle', 'Our registration and certification details for healthcare procurement teams.')}</p>
          </div>

          <div className="legal-panel">
            <div className="legal-info-grid">
              {[
                { label: t('about.cr_number', 'CR Number'), value: company.cr_number },
                { label: t('about.vat_number', 'VAT Number'), value: company.vat_number },
                { label: t('about.entity_type', 'Entity Type'), value: company.entity_type },
              ].map(({ label, value }) => (
                <div key={label} className="legal-item">
                  <span className="legal-item-label">{label}</span>
                  <span className="legal-item-value">{value || '—'}</span>
                </div>
              ))}
            </div>

            {(company.certifications || '').split(',').map(s => s.trim()).filter(Boolean).length > 0 && (
              <div className="legal-certs">
                <span className="legal-cert-label">{t('about.certifications', 'Certifications')}</span>
                <div className="cert-badges">
                  {company.certifications.split(',').map(cert => cert.trim()).filter(Boolean).map(cert => (
                    <span key={cert} className="cert-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}

export default About;

