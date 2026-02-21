import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquarePlus } from 'lucide-react';
import FeedbackForm from '../feedback/FeedbackForm';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow duration-300">
                  <span className="text-white font-bold text-sm">CS</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div>
                <span className="text-xl font-semibold text-white tracking-tight">
                  Content Strategy
                </span>
                <span className="text-xl font-semibold text-primary-400 tracking-tight ml-1">
                  Portal
                </span>
              </div>
            </Link>
            <p className="text-charcoal-300 text-sm max-w-md leading-relaxed">
              Your complete content strategy PowerSuite. Plan, audit, optimize,
              and ensure accessibility — all in one platform.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/features/planner" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
                  Content Planner
                </Link>
              </li>
              <li>
                <Link to="/features/audit" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
                  Technical Audit
                </Link>
              </li>
              <li>
                <Link to="/features/accessibility" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
                  Accessibility Analyzer
                </Link>
              </li>
              <li>
                <Link to="/features/meta-generator" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
                  Meta Generator
                </Link>
              </li>
              <li>
                <Link to="/features/schema-generator" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
                  Schema Generator
                </Link>
              </li>
              <li>
                <Link to="/features/image-alt" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
                  Image Alt Generator
                </Link>
              </li>
              <li>
                <Link to="/features/readability" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
                  AI Readability Checker
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Help & Resources</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/help" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/help/getting-started" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
                  Getting Started
                </Link>
              </li>
              <li>
                <Link to="/help/resources" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
                  Resource Library
                </Link>
              </li>
              <li>
                <Link to="/help/glossary" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
                  SEO Glossary
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
                  About
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  Send Feedback
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links Section */}
        <div className="py-6 border-b border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <Link to="/terms" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
              Privacy & Data Policy
            </Link>
            <Link to="/ai-policy" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
              AI Usage Policy
            </Link>
            <Link to="/accessibility" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
              Accessibility
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-charcoal-500 text-sm">
              © {currentYear} Joseph S. Thomas dba Content-Strategy.co
            </p>
            <p className="text-charcoal-600 text-xs mt-1">
              All rights reserved. Independently developed and owned.
            </p>
          </div>
          <p className="text-charcoal-600 text-xs">
            Content Strategy Portal v3.0
          </p>
        </div>
      </div>

      {/* Feedback Form Modal */}
      <FeedbackForm isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </footer>
  );
}
