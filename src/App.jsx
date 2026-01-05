import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Auth Components (keep eager - needed for initial auth)
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout Components (keep eager - always needed)
import Navigation from './components/shared/Navigation';
import Footer from './components/shared/Footer';
import ErrorBoundary from './components/shared/ErrorBoundary';

// Home - eager load for fast initial render
import HomePage from './components/home/HomePage';

// Lazy loaded components for code splitting
const ProjectDashboard = lazy(() => import('./components/projects/ProjectDashboard'));
const ProjectCreationWizard = lazy(() => import('./components/projects/ProjectCreationWizard'));
const MyTasksPage = lazy(() => import('./components/projects/MyTasksPage'));
const TeamManagementPage = lazy(() => import('./components/projects/TeamManagementPage'));
const SEOChecklist = lazy(() => import('./components/checklist/SEOChecklist'));

// Help Components - lazy load
const ResourceLibrary = lazy(() => import('./components/help/ResourceLibrary'));
const GlossaryPage = lazy(() => import('./components/help/GlossaryPage'));
import KeyboardShortcuts from './components/help/KeyboardShortcuts';
import OnboardingWalkthrough from './components/help/OnboardingWalkthrough';

// Audit Components - lazy load (heaviest components with xlsx, jspdf)
const AuditPage = lazy(() => import('./components/audit/AuditPage'));
const SharedAuditView = lazy(() => import('./components/audit/shared/SharedAuditView'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <Navigation />
          <OnboardingWalkthrough />
          <KeyboardShortcuts />
          <main id="main-content" className="flex-1">
            <ErrorBoundary message="Failed to load this page. This might be a temporary issue.">
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
              {/* SEO PLANNER ROUTES (formerly Checklist)     */}
              {/* ============================================ */}
              <Route
                path="/planner"
                element={
                  <ProtectedRoute>
                    <ProjectDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/planner/new"
                element={
                  <ProtectedRoute>
                    <ProjectCreationWizard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/planner/projects/:projectId"
                element={
                  <ProtectedRoute>
                    <SEOChecklist />
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
                    <AuditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit/:auditId"
                element={
                  <ProtectedRoute>
                    <AuditPage />
                  </ProtectedRoute>
                }
              />
              {/* Shared audit view - public access */}
              <Route
                path="/audit/shared/:shareId"
                element={<SharedAuditView />}
              />

              {/* ============================================ */}
              {/* SHARED ROUTES                               */}
              {/* ============================================ */}
              <Route
                path="/my-tasks"
                element={
                  <ProtectedRoute>
                    <MyTasksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team"
                element={
                  <ProtectedRoute>
                    <TeamManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help/resources"
                element={
                  <ProtectedRoute>
                    <ResourceLibrary />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help/glossary"
                element={
                  <ProtectedRoute>
                    <GlossaryPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                      <p className="text-gray-600 mb-4">Page not found</p>
                      <a href="/" className="text-primary-600 hover:text-primary-700">
                        Go to Home
                      </a>
                    </div>
                  </div>
                }
              />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>

          {/* Footer */}
          <Footer />

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            containerStyle={{
              top: 80,
            }}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
                style: {
                  background: '#10b981',
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
                  primary: '#ef4444',
                  secondary: '#fff',
                },
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
                ariaProps: {
                  role: 'alert',
                  'aria-live': 'assertive',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
