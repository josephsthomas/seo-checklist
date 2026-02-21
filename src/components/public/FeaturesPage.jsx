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
  Zap
} from 'lucide-react';
import SEOHead from '../shared/SEOHead';
import { softwareSchemas } from '../../config/seo';

const FEATURES = [
  {
    name: 'Content Planner',
    slug: 'planner',
    icon: LayoutDashboard,
    description: 'Comprehensive project management with a 321-item SEO checklist covering all project phases.',
    highlights: [
      'Multi-project dashboard with progress tracking',
      '321-item checklist across all SEO phases',
      'Team collaboration with role-based permissions',
      'Timeline management with due dates',
      'Professional Excel and PDF exports'
    ],
    color: 'primary'
  },
  {
    name: 'Technical Audit',
    slug: 'audit',
    icon: Search,
    description: 'Analyze Screaming Frog exports and get AI-powered recommendations for fixing technical issues.',
    highlights: [
      'Upload Screaming Frog ZIP exports (up to 5GB)',
      '31 audit categories with prioritization',
      'AI-powered fix suggestions',
      'Health score and issue breakdown',
      'Export audit reports for clients'
    ],
    color: 'blue'
  },
  {
    name: 'Accessibility Analyzer',
    slug: 'accessibility',
    icon: Eye,
    description: 'WCAG 2.2 compliance auditing with impact-based prioritization and remediation guidance.',
    highlights: [
      'WCAG 2.2 compliance scoring (A, AA, AAA)',
      '93 Axe-core accessibility rules',
      'Impact-based issue prioritization',
      'AI-powered remediation suggestions',
      'VPAT report generation'
    ],
    color: 'emerald'
  },
  {
    name: 'Meta Data Generator',
    slug: 'meta-generator',
    icon: FileText,
    description: 'AI-powered title and meta description optimization for better search visibility.',
    highlights: [
      'AI-generated title tags and descriptions',
      'Character count validation',
      'Preview snippets for Google/social',
      'Bulk generation capabilities',
      'Copy-to-clipboard functionality'
    ],
    color: 'violet'
  },
  {
    name: 'Schema Generator',
    slug: 'schema-generator',
    icon: Code,
    description: 'Generate valid JSON-LD structured data for 15+ schema types with one click.',
    highlights: [
      'Support for 15+ schema types',
      'JSON-LD structured data format',
      'Real-time validation',
      'Copy-ready code output',
      'Rich snippets preview'
    ],
    color: 'orange'
  },
  {
    name: 'Image Alt Generator',
    slug: 'image-alt',
    icon: Image,
    description: 'Bulk alt text generation to improve accessibility and image SEO across your site.',
    highlights: [
      'AI-powered alt text generation',
      'Bulk processing for efficiency',
      'Accessibility-focused descriptions',
      'SEO-optimized suggestions',
      'Easy copy and export'
    ],
    color: 'pink'
  },
  {
    name: 'AI Readability Checker',
    slug: 'readability',
    icon: ScanEye,
    description: 'Analyze how AI models read and interpret your content. Get actionable recommendations to improve visibility in AI-generated answers.',
    highlights: [
      'AI readability scoring',
      'See how AI interprets your content',
      'Actionable improvement recommendations',
      'URL and HTML analysis',
      'Content optimization insights'
    ],
    color: 'teal'
  },
];

const getColorClasses = (color) => {
  const colors = {
    primary: {
      bg: 'bg-primary-50',
      icon: 'text-primary-600',
      border: 'border-primary-200',
      accent: 'bg-primary-100'
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-200',
      accent: 'bg-blue-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      border: 'border-emerald-200',
      accent: 'bg-emerald-100'
    },
    violet: {
      bg: 'bg-violet-50',
      icon: 'text-violet-600',
      border: 'border-violet-200',
      accent: 'bg-violet-100'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      border: 'border-orange-200',
      accent: 'bg-orange-100'
    },
    pink: {
      bg: 'bg-pink-50',
      icon: 'text-pink-600',
      border: 'border-pink-200',
      accent: 'bg-pink-100'
    },
    teal: {
      bg: 'bg-teal-50',
      icon: 'text-teal-600',
      border: 'border-teal-200',
      accent: 'bg-teal-100'
    }
  };
  return colors[color] || colors.primary;
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        pageKey="features"
        schema={Object.values(softwareSchemas)}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Features' }
        ]}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-charcoal-50 via-white to-primary-50 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-100 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              7 Powerful Tools
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-charcoal-900 tracking-tight">
              Features Built for Content Excellence
            </h1>
            <p className="mt-6 text-xl text-charcoal-600 leading-relaxed">
              From project planning to technical audits, accessibility compliance to AI readability
              analysis. Everything you need in one platform.
            </p>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {FEATURES.map((feature, index) => {
              const colors = getColorClasses(feature.color);
              const isEven = index % 2 === 0;

              return (
                <div
                  key={feature.slug}
                  className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                    isEven ? '' : 'lg:grid-flow-dense'
                  }`}
                >
                  <div className={isEven ? '' : 'lg:col-start-2'}>
                    <div className={`inline-flex items-center justify-center w-14 h-14 ${colors.bg} rounded-2xl mb-6`}>
                      <feature.icon className={`w-7 h-7 ${colors.icon}`} />
                    </div>
                    <h2 className="text-3xl font-bold text-charcoal-900">{feature.name}</h2>
                    <p className="mt-4 text-lg text-charcoal-600 leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="mt-8 space-y-3">
                      {feature.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                          <span className="text-charcoal-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/features/${feature.slug}`}
                      className={`mt-8 inline-flex items-center gap-2 font-medium ${colors.icon} hover:opacity-80 transition-opacity`}
                    >
                      Learn more about {feature.name}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className={`${colors.bg} rounded-3xl p-8 lg:p-12 ${isEven ? '' : 'lg:col-start-1'}`}>
                    <div className={`${colors.accent} rounded-2xl p-6 border ${colors.border}`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center`}>
                          <feature.icon className={`w-5 h-5 ${colors.icon}`} />
                        </div>
                        <div className="font-semibold text-charcoal-900">{feature.name}</div>
                      </div>
                      <div className="space-y-2">
                        {feature.highlights.slice(0, 3).map((highlight, i) => (
                          <div
                            key={i}
                            className="bg-white/60 rounded-lg px-4 py-2 text-sm text-charcoal-600"
                          >
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 lg:py-28 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-charcoal-900">
              All Tools Work Together
            </h2>
            <p className="mt-4 text-lg text-charcoal-600">
              Unlike separate point solutions, all our tools are integrated into one cohesive platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                <LayoutDashboard className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900">Unified Dashboard</h3>
              <p className="mt-2 text-charcoal-600 text-sm leading-relaxed">
                Access all tools from a single dashboard. Switch between features without losing context.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900">Shared AI Engine</h3>
              <p className="mt-2 text-charcoal-600 text-sm leading-relaxed">
                Our AI understands your projects and provides contextual recommendations across all tools.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900">Professional Exports</h3>
              <p className="mt-2 text-charcoal-600 text-sm leading-relaxed">
                Generate client-ready reports that combine insights from multiple tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Ready to Experience These Features?
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            Start using all seven tools today with a free account.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-charcoal-50 text-primary-600 font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              Get Started Free
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
