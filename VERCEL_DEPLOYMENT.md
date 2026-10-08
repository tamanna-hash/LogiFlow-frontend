# LogiFlow Frontend - Vercel Deployment Guide

This guide walks you through deploying the LogiFlow frontend to Vercel.

---

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Backend Deployed**: Your backend API must be deployed and accessible (e.g., on Render)
3. **Git Repository**: Code pushed to GitHub, GitLab, or Bitbucket

---

## Quick Deployment (Recommended)

### Option 1: Deploy via Vercel Dashboard

1. **Connect Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Choose the `LogiFlow` repository
   - Select the `LogiFlow_Frontend` folder as the root directory

2. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `LogiFlow_Frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

3. **Set Environment Variables**
   
   Click "Environment Variables" and add:

   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com/api/v1
   ```

   **Important:** Replace `https://your-backend-api.onrender.com` with your actual backend URL.

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd LogiFlow_Frontend

# Login to Vercel
vercel login

# Deploy (production)
vercel --prod

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? [Your account]
# - Link to existing project? N
# - Project name? logiflow-frontend
# - Directory? ./ (current directory)
```

After deployment, set environment variables:

```bash
vercel env add NEXT_PUBLIC_API_URL production
# Paste your backend URL when prompted
```

Then redeploy:

```bash
vercel --prod
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://logiflow-api.onrender.com/api/v1` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Frontend URL (for OG images, etc.) | Auto-detected by Vercel |
| `NEXT_PUBLIC_ENV` | Environment name | `production` |

### Setting Environment Variables

**Via Dashboard:**
1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add each variable for Production, Preview, and Development

**Via CLI:**
```bash
# Production
vercel env add NEXT_PUBLIC_API_URL production

# Preview (for PR deployments)
vercel env add NEXT_PUBLIC_API_URL preview

# Development (local)
vercel env add NEXT_PUBLIC_API_URL development
```

---

## Custom Domain

### Add Custom Domain

1. **Via Dashboard:**
   - Project Settings → Domains
   - Add your domain: `app.logiflow.com`
   - Follow DNS configuration instructions

2. **DNS Configuration:**

   **Option A: Vercel Nameservers (Recommended)**
   - Point your domain's nameservers to Vercel
   - Vercel handles everything automatically

   **Option B: CNAME Record**
   - Add CNAME record: `app.logiflow.com` → `cname.vercel-dns.com`
   - SSL certificate issued automatically

### Domain Examples

- Production: `app.logiflow.com`
- Staging: `staging.logiflow.com`
- Preview: `pr-123.logiflow.com` (automatic for each PR)

---

## Backend CORS Configuration

**IMPORTANT:** Your backend must allow requests from your Vercel domain.

### Update Backend Environment Variables

```bash
# On Render or your backend host
FRONTEND_URL=https://your-project.vercel.app
```

If using custom domain:
```bash
FRONTEND_URL=https://app.logiflow.com
```

### Backend CORS Setup (Already Configured)

Your backend (`LogiFlow_Backend/src/app.ts`) already has CORS configured:

```typescript
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [env.FRONTEND_URL];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
}));
```

---

## Vercel Configuration

### vercel.json Explained

The `vercel.json` file configures your deployment:

```json
{
  "version": 2,
  "framework": "nextjs",
  "regions": ["iad1"],  // US East (change as needed)
  
  // Environment variables
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  },
  
  // Security headers
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### Regions

Choose the region closest to your users:

- `iad1` - US East (Washington, D.C.)
- `sfo1` - US West (San Francisco)
- `lhr1` - Europe West (London)
- `hnd1` - Asia (Tokyo)
- `sin1` - Southeast Asia (Singapore)

Update `"regions": ["iad1"]` in `vercel.json` as needed.

---

## Automatic Deployments

### Git Integration

Vercel automatically deploys:

1. **Production Deployment**
   - Triggered on push to `main` branch
   - URL: `https://your-project.vercel.app`

2. **Preview Deployment**
   - Triggered on push to any other branch
   - Unique URL for each branch/PR
   - Example: `https://logiflow-frontend-git-feature-xyz.vercel.app`

3. **Pull Request Comments**
   - Vercel bot comments on PRs with preview URL
   - Useful for testing before merge

### Disable Auto-Deploy (Optional)

If you want manual deployments only:

1. Project Settings → Git
2. Disable "Production Branch" auto-deployments
3. Deploy manually via CLI: `vercel --prod`

---

## Build Configuration

### Build Output

```bash
✓ Compiled successfully in 28.0s
✓ Finished TypeScript in 6.2s
✓ Generating static pages (43/43)
```

- **43 routes** compiled
- **17 static pages** pre-rendered
- **13 dynamic routes** + proxy middleware

### Build Time

- Typical: 2-3 minutes
- First build: 3-4 minutes (npm install + build)

### Build Errors

If build fails:

1. **Check Logs**
   - Vercel Dashboard → Deployments → [Failed Build] → Build Logs

2. **Common Issues**
   - Missing environment variables
   - TypeScript errors
   - Lint errors (if enabled)

