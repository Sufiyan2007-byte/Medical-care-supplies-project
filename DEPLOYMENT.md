# 🚀 MedPortal Deployment Guide

This guide covers deploying the **Express API** backend and **PostgreSQL** database to cloud platforms (Render, Railway, or VPS using Docker).

---

## 📋 Required Environment Variables

When setting up your hosting environment, configure the following variables:

| Variable | Description | Example / Note |
|---|---|---|
| `PORT` | HTTP port for Express | `5000` (auto-assigned by Render/Railway) |
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/meddb?sslmode=require` |
| `JWT_SECRET` | Secret key for signing auth tokens | Minimum 32 random characters |
| `BREVO_API_KEY` | API key for transactional emails | Sourced from your Brevo Dashboard |
| `ADMIN_EMAIL` | Target email for contact form alerts | `admin@medportal.com` |

---

## 🛠️ Deployment Options

### Option 1: Render (Recommended)
1. Push code to GitHub.
2. Connect your GitHub repository to [Render](https://render.com).
3. Click **New +** -> **Blueprint** and select `render.yaml`.
4. Render will automatically provision:
   - A managed PostgreSQL Database (`medical-website-db`).
   - The Express Web Service (`medical-website-api`).
   - Auto-generate `JWT_SECRET` and link `DATABASE_URL`.
5. Add your `BREVO_API_KEY` in the Render Environment tab.

### Option 2: Railway
1. Create a new Project on [Railway](https://railway.app).
2. Provision a **PostgreSQL** database service.
3. Deploy the `server/` directory as a Node service.
4. Set the build command to `npm install` and start command to `npx prisma db push && node index.js`.
5. Link `DATABASE_URL` to the Railway Postgres connection string.

### Option 3: Docker / VPS
1. Build the image:
   ```bash
   cd server
   docker build -t medportal-api .
   ```
2. Run container:
   ```bash
   docker run -d -p 5000:5000 --env-file .env medportal-api
   ```

---

## 🗄️ Database Migrations & Seeding

In production, database schemas are kept in sync automatically via:
```bash
npx prisma db push
```

To seed initial data (categories and sample items):
```bash
node prisma/seed.js
```
