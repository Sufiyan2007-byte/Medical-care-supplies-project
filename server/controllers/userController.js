import prisma from '../lib/prisma.js';
import { ALL_ROLES } from '../middleware/auth.js';

/** GET /api/users?q= — developer only */
export async function listUsers(req, res) {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const users = await prisma.user.findMany({
      where: q
        ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] }
        : undefined,
      select: { id: true, name: true, email: true, role: true, is_verified: true, created_at: true },
      orderBy: { created_at: 'desc' },
      take: 500,
    });
    res.json({ users });
  } catch (err) {
    console.error('[listUsers] Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Could not load users.' });
  }
}

/** PATCH /api/users/:id/role — developer only */
export async function updateUserRole(req, res) {
  try {
    const id = Number(req.params.id);
    const { role } = req.body || {};
    if (!Number.isInteger(id) || !ALL_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Bad Request', message: `Role must be one of: ${ALL_ROLES.join(', ')}` });
    }
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Bad Request', message: "You can't change your own role." });
    }
    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!target) return res.status(404).json({ error: 'Not Found', message: 'User not found.' });

    if (target.role === 'developer' && role !== 'developer') {
      const devCount = await prisma.user.count({ where: { role: 'developer' } });
      if (devCount <= 1) {
        return res.status(400).json({ error: 'Bad Request', message: 'There must be at least one developer account.' });
      }
    }
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, is_verified: true, created_at: true },
    });
    res.json({ user });
  } catch (err) {
    console.error('[updateUserRole] Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Could not update the role.' });
  }
}
