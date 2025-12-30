import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout Components
import Navigation from './components/shared/Navigation';
import Footer from './components/shared/Footer';

// Home Components
import HomePage from './components/home/HomePage';

// SEO Planner Components (formerly Checklist)
import ProjectDashboard from './components/projects/ProjectDashboard';
import ProjectCreationWizard from './components/projects/ProjectCreationWizard';
import MyTasksPage from './components/projects/MyTasksPage';
import TeamManagementPage from './components/projects/TeamManagementPage';
import SEOChecklist from './components/checklist/SEOChecklist';

// Help Components
import ResourceLibrary from './components/help/ResourceLibrary';
import GlossaryPage from './components/help/GlossaryPage';
import KeyboardShortcuts from './components/help/KeyboardShortcuts';
import OnboardingWalkthrough from './components/help/OnboardingWalkthrough';

// Placeholder for Technical Audit Tool (to be implemented)
const AuditPlaceholder = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="text-center">
      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Technical Audit Tool</h1>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Upload Screaming Frog exports to generate comprehensive technical SEO audits with AI-powered recommendations.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Coming Soon - Implementation in Progress</span>
      </div>
    </div>
  </div>
);

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
                    <AuditPlaceholder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit/:auditId"
                element={
                  <ProtectedRoute>
                    <AuditPlaceholder />
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
