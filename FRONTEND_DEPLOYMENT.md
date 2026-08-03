# 🌐 MedPortal Frontend Deployment Guide

This guide covers deploying the **Vite + React SPA** frontend to cloud hosting providers like **Vercel** or **Netlify**, and linking it to your deployed backend API.

---

## 📋 Environment Variables

Set the following environment variable in your hosting dashboard:

| Variable | Description | Production Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of your live Express API | `https://medical-website-api.onrender.com` |

*Note: In Vite apps, environment variables must start with `VITE_` to be embedded into the client bundle at build time.*

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
1. Push project to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Vercel will automatically detect `vercel.json` and configure:
   - **Build Command**: `npm run build -w client`
   - **Output Directory**: `client/dist`
   - **SPA Rewrites**: All routes mapped to `/index.html`
4. Add `VITE_API_BASE_URL` in the Vercel Environment Variables setting.
5. Click **Deploy**.

### Option 2: Netlify
1. Connect your repository in [Netlify](https://netlify.com).
2. Netlify will auto-detect `netlify.toml` and `client/public/_redirects`.
3. Set `VITE_API_BASE_URL` under **Site configuration > Environment variables**.
4. Click **Deploy site**.

---

## 🔍 Verifying SPA Routing

After deployment:
- Direct navigation to deep links (e.g. `/products/surgical-instruments`, `/about`, `/contact`) will load seamlessly without `404 Not Found` errors.
- CORS requests from your deployed domain to the Express backend will be allowed.
