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

### 1.3 Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **Create Database**
3. Choose **Start in production mode**
4. Select your preferred region (e.g., `us-central1`)
5. Click **Enable**

### 1.4 Configure Firestore Security Rules

1. In Firestore, go to **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Projects - users can access their own projects
    match /projects/{projectId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }

    // Audits - users can access their own audits
    match /audits/{auditId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }

    // Shared audits - anyone with the link can read
    match /sharedAudits/{shareId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Team members
    match /teams/{teamId}/members/{memberId} {
      allow read, write: if request.auth != null;
    }

    // Feedback submissions - authenticated users can create
    match /feedback/{feedbackId} {
      allow create: if request.auth != null;
      // Note: Reading/managing feedback requires admin access via Firebase Console or Cloud Functions
    }
  }
}
```

3. Click **Publish**

### 1.5 Enable Cloud Storage

1. Go to **Build → Storage**
2. Click **Get Started**
3. Choose **Start in production mode**
4. Select the same region as Firestore
5. Click **Done**

### 1.6 Configure Storage Security Rules

1. In Storage, go to **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User uploads
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Shared files (read-only for anyone with link)
    match /shared/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Feedback screenshots - authenticated users can upload
    match /feedback-screenshots/{fileName} {
      allow write: if request.auth != null;
      // Read access limited to admins via Firebase Console
    }
  }
}
```

3. Click **Publish**

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

Railway hosts the backend proxy that securely forwards requests to Claude API.

### 2.1 Create AI Proxy Service

Create a new file `api-proxy/index.js` in a separate repository or directory:

```javascript
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration - update with your Vercel domain
const allowedOrigins = [
  'https://your-app.vercel.app',
  'http://localhost:5173' // for local development
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '10mb' }));

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Claude API proxy endpoint
app.post('/api/claude', async (req, res) => {
  try {
    const { model, max_tokens, messages, system } = req.body;

    const response = await anthropic.messages.create({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: max_tokens || 4096,
      system: system,
      messages: messages,
    });

    res.json(response);
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Failed to process request'
    });
  }
});

app.listen(port, () => {
  console.log(`AI Proxy running on port ${port}`);
});
```

Create `api-proxy/package.json`:

```json
{
  "name": "content-strategy-ai-proxy",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "cors": "^2.8.5",
    "express": "^4.18.2"
  }
}
```

### 2.2 Deploy to Railway

1. Go to [Railway](https://railway.app) and sign in
2. Click **New Project**
3. Select **Deploy from GitHub repo** or **Empty Project**
4. If using GitHub:
   - Connect your GitHub account
   - Select the api-proxy repository
5. If empty project:
   - Click **Add Service → Empty Service**
   - Go to **Settings → Deploy**
   - Connect to Git or use Railway CLI

### 2.3 Configure Railway Environment Variables

1. In your Railway service, go to **Variables** tab
2. Add the following:

| Variable | Value |
|----------|-------|
| `ANTHROPIC_API_KEY` | Your Claude API key from [Anthropic Console](https://console.anthropic.com) |
| `PORT` | `3001` (Railway will override this automatically) |

### 2.4 Get Railway URL

1. Go to **Settings → Networking**
2. Click **Generate Domain** or add a custom domain
3. Copy the URL (e.g., `https://your-proxy.up.railway.app`)

Save this URL - you'll need it for Vercel.

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
| `VITE_AI_PROXY_URL` | Your Railway URL (e.g., `https://your-proxy.up.railway.app/api/claude`) | All |

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
2. Create a test account
3. Test each feature:
   - [ ] User registration/login
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

---

## Security Checklist

Before going live:

- [ ] Firebase security rules are in production mode
- [ ] Storage rules restrict access appropriately
- [ ] AI proxy only accepts requests from your domain (CORS)
- [ ] Anthropic API key is not exposed in frontend code
- [ ] Environment variables are set correctly in each platform
- [ ] HTTPS is enforced on all endpoints

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
