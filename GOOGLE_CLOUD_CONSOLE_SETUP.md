# Google Cloud Console Configuration

## Required Settings for Work-Bee OAuth

### 1. OAuth Consent Screen

Go to: **APIs & Services** → **OAuth consent screen**

**User Type**: External
- App name: `Work-Bee Job Portal`
- User support email: Your email
- Developer contact: Your email

**Scopes**: Add these scopes
- `openid`
- `email`
- `profile`

**Test users** (if not published):
- Add your test Google accounts

---

### 2. OAuth 2.0 Client ID

Go to: **APIs & Services** → **Credentials**

**Application type**: Web application
**Name**: Work-Bee OAuth Client

#### ✅ Authorized JavaScript origins:
```
http://localhost:3333
http://localhost:5000
```

#### ✅ Authorized redirect URIs:
```
http://localhost:5000/api/auth/google/callback
http://localhost:3333/auth/callback
```

**Your Credentials:**
```
Client ID: 917748415497-ngem52citb0ck7elfm9n6bftq7e4bbot.apps.googleusercontent.com
Client Secret: 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
```

---

### 3. Common Issues

#### "redirect_uri_mismatch" Error

**Problem**: The redirect URI doesn't match what's in Google Console

**Solution**: Ensure EXACTLY these URIs are added:
1. `http://localhost:5000/api/auth/google/callback` ← Backend callback
2. `http://localhost:3333/auth/callback` ← Frontend callback (optional)

**Important**: 
- No trailing slashes
- Exact case match
- Include the `/api/` part
- Wait 5-10 minutes after adding URIs

#### "Access blocked: This app's request is invalid"

**Solution**:
1. Complete OAuth consent screen configuration
2. Add test users if app is not published
3. Add required scopes (openid, email, profile)

#### "idpiframe_initialization_failed"

**Solution**:
1. Enable third-party cookies in browser
2. Clear browser cache
3. Try in incognito mode

---

### 4. Production Setup (When Ready)

**When deploying to production:**

1. Get your production domain (e.g., `https://workbee.com`)

2. Update Google Console:
   - Add production JavaScript origins
   - Add production redirect URI:
     ```
     https://workbee.com/api/auth/google/callback
     ```

3. Update backend `.env`:
   ```
   GOOGLE_REDIRECT_URI=https://workbee.com/api/auth/google/callback
   FRONTEND_BASE_URL=https://workbee.com
   NODE_ENV=production
   ```

4. Publish OAuth consent screen (remove "Testing" mode)

5. **MUST use HTTPS** - OAuth won't work with HTTP in production

---

### 5. Verification Checklist

Before testing, verify:

- [ ] OAuth consent screen configured
- [ ] Scopes added (openid, email, profile)
- [ ] Test users added (if not published)
- [ ] Client ID and Secret match in `.env`
- [ ] Redirect URIs exactly match:
  - [ ] `http://localhost:5000/api/auth/google/callback`
- [ ] JavaScript origins added
- [ ] Backend `.env` has all Google variables
- [ ] Frontend `.env` has `REACT_APP_API_URL`
- [ ] Both servers running

---

### 6. Testing Access

**Test the OAuth flow:**

1. Navigate to: http://localhost:3333/login/jobseeker
2. Click "Continue with Google"
3. Should redirect to:
   ```
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=917748415497-ngem52citb0ck7elfm9n6bftq7e4bbot.apps.googleusercontent.com
     &redirect_uri=http://localhost:5000/api/auth/google/callback
     &response_type=code
     &scope=openid%20email%20profile
     ...
   ```

4. After Google login, redirects to:
   ```
   http://localhost:3333/auth/callback?token=eyJ...&role=jobseeker
   ```

5. Then navigates to dashboard

---

### 7. Quick Links

- **Google Cloud Console**: https://console.cloud.google.com
- **OAuth Credentials**: https://console.cloud.google.com/apis/credentials
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent
- **JWT Decoder** (for testing tokens): https://jwt.io

---

### 8. Security Notes

- ✅ Client Secret is saved in backend `.env` (not committed to Git)
- ✅ Never expose Client Secret in frontend code
- ✅ Use HTTPS in production
- ✅ Rotate secrets periodically in production
- ✅ Enable additional security features in Google Console for production
- ✅ Monitor OAuth usage in Google Console
