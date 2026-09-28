/**
 * One-time helper to give an existing account a role.
 * Usage (from the server folder):
 *   node scripts/setRole.js someone@example.com developer
 *   node scripts/setRole.js someone@example.com admin
 *   node scripts/setRole.js someone@example.com user
 * The person must have signed up on the website first. After the first developer exists,
 * roles can be changed from the Staff panel → Users page instead.
 */
import dotenv from 'dotenv';
import prisma from '../lib/prisma.js';

dotenv.config();
const [email, role] = process.argv.slice(2);
const ROLES = ['user', 'admin', 'developer'];

if (!email || !ROLES.includes(role)) {
  console.error('Usage: node scripts/setRole.js <email> <user|admin|developer>');
  process.exit(1);
}

try {
  const user = await prisma.user.update({ where: { email: email.toLowerCase().trim() }, data: { role } });
  console.log(`Done: ${user.email} is now "${user.role}".`);
} catch (err) {
  console.error(err.code === 'P2025' ? `No account found for ${email}. Sign up on the website first.` : err.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
