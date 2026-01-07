import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { lazyWithRetry } from './utils/lazyWithRetry';

// Auth Components (keep eager - needed for initial auth)
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPassword from './components/auth/ForgotPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EmailVerificationBanner from './components/auth/EmailVerificationBanner';

// Layout Components (keep eager - always needed)
import Navigation from './components/shared/Navigation';
import PublicNavigation from './components/public/PublicNavigation';
import Footer from './components/shared/Footer';
import ErrorBoundary, { ToolErrorBoundary } from './components/shared/ErrorBoundary';

// Home - eager load for fast initial render
import HomePage from './components/home/HomePage';

// Public Pages - eager load for fast marketing site
import LandingPage from './components/public/LandingPage';
import AboutPage from './components/public/AboutPage';
import FeaturesPage from './components/public/FeaturesPage';
import FeatureDetailPage from './components/public/FeatureDetailPage';
import HelpCenterPage from './components/public/HelpCenterPage';
import GettingStartedPage from './components/public/GettingStartedPage';
import PublicNotFoundPage from './components/public/NotFoundPage';

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
import CookieConsent from './components/shared/CookieConsent';
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

// Legal Pages - lazy load
const TermsOfService = lazyWithRetry(() => import('./components/legal/TermsOfService'), 'TermsOfService');
const PrivacyPolicy = lazyWithRetry(() => import('./components/legal/PrivacyPolicy'), 'PrivacyPolicy');
const AIPolicy = lazyWithRetry(() => import('./components/legal/AIPolicy'), 'AIPolicy');
const AccessibilityStatement = lazyWithRetry(() => import('./components/legal/AccessibilityStatement'), 'AccessibilityStatement');

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
 * Check if current route is part of the authenticated app
 */
function isAppRoute(pathname) {
  return pathname.startsWith('/app');
}

/**
 * Smart Home component - shows LandingPage for guests, redirects to app for users
 */
function SmartHome() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  // If logged in, redirect to app dashboard
  if (currentUser) {
    return <Navigate to="/app" replace />;
  }

  // Otherwise show landing page
  return <LandingPage />;
}

// Wrapper component to use hooks inside Router
function AppContent() {
  const commandPalette = useCommandPalette();
  const location = useLocation();
  const { currentUser } = useAuth();
  // Show public nav on marketing pages when not logged in, or when logged in but on public pages outside /app
  const showPublicNav = !isAppRoute(location.pathname) && !currentUser;

  return (
    <div className="min-h-screen bg-charcoal-50 dark:bg-charcoal-900 flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {/* Show appropriate navigation based on route and auth state */}
      {showPublicNav ? <PublicNavigation /> : <Navigation />}
      {currentUser && <EmailVerificationBanner />}
      {currentUser && <CommandPalette isOpen={commandPalette.isOpen} onClose={commandPalette.close} />}
      {currentUser && <OnboardingWalkthrough />}
      {currentUser && <KeyboardShortcuts />}
          <main id="main-content" className="flex-1" role="main">
            <ErrorBoundary variant="page" message="Failed to load this page. This might be a temporary issue.">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* ============================================ */}
                  {/* PUBLIC MARKETING WEBSITE ROUTES             */}
                  {/* ============================================ */}

                  {/* Home - Smart routing based on auth state */}
                  <Route path="/" element={<SmartHome />} />

                  {/* About */}
                  <Route path="/about" element={<AboutPage />} />

                  {/* Features */}
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/features/:featureSlug" element={<FeatureDetailPage />} />

                  {/* Help (public) */}
                  <Route path="/help" element={<HelpCenterPage />} />
                  <Route path="/help/getting-started" element={<GettingStartedPage />} />
                  <Route path="/help/resources" element={<ResourceLibrary />} />
                  <Route path="/help/glossary" element={<GlossaryPage />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/register" element={<RegisterForm />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Legal Pages - Public */}
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/ai-policy" element={<AIPolicy />} />
                  <Route path="/accessibility" element={<AccessibilityStatement />} />

                  {/* ============================================ */}
                  {/* AUTHENTICATED APP ROUTES (/app/...)        */}
                  {/* ============================================ */}

                  {/* App Dashboard - Authenticated Home */}
                  <Route
                    path="/app"
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
                    path="/app/planner"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Content Planner" toolColor="primary">
                          <ProjectDashboard />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/planner/new"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Project Creation" toolColor="primary">
                          <ProjectCreationWizard />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/planner/projects/:projectId"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Content Checklist" toolColor="primary">
                          <SEOChecklist />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/planner/progress"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Progress Dashboard" toolColor="primary">
                          <ProgressDashboard />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/planner/projects/:projectId/health"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Project Health Report" toolColor="primary">
                          <ProjectHealthReport />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />

                  {/* ============================================ */}
                  {/* TECHNICAL AUDIT TOOL ROUTES                 */}
                  {/* ============================================ */}
                  <Route
                    path="/app/audit"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Technical Audit" toolColor="cyan">
                          <AuditPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/audit/:auditId"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Technical Audit" toolColor="cyan">
                          <AuditPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  {/* Shared audit view - public access (keeps old path for sharing) */}
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
                    path="/app/accessibility"
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
                    path="/app/image-alt"
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
                    path="/app/meta-generator"
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
                    path="/app/schema-generator"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Structured Data Generator" toolColor="rose">
                          <SchemaGeneratorPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />

                  {/* ============================================ */}
                  {/* SHARED APP ROUTES                           */}
                  {/* ============================================ */}
                  <Route
                    path="/app/my-tasks"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="My Tasks" toolColor="primary">
                          <MyTasksPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/team"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Team Management" toolColor="primary">
                          <TeamManagementPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/activity"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="Activity Log" toolColor="primary">
                          <ActivityPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/export"
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
                    path="/app/profile"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="User Profile" toolColor="primary">
                          <UserProfilePage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/profile/:userId"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="User Profile" toolColor="primary">
                          <UserProfilePage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/settings"
                    element={
                      <ProtectedRoute>
                        <ToolErrorBoundary toolName="User Settings" toolColor="primary">
                          <UserSettingsPage />
                        </ToolErrorBoundary>
                      </ProtectedRoute>
                    }
                  />

                  {/* ============================================ */}
                  {/* LEGACY REDIRECTS                            */}
                  {/* ============================================ */}
                  <Route path="/dashboard" element={<Navigate to="/app" replace />} />
                  <Route path="/planner" element={<Navigate to="/app/planner" replace />} />
                  <Route path="/planner/*" element={<Navigate to="/app/planner" replace />} />
                  <Route path="/projects" element={<Navigate to="/app/planner" replace />} />
                  <Route path="/projects/*" element={<Navigate to="/app/planner" replace />} />
                  <Route path="/audit" element={<Navigate to="/app/audit" replace />} />
                  <Route path="/my-tasks" element={<Navigate to="/app/my-tasks" replace />} />
                  <Route path="/team" element={<Navigate to="/app/team" replace />} />
                  <Route path="/activity" element={<Navigate to="/app/activity" replace />} />
                  <Route path="/export" element={<Navigate to="/app/export" replace />} />
                  <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
                  <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
                  <Route path="/image-alt" element={<Navigate to="/app/image-alt" replace />} />
                  <Route path="/meta-generator" element={<Navigate to="/app/meta-generator" replace />} />
                  <Route path="/schema-generator" element={<Navigate to="/app/schema-generator" replace />} />

                  {/* 404 Route */}
                  <Route path="*" element={<PublicNotFoundPage />} />
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

          {/* Cookie Consent Banner - GDPR/CCPA Compliance */}
          <CookieConsent />
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
