import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import './Contact.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/* ── SVG Icons ───────────────────────────────────────────────────────────── */
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconShieldCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconTruckFast = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const FAQS = [
  {
    qKey: 'contact.faq1_q',
    qDefault: 'What is your standard delivery timeframe within Saudi Arabia?',
    aKey: 'contact.faq1_a',
    aDefault: 'We offer express delivery within 24 to 48 hours to major hubs including Riyadh, Jeddah, Dammam, Mecca, and Medina. Regional clinic shipments typically arrive within 2–3 business days.',
  },
  {
    qKey: 'contact.faq2_q',
    qDefault: 'Are all products certified and registered with the SFDA?',
    aKey: 'contact.faq2_a',
    aDefault: 'Yes. 100% of surgical instruments, sets, and medical consumables cataloged on MedPortal are registered with the Saudi Food & Drug Authority (SFDA) and comply with ISO standards.',
  },
  {
    qKey: 'contact.faq3_q',
    qDefault: 'Can hospitals and healthcare institutions request formal RFP quotes?',
    aKey: 'contact.faq3_a',
    aDefault: 'Absolutely. Our sales department handles volume pricing, formal quotation sheets, and credit terms for licensed hospitals, day-surgery centers, and medical chains.',
  },
  {
    qKey: 'contact.faq4_q',
    qDefault: 'What is your warranty and return policy for surgical instruments?',
    aKey: 'contact.faq4_a',
    aDefault: 'Our surgical grade instruments come with a lifetime material guarantee against manufacturing defects. If an item arrives compromised or fails inspection, we issue an immediate replacement.',
  },
];

