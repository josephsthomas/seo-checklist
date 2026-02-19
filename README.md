# Content Strategy Portal

A comprehensive SEO and content strategy platform for agencies and enterprise teams. Manage projects, run technical audits, ensure accessibility compliance, and optimize content at scale.

## Features

### Project Management
- Multi-project dashboard with visual progress tracking
- 321-item SEO checklist covering all project phases
- Team collaboration with role-based permissions
- Timeline management with due dates and assignments
- Professional Excel and PDF exports

### Technical Audit Tool
- Upload Screaming Frog exports (ZIP files up to 5GB)
- 31 audit categories with prioritized recommendations
- AI-powered fix suggestions
- Health score and issue breakdown
- Export audit reports for clients

### AI Readability Checker
- **URL Analysis**: Fetch any URL and score its AI readability (50+ automated checks)
- **Multi-LLM Preview**: See how Claude, GPT-4o, and Gemini interpret your content
- **5-Category Scoring**: Content Structure, Clarity, Technical Access, Metadata & Schema, AI Signals
- **AI Recommendations**: Claude-generated prioritized improvement suggestions
- **Score Trending**: Track readability improvements over time with sparkline history
- **Export & Share**: Full PDF reports (9 pages), Excel workbooks, JSON, and shareable links

### Accessibility Analyzer
- WCAG 2.2 compliance scoring (A, AA, AAA levels)
- 93 Axe-core accessibility rules
- Impact-based prioritization
- AI-powered remediation suggestions
- VPAT report generation

### Content Tools
- **Meta Data Generator**: AI-assisted title and description optimization
- **Schema Generator**: JSON-LD structured data for 15+ schema types
- **Image Alt Generator**: Bulk alt text generation for images

### Authentication & Account Management
- **Secure Registration**: Scroll-to-accept policy modals for Terms of Service, Privacy Policy, and AI Usage Policy
- **Password Security**: Strength meter with visual feedback and requirements checklist
- **Email Verification**: Automatic verification emails with resend capability
- **Password Reset**: Self-service forgot password flow via email
- **Account Settings**: Profile management, avatar upload, notification preferences
- **Account Deletion**: Self-service account deletion with data cleanup

### Resource Library
- 200+ SEO resources organized by category
- Video tutorials and documentation
- Searchable glossary of SEO terms

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account
- API keys for AI features (Anthropic, OpenAI, Google — see below)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd content-strategy-portal

# Install frontend dependencies
npm install

# Copy environment template
cp .env.example .env

# Start frontend development server
npm run dev
```

### Server Setup (AI Proxy)

The AI features (Readability Checker, Meta Generator, Schema Generator, Alt Generator) require the proxy server in the `server/` directory.

```bash
# Install server dependencies
cd server
npm install

# Copy server environment template
cp .env.example .env
# Edit server/.env with your API keys (see below)

# Start proxy server
npm start
# Server runs on http://localhost:3001
```

Then set `VITE_AI_PROXY_URL=http://localhost:3001` in your frontend `.env`.

### Environment Variables

**Frontend** (`.env` in project root):

```env
# Firebase Configuration (required)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI Proxy (required for AI features — base URL, no path suffix)
VITE_AI_PROXY_URL=http://localhost:3001
```

**Server** (`server/.env`):

```env
# CORS — your frontend URLs (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173

# Firebase Admin SDK (JSON service account key — single line)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# LLM API Keys
ANTHROPIC_API_KEY=sk-ant-...    # https://console.anthropic.com
OPENAI_API_KEY=sk-...           # https://platform.openai.com/api-keys
GEMINI_API_KEY=AI...            # https://aistudio.google.com/apikey
```

See `server/.env.example` for the full template with comments.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to:
- Vercel (frontend)
- Railway (API proxy — `server/` directory)
- Firebase (authentication & database)

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI Proxy**: Express.js server routing to Claude, OpenAI, and Gemini APIs
- **AI Models**: Claude Sonnet 4.5, GPT-4o, Gemini 2.0 Flash
- **Export**: ExcelJS, jsPDF, html2canvas

## Scripts

```bash
# Frontend
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run test     # Run test suite
npm run lint     # Run ESLint

# Server
cd server
npm start        # Start proxy server (port 3001)
npm run dev      # Start with file watching (Node 18+)
```

## Security

- Firebase Authentication with email/password and Google OAuth
- Email verification required for new accounts
- Password strength requirements enforced (8+ characters)
- Scroll-to-accept policy agreements for legal compliance
- Firestore security rules enforce data access
- AI API keys stored server-side only — never exposed to browser
- Firebase auth token verification on all proxy requests
- Tiered rate limiting: Free (10/hr), Pro (30/hr), Enterprise (200/hr)
- SSRF protection on server-side URL fetching
- Secure account deletion with data cleanup

## Support

For issues or feature requests, please contact support or open a GitHub issue.

## License

Proprietary - All rights reserved.
