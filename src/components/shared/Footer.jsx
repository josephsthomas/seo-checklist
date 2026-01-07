import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
            <p className="text-charcoal-300 text-sm max-w-md leading-relaxed mb-6">
              Your all-in-one content and SEO suite for organic health & visibility.
              Streamline your workflow with powerful tools designed for modern content professionals.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3" role="list" aria-label="Social media links">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-charcoal-400 hover:text-white transition-all duration-200"
                aria-label="Follow us on Twitter"
                role="listitem"
              >
                <Twitter className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-charcoal-400 hover:text-white transition-all duration-200"
                aria-label="Connect on LinkedIn"
                role="listitem"
              >
                <Linkedin className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-charcoal-400 hover:text-white transition-all duration-200"
                aria-label="View our GitHub"
                role="listitem"
              >
                <Github className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="mailto:support@flipside.com"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-charcoal-400 hover:text-white transition-all duration-200"
                aria-label="Send us an email"
                role="listitem"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-white font-semibold mb-4">Tools</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/planner" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2 group">
                  Content Planner
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/audit" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2 group">
                  Technical Audit
                  <span className="px-1.5 py-0.5 text-2xs font-medium rounded bg-cyan-500/20 text-cyan-400">New</span>
                </Link>
              </li>
              <li>
                <span className="text-charcoal-500 text-sm flex items-center gap-2">
                  Analytics Dashboard
                  <span className="px-1.5 py-0.5 text-2xs font-medium rounded bg-charcoal-700 text-charcoal-400">Soon</span>
                </span>
              </li>
              <li>
                <span className="text-charcoal-500 text-sm flex items-center gap-2">
                  Content Optimizer
                  <span className="px-1.5 py-0.5 text-2xs font-medium rounded bg-charcoal-700 text-charcoal-400">Soon</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/help/resources" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
                  Resource Library
                </Link>
              </li>
              <li>
                <Link to="/help/glossary" className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200">
                  Content Glossary
                </Link>
              </li>
              <li>
                <button
                  onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))}
                  className="text-charcoal-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2"
                >
                  Keyboard Shortcuts
                  <kbd className="px-1.5 py-0.5 text-2xs font-mono rounded bg-charcoal-700 text-charcoal-400">?</kbd>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-charcoal-500 text-sm">
            © {currentYear} Content Strategy Portal. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-charcoal-500 hover:text-charcoal-300 text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-charcoal-500 hover:text-charcoal-300 text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
