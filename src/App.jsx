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

// Project Components
import ProjectDashboard from './components/projects/ProjectDashboard';
import ProjectCreationWizard from './components/projects/ProjectCreationWizard';
import MyTasksPage from './components/projects/MyTasksPage';
import TeamManagementPage from './components/projects/TeamManagementPage';

// Checklist Components
import SEOChecklist from './components/checklist/SEOChecklist';

// Help Components
import ResourceLibrary from './components/help/ResourceLibrary';
import GlossaryPage from './components/help/GlossaryPage';
import KeyboardShortcuts from './components/help/KeyboardShortcuts';
import OnboardingWalkthrough from './components/help/OnboardingWalkthrough';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <Navigation />
          <OnboardingWalkthrough />
          <KeyboardShortcuts />
          <main id="main-content">
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            {/* Protected Routes */}
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/new"
              element={
                <ProtectedRoute>
                  <ProjectCreationWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <SEOChecklist />
                </ProtectedRoute>
              }
            />
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

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/projects" replace />} />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                    <p className="text-gray-600 mb-4">Page not found</p>
                    <a href="/projects" className="text-primary-600 hover:text-primary-700">
                      Go to Projects
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
          </main>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
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
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
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
