import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  Search,
  Eye,
  FileText,
  Code,
  Image,
  BookOpen,
  HelpCircle,
  Sparkles,
  ScanEye,
  ArrowRight
} from 'lucide-react';

const FEATURE_CATEGORIES = [
  {
    label: 'Plan & Manage',
    tools: [
      { name: 'Content Planner', href: '/features/planner', icon: LayoutDashboard, description: '353-item checklist & project management', color: 'primary' },
    ]
  },
  {
    label: 'Audit & Analyze',
    tools: [
      { name: 'Technical Audit', href: '/features/audit', icon: Search, description: 'Screaming Frog analysis with AI recommendations', color: 'blue' },
      { name: 'Accessibility Analyzer', href: '/features/accessibility', icon: Eye, description: 'WCAG 2.2 compliance scanning & VPAT reports', color: 'emerald' },
      { name: 'AI Readability Checker', href: '/features/readability', icon: ScanEye, description: 'Optimize content for AI-powered search', color: 'teal' },
    ]
  },
  {
    label: 'Generate & Optimize',
    tools: [
      { name: 'Meta Data Generator', href: '/features/meta-generator', icon: FileText, description: 'AI-powered title & description optimization', color: 'violet' },
      { name: 'Schema Generator', href: '/features/schema-generator', icon: Code, description: 'JSON-LD structured data for 40+ types', color: 'orange' },
      { name: 'Image Alt Generator', href: '/features/image-alt', icon: Image, description: 'Bulk accessible alt text generation', color: 'pink' },
    ]
  }
];

// Flat list for mobile
const ALL_FEATURES = FEATURE_CATEGORIES.flatMap(cat => cat.tools);

const HELP_LINKS = [
  { name: 'Help Center', href: '/help', icon: HelpCircle, description: 'Documentation & guides' },
  { name: 'Getting Started', href: '/help/getting-started', icon: Sparkles, description: 'Quick start guide' },
  { name: 'Resource Library', href: '/help/resources', icon: BookOpen, description: '200+ content strategy resources' },
  { name: 'Glossary', href: '/help/glossary', icon: FileText, description: 'Content & SEO terminology' },
];

const getIconColors = (color) => {
  const map = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
  };
  return map[color] || map.primary;
};

