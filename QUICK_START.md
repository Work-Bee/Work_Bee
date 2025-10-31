# 🐝 Work-Bee Quick Reference

## 🚀 Start Servers
```powershell
# Backend (Terminal 1)
cd D:\Work-bee\Work_Bee\backend
npm start

# Frontend (Terminal 2)
cd D:\Work-bee\Work_Bee\frontend
$env:PORT="3333"; npm start
```

## 🌐 URLs
- **Frontend**: http://localhost:3333
- **Backend**: http://localhost:5000
- **API**: http://localhost:5000/api

## 👤 Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Job Seeker | jobseeker@demo.com | demo123 |
| Employer | employer@demo.com | demo123 |
| Admin | admin@demo.com | admin123 |

## 🔑 Login Pages
- Job Seeker: http://localhost:3333/login/jobseeker
- Employer: http://localhost:3333/login/employer
- Admin: http://localhost:3333/login/admin

## 🔍 Testing Google OAuth

### Test 1: New User
1. Go to job seeker login
2. Click "Continue with Google"
3. Login with Google account (first time)
4. Should create new user + redirect to dashboard

### Test 2: Existing User
1. Use same Google account
2. Click "Continue with Google"
3. Should login (no duplicate user)

### Check Console (F12)
Should see:
```
Token received: ...
Token stored in localStorage
Calling getProfile...
User loaded: ...
Navigating to: /jobseeker/home
```

## 🐛 Quick Fixes

### Clear Data
```javascript
// In browser console (F12)
localStorage.clear();
location.reload();
```

### Check Backend
```powershell
curl http://localhost:5000/api/health
```

### View Token
```javascript
// In console
console.log(localStorage.getItem('token'));
```

## 📚 Full Documentation
- Setup: `GOOGLE_OAUTH_SETUP.md`
- Testing: `GOOGLE_OAUTH_TESTING_GUIDE.md`
- Console: `GOOGLE_CLOUD_CONSOLE_SETUP.md`
- Summary: `OAUTH_FIX_SUMMARY.md`

## ✅ Status
- Backend: ✅ Running on port 5000
- Frontend: ✅ Running on port 3333
- Google OAuth: ✅ Configured
- Database: ✅ Connected (MongoDB Atlas)

## 🔧 Configuration
```
Google Client ID: 917748415497-ngem52citb0ck7elfm9n6bftq7e4bbot.apps.googleusercontent.com
Redirect URI: http://localhost:5000/api/auth/google/callback
Frontend URL: http://localhost:3333
```
