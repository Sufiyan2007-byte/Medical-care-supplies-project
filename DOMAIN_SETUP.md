# 🌐 Domain & SSL Setup Guide

This guide explains how to connect your custom domain (`medicaresupplies.net`) to your deployed frontend and backend, with automatic SSL provisioning.

---

## 1. Frontend Domain Setup (Vercel / Netlify)

Your main domain (`medicaresupplies.net` and `www.medicaresupplies.net`) should point to your frontend hosting provider.

### For Vercel:
1. Go to your Vercel Project > **Settings** > **Domains**.
2. Enter `medicaresupplies.net` and click **Add**.
3. Choose the recommended option to add both the apex domain and the `www` subdomain.
4. Log into your DNS Provider (e.g., Cloudflare, Namecheap, GoDaddy) and add these records:
   
   | Type | Name | Value (Target) |
   |---|---|---|
   | `A` | `@` | `76.76.21.21` |
   | `CNAME` | `www` | `cname.vercel-dns.com` |

5. Vercel will automatically provision and renew your Let's Encrypt SSL certificates.

### For Netlify:
1. Go to your Netlify Site > **Domain management** > **Add custom domain**.
2. Enter `medicaresupplies.net`.
3. In your DNS Provider, add:

   | Type | Name | Value (Target) |
   |---|---|---|
   | `A` | `@` | `75.2.60.5` |
   | `CNAME` | `www` | `your-site-name.netlify.app` |

---

## 2. Backend API Domain Setup (Render / Railway)

Your API should be served from a subdomain to avoid CORS/Cookie issues (e.g., `api.medicaresupplies.net`).

### For Render:
1. Go to your Web Service in Render > **Settings** > **Custom Domains**.
2. Add `api.medicaresupplies.net`.
3. In your DNS Provider, add the CNAME record provided by Render:

   | Type | Name | Value (Target) |
   |---|---|---|
   | `CNAME` | `api` | `medical-website-api.onrender.com` |

4. Render manages SSL certificates automatically.

---

## 3. Post-Domain Setup Checks

After DNS propagation (usually 5–30 minutes), verify the following:
1. Both `https://medicaresupplies.net` and `https://api.medicaresupplies.net` display secure padlock icons in the browser (SSL active).
2. **Crucial:** Update your frontend Environment Variables (in Vercel/Netlify) to point to the new custom API domain:
   - `VITE_API_BASE_URL` = `https://api.medicaresupplies.net`
3. Trigger a redeploy of the frontend so the new `VITE_API_BASE_URL` takes effect.
