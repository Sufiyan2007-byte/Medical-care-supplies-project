import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import prisma from './lib/prisma.js';
import { sanitizeBody } from './middleware/sanitize.js';

// Route imports
import authRouter from './routes/auth.js';
import productRouter from './routes/product.js';
import companyRouter from './routes/company.js';
import contactRouter from './routes/contact.js';
import ordersRouter from './routes/orders.js';
import staffRouter from './routes/staff.js';
import accountRouter from './routes/account.js';
import xelpovRouter from './routes/xelpov.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Apply middlewares
app.use(helmet());          // Security headers (XSS, HSTS, no-sniff, etc.)
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(sanitizeBody);      // Strip HTML/script injection from all POST bodies

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api', productRouter);
app.use('/api/company', companyRouter);
app.use('/api/contact', contactRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/account', accountRouter);
app.use('/api/staff', staffRouter);
app.use('/api/xelpov', xelpovRouter);

// Basic health check route
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    // Attempt database check
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected (database check failed)';
  }

  res.json({
    status: 'ok',
    database: dbStatus,
    message: 'Medical Website Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});
