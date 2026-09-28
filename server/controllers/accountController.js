import prisma from '../lib/prisma.js';

const PROFILE = { id: true, name: true, email: true, role: true, phone: true, city: true, address: true, created_at: true };
const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** GET /api/account */
export async function getAccount(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: PROFILE });
    if (!user) return res.status(404).json({ error: 'Not Found', message: 'Account not found.' });
    res.json({ user });
  } catch (err) {
    console.error('[getAccount] Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Could not load your account.' });
  }
}

/** PATCH /api/account — name, phone, city, address (email and role can't be changed here) */
export async function updateAccount(req, res) {
  try {
    const b = req.body || {};
    const data = {};
    if (b.name !== undefined) {
      const name = clean(b.name, 120);
      if (name.length < 2) return res.status(400).json({ error: 'Bad Request', message: 'Name is required.' });
      data.name = name;
    }
    if (b.phone !== undefined) {
      const phone = clean(b.phone, 30);
      if (phone && !/^[+\d][\d\s-]{6,}$/.test(phone)) {
        return res.status(400).json({ error: 'Bad Request', message: 'Enter a valid phone number.' });
      }
      data.phone = phone || null;
    }
    if (b.city !== undefined) data.city = clean(b.city, 80) || null;
    if (b.address !== undefined) data.address = clean(b.address, 400) || null;

    const user = await prisma.user.update({ where: { id: req.user.id }, data, select: PROFILE });
    res.json({ user });
  } catch (err) {
    console.error('[updateAccount] Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Could not save your details.' });
  }
}
