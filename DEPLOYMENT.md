# Deployment Guide

This guide walks you through deploying the Content Strategy Portal to production using Firebase, Vercel, and Railway.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Vercel         │────▶│  Railway        │────▶│  Claude API     │
│  (Frontend)     │     │  (AI Proxy)     │     │  (Anthropic)    │
│                 │     │                 │     │                 │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│                 │
│  Firebase       │
│  - Auth         │
│  - Firestore    │
│  - Storage      │
│                 │
└─────────────────┘
```

## Prerequisites

- Node.js 18+ installed locally
- Git repository with the codebase
- Accounts on:
  - [Firebase](https://console.firebase.google.com)
  - [Vercel](https://vercel.com)
  - [Railway](https://railway.app)
  - [Anthropic](https://console.anthropic.com) (for Claude API)

---

## Step 1: Firebase Setup

Firebase handles authentication, database, and file storage.

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add Project**
3. Enter project name (e.g., `content-strategy-portal`)
4. Disable Google Analytics (optional)
5. Click **Create Project**

### 1.2 Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider:
   - Click **Email/Password**
   - Toggle **Enable**
   - Click **Save**
4. (Optional) Enable **Google** provider:
   - Click **Google**
   - Toggle **Enable**
   - Add support email
   - Click **Save**

### 1.2.1 Configure Email Templates (Important!)

The application uses email verification and password reset. Configure these templates:

1. In Firebase Console, go to **Authentication → Templates**
2. Configure **Email address verification**:
   - Customize the sender name (e.g., "Content Strategy Portal")
   - Edit the subject and body as desired
   - Ensure the action URL is correct
3. Configure **Password reset**:
   - Customize the sender name
   - Edit the subject line (e.g., "Reset your Content Strategy Portal password")
   - Customize the email body

**Note:** Firebase uses action URLs that handle verification/reset in the Firebase-hosted page. The user will be redirected back to your app after completing the action.

### 1.3 Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **Create Database**
3. Choose **Start in production mode**
4. Select your preferred region (e.g., `us-central1`)
5. Click **Enable**

### 1.4 Configure Firestore Security Rules

1. In Firestore, go to **Rules** tab
2. Replace the default rules with the contents of `firestore.rules` from this repository
3. Click **Publish**

The rules file includes:
- User profile access with settings subcollection for notification preferences
- Project access with team member permissions
- Checklist completions and custom items
- Comments and notifications
- Activity logging
- Task assignments and time entries
- File attachments
- Feedback submissions
- Shared audit links (public read access)

**Important:** The rules are designed to:
- Allow users to manage their own profiles and settings
- Support team collaboration on projects
- Enable account deletion (users can delete their own data)
- Protect feedback from public read access

### 1.5 Enable Cloud Storage

1. Go to **Build → Storage**
2. Click **Get Started**
3. Choose **Start in production mode**
4. Select the same region as Firestore
5. Click **Done**

### 1.6 Configure Storage Security Rules

1. In Storage, go to **Rules** tab
2. Replace with the contents of `storage.rules` from this repository
3. Click **Publish**

The storage rules include:
- **User avatars** (`/users/{userId}/avatar`): 2MB limit, images only
- **Feedback screenshots** (`/feedback/*`): 5MB limit, images only
- **Project attachments** (`/projects/{projectId}/items/*`): 10MB limit, documents/images

**File type restrictions:**
- Avatars: Images only (JPEG, PNG, GIF, WebP)
- Screenshots: Images only
- Attachments: Images, PDF, Word, Excel, CSV, TXT

### 1.7 Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web** icon (`</>`)
4. Register app with nickname (e.g., `web-app`)
5. Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

Save these values - you'll need them for Vercel environment variables.

---

## Step 2: Railway Setup (AI Proxy)

Railway hosts the backend proxy server that securely routes requests to Claude, OpenAI, and Gemini APIs. The proxy server code is in the `server/` directory of this repository.

### What the Proxy Server Does

- **Multi-LLM Routing**: Routes requests to Anthropic Claude, OpenAI GPT-4o, and Google Gemini
- **URL Fetching**: Fetches web page content server-side for the AI Readability Checker
- **Firebase Auth Verification**: Validates user authentication tokens on every request
- **Tiered Rate Limiting**: Free (10/hr), Pro (30/hr), Enterprise (200/hr) — prevents unlimited API cost
- **SSRF Protection**: Validates URLs before fetching to prevent server-side request forgery
- **Health Monitoring**: Structured `/health` endpoint for uptime monitoring

### 2.1 Local Development

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your API keys (see below)
npm start
# Server runs on http://localhost:3001
```

### 2.2 Deploy to Railway

1. Go to [Railway](https://railway.app) and sign in
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Connect your GitHub account and select this repository
5. In **Settings → Build**, set the **Root Directory** to `server`
6. Railway will auto-detect Node.js and run `npm start`

Alternatively, deploy the `server/` directory as a standalone repository.

### 2.3 Configure Railway Environment Variables

In your Railway service, go to **Variables** tab and add:

| Variable | Value | Required |
|----------|-------|----------|
| `ANTHROPIC_API_KEY` | Claude API key from [Anthropic Console](https://console.anthropic.com) | Yes |
| `OPENAI_API_KEY` | OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys) | Yes |
| `GEMINI_API_KEY` | Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) | Yes |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase service account JSON (single-line) — see below | Yes |
| `ALLOWED_ORIGINS` | Your Vercel URL, e.g. `https://your-app.vercel.app` | Yes |
| `PORT` | Railway sets this automatically | No |
| `NODE_ENV` | `production` | Recommended |

**Getting the Firebase Service Account Key:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click **Generate new private key**
3. Open the downloaded JSON file
4. Copy the entire contents and paste as a single-line string in the `FIREBASE_SERVICE_ACCOUNT_KEY` variable

### 2.4 Get Railway URL

1. Go to **Settings → Networking**
2. Click **Generate Domain** or add a custom domain
3. Copy the URL (e.g., `https://your-proxy.up.railway.app`)
4. Verify health: `curl https://your-proxy.up.railway.app/health`

Save this URL — you'll need it for the Vercel `VITE_AI_PROXY_URL` variable.

### 2.5 Proxy API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check — returns service status and configured providers |
| `/` | POST | Yes | AI request — legacy format (`{ prompt, maxTokens }`) or multi-provider (`{ provider, model, content }`) |
| `/api/ai` | POST | Yes | AI request — same as above |
| `/api/fetch-url` | POST | Yes | Fetch URL content server-side for readability analysis |

---

## Step 3: Vercel Deployment (Frontend)

Vercel hosts the React frontend application.

### 3.1 Connect Repository

1. Go to [Vercel](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import your Git repository
4. Select the repository containing the Content Strategy Portal

### 3.2 Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 3.3 Add Environment Variables

In the **Environment Variables** section, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_FIREBASE_API_KEY` | From Firebase config | All |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | All |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID | All |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` | All |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | From Firebase config | All |
| `VITE_FIREBASE_APP_ID` | From Firebase config | All |
| `VITE_AI_PROXY_URL` | Your Railway URL — base URL only (e.g., `https://your-proxy.up.railway.app`) | All |

### 3.4 Deploy

1. Click **Deploy**
2. Wait for the build to complete (usually 1-2 minutes)
3. Your app will be available at `https://your-project.vercel.app`

### 3.5 Update CORS (Important!)

After getting your Vercel URL, go back to Railway and update the CORS configuration in your proxy code to include your production domain.

---

## Step 4: Post-Deployment Configuration

### 4.1 Add Authorized Domains to Firebase

1. In Firebase Console, go to **Authentication → Settings**
2. Under **Authorized domains**, add:
   - `your-project.vercel.app`
   - Any custom domains you're using

### 4.2 Test the Deployment

1. Visit your Vercel URL
2. Test the authentication flow:
   - [ ] User registration with policy acceptance (scroll all 3 policies)
   - [ ] Password strength meter works correctly
   - [ ] Email verification email received
   - [ ] Email verification banner appears after login
   - [ ] Resend verification email works
   - [ ] Password reset flow works
   - [ ] Google OAuth login works
3. Test account management:
   - [ ] Profile settings update correctly
   - [ ] Avatar upload/remove works
   - [ ] Password change works
   - [ ] Account deletion works (test with throwaway account)
4. Test core features:
   - [ ] Create a project
   - [ ] Upload audit file
   - [ ] Run accessibility scan
   - [ ] Test AI features (meta generator, etc.)
   - [ ] Export reports

### 4.3 Set Up Custom Domain (Optional)

**Vercel:**
1. Go to your project **Settings → Domains**
2. Add your custom domain
3. Configure DNS records as instructed

**Firebase:**
1. Add the custom domain to authorized domains in Authentication settings

---

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `VITE_AI_PROXY_URL` | Yes* | Railway proxy URL for AI features |

*AI features will be disabled if not configured

### Backend Proxy (Railway)

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key from Anthropic |
| `PORT` | No | Server port (Railway sets automatically) |

---

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Add your Vercel domain to Firebase Authentication authorized domains

### AI features not working
- Check Railway logs for errors
- Verify `VITE_AI_PROXY_URL` includes the full path (`/api/claude`)
- Ensure CORS is configured with your Vercel domain

### Build fails on Vercel
- Check that all environment variables are set
- Ensure Node.js version is 18+
- Review build logs for specific errors

### Storage upload fails
- Verify Firebase Storage rules are published
- Check that the user is authenticated
- Ensure storage bucket name is correct

### Email verification not received
- Check spam/junk folder
- Verify Email/Password provider is enabled
- Check Firebase Authentication → Templates for email configuration
- Ensure sender email is verified (for custom domains)

### Password reset email not received
- Same troubleshooting as email verification
- Check that the email address exists in Firebase Auth

### Avatar upload fails
- Check Storage rules allow `/users/{userId}/avatar`
- Verify file is under 2MB and is an image
- Check browser console for CORS errors

### Account deletion fails
- User must re-authenticate with correct password
- Check Firestore rules allow user to delete their own data
- Check for cascading delete issues in Firestore

---

## Security Checklist

Before going live:

- [ ] Firebase security rules are in production mode
- [ ] Storage rules restrict access appropriately
- [ ] AI proxy only accepts requests from your domain (CORS)
- [ ] Anthropic API key is not exposed in frontend code
- [ ] Environment variables are set correctly in each platform
- [ ] HTTPS is enforced on all endpoints
- [ ] Email verification templates are configured
- [ ] Password reset templates are configured
- [ ] Policy documents (Terms, Privacy, AI Usage) are up to date
- [ ] Account deletion properly cleans up all user data

---

## Monitoring & Maintenance

### Firebase
- Monitor usage in Firebase Console → Usage and billing
- Set up budget alerts to avoid unexpected charges

### Railway
- View logs in Railway dashboard
- Set up alerts for service downtime

### Vercel
- View analytics in Vercel dashboard
- Set up deployment notifications

---

## Cost Estimates

| Service | Free Tier | Estimated Production Cost |
|---------|-----------|---------------------------|
| Firebase Auth | 50K MAU free | $0.06/MAU beyond free tier |
| Firestore | 1GB storage, 50K reads/day | $0.18/100K reads |
| Firebase Storage | 5GB free | $0.026/GB beyond free tier |
| Vercel | 100GB bandwidth | $20/mo Pro for more |
| Railway | $5 free credit/month | ~$5-20/mo based on usage |
| Claude API | Pay per token | ~$3/1M input tokens |

Actual costs depend heavily on usage. Start with free tiers and scale as needed.
