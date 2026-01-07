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

### Resource Library
- 200+ SEO resources organized by category
- Video tutorials and documentation
- Searchable glossary of SEO terms

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd content-strategy-portal

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
# Firebase Configuration (required)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI Features (optional - requires backend proxy)
VITE_AI_PROXY_URL=https://your-backend.com/api/claude
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to:
- Vercel (frontend)
- Railway (API proxy)
- Firebase (authentication & database)

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Claude API (via secure backend proxy)
- **Export**: ExcelJS, jsPDF, html2canvas

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run test     # Run test suite
npm run lint     # Run ESLint
```

## Security

- Firebase Authentication with email/password and Google OAuth
- Firestore security rules enforce data access
- AI API calls require secure backend proxy in production
- No sensitive data stored in client-side code

## Support

For issues or feature requests, please contact support or open a GitHub issue.

## License

Proprietary - All rights reserved.
