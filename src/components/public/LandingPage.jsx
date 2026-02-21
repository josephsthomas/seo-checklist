import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Eye,
  FileText,
  Code,
  Image,
  ScanEye,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
  Target,
  Layers
} from 'lucide-react';
import SEOHead from '../shared/SEOHead';
import { organizationSchema, generateBreadcrumbSchema } from '../../config/seo';

const FEATURES = [
  {
    name: 'Content Planner',
    href: '/features/planner',
    icon: LayoutDashboard,
    description: 'Comprehensive project management with 353-item checklist covering all content and SEO phases.',
    color: 'primary'
  },
  {
    name: 'Technical Audit',
    href: '/features/audit',
    icon: Search,
    description: 'Analyze Screaming Frog exports with 31 audit categories and AI-powered recommendations.',
    color: 'blue'
  },
  {
    name: 'Accessibility Analyzer',
    href: '/features/accessibility',
    icon: Eye,
    description: 'WCAG 2.2 compliance scoring with 93 Axe-core rules and remediation suggestions.',
    color: 'emerald'
  },
  {
    name: 'Metadata Generator',
    href: '/features/meta-generator',
    icon: FileText,
    description: 'AI-powered title and description optimization for better search visibility.',
    color: 'violet'
  },
  {
    name: 'Schema Generator',
    href: '/features/schema-generator',
    icon: Code,
    description: 'Generate JSON-LD structured data for 40+ schema types with one click.',
    color: 'orange'
  },
  {
    name: 'Image Alt Generator',
    href: '/features/image-alt',
    icon: Image,
    description: 'Bulk alt text generation to improve accessibility and image SEO.',
    color: 'pink'
  },
  {
    name: 'AI Readability Checker',
    href: '/features/readability',
    icon: ScanEye,
    description: 'Analyze how AI models read your content. Get recommendations to improve visibility in AI-generated answers.',
    color: 'teal'
  },
];

const BENEFITS = [
  { icon: Clock, title: 'Save 10+ Hours Weekly', description: 'Stop manually auditing. Start strategically advising.' },
  { icon: TrendingUp, title: 'Rank-Ready Content', description: 'Every page optimized for search, accessibility, and AI discovery.' },
  { icon: Shield, title: 'Compliance Without Anxiety', description: 'WCAG 2.2, structured data, and meta best practices — automated.' },
  { icon: Users, title: 'Built for Teams', description: 'Assign, track, and deliver across every client project.' },
];

const STATS = [
  { value: '10+', label: 'Hours Saved Weekly' },
  { value: '353', label: 'Points of Quality Assurance' },
  { value: '93', label: 'Accessibility Checks Automated' },
  { value: '40+', label: 'Schema Types Supported' },
];

