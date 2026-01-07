import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { Home, Search as SearchIcon } from 'lucide-react';
import { lazyWithRetry } from './utils/lazyWithRetry';

// Auth Components (keep eager - needed for initial auth)
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout Components (keep eager - always needed)
import Navigation from './components/shared/Navigation';
import Footer from './components/shared/Footer';
import ErrorBoundary, { ToolErrorBoundary } from './components/shared/ErrorBoundary';

// Home - eager load for fast initial render
import HomePage from './components/home/HomePage';

// Lazy loaded components for code splitting (with retry logic)
const ProjectDashboard = lazyWithRetry(() => import('./components/projects/ProjectDashboard'), 'ProjectDashboard');
const ProjectCreationWizard = lazyWithRetry(() => import('./components/projects/ProjectCreationWizard'), 'ProjectCreationWizard');
const MyTasksPage = lazyWithRetry(() => import('./components/projects/MyTasksPage'), 'MyTasksPage');
const TeamManagementPage = lazyWithRetry(() => import('./components/projects/TeamManagementPage'), 'TeamManagementPage');
const SEOChecklist = lazyWithRetry(() => import('./components/checklist/SEOChecklist'), 'SEOChecklist');
const ProgressDashboard = lazyWithRetry(() => import('./components/projects/ProgressDashboard'), 'ProgressDashboard');
const ProjectHealthReport = lazyWithRetry(() => import('./components/projects/ProjectHealthReport'), 'ProjectHealthReport');

// Activity Components - lazy load
const ActivityPage = lazyWithRetry(() => import('./components/activity/ActivityPage'), 'ActivityPage');

// Help Components - lazy load
const ResourceLibrary = lazyWithRetry(() => import('./components/help/ResourceLibrary'), 'ResourceLibrary');
const GlossaryPage = lazyWithRetry(() => import('./components/help/GlossaryPage'), 'GlossaryPage');
import KeyboardShortcuts from './components/help/KeyboardShortcuts';
import OnboardingWalkthrough from './components/help/OnboardingWalkthrough';
import FeedbackWidget from './components/shared/FeedbackWidget';
import CommandPalette, { useCommandPalette } from './components/shared/CommandPalette';

// Audit Components - lazy load (heaviest components with exceljs, jspdf)
const AuditPage = lazyWithRetry(() => import('./components/audit/AuditPage'), 'AuditPage');
const SharedAuditView = lazyWithRetry(() => import('./components/audit/shared/SharedAuditView'), 'SharedAuditView');

// Accessibility Components - lazy load
const AccessibilityAuditPage = lazyWithRetry(() => import('./components/accessibility/AccessibilityAuditPage'), 'AccessibilityAuditPage');

// Image Alt Generator - lazy load
const ImageAltGeneratorPage = lazyWithRetry(() => import('./components/image-alt-generator/ImageAltGeneratorPage'), 'ImageAltGeneratorPage');

// Meta Data Generator - lazy load
const MetaGeneratorPage = lazyWithRetry(() => import('./components/meta-generator/MetaGeneratorPage'), 'MetaGeneratorPage');

// Structured Data Generator - lazy load
const SchemaGeneratorPage = lazyWithRetry(() => import('./components/schema-generator/SchemaGeneratorPage'), 'SchemaGeneratorPage');

// User Settings - lazy load
const UserSettingsPage = lazyWithRetry(() => import('./components/settings/UserSettingsPage'), 'UserSettingsPage');

// User Profile - lazy load
const UserProfilePage = lazyWithRetry(() => import('./components/profile/UserProfilePage'), 'UserProfilePage');

// Export Hub - lazy load
const ExportHubPage = lazyWithRetry(() => import('./components/export/ExportHubPage'), 'ExportHubPage');

/**
 * Enhanced Loading Fallback with Skeleton
 */
function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 border-4 border-charcoal-100 rounded-full"></div>
          {/* Spinning gradient ring */}
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-500 border-r-cyan-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-charcoal-500 mt-4 font-medium">Loading...</p>
      </div>
    </div>
  );
}

/**
 * 404 Not Found Page
 */
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-charcoal-100 to-charcoal-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SearchIcon className="w-12 h-12 text-charcoal-400" />
        </div>
        <h1 className="text-6xl font-bold text-charcoal-900 mb-2">404</h1>
        <p className="text-xl text-charcoal-600 mb-6">Page not found</p>
        <p className="text-charcoal-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/"
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Go to Home
        </Link>
      </div>
    </div>
  );
}