export default function PublicNavigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const featuresRef = useRef(null);
  const helpRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (featuresRef.current && !featuresRef.current.contains(event.target)) {
        setFeaturesOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setHelpOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setFeaturesOpen(false);
    setHelpOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-charcoal-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow duration-300">
                <span className="text-white font-bold text-xs sm:text-sm">CS</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-semibold text-charcoal-900 tracking-tight">
                Content Strategy
              </span>
              <span className="text-base sm:text-lg font-semibold text-primary-600 tracking-tight ml-1">
                Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50'
              }`}
            >
              Home
            </Link>

            {/* Features Mega Nav */}
            <div ref={featuresRef} className="relative">
              <button
                onClick={() => {
                  setFeaturesOpen(!featuresOpen);
                  setHelpOpen(false);
                }}
                aria-expanded={featuresOpen}
                aria-haspopup="true"
                aria-label="Features menu"
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/features')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50'
                }`}
              >
                Features
                <ChevronDown className={`w-4 h-4 transition-transform ${featuresOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {featuresOpen && (
                <div
                  className="absolute top-full -left-32 mt-2 w-[720px] bg-white rounded-2xl shadow-xl border border-charcoal-100 p-6 animate-in fade-in slide-in-from-top-2 duration-200"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="features-menu"
                >
                  <div className="grid grid-cols-3 gap-6">
                    {FEATURE_CATEGORIES.map((category) => (
                      <div key={category.label}>
                        <div className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3 px-1">
                          {category.label}
                        </div>
                        <div className="space-y-1">
                          {category.tools.map((tool) => {
                            const colors = getIconColors(tool.color);
                            return (
                              <Link
                                key={tool.href}
                                to={tool.href}
                                className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-charcoal-50 transition-colors group/item"
                              >
                                <div className={`w-9 h-9 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                  <tool.icon className={`w-5 h-5 ${colors.text}`} />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-medium text-charcoal-900 text-sm group-hover/item:text-primary-600 transition-colors">{tool.name}</span>
                                  <p className="text-xs text-charcoal-500 mt-0.5 leading-relaxed">{tool.description}</p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer CTA */}
                  <div className="mt-5 pt-4 border-t border-charcoal-100 flex items-center justify-between">
                    <Link
                      to="/features"
                      className="text-sm font-medium text-charcoal-600 hover:text-primary-600 transition-colors flex items-center gap-1"
                    >
                      View all features
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to="/register"
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1"
                    >
                      Start free
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Help Dropdown */}
            <div ref={helpRef} className="relative">
              <button
                onClick={() => {
                  setHelpOpen(!helpOpen);
                  setFeaturesOpen(false);
                }}
                aria-expanded={helpOpen}
                aria-haspopup="true"
                aria-label="Help menu"
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/help')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50'
                }`}
              >
                Help
                <ChevronDown className={`w-4 h-4 transition-transform ${helpOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {helpOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-charcoal-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="help-menu"
                >
                  {HELP_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-charcoal-50 transition-colors"
                    >
                      <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <link.icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <span className="font-medium text-charcoal-900 text-sm">{link.name}</span>
                        <p className="text-xs text-charcoal-500 mt-0.5">{link.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/about"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === '/about'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50'
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === '/contact'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-charcoal-700 hover:text-charcoal-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-charcoal-100 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              <Link
                to="/"
                className={`block px-4 py-3 rounded-xl font-medium ${
                  location.pathname === '/' ? 'bg-primary-50 text-primary-600' : 'text-charcoal-700 hover:bg-charcoal-50'
                }`}
              >
                Home
              </Link>

              {/* Mobile Features */}
              <div>
                <button
                  onClick={() => setFeaturesOpen(!featuresOpen)}
                  aria-expanded={featuresOpen}
                  aria-label="Toggle features menu"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-charcoal-700 hover:bg-charcoal-50"
                >
                  Features
                  <ChevronDown className={`w-5 h-5 transition-transform ${featuresOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {featuresOpen && (
                  <div className="pl-4 mt-1 space-y-3">
                    {FEATURE_CATEGORIES.map((category) => (
                      <div key={category.label}>
                        <div className="px-4 py-1 text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
                          {category.label}
                        </div>
                        {category.tools.map((tool) => (
                          <Link
                            key={tool.href}
                            to={tool.href}
                            className="block px-4 py-2 text-sm text-charcoal-600 hover:text-primary-600"
                          >
                            {tool.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                    <Link to="/features" className="block px-4 py-2 text-sm font-medium text-primary-600">
                      View all features
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Help */}
              <div>
                <button
                  onClick={() => setHelpOpen(!helpOpen)}
                  aria-expanded={helpOpen}
                  aria-label="Toggle help menu"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-charcoal-700 hover:bg-charcoal-50"
                >
                  Help
                  <ChevronDown className={`w-5 h-5 transition-transform ${helpOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {helpOpen && (
                  <div className="pl-4 space-y-1 mt-1">
                    {HELP_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="block px-4 py-2 text-sm text-charcoal-600 hover:text-primary-600"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/about"
                className={`block px-4 py-3 rounded-xl font-medium ${
                  location.pathname === '/about' ? 'bg-primary-50 text-primary-600' : 'text-charcoal-700 hover:bg-charcoal-50'
                }`}
              >
                About
              </Link>

              <Link
                to="/contact"
                className={`block px-4 py-3 rounded-xl font-medium ${
                  location.pathname === '/contact' ? 'bg-primary-50 text-primary-600' : 'text-charcoal-700 hover:bg-charcoal-50'
                }`}
              >
                Contact
              </Link>
            </div>

            {/* Mobile Auth Buttons */}
            <div className="mt-4 pt-4 border-t border-charcoal-100 space-y-2">
              <Link
                to="/login"
                className="block w-full px-4 py-3 text-center font-medium text-charcoal-700 hover:text-charcoal-900 rounded-xl border border-charcoal-200 hover:bg-charcoal-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block w-full px-4 py-3 text-center font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl"
              >
                Start Free
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
