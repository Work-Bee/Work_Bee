# WorkBee - Quick Reference Guide

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                  https://workbee-frontend.com                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   AZURE STATIC WEB APPS                         │
│                    (React 18 Frontend)                          │
│                                                                 │
│  Components: Landing, Jobs, Profile, Dashboard                 │
│  Auth Context: JWT management, user state                      │
│  API Client: Axios → backend                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API Calls (/api/*)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   AZURE APP SERVICE                             │
│                    (Node.js Backend)                            │
│                                                                 │
│  Routes: /auth, /jobs, /applications, /users                   │
│  Middleware: JWT verify, role check, file upload               │
│  Controllers: Business logic                                   │
└───────┬──────────────────────────────────┬─────────────────────┘
        │                                  │
        │                                  │
        ▼                                  ▼
┌───────────────────┐            ┌──────────────────────┐
│  MONGODB ATLAS    │            │  AZURE BLOB STORAGE  │
│   (Database)      │            │   (File Uploads)     │
│                   │            │                      │
│ • users           │            │ • resumes/           │
│ • jobs            │            │ • company-logos/     │
│ • applications    │            │ • profile-photos/    │
│ • companies       │            │                      │
│ • bookmarks       │            │                      │
└───────────────────┘            └──────────────────────┘

                ┌─────────────────────┐
                │  GOOGLE OAUTH API   │
                │  (Authentication)   │
                └─────────────────────┘
```

---

## 📦 Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| React Router | 6.15.0 | Client-side routing |
| Tailwind CSS | 3.3.3 | Styling |
| Axios | 1.5.0 | HTTP client |
| React Query | 3.39.3 | Data fetching/caching |
| React Hook Form | 7.45.4 | Form validation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18 LTS | Runtime |
| Express | 4.18.2 | Web framework |
| Mongoose | 7.5.0 | MongoDB ODM |
| JWT | 9.0.2 | Authentication |
| bcryptjs | 2.4.3 | Password hashing |
| Multer | 1.4.5 | File uploads |
| Helmet | 7.0.0 | Security headers |
| Google Auth Library | 9.15.1 | OAuth 2.0 |

---

## 🗂️ Database Schema Quick Reference

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "jobseeker" | "employer" | "admin",
  phone: String,
  location: String,
  profile: {                    // For job seekers
    skills: [String],
    experience: String,
    education: String,
    resume: {
      filename: String,
      path: String,
      uploadDate: Date
    }
  },
  companyDetails: {             // For employers
    companyName: String,
    industry: String,
    description: String,
    website: String,
    logo: { filename, path }
  },
  isActive: Boolean,
  createdAt: Date
}
```

### Jobs Collection
```javascript
{
  _id: ObjectId,
  title: String,
  company: ObjectId → companies,
  description: String,
  category: String,
  jobType: "Full-time" | "Part-time" | "Contract" | "Temporary" | "Seasonal",
  location: { city, state, address },
  salary: { min, max, currency, period },
  status: "active" | "closed",
  applicationDeadline: Date,
  applicationsCount: Number,
  createdAt: Date
}
```

### Applications Collection
```javascript
{
  _id: ObjectId,
  job: ObjectId → jobs,
  applicant: ObjectId → users,
  coverLetter: String,
  resume: { filename, path },
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted",
  employerNotes: String,
  appliedAt: Date
}
```

---

## 🔑 Environment Variables Template

### Backend (.env)
```bash
# Server
PORT=5555
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/work_bee

# JWT
JWT_SECRET=<openssl rand -base64 32>
JWT_EXPIRE=30d

# Google OAuth
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=https://your-backend.com/api/auth/google/callback
FRONTEND_BASE_URL=https://your-frontend.com

# Storage (Optional)
STORAGE_TYPE=azure
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
AZURE_STORAGE_CONTAINER_NAME=workbee-uploads
```

### Frontend (.env)
```bash
REACT_APP_API_URL=https://your-backend.com/api
```

---

## 📡 API Endpoints Quick Reference

### Authentication
```
POST   /api/auth/register              Register user
POST   /api/auth/login                 Login with email/password
GET    /api/auth/google                Start Google OAuth
GET    /api/auth/google/callback       Google OAuth callback
GET    /api/auth/profile               Get current user [AUTH]
PUT    /api/auth/profile               Update profile [AUTH]
PUT    /api/auth/change-password       Change password [AUTH]
```

### Jobs
```
GET    /api/jobs                       List jobs (+ filters)
GET    /api/jobs/:id                   Get single job
POST   /api/jobs                       Create job [EMPLOYER]
PUT    /api/jobs/:id                   Update job [EMPLOYER]
DELETE /api/jobs/:id                   Delete job [EMPLOYER]
GET    /api/jobs/employer/my-jobs      My posted jobs [EMPLOYER]
```

### Applications
```
POST   /api/applications               Apply for job [JOBSEEKER]
GET    /api/applications/my-applications  My applications [JOBSEEKER]
GET    /api/applications/employer/all  All applications [EMPLOYER]
GET    /api/applications/employer/:jobId  Job applications [EMPLOYER]
PUT    /api/applications/:id/status    Update status [EMPLOYER]
DELETE /api/applications/:id           Withdraw [JOBSEEKER]
```

### Users
```
POST   /api/users/upload-resume        Upload resume [JOBSEEKER]
DELETE /api/users/resume               Delete resume [JOBSEEKER]
POST   /api/users/upload-photo         Upload profile photo [AUTH]
DELETE /api/users/photo                Delete photo [AUTH]
```

### Bookmarks
```
GET    /api/bookmarks                  My bookmarks [JOBSEEKER]
POST   /api/bookmarks                  Add bookmark [JOBSEEKER]
DELETE /api/bookmarks/:jobId           Remove bookmark [JOBSEEKER]
GET    /api/bookmarks/check/:jobId     Check if bookmarked [JOBSEEKER]
```

---

## 🚀 Deployment Quick Start

### 1. Prerequisites
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Install Node.js 18
nvm install 18
nvm use 18
```

### 2. Deploy Backend (Azure App Service)
```bash
cd backend

# Deploy
az webapp up \
  --name workbee-backend \
  --resource-group WorkBee-rg \
  --runtime "NODE:18-lts" \
  --location eastus

# Set environment variables
az webapp config appsettings set \
  --name workbee-backend \
  --resource-group WorkBee-rg \
  --settings \
    NODE_ENV=production \
    MONGO_URI="mongodb+srv://..." \
    JWT_SECRET="..." \
    GOOGLE_CLIENT_ID="..." \
    GOOGLE_CLIENT_SECRET="..." \
    GOOGLE_REDIRECT_URI="https://workbee-backend.azurewebsites.net/api/auth/google/callback" \
    FRONTEND_BASE_URL="https://workbee-frontend.azurestaticapps.net"
```

### 3. Deploy Frontend (Azure Static Web Apps)
```bash
cd frontend

# Build
npm run build

# Deploy (via GitHub Actions - configure in Azure Portal)
# Or manually:
az staticwebapp deploy \
  --name workbee-frontend \
  --resource-group WorkBee-rg \
  --source ./build

# Set environment variables in Azure Portal:
# Configuration → Application settings → REACT_APP_API_URL
```

### 4. Seed Demo Data
```bash
# SSH into App Service or run locally
cd backend
npm run seed
```

---

## 🧪 Testing Commands

### Backend Tests
```bash
# Test API
curl https://your-backend.com/api/jobs

# Test auth (should return 401)
curl https://your-backend.com/api/auth/profile

# Test Google OAuth redirect
curl -I https://your-backend.com/api/auth/google?role=jobseeker
```

### Frontend Tests
```bash
# Build locally
cd frontend
npm run build

# Test build
npx serve -s build -l 3333
```

---

## 📊 Monitoring Commands

### View Logs
```bash
# Backend logs (real-time)
az webapp log tail \
  --name workbee-backend \
  --resource-group WorkBee-rg

# Download logs
az webapp log download \
  --name workbee-backend \
  --resource-group WorkBee-rg \
  --log-file logs.zip
```

### Check Status
```bash
# App Service status
az webapp show \
  --name workbee-backend \
  --resource-group WorkBee-rg \
  --query "state"

# Static Web App status
az staticwebapp show \
  --name workbee-frontend \
  --resource-group WorkBee-rg \
  --query "defaultHostname"
```

---

## 🔧 Common Issues & Fixes

### Issue: "Cannot connect to MongoDB"
```bash
# Test connection locally
mongosh "mongodb+srv://username:password@cluster.mongodb.net/work_bee"

# Check IP whitelist in Atlas
# Settings → Network Access → Add IP: 0.0.0.0/0
```

### Issue: "CORS errors"
**Fix**: Update backend CORS origin
```javascript
// backend/server.js
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

### Issue: "Google OAuth fails"
**Check**:
1. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` match Google Console
2. Redirect URI in code matches Google Console exactly
3. OAuth consent screen configured in Google Console

### Issue: "File uploads fail"
**Local storage**:
```bash
# Ensure directory exists
mkdir -p backend/uploads/resumes
chmod 755 backend/uploads
```

**Azure Blob Storage**:
```bash
# Test connection string
az storage blob list \
  --account-name workbeestorage \
  --container-name workbee-uploads \
  --connection-string "..."
```

---

## 📞 Useful Links

| Resource | URL |
|----------|-----|
| Azure Portal | [portal.azure.com](https://portal.azure.com) |
| Azure for Students | [azure.microsoft.com/free/students](https://azure.microsoft.com/free/students) |
| MongoDB Atlas | [cloud.mongodb.com](https://cloud.mongodb.com) |
| Google Cloud Console | [console.cloud.google.com](https://console.cloud.google.com) |
| Azure Docs | [docs.microsoft.com/azure](https://docs.microsoft.com/azure) |
| Node.js Docs | [nodejs.org/docs](https://nodejs.org/docs) |
| React Docs | [react.dev](https://react.dev) |

---

## 🎯 Demo Accounts

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Job Seeker | jobseeker@demo.com | demo123 |
| Employer | employer@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |

---

## 📝 Project Files

```
Work_Bee/
├── backend/
│   ├── server.js              # Entry point
│   ├── package.json           # Dependencies
│   ├── .env                   # Environment variables
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main component
│   │   ├── index.js           # Entry point
│   │   └── ...
│   ├── package.json           # Dependencies
│   ├── .env                   # Frontend env vars
│   └── ...
├── PROJECT_SUMMARY_FOR_AZURE.md        # Full documentation
├── AZURE_DEPLOYMENT_CHECKLIST.md       # Step-by-step checklist
└── README.md                            # Original README
```

---

**End of Quick Reference**

*For detailed information, see `PROJECT_SUMMARY_FOR_AZURE.md`*