3. **Test Locally**
   ```bash
   npm run build
   npm run start
   ```

---

## Performance Optimization

### Edge Caching

Vercel automatically caches:
- Static assets (images, CSS, JS)
- Static pages
- ISR pages (if using Incremental Static Regeneration)

### Image Optimization

Next.js Image component is automatically optimized by Vercel:
- WebP format for supported browsers
- Responsive images
- Lazy loading

### Analytics (Optional)

Enable Vercel Analytics:

1. Project Settings → Analytics
2. Enable "Vercel Analytics"
3. View real-user metrics in dashboard

---

## Monitoring

### Deployment Status

- Dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
- CLI: `vercel ls`

### Logs

**Real-time logs:**
```bash
vercel logs [deployment-url] --follow
```

**View recent logs:**
- Dashboard → Deployments → [Deployment] → Runtime Logs

### Health Check

Test your deployment:
```bash
curl https://your-project.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-10-08T12:00:00.000Z"
}
```

---

## Rollback

### Via Dashboard

1. Deployments tab
2. Find working deployment
3. Click "..." → Promote to Production

### Via CLI

```bash
# List deployments
vercel ls

# Promote specific deployment to production
vercel promote [deployment-url]
```

---

## Troubleshooting

### Issue: 404 on Dynamic Routes

**Cause:** Next.js not configured for dynamic routes

**Solution:** Already handled by Next.js App Router (no action needed)

### Issue: API Calls Fail (CORS Error)

**Cause:** Backend not allowing your Vercel domain

**Solution:**
1. Update backend `FRONTEND_URL` environment variable
2. Include your Vercel URL (both `*.vercel.app` and custom domain)
3. Redeploy backend

### Issue: Environment Variables Not Working

**Cause:** Variables not prefixed with `NEXT_PUBLIC_`

**Solution:**
- Client-side variables MUST start with `NEXT_PUBLIC_`
- Server-side variables don't need prefix
- Redeploy after adding variables

### Issue: Build Fails with TypeScript Errors

**Solution:**
```bash
# Test locally first
npm run type-check
npm run build

# Fix any errors before deploying
```

### Issue: Out of Memory During Build

**Cause:** Large dependencies or complex build

**Solution:**
1. Project Settings → General
2. Scroll to "Node.js Version"
3. Select latest Node version (20.x)
4. Increase memory limit (Pro plan required for >1GB)

---

## Preview Environments

### Branch Previews

Every branch gets its own URL:
- `feature-branch` → `logiflow-frontend-git-feature-branch.vercel.app`
- `staging` → `logiflow-frontend-git-staging.vercel.app`

### Environment-Specific Variables

Set different values for preview/production:

```bash
# Production
vercel env add NEXT_PUBLIC_API_URL production
https://api.logiflow.com/api/v1

# Preview
vercel env add NEXT_PUBLIC_API_URL preview
https://api-staging.logiflow.com/api/v1
```

---

## Security Checklist

✅ **Environment Variables**
- Never commit `.env` files
- Use Vercel environment variables
- Backend secrets NOT in frontend

✅ **API Security**
- Backend uses authentication
- JWT tokens stored in localStorage (secure over HTTPS)
- CORS properly configured

✅ **Headers**
- Security headers configured in `vercel.json`
- X-Frame-Options prevents clickjacking
- CSP headers for XSS protection

✅ **HTTPS**
- Vercel provides free SSL certificates
- HTTP automatically redirects to HTTPS

---

## Cost Estimation

### Hobby Plan (Free)
- Unlimited deployments
- Automatic HTTPS
- 100 GB bandwidth/month
- 100 hours build time/month
- **Suitable for:** Development, small projects

### Pro Plan ($20/month)
- Everything in Hobby
- Unlimited bandwidth
- Priority support
- Team collaboration
- **Suitable for:** Production applications

### Bandwidth Usage
- Average page: ~500 KB
- 100 GB = ~200,000 page views/month (Hobby)
- Unlimited on Pro plan

---

## Production Checklist

Before going live:

- [ ] Backend deployed and accessible
- [ ] `NEXT_PUBLIC_API_URL` set correctly
- [ ] Backend `FRONTEND_URL` includes Vercel domain
- [ ] Custom domain configured (if using)
- [ ] SSL certificate active (automatic)
- [ ] Test login/logout flow
- [ ] Test shipment creation
- [ ] Test payment flows (bKash/Stripe in production mode)
- [ ] Error monitoring configured (Sentry recommended)
- [ ] Analytics enabled (optional)
- [ ] Performance tested (Lighthouse score)

---

## Support

**Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)  
**Next.js Documentation:** [nextjs.org/docs](https://nextjs.org/docs)  
**Vercel Support:** Available on Pro plan

---

## Quick Reference

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# View logs
vercel logs [deployment-url]

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# Promote deployment
vercel promote [deployment-url]

# Environment variables
vercel env ls
vercel env add [name] [environment]
vercel env rm [name] [environment]

# Pull environment variables locally
vercel env pull
```

---

**Last Updated:** October 8, 2026  
**Next.js Version:** 16.3.8  
**Vercel CLI Version:** Latest