export default function LandingPage() {
  // Schema for homepage
  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Content Strategy Portal',
    url: 'https://contentstrategyportal.com',
    description: 'AI-powered content strategy platform for agencies and enterprise teams.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://contentstrategyportal.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        pageKey="home"
        schema={[homeSchema, organizationSchema]}
        breadcrumbs={[{ name: 'Home' }]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-charcoal-50 via-white to-primary-50 pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-100 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" aria-hidden="true" />
              Your complete content strategy platform.
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal-900 tracking-tight leading-tight">
              Content Strategy Is Your Job.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
                The Busywork Isn't.
              </span>
            </h1>

            <p className="mt-6 text-xl text-charcoal-600 max-w-2xl mx-auto leading-relaxed">
              Audits. Checklists. Metadata. Accessibility. Structured data. AI readability.
              You shouldn't be doing any of this manually. Now you don't have to.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200"
              >
                Start Your Free Project
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-charcoal-50 text-charcoal-700 font-semibold rounded-xl border border-charcoal-200 transition-colors"
              >
                Explore Our Tools
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-charcoal-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                Unlimited projects on free tier
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                Setup in under 2 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-charcoal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600">{stat.value}</div>
                <div className="mt-1 text-sm text-charcoal-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal-900">
              The Tools That Replace Your Spreadsheet Stack
            </h2>
            <p className="mt-4 text-lg text-charcoal-600">
              Planning, auditing, accessibility, metadata, schema, alt text, and AI readability — integrated in one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <Link
                key={feature.href}
                to={feature.href}
                className="group relative bg-white rounded-2xl border border-charcoal-100 p-6 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  feature.color === 'primary' ? 'bg-primary-50' :
                  feature.color === 'blue' ? 'bg-blue-50' :
                  feature.color === 'emerald' ? 'bg-emerald-50' :
                  feature.color === 'violet' ? 'bg-violet-50' :
                  feature.color === 'orange' ? 'bg-orange-50' :
                  feature.color === 'teal' ? 'bg-teal-50' :
                  'bg-pink-50'
                }`}>
                  <feature.icon className={`w-6 h-6 ${
                    feature.color === 'primary' ? 'text-primary-600' :
                    feature.color === 'blue' ? 'text-blue-600' :
                    feature.color === 'emerald' ? 'text-emerald-600' :
                    feature.color === 'violet' ? 'text-violet-600' :
                    feature.color === 'orange' ? 'text-orange-600' :
                    feature.color === 'teal' ? 'text-teal-600' :
                    'text-pink-600'
                  }`} />
                </div>
                <h3 className="text-lg font-semibold text-charcoal-900 group-hover:text-primary-600 transition-colors">
                  {feature.name}
                </h3>
                <p className="mt-2 text-charcoal-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/features"
              className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700"
            >
              View all features
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow Section — How Content Strategists Use CSP */}
      <section className="py-20 lg:py-28 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              For Content Strategists
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal-900">
              What Your Week Looks Like After CSP
            </h2>
            <p className="mt-4 text-lg text-charcoal-600">
              You became a content strategist to think big — not to wrangle spreadsheets,
              manually audit meta tags, or chase accessibility fixes. We handle all of that.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-charcoal-100">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-5">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900">Plan with Confidence</h3>
              <p className="mt-3 text-charcoal-600 text-sm leading-relaxed">
                Start every project with a 353-item checklist that covers discovery, planning, content creation,
                technical implementation, launch, and post-launch. Nothing slips through the cracks so you
                can focus on the creative strategy.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-charcoal-100">
              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-5">
                <Layers className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900">Automate the Technical Work</h3>
              <p className="mt-3 text-charcoal-600 text-sm leading-relaxed">
                Technical audits, accessibility scans, metadata generation, schema markup, alt text —
                these are hours of repetitive work that AI handles in minutes. You review, approve,
                and move on to higher-value work.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-charcoal-100">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-5">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900">Deliver Measurable Results</h3>
              <p className="mt-3 text-charcoal-600 text-sm leading-relaxed">
                Export client-ready reports, track project health, and demonstrate the impact of
                your content strategy with data. Spend your time interpreting results and making
                strategic recommendations — not compiling spreadsheets.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200"
            >
              Start Automating Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-charcoal-900 to-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Why Teams Choose Content Strategy Portal
            </h2>
            <p className="mt-4 text-lg text-charcoal-300">
              Spend less time on execution. More time on strategy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                <p className="mt-2 text-charcoal-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-emerald-700 text-sm font-medium mb-4">
              <Award className="w-4 h-4" />
              Early Access Feedback
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal-900">
              Built for Agencies & Enterprise Teams
            </h2>
            <p className="mt-4 text-lg text-charcoal-600">
              Here's what early users are telling us.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-charcoal-50 rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-charcoal-700 leading-relaxed">
                "We used to spend half our time on technical audits and metadata.
                Now AI handles the grunt work and we focus on actual content strategy."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">JD</span>
                </div>
                <div>
                  <div className="font-medium text-charcoal-900">Content Director</div>
                  <div className="text-sm text-charcoal-500">Agency, name withheld</div>
                </div>
              </div>
            </div>

            <div className="bg-charcoal-50 rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-charcoal-700 leading-relaxed">
                "The checklist keeps our content strategy organized across 10+ client sites.
                We stopped dropping balls the day we started using it."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-semibold">MK</span>
                </div>
                <div>
                  <div className="font-medium text-charcoal-900">Content Strategist</div>
                  <div className="text-sm text-charcoal-500">E-commerce, name withheld</div>
                </div>
              </div>
            </div>

            <div className="bg-charcoal-50 rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-charcoal-700 leading-relaxed">
                "Accessibility used to be an afterthought. Now it's automated into
                every project from day one. That's a better content strategy."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                  <span className="text-violet-600 font-semibold">AS</span>
                </div>
                <div>
                  <div className="font-medium text-charcoal-900">Head of Content</div>
                  <div className="text-sm text-charcoal-500">SaaS, name withheld</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Your next project deserves better tools.
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            Create a free account. Run your first audit in under 2 minutes.
            No credit card. No sales calls. Just better content strategy.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-charcoal-50 text-primary-600 font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/help/getting-started"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-400/20 hover:bg-primary-400/30 text-white font-semibold rounded-xl border border-primary-400/30 transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
