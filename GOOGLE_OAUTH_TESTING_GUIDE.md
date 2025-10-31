# Google OAuth & Login Testing Guide

## Current Status: ✅ SERVERS RUNNING
- **Backend**: Running on http://localhost:5000
- **Frontend**: Running on http://localhost:3333

## Configuration Summary

### Backend (.env)
```
GOOGLE_CLIENT_ID=917748415497-ngem52citb0ck7elfm9n6bftq7e4bbot.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
FRONTEND_BASE_URL=http://localhost:3333
```

### Frontend (.env)
```
PORT=3333
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Test Plan

### Test 1: Regular Email/Password Login ✓

**For Job Seeker:**
1. Navigate to: http://localhost:3333/login/jobseeker
2. Enter credentials:
   - Email: `jobseeker@demo.com`
   - Password: `demo123`
3. Click "Sign in"
4. **Expected**: Should redirect to `/jobseeker/home`
5. **Check**: User info should appear in header

**For Employer:**
1. Navigate to: http://localhost:3333/login/employer
2. Enter credentials:
   - Email: `employer@demo.com`
   - Password: `demo123`
3. Click "Sign in"
4. **Expected**: Should redirect to `/employer/home`

**For Admin:**
1. Navigate to: http://localhost:3333/login/admin
2. Enter credentials:
   - Email: `admin@demo.com`
   - Password: `admin123`
3. Click "Sign in"
4. **Expected**: Should redirect to `/admin/dashboard`

---

### Test 2: Google OAuth - New User Creation ✓

**Test with a NEW Google Account (that hasn't been used before):**

1. **Clear browser data first** (important for clean test):
   - Press F12 → Console tab
   - Run: `localStorage.clear()` 
   - Close DevTools

2. Navigate to: http://localhost:3333/login/jobseeker

3. Click **"Continue with Google"** button

4. **Expected Flow:**
   - Redirects to Google login page
   - Select/login with Google account
   - **First time users**: Google asks for permission to share email/profile
   - Click "Allow"/"Continue"
   - Returns to: `http://localhost:3333/auth/callback?token=...&role=jobseeker`
   - Shows "Finishing sign-in..." spinner
   - **New user should be created in database**
   - Redirects to `/jobseeker/home`

5. **Verify in Browser Console** (F12 → Console):
   ```
   Token received: eyJhbGc...
   Token stored in localStorage
   Calling getProfile...
   getProfile result: {success: true, user: {...}}
   User loaded: {name: "...", email: "...", role: "jobseeker"}
   Navigating to: /jobseeker/home
   ```

