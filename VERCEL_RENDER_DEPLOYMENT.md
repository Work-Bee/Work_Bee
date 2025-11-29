# Deployment Guide: Vercel + Render

This guide covers deploying the Work-Bee application with:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## Prerequisites

1. GitHub account with your code pushed
2. MongoDB Atlas account and cluster set up
3. Vercel account (free tier works)
4. Render account (free tier works)
5. Google OAuth credentials (if using Google login)

---

## Part 1: Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/login and create a free cluster
3. Click "Connect" on your cluster
4. Add your IP address (or allow access from anywhere: `0.0.0.0/0` for Render)
5. Create a database user with username and password
6. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/work_bee`

---

## Part 2: Backend Deployment (Render)

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `Work_Bee` repository
5. Configure the service:

**Basic Settings:**
- **Name**: `workbee-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Environment Variables** (Click "Advanced" → "Add Environment Variable"):

```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/work_bee?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars-long
JWT_EXPIRE=30d
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-render-app.onrender.com/api/auth/google/callback
FRONTEND_BASE_URL=https://your-vercel-app.vercel.app
```

**Important Notes:**
- Replace `your-render-app` with your actual Render app name
- Replace `your-vercel-app` with your actual Vercel app name (you'll set this up next)
- Generate a strong JWT_SECRET (at least 32 random characters)
- The free tier on Render spins down after inactivity; first request may be slow

### 3. Deploy Backend

1. Click "Create Web Service"
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://your-app.onrender.com`
4. Test health endpoint: `https://your-app.onrender.com/api/health`

### 4. Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Add to "Authorized redirect URIs":
   - `https://your-render-app.onrender.com/api/auth/google/callback`
5. Add to "Authorized JavaScript origins":
   - `https://your-render-app.onrender.com`
   - `https://your-vercel-app.vercel.app`
6. Save changes

---

## Part 3: Frontend Deployment (Vercel)

### 1. Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd d:\Work-bee\Work_Bee
vercel
```

**Option B: Using Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend` (IMPORTANT: Set this to frontend folder)
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `build` (or leave default)
   - **Install Command**: `npm install` (or leave default)

**Note**: The Root Directory setting is crucial. Since your frontend code is in the `frontend` folder, Vercel needs to know where to find it.

### 2. Configure Environment Variables

In Vercel dashboard → Project Settings → Environment Variables:

```
REACT_APP_API_URL=https://your-render-app.onrender.com
```

**Important**: 
- Replace `your-render-app` with your actual Render backend URL
- Don't include `/api` at the end - the frontend code adds it automatically

### 3. Important: Set Root Directory

If you didn't set it during project creation:

1. Go to Project Settings → General
2. Find "Root Directory" section
3. Click "Edit"
4. Enter: `frontend`
5. Click "Save"

This tells Vercel that your React app is inside the `frontend` folder, not at the repository root.

### 3. Deploy

1. Click "Deploy"
2. Wait for build to complete (3-5 minutes)
3. Note your frontend URL: `https://your-vercel-app.vercel.app`

**Common Build Error**: If you see `cd: frontend: No such file or directory`:
- This means the Root Directory wasn't set correctly
- Go to Settings → General → Root Directory → Set to `frontend`
- Trigger a new deployment

### 4. Update Backend CORS

Go back to Render dashboard:
1. Open your backend service
2. Go to "Environment" tab
3. Update `FRONTEND_BASE_URL` to your Vercel URL:
   ```
   FRONTEND_BASE_URL=https://your-vercel-app.vercel.app
   ```
4. Click "Save Changes" (this will trigger a redeploy)

---

## Part 4: Post-Deployment Configuration

### 1. Seed Database (Optional)

If you want to add demo data:

```bash
# Install Render CLI or use the web shell
# In Render dashboard → Your service → Shell tab

npm run seed
npm run demo:ensure
```

### 2. Create Admin User

```bash
# In Render shell
npm run create-admin
```

### 3. Test the Application

1. Visit your Vercel URL: `https://your-vercel-app.vercel.app`
2. Test registration and login
3. Test Google OAuth login
4. Test job posting/application features
5. Check browser console for any errors

---

## Part 5: Custom Domain (Optional)

### For Vercel (Frontend):
1. In Vercel dashboard → Project → Settings → Domains
2. Add your custom domain (e.g., `www.workbee.com`)
3. Follow DNS configuration instructions
4. Update `FRONTEND_BASE_URL` in Render

### For Render (Backend):
1. In Render dashboard → Service → Settings
2. Add custom domain under "Custom Domains"
3. Configure DNS with provided CNAME
4. Update `REACT_APP_API_URL` in Vercel
5. Update `GOOGLE_REDIRECT_URI` in both Render and Google Console

---

## Troubleshooting

### Backend Issues

**Problem**: "Cannot connect to MongoDB"
- Solution: Check MONGO_URI is correct and IP whitelist includes `0.0.0.0/0` in Atlas

**Problem**: "CORS error"
- Solution: Ensure `FRONTEND_BASE_URL` in Render matches your Vercel URL exactly

**Problem**: "Service unavailable on first request"
- Solution: Free tier spins down after 15 mins of inactivity; wait 30-60 seconds

### Frontend Issues

**Problem**: "Build fails with `cd: frontend: No such file or directory`"
- Solution: Set Root Directory to `frontend` in Vercel Project Settings → General

**Problem**: "Network error" or "API calls failing"
- Solution: Verify `REACT_APP_API_URL` in Vercel points to correct Render URL

**Problem**: "Google OAuth not working"
- Solution: Check Google Console redirect URIs match your deployed URLs exactly

**Problem**: "Blank page after deployment"
- Solution: Check Vercel build logs for errors; ensure Root Directory is set to `frontend`

### General Tips

1. **Check Logs**: 
   - Render: Dashboard → Service → Logs
   - Vercel: Dashboard → Project → Deployments → View logs

2. **Environment Variables**: 
   - Changes to env vars require redeployment
   - Vercel: Auto-redeploys on env var changes
   - Render: Manual redeploy or auto-redeploys on code push

3. **Free Tier Limitations**:
   - Render: 750 hours/month, spins down after 15 mins inactivity
   - Vercel: Unlimited deployments, bandwidth limits apply
   - MongoDB Atlas: 512MB storage limit

---

## Security Checklist

- [ ] Strong JWT_SECRET generated (32+ characters)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Google OAuth redirect URIs restricted to production URLs only
- [ ] Environment variables secured (never commit .env files)
- [ ] HTTPS enabled on both frontend and backend (automatic on Vercel/Render)
- [ ] CORS configured to only allow your frontend domain
- [ ] Rate limiting enabled in backend (already configured)

---

## Costs

- **Vercel**: Free tier is generous; only pay if you exceed limits
- **Render**: Free tier available; $7/month for persistent services
- **MongoDB Atlas**: Free tier (512MB); $9/month for 2GB+ 
- **Total**: Can run entirely on free tier with limitations

---

## Environment Variables Reference

### Backend (Render)
```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/auth/google/callback
FRONTEND_BASE_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

---

## Quick Deploy Commands

```bash
# 1. Ensure code is committed
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy frontend with Vercel CLI (optional)
vercel --prod

# 3. Backend deploys automatically via GitHub integration on Render
```

---

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

For project-specific issues, check the existing documentation in the `Work_Bee` folder.
