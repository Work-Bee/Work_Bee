# Google OAuth Setup Guide

## Problem
The "Continue with Google" button is failing with the error:
```json
{"success":false,"error":"Failed to start Google OAuth"}
```

## Root Cause
Missing Google OAuth credentials in the `.env` file. The backend requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables to initialize the Google OAuth client.

## Solution

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Create a new project or select an existing one

3. **Enable Google+ API (or Google Identity Services)**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" or "Google Identity Services"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" user type
     - Fill in app name, user support email, and developer contact
     - Add scopes: `email`, `profile`, `openid`
     - Add test users if in development
   - Choose Application type: "Web application"
   - Name: "Work-Bee Job Portal" (or any name you prefer)

5. **Add Authorized Redirect URIs**
   Add these URIs (based on your setup):
   ```
   http://localhost:5000/api/auth/google/callback
   http://localhost:5555/api/auth/google/callback
   http://localhost:3333/auth/callback
   ```

6. **Save and Copy Credentials**
   - Click "Create"
   - Copy the **Client ID** and **Client Secret**

### Step 2: Update Backend .env File

Open `backend/.env` and add these lines (replace with your actual credentials):

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
FRONTEND_BASE_URL=http://localhost:3333
```

### Step 3: Restart Your Backend Server

After updating the `.env` file, restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm start
# or if using nodemon
npm run dev
```

### Step 4: Test the Integration

1. Go to your frontend (http://localhost:3333)
2. Click "Continue with Google"
3. You should be redirected to Google's login page
4. After authentication, you'll be redirected back to your app with a token

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that the redirect URI in Google Cloud Console exactly matches the one in your `.env`
- Make sure there are no trailing slashes or typos
- Common URIs to add:
  - `http://localhost:5000/api/auth/google/callback`
  - `http://localhost:3333/auth/callback`

### Error: "Access blocked: This app's request is invalid"
- Make sure you've configured the OAuth consent screen
- Add your test email to the list of test users
- Verify that the required scopes (email, profile, openid) are added

### Error: "idpiframe_initialization_failed"
- This usually happens in the browser
- Clear cookies and cache
- Check if third-party cookies are enabled in your browser

### Still Getting "Failed to start Google OAuth"
- Double-check that environment variables are set correctly
- Verify the `.env` file is in the `backend` folder
- Make sure you restarted the server after updating `.env`
- Check server console logs for more detailed error messages

## Port Configuration

If you're running the backend on a different port:
- Update `GOOGLE_REDIRECT_URI` to match your backend port
- Update the redirect URIs in Google Cloud Console accordingly

Example for port 5555:
```env
GOOGLE_REDIRECT_URI=http://localhost:5555/api/auth/google/callback
```

## Production Setup

For production deployment:
1. Get a domain name
2. Set up HTTPS (required for OAuth in production)
3. Update redirect URIs in Google Cloud Console to use your production domain:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```
4. Update `.env` with production values:
   ```env
   GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
   FRONTEND_BASE_URL=https://yourdomain.com
   NODE_ENV=production
   ```

## Security Notes

- **Never commit** the `.env` file to version control
- Keep your `GOOGLE_CLIENT_SECRET` confidential
- Use different OAuth credentials for development and production
- Regularly rotate your secrets in production
- Enable additional security features in Google Cloud Console (like domain verification)

## Testing Without Google OAuth (Temporary Workaround)

If you want to test your app without setting up Google OAuth immediately, you can use the regular email/password registration and login instead of the "Continue with Google" button.
