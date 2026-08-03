import prisma from '../lib/prisma.js';

const DEFAULT_COMPANY = {
  about_text:
    'We are a dedicated medical supplier committed to excellence and quality assurance in healthcare. Our goal is to provide the best tools to medical professionals.',
  vision: 'To be the most trusted provider of medical supplies globally.',
  mission:
    'Delivering innovative, high-quality, and cost-effective medical products to improve patient outcomes.',
  cr_number: '1010872859',
  vat_number: '311622026300003',
  entity_type: 'Single-Person LLC',
  certifications: 'SFDA & MDMA, CE/ISO 13485',
  address: 'Medical City, Health Blvd, Riyadh, Saudi Arabia',
  email: 'contact@medportal.com',
  phone: '+966 11 123 4567',
};

/**
 * GET /api/company
 * Retrieves the company profile. Falls back to defaults if DB is unavailable.
 */
export async function getCompanyProfile(req, res) {
  try {
    const companyInfo = await prisma.companyInfo.findFirst();
    return res.status(200).json({ company: companyInfo ?? DEFAULT_COMPANY });
  } catch (err) {
    console.warn('[getCompanyProfile] DB unavailable, returning defaults:', err.message);
    return res.status(200).json({ company: DEFAULT_COMPANY });
  }
}