6. **Check Database**:
   - A new user should be created with:
     - Name from Google profile
     - Email from Google
     - Role: `jobseeker`
     - Random password (user won't know it, only Google OAuth works)

---

### Test 3: Google OAuth - Existing User Login ✓

**Test with a Google account that was already used to create an account:**

1. **Logout first** (if logged in)

2. Navigate to: http://localhost:3333/login/employer

3. Click **"Continue with Google"**

4. Select the Google account you used before

5. **Expected Flow:**
   - Google recognizes the account (might not ask for permission again)
   - Returns to callback URL
   - Shows spinner
   - **Should login with EXISTING user's role** (not create duplicate)
   - Redirects to appropriate dashboard based on user's actual role

6. **Important Note**: If user registered as jobseeker via Google, they stay jobseeker even if they click "Continue with Google" on employer login page

---

### Test 4: Google OAuth - Role Switching ✓

**What happens if user tries different portals:**

1. Create account via Google on jobseeker portal → gets role: `jobseeker`

2. Try to login via Google on employer portal → **Still logs in as jobseeker**, redirects to `/jobseeker/home`

3. **This is correct behavior** - role is set on first registration and doesn't change

---

### Test 5: Google OAuth - Error Scenarios

**Test A: Cancel Google Login**
1. Click "Continue with Google"
2. On Google login page, click "Cancel" or close window
3. **Expected**: User stays on login page, can try again

**Test B: Network Error**
1. Disconnect internet
2. Click "Continue with Google"
3. **Expected**: Shows error message or timeout

**Test C: Invalid Token**
1. Manually navigate to: `http://localhost:3333/auth/callback?token=invalid123&role=jobseeker`
2. **Expected**: Shows "Could not complete sign-in" message, redirects to login after 2 seconds

---

## Debugging Checklist

### If "Continue with Google" button doesn't work:

1. **Check Backend Console** for errors:
   ```
   Look for: "googleAuthStart error:" or "Google OAuth env vars missing"
   ```

2. **Check Frontend Console** (F12):
   ```
   Look for: Network errors, CORS errors, or failed requests
   ```

3. **Check Network Tab** (F12 → Network):
   - Click "Continue with Google"
   - Should see redirect to: `http://localhost:5000/api/auth/google`
   - Should then redirect to: `https://accounts.google.com/...`

4. **Verify Environment Variables**:
   ```bash
   # Backend
   cat backend/.env | grep GOOGLE
   
   # Should show:
   GOOGLE_CLIENT_ID=917748415497-...
   GOOGLE_CLIENT_SECRET=GOCSPX-...
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   ```

### If stuck on callback page:

1. **Check Console Logs** (F12):
   - Should see detailed logs from AuthCallback.js
   - Look for errors in getProfile call

2. **Check Network Tab**:
   - Look for `/api/auth/profile` request
   - Check status code (should be 200)
   - Check response body

3. **Check localStorage**:
   ```javascript
   // In console (F12):
   console.log('Token:', localStorage.getItem('token'));
   console.log('User:', localStorage.getItem('user'));
   ```

4. **Verify Token**:
   - Copy token from localStorage
   - Go to: https://jwt.io
   - Paste token
   - Check if it's valid and not expired

---

## Common Issues & Solutions

### Issue 1: ERR_CONNECTION_REFUSED
**Problem**: Frontend server not running
**Solution**: 
```bash
cd D:\Work-bee\Work_Bee\frontend
$env:PORT="3333"
npm start
```

### Issue 2: "redirect_uri_mismatch" from Google
**Problem**: Google OAuth redirect URI doesn't match
**Solution**: 
1. Go to Google Cloud Console
2. Add `http://localhost:5000/api/auth/google/callback`
3. Save changes
4. Wait 5-10 minutes for changes to propagate

### Issue 3: Stuck on "Finishing sign-in..."
**Problem**: getProfile() failing or AuthContext not updating
**Solution**: Check logs in console (F12) - we added detailed logging to debug this

### Issue 4: CORS Error
**Problem**: Frontend can't access backend API
**Solution**: 
- Ensure backend CORS is configured for `http://localhost:3333`
- Check backend server.js CORS configuration

### Issue 5: User Created with Wrong Role
**Problem**: User created as jobseeker but should be employer
**Solution**: 
- Role is determined on FIRST registration
- To change: Delete user from database and re-register
- Or: Manually update user.role in database

---

## Manual Testing Commands

### Check if servers are running:
```bash
# Check backend
curl http://localhost:5000/api/health

# Should return: {"status":"OK","message":"Job Portal API is running"}
```

### Test Google OAuth flow manually:
```bash
# Step 1: Start OAuth (in browser)
http://localhost:5000/api/auth/google?role=jobseeker

# Should redirect to Google login
```

### Clear test data:
```javascript
// In browser console (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## Success Criteria

### ✅ Regular Login Works:
- [ ] Job seeker can login with email/password
- [ ] Employer can login with email/password
- [ ] Admin can login with email/password
- [ ] Users redirected to correct dashboard
- [ ] User info displayed in header

### ✅ Google OAuth - New User:
- [ ] "Continue with Google" button clickable
- [ ] Redirects to Google login page
- [ ] Google login completes successfully
- [ ] Returns to callback page
- [ ] New user created in database
- [ ] User redirected to dashboard
- [ ] User info displayed correctly

### ✅ Google OAuth - Existing User:
- [ ] Existing user can login via Google
- [ ] No duplicate users created
- [ ] User keeps their original role
- [ ] Redirects to correct dashboard

### ✅ Error Handling:
- [ ] Cancel Google login → user stays on login page
- [ ] Invalid token → shows error message
- [ ] Network error → shows appropriate error
- [ ] All errors logged to console

---

## Next Steps After Testing

1. **If all tests pass**: Google OAuth is fully functional ✓

2. **If tests fail**: 
   - Check console logs (detailed logging added)
   - Check Network tab for failed requests
   - Verify environment variables
   - Check Google Cloud Console settings

3. **Production Deployment**:
   - Update redirect URIs in Google Console
   - Update .env with production URLs
   - Use HTTPS (required for OAuth)
   - Test again in production environment

---

## Test Results Template

Fill this out after testing:

```
Date: ___________
Tester: ___________

Regular Login:
- Job Seeker: [ ] PASS / [ ] FAIL - Notes: ________________
- Employer: [ ] PASS / [ ] FAIL - Notes: ________________
- Admin: [ ] PASS / [ ] FAIL - Notes: ________________

Google OAuth - New User:
- Click button: [ ] PASS / [ ] FAIL - Notes: ________________
- Google redirect: [ ] PASS / [ ] FAIL - Notes: ________________
- User created: [ ] PASS / [ ] FAIL - Notes: ________________
- Dashboard redirect: [ ] PASS / [ ] FAIL - Notes: ________________

Google OAuth - Existing User:
- Login successful: [ ] PASS / [ ] FAIL - Notes: ________________
- No duplicates: [ ] PASS / [ ] FAIL - Notes: ________________
- Correct role: [ ] PASS / [ ] FAIL - Notes: ________________

Error Handling:
- Cancel flow: [ ] PASS / [ ] FAIL - Notes: ________________
- Invalid token: [ ] PASS / [ ] FAIL - Notes: ________________

Overall: [ ] ALL TESTS PASSED / [ ] SOME FAILURES

Issues Found:
_________________________________________________________________
_________________________________________________________________
```
