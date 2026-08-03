import { PrismaClient } from '@prisma/client';

// Shared PrismaClient singleton to prevent multiple instances
const prisma = new PrismaClient();

export default prisma;