// Wrapper component to use hooks inside Router
function AppContent() {
  const commandPalette = useCommandPalette();

  return (
    <div className="min-h-screen bg-charcoal-50 dark:bg-charcoal-900 flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navigation />
      <CommandPalette isOpen={commandPalette.isOpen} onClose={commandPalette.close} />
      <OnboardingWalkthrough />
      <KeyboardShortcuts />
          <main id="main-content" className="flex-1" role="main">
            <ErrorBoundary variant="page" message="Failed to load this page. This might be a temporary issue.">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/register" element={<RegisterForm />} />

                  {/* Home - Portal Dashboard */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ============================================ */}
                  {/* CONTENT PLANNER ROUTES                      */}
                  {/* ============================================ */}
                  <Route
                    path="/planner"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Content Planner" toolColor="primary">
                          <ProjectDashboard />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/planner/new"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Project Creation" toolColor="primary">
                          <ProjectCreationWizard />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/planner/projects/:projectId"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Content Checklist" toolColor="primary">
                          <SEOChecklist />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/planner/progress"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Progress Dashboard" toolColor="primary">
                          <ProgressDashboard />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/planner/projects/:projectId/health"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Project Health Report" toolColor="primary">
                          <ProjectHealthReport />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />

                  {/* Legacy routes - redirect to new paths */}
                  <Route path="/projects" element={<Navigate to="/planner" replace />} />
                  <Route path="/projects/new" element={<Navigate to="/planner/new" replace />} />
                  <Route path="/projects/:projectId" element={<Navigate to="/planner/projects/:projectId" replace />} />

                  {/* ============================================ */}
                  {/* TECHNICAL AUDIT TOOL ROUTES                 */}
                  {/* ============================================ */}
                  <Route
                    path="/audit"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Technical Audit" toolColor="cyan">
                          <AuditPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/audit/:auditId"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Technical Audit" toolColor="cyan">
                          <AuditPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  {/* Shared audit view - public access */}
                  <Route
                    path="/audit/shared/:shareId"
                    element={
                      <ToolErrorBoundary toolName="Shared Audit" toolColor="cyan">
                        <SharedAuditView />
                      </ToolErrorBoundary>
                    }
                  />

                  {/* ============================================ */}
                  {/* ACCESSIBILITY ANALYZER ROUTES               */}
                  {/* ============================================ */}
                  <Route
                    path="/accessibility"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Accessibility Analyzer" toolColor="purple">
                          <AccessibilityAuditPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />

                  {/* ============================================ */}
                  {/* IMAGE ALT TEXT GENERATOR ROUTES             */}
                  {/* ============================================ */}
                  <Route
                    path="/image-alt"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Image Alt Text Generator" toolColor="emerald">
                          <ImageAltGeneratorPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />

                  {/* ============================================ */}
                  {/* META DATA GENERATOR ROUTES                  */}
                  {/* ============================================ */}
                  <Route
                    path="/meta-generator"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Meta Data Generator" toolColor="amber">
                          <MetaGeneratorPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />

                  {/* ============================================ */}
                  {/* STRUCTURED DATA GENERATOR ROUTES            */}
                  {/* ============================================ */}
                  <Route
                    path="/schema-generator"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Structured Data Generator" toolColor="rose">
                          <SchemaGeneratorPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />

                  {/* ============================================ */}
                  {/* SHARED ROUTES                               */}
                  {/* ============================================ */}
                  <Route
                    path="/my-tasks"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="My Tasks" toolColor="primary">
                          <MyTasksPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/team"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Team Management" toolColor="primary">
                          <TeamManagementPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/help/resources"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Resource Library" toolColor="primary">
                          <ResourceLibrary />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/help/glossary"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Glossary" toolColor="primary">
                          <GlossaryPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/activity"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Activity Log" toolColor="primary">
                          <ActivityPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/export"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Export Hub" toolColor="primary">
                          <ExportHubPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />

                  {/* ============================================ */}
                  {/* USER PROFILE & SETTINGS                     */}
                  {/* ============================================ */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="User Profile" toolColor="primary">
                          <UserProfilePage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile/:userId"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="User Profile" toolColor="primary">
                          <UserProfilePage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="User Settings" toolColor="primary">
                          <UserSettingsPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>

          {/* Footer */}
          <Footer />

          {/* Toast Notifications - Updated with Design System */}
          <Toaster
            position="top-right"
            containerStyle={{
              top: 80,
            }}
            toastOptions={{
              duration: 4000,
              className: 'toast-notification',
              style: {
                background: '#1e293b', // charcoal-800
                color: '#f8fafc', // charcoal-50
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981', // emerald-500
                  secondary: '#fff',
                },
                style: {
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', // emerald gradient
                  color: '#fff',
                },
                ariaProps: {
                  role: 'status',
                  'aria-live': 'polite',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444', // red-500
                  secondary: '#fff',
                },
                style: {
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', // red gradient
                  color: '#fff',
                },
                ariaProps: {
                  role: 'alert',
                  'aria-live': 'assertive',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#0066FF', // primary-500
                  secondary: '#fff',
                },
                style: {
                  background: '#1e293b', // charcoal-800
                  color: '#f8fafc',
                },
              },
            }}
          />

          {/* Feedback Widget - Available on all pages */}
          <FeedbackWidget />
        </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
