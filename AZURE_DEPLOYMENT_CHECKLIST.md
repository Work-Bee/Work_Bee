# WorkBee Azure Deployment Checklist

## 📋 Pre-Deployment Preparation

### 1. Azure Account Setup
- [ ] Register for Azure for Students at [azure.microsoft.com/free/students](https://azure.microsoft.com/free/students)
- [ ] Verify student email (.edu or student ID)
- [ ] Confirm $100 credit activated
- [ ] Install Azure CLI: `az login`
- [ ] Install VS Code Azure extension (optional)

### 2. MongoDB Setup (External)
- [ ] Create MongoDB Atlas account (free tier M0)
- [ ] Create cluster (choose region close to Azure region)
- [ ] Create database user with credentials
- [ ] Whitelist Azure IP ranges or 0.0.0.0/0 (all IPs)
- [ ] Get connection string: `mongodb+srv://...`
- [ ] Test connection locally

### 3. Google OAuth Setup
- [ ] Go to [console.cloud.google.com](https://console.cloud.google.com)
- [ ] Create new project: "WorkBee"
- [ ] Enable "Google+ API"
- [ ] Create OAuth 2.0 credentials
- [ ] Add authorized redirect URI: `https://<your-backend>.azurewebsites.net/api/auth/google/callback`
- [ ] Add authorized JavaScript origin: `https://<your-frontend>.azurestaticapps.net`
- [ ] Save Client ID and Client Secret

---

## 🚀 Backend Deployment (Azure App Service)

### Create App Service
- [ ] Azure Portal → Create → App Service
- [ ] **Name**: `workbee-backend-<yourname>`
- [ ] **Runtime**: Node 18 LTS
- [ ] **OS**: Linux
- [ ] **Region**: Choose closest to users (e.g., East US)
- [ ] **Pricing**: B1 Basic (free with student benefits)

### Configure Environment Variables
Go to: App Service → Configuration → Application Settings

- [ ] `PORT` = `8080` (or leave default)
- [ ] `NODE_ENV` = `production`
- [ ] `MONGO_URI` = `mongodb+srv://username:password@cluster.mongodb.net/work_bee?retryWrites=true&w=majority`
- [ ] `JWT_SECRET` = `<generate with: openssl rand -base64 32>`
- [ ] `JWT_EXPIRE` = `30d`
- [ ] `GOOGLE_CLIENT_ID` = `<your-google-client-id>.apps.googleusercontent.com`
- [ ] `GOOGLE_CLIENT_SECRET` = `<your-google-client-secret>`
- [ ] `GOOGLE_REDIRECT_URI` = `https://workbee-backend-<yourname>.azurewebsites.net/api/auth/google/callback`
- [ ] `FRONTEND_BASE_URL` = `https://workbee-frontend-<yourname>.azurestaticapps.net`

**Click "Save" after adding all variables**

### Deploy Code
- [ ] **Option A**: Connect GitHub repository
  - Go to Deployment Center → GitHub
  - Authorize and select repository
  - Select branch: `rob_dev` or `main`
  - Configure build settings:
    - **Build provider**: GitHub Actions
    - **Root folder**: `backend`
  - Save and trigger deployment
  
- [ ] **Option B**: Deploy via Azure CLI
  ```bash
  cd backend
  az webapp up --name workbee-backend-<yourname> \
    --resource-group WorkBee-rg \
    --runtime "NODE:18-lts" \
    --location eastus
  ```

- [ ] **Option C**: Deploy via VS Code
  - Install Azure App Service extension
  - Right-click `backend` folder
  - Select "Deploy to Web App"
  - Choose your App Service

### Verify Backend
- [ ] Go to: `https://workbee-backend-<yourname>.azurewebsites.net/api/jobs`
- [ ] Should see JSON response with jobs
- [ ] Check logs: App Service → Log stream
- [ ] Test health: `https://<backend>/api/auth/profile` (should return 401 without token)

---

## 🎨 Frontend Deployment (Azure Static Web Apps)

### Create Static Web App
- [ ] Azure Portal → Create → Static Web App
- [ ] **Name**: `workbee-frontend-<yourname>`
- [ ] **Hosting plan**: Free
- [ ] **Region**: Choose same as backend
- [ ] **Source**: GitHub
- [ ] **Repository**: Select your repo
- [ ] **Branch**: `rob_dev` or `main`
- [ ] **Build Details**:
  - **App location**: `/frontend`
  - **Build location**: `build`
  - **Output location**: `build`

### Configure Environment Variables
Go to: Static Web App → Configuration → Application settings

- [ ] `REACT_APP_API_URL` = `https://workbee-backend-<yourname>.azurewebsites.net/api`

**Click "Save"**

### Trigger Build
- [ ] GitHub Actions will automatically build and deploy
- [ ] Check GitHub → Actions tab for build status
- [ ] Wait 5-10 minutes for first deployment

### Verify Frontend
- [ ] Go to: `https://workbee-frontend-<yourname>.azurestaticapps.net`
- [ ] Should see WorkBee landing page
- [ ] Check browser console for errors
- [ ] Test navigation to /jobs page
- [ ] Verify jobs load from backend

---

## 📦 File Storage (Azure Blob Storage)

### Create Storage Account
- [ ] Azure Portal → Create → Storage Account
- [ ] **Name**: `workbeestorage<yourname>`
- [ ] **Performance**: Standard
- [ ] **Replication**: LRS (Locally Redundant)
- [ ] **Pricing**: 5GB free with student benefits

### Create Container
- [ ] Storage Account → Containers → + Container
- [ ] **Name**: `workbee-uploads`
- [ ] **Public access level**: Blob (anonymous read for blobs)

### Get Connection String
- [ ] Storage Account → Access Keys
- [ ] Copy "Connection string" (key1)

### Update Backend Environment Variables
- [ ] Add to App Service Configuration:
  - `STORAGE_TYPE` = `azure`
  - `AZURE_STORAGE_CONNECTION_STRING` = `<your-connection-string>`
  - `AZURE_STORAGE_CONTAINER_NAME` = `workbee-uploads`

**Note**: You'll need to update backend code to use Azure Blob SDK instead of local `multer` storage. This can be done later as an enhancement.

---

## 🔐 Google OAuth Final Configuration

### Update Google Cloud Console
- [ ] Go to [console.cloud.google.com](https://console.cloud.google.com)
- [ ] Select "WorkBee" project
- [ ] APIs & Services → Credentials
- [ ] Edit OAuth 2.0 Client

**Authorized redirect URIs** (add):
- [ ] `https://workbee-backend-<yourname>.azurewebsites.net/api/auth/google/callback`
- [ ] `http://localhost:5555/api/auth/google/callback` (for local testing)

**Authorized JavaScript origins** (add):
- [ ] `https://workbee-frontend-<yourname>.azurestaticapps.net`
- [ ] `http://localhost:3333` (for local testing)

- [ ] Click "Save"

### Test OAuth Flow
- [ ] Go to frontend → Click "Sign in with Google"
- [ ] Should redirect to Google consent screen
- [ ] After consent, should redirect back to app with user logged in
- [ ] Check browser console and backend logs for errors

---

## 🧪 Testing & Verification

### Backend API Tests
```bash
# Replace with your actual backend URL
export BACKEND_URL="https://workbee-backend-<yourname>.azurewebsites.net"

# Test public endpoint (should return jobs)
curl $BACKEND_URL/api/jobs

# Test health check
curl $BACKEND_URL/api/auth/profile
# Should return: {"success":false,"error":"No token provided"}

# Test Google OAuth start (should redirect)
curl -I $BACKEND_URL/api/auth/google?role=jobseeker
# Should return: 302 redirect to Google
```

### Frontend Tests
- [ ] Visit landing page - loads correctly
- [ ] Navigation menu - all links work
- [ ] Job listings page - displays jobs from backend
- [ ] Single job view - opens job details
- [ ] Register as job seeker - creates account
- [ ] Login with email/password - authenticates
- [ ] Login with Google - OAuth flow works
- [ ] Upload resume (as job seeker) - file uploads to storage
- [ ] Apply for job - application submitted
- [ ] View applications - shows submitted applications
- [ ] Register as employer - creates employer account
- [ ] Post a job (as employer) - job created
- [ ] View applications (as employer) - shows applicants

### Seed Demo Data (Optional)
```bash
# SSH into App Service (Advanced → SSH in Portal)
cd /home/site/wwwroot
npm run seed

# Or run locally and sync to Azure MongoDB
cd backend
npm run seed
```

### Demo Accounts
```
Job Seeker:
  Email: jobseeker@demo.com
  Password: demo123

Employer:
  Email: employer@demo.com
  Password: demo123

Admin:
  Email: admin@demo.com
  Password: admin123
```

---

## 🔍 Monitoring & Logging

### Enable Application Insights
- [ ] App Service → Application Insights → Turn on
- [ ] Create new Application Insights resource or use existing
- [ ] Wait 5-10 minutes for data to populate
- [ ] View metrics: Requests, Response times, Failures

### View Logs
- [ ] App Service → Log stream (real-time logs)
- [ ] Static Web App → GitHub Actions logs (build logs)
- [ ] MongoDB Atlas → Monitoring (database metrics)

### Set Up Alerts
- [ ] App Service → Alerts → New alert rule
- [ ] Condition: When HTTP 5xx errors > 5 in 5 minutes
- [ ] Action: Email notification

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain
- [ ] Purchase domain (e.g., from Namecheap, GoDaddy)
- [ ] App Service → Custom domains → Add custom domain
- [ ] Update DNS records with your registrar:
  - `A` record pointing to App Service IP
  - `TXT` record for verification
- [ ] Azure auto-provisions SSL certificate (free)

### Update OAuth Redirect URIs
- [ ] Add `https://yourdomain.com/api/auth/google/callback` to Google Console
- [ ] Update `FRONTEND_BASE_URL` to `https://yourdomain.com`

---

## 🐛 Troubleshooting

### Backend Issues

**"Cannot connect to MongoDB"**
- [ ] Check `MONGO_URI` format is correct
- [ ] Verify MongoDB Atlas IP whitelist includes Azure IPs or 0.0.0.0/0
- [ ] Test connection string with `mongosh` locally

**"500 Internal Server Error"**
- [ ] Check App Service logs (Log stream)
- [ ] Verify all environment variables are set
- [ ] Check `NODE_ENV=production` is set
- [ ] Look for missing dependencies in package.json

**"Google OAuth not working"**
- [ ] Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- [ ] Check redirect URI matches exactly in Google Console
- [ ] Ensure `FRONTEND_BASE_URL` is correct

### Frontend Issues

**"API errors (CORS)"**
- [ ] Check `REACT_APP_API_URL` points to correct backend URL
- [ ] Verify backend CORS allows frontend origin
- [ ] Check browser console for specific CORS error

**"Blank page after deployment"**
- [ ] Check GitHub Actions build logs for errors
- [ ] Verify build command is `npm run build`
- [ ] Check Static Web App configuration (app location, output location)

**"Cannot login"**
- [ ] Check backend `/api/auth/login` endpoint works (test with curl)
- [ ] Verify JWT_SECRET is set on backend
- [ ] Check browser localStorage for token after login

### File Upload Issues

**"Resume upload fails"**
- [ ] Check if using Azure Blob Storage or local storage
- [ ] Verify `./uploads/resumes/` directory exists (for local)
- [ ] Check Azure Storage connection string (for Blob)
- [ ] Verify file size limits (5MB max)

---

## 📊 Cost Estimation (Azure Student)

### Free Tier (Included with Azure for Students)
- **App Service B1**: $0/month (normally $54.75/month)
- **Static Web Apps**: $0/month (free tier)
- **Blob Storage**: $0.018/GB/month (5GB free = $0)
- **Application Insights**: $0/month (first 5GB free)
- **Bandwidth**: 15GB free/month

**Total Cost**: **$0-5/month** with student benefits

### After Student Benefits Expire
- Consider downgrading to F1 App Service (free forever, but limited)
- Use Azure Free Account (12 months free services)
- Or migrate to other hosting (Heroku, Vercel, Railway)

---

## ✅ Final Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] MongoDB connection working
- [ ] Google OAuth configured and tested
- [ ] Environment variables set on both services
- [ ] Demo data seeded (optional)
- [ ] All features tested (register, login, post job, apply)
- [ ] Logs and monitoring enabled
- [ ] README updated with deployment URLs
- [ ] Documentation shared with team

---

## 🎉 Success!

Your WorkBee application should now be live on Azure!

**Backend URL**: `https://workbee-backend-<yourname>.azurewebsites.net`
**Frontend URL**: `https://workbee-frontend-<yourname>.azurestaticapps.net`

Share these URLs with your team and start using the app!

---

## 📞 Support Resources

- **Azure Documentation**: [docs.microsoft.com/azure](https://docs.microsoft.com/azure)
- **Azure Student Benefits**: [azure.microsoft.com/free/students](https://azure.microsoft.com/free/students)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Google OAuth Setup**: [console.cloud.google.com](https://console.cloud.google.com)
- **Azure Support**: Available through Azure Portal (Chat with expert)

---

*Last Updated: January 2025*
