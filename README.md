# SEO Checklist Pro - Agency Project Management Platform

A comprehensive SEO checklist and project management platform designed for agencies to manage client SEO projects with 321 professional checklist items.

## Features (Phase 5 Complete)

### ✅ Phase 5: Project Management Core

- **Multi-Project Management**: Create and manage unlimited SEO projects
- **Firebase Authentication**: Email/password and Google OAuth sign-in
- **Project Dashboard**: Visual overview of all projects with stats
- **Project Creation Wizard**: 4-step guided project setup
- **SEO Checklist**: 321 comprehensive items covering all SEO phases
  - Discovery (keyword research, audits, competitive analysis)
  - Strategy (IA, URL structure, schema planning)
  - Build (technical SEO, on-page optimization, performance)
  - Pre-Launch, Launch, Post-Launch
- **Real-time Data Sync**: Firestore live updates across devices
- **Professional Excel Export**: Multi-sheet reports with project data
- **Project Filtering**: By phase, priority, owner, category
- **Progress Tracking**: Visual progress bars and completion stats
- **Project Types Support**: Net New Site, Site Refresh, Campaign Landing Page, Microsite

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Firebase account (free tier works)
- Git

### Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd seo-checklist
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Firebase Setup

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com)

2. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Enable Google OAuth

3. Create Firestore Database:
   - Go to Firestore Database
   - Click "Create database"
   - Start in production mode
   - Choose your region

4. Get Firebase Config:
   - Go to Project Settings (gear icon) → General
   - Scroll to "Your apps" section
   - Click the web icon (</>) to add a web app
   - Copy the firebaseConfig object

5. Update Firestore Rules:
   - Go to Firestore Database → Rules
   - Copy contents from `firestore.rules` in this repo
   - Publish the rules

### Step 4: Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 5: Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Step 6: Build for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── projects/
│   │   ├── ProjectDashboard.jsx
│   │   ├── ProjectCreationWizard.jsx
│   │   └── ProjectCard.jsx
│   ├── checklist/
│   │   └── SEOChecklist.jsx
│   └── shared/
│       └── Navigation.jsx
├── contexts/
│   └── AuthContext.jsx
├── hooks/
│   ├── useProjects.js
│   └── useChecklist.js
├── lib/
│   ├── firebase.js
│   └── excelExport.js
├── data/
│   └── checklistData.js
├── App.jsx
├── main.jsx
└── index.css
```

## Usage

### Creating a Project

1. Click "New Project" button
2. Follow 4-step wizard:
   - **Step 1**: Enter project name, client name, select project type
   - **Step 2**: Set start date, target launch date, status
   - **Step 3**: Add estimated hours and budget
   - **Step 4**: Add description, contact info, notes
3. Click "Create Project"

### Managing Checklist

1. Click "View Checklist" on any project
2. See all 321 SEO checklist items filtered by your project type
3. Check off items as you complete them
4. Use filters to focus on specific phases, priorities, or owners
5. Track overall progress with the progress bar
6. Export to Excel for client reports

### Excel Export

The Excel export creates 5 sheets:
- **Overview**: Project summary and stats
- **By Phase**: Items grouped by phase (Discovery, Strategy, etc.)
- **By Priority**: Items grouped by priority level
- **By Owner**: Items grouped by team role
- **All Items**: Complete list with auto-filter

## Firestore Database Schema

### Collections

#### `users`
```javascript
{
  email: string,
  name: string,
  role: string,  // "project_manager", "seo_specialist", etc.
  createdAt: timestamp,
  avatar: string | null
}
```

#### `projects`
```javascript
{
  name: string,
  clientName: string,
  projectType: string,  // "Net New Site", "Site Refresh", etc.
  status: string,  // "Planning", "Active", "Completed", etc.
  startDate: timestamp,
  targetLaunchDate: timestamp,
  actualLaunchDate: timestamp | null,
  estimatedHours: number,
  budget: number,
  description: string,
  primaryContact: {
    name: string,
    email: string,
    phone: string
  },
  ownerId: string,  // user ID who created project
  teamMembers: array,  // array of user IDs
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `checklist_completions`
```javascript
{
  "{projectId}_completions": {
    "1": boolean,  // item ID: completion status
    "2": boolean,
    // ... for all 321 items
  }
}
```

## Technologies Used

- **Frontend**: React 18, React Router v6
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **State Management**: React Context + Hooks
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Dates**: date-fns
- **Excel**: SheetJS (xlsx)
- **Build Tool**: Vite
- **Notifications**: react-hot-toast

## Security

- Authentication required for all routes
- Firestore security rules enforce data access
- Users can only access their own projects
- Team members can be added to projects for shared access
- Environment variables keep Firebase config secure

## Future Phases

Coming soon:
- **Phase 6**: Team collaboration, task assignments, comments, notifications
- **Phase 7**: Help system, resource library, video tutorials
- **Phase 8**: Kanban/Timeline views, client portal, automated reports
- **Phase 9**: Integrations (Jira, Slack), white-labeling, analytics

## Support

For issues or questions:
1. Check the Firebase console for any errors
2. Verify `.env` file has correct credentials
3. Ensure Firestore rules are properly configured
4. Check browser console for error messages

## License

MIT License - feel free to use for your agency!

---

**Built with ❤️ for SEO Professionals**