function Contact() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [companyInfo, setCompanyInfo] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    facility: '',
    department: 'sales',
    message: '',
    website: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/api/company`)
      .then((res) => res.json())
      .then((data) => setCompanyInfo(data.data || data.company))
      .catch((err) => console.error('Failed to load company info:', err));
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t('contact.error_generic', 'Something went wrong. Please try again.'));
      }

      addToast(t('contact.success', 'Thank you! Your message has been sent successfully.'), 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        facility: '',
        department: 'sales',
        message: '',
        website: '',
      });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="contact-page">

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <span className="contact-eyebrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent-color)" stroke="none"><circle cx="12" cy="12" r="12"/></svg>
            {t('contact.eyebrow', 'Contact MedPortal')}
          </span>
          <h1>{t('contact.header_title', 'Connect with Our Medical Specialists')}</h1>
          <p className="contact-hero-lead">
            {t('contact.header_desc', 'Whether you need formal sales quotes, SFDA compliance documentation, or urgent operating theatre supplies, our dedicated team is here to assist.')}
          </p>
        </div>

        {/* Decorative Grid Pattern */}
        <div className="contact-hero-decor" aria-hidden="true">
          {Array.from({ length: 48 }).map((_, i) => (
            <span key={i} className="decor-dot" />
          ))}
        </div>
      </section>

      {/* ── Contact Channels Strip (4-Card Grid) ─────────────────────────── */}
      <section className="contact-channels-strip">
        <div className="channels-grid">
          <div className="channel-card">
            <div className="channel-icon-wrap">
              <IconMapPin />
            </div>
            <div className="channel-body">
              <h3>{t('contact.headquarters', 'Headquarters')}</h3>
              <p>{companyInfo?.address || t('contact.address_default', '2435 Khurais Road, 7737, Riyadh 14241, Saudi Arabia')}</p>
            </div>
          </div>

          <div className="channel-card">
            <div className="channel-icon-wrap">
              <IconPhone />
            </div>
            <div className="channel-body">
              <h3>{t('contact.phone_label', 'Sales & Orders')}</h3>
              <a href={`tel:${(companyInfo?.phone || '+966 55 928 6613').replace(/[^+\d]/g, '')}`} dir="ltr">
                {companyInfo?.phone || '+966 55 928 6613'}
              </a>
              <span className="channel-subtext">{t('contact.support_subtext', '24/7 RFQ & Technical Inquiry')}</span>
            </div>
          </div>

          <div className="channel-card">
            <div className="channel-icon-wrap">
              <IconMail />
            </div>
            <div className="channel-body">
              <h3>{t('contact.support_label', 'Customer Support')}</h3>
              <a href={`mailto:${companyInfo?.email || 'Info@medicaresupplies.net'}`} dir="ltr">
                {companyInfo?.email || 'Info@medicaresupplies.net'}
              </a>
              <span className="channel-subtext">{t('contact.email_subtext', 'Sales, support & general inquiries')}</span>
            </div>
          </div>

          <div className="channel-card">
            <div className="channel-icon-wrap">
              <IconClock />
            </div>
            <div className="channel-body">
              <h3>{t('contact.hours_label', 'Operating Hours')}</h3>
              <p>{t('contact.hours_value', 'Sun – Thu: 8:00 AM – 5:00 PM AST')}</p>
              <span className="channel-badge">{t('contact.emergency_badge', 'Emergency Dispatch Active')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Grid (Form + Information Desk) ────────────────────── */}
      <section className="contact-main-section">
        <div className="contact-main-grid">

          {/* Form Side */}
          <div className="contact-form-card">
            <div className="form-card-header">
              <h2>{t('contact.form_title', 'Send a Message')}</h2>
              <p>{t('contact.form_subtitle', 'Fill out the details below and our team will get back to you within 2 business hours.')}</p>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="name">{t('contact.name_label', 'Full Name')} <span className="req">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={t('contact.name_placeholder', 'Enter your full name')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t('contact.email_label', 'Institutional Email')} <span className="req">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder={t('contact.email_placeholder', 'sarah@hospital.med.sa')}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="phone">{t('contact.phone_field_label', 'Phone Number')}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    dir="ltr"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+966 50 123 4567"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="facility">{t('contact.facility_label', 'Hospital / Facility Name')}</label>
                  <input
                    type="text"
                    id="facility"
                    name="facility"
                    value={formData.facility}
                    onChange={handleChange}
                    placeholder={t('contact.facility_placeholder', 'King Faisal Specialist Hospital')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="department">{t('contact.department_label', 'Inquiry Type / Department')}</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="sales">{t('contact.dept_sales', 'Sales Quote & Volume Pricing')}</option>
                  <option value="sfda">{t('contact.dept_sfda', 'SFDA Compliance & Certifications')}</option>
                  <option value="technical">{t('contact.dept_technical', 'Technical Product Specs')}</option>
                  <option value="order">{t('contact.dept_order', 'Order Tracking & Logistics')}</option>
                  <option value="general">{t('contact.dept_general', 'General Support')}</option>
                </select>
              </div>

              {/* Honeypot field for bot protection */}
              <div className="form-group" style={{ display: 'none' }} aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex="-1"
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">{t('contact.message_label', 'Message')} <span className="req">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder={t('contact.message_placeholder', 'Please specify product quantities, required delivery timeline, or any specific SFDA certificate requests...')}
                />
              </div>

              <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span>{t('contact.sending', 'Sending...')}</span>
                ) : (
                  <>
                    <span>{t('contact.send_button', 'Send Message')}</span>
                    <IconSend />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar Side (Logistics, Express, HQ Map Card) */}
          <div className="contact-sidebar">

            {/* Fast Track Box */}
            <div className="sidebar-box sidebar-box--urgent">
              <div className="box-icon-head">
                <div className="box-icon"><IconTruckFast /></div>
                <div>
                  <h4>{t('contact.urgent_title', 'Urgent Surgical Supply Line')}</h4>
                  <span className="box-badge">{t('contact.urgent_badge', '24/7 Hospital Dispatch')}</span>
                </div>
              </div>
              <p>{t('contact.urgent_text', 'For immediate emergency theatre supplies or urgent instrument replacements across KSA, call our direct logistics hot desk.')}</p>
              <a href={`tel:${(companyInfo?.phone || '+966 55 928 6613').replace(/[^+\d]/g, '')}`} className="box-link" dir="ltr">{companyInfo?.phone || '+966 55 928 6613'} →</a>
            </div>

            {/* SFDA Compliance Box */}
            <div className="sidebar-box sidebar-box--sfda">
              <div className="box-icon-head">
                <div className="box-icon"><IconShieldCheck /></div>
                <div>
                  <h4>{t('contact.sfda_desk_title', 'SFDA & Quality Regulatory Desk')}</h4>
                  <span className="box-sub">{t('contact.sfda_desk_sub', 'Compliance Verification')}</span>
                </div>
              </div>
              <p>{t('contact.sfda_desk_text', 'Need batch analysis certificates, ISO documentation, or SFDA registration letters for procurement records?')}</p>
              <a href={`mailto:${companyInfo?.email || 'Info@medicaresupplies.net'}`} className="box-link" dir="ltr">{companyInfo?.email || 'Info@medicaresupplies.net'} →</a>
            </div>

            {/* Map / Location Mockup Box */}
            <div className="sidebar-box sidebar-box--map">
              <div className="map-mockup-inner">
                <div className="map-pin-pulse">
                  <IconMapPin />
                </div>
                <h4>{t('contact.hub_title', 'MedPortal Central Hub')}</h4>
                <p>{t('contact.hub_sub', 'Riyadh Logistics & Procurement Office')}</p>
                <span className="map-coords" dir="ltr">24.7136° N, 46.6753° E</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────────────── */}
      <section className="contact-faq-section">
        <div className="faq-header">
          <span className="faq-tag">{t('contact.faq_tag', 'Frequently Asked Questions')}</span>
          <h2>{t('contact.faq_title', 'Quick Answers for Procurement Teams')}</h2>
          <p>{t('contact.faq_subtitle', 'Common questions regarding ordering, SFDA certificates, and logistics across Saudi Arabia.')}</p>
        </div>

        <div className="faq-list">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className={`faq-item ${openFaq === idx ? 'faq-item--open' : ''}`}
              onClick={() => toggleFaq(idx)}
            >
              <div className="faq-question">
                <h3>{t(faq.qKey, faq.qDefault)}</h3>
                <span className="faq-toggle-icon">
                  <IconChevronDown />
                </span>
              </div>
              {openFaq === idx && (
                <div className="faq-answer">
                  <p>{t(faq.aKey, faq.aDefault)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Contact;

