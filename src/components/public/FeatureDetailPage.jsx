import { useParams, Link, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Eye,
  FileText,
  Code,
  Image,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Clock,
  Target,
  Users,
  BarChart3,
  Shield,
  Globe,
  Sparkles,
  Layers,
  Download,
  Settings
} from 'lucide-react';
import SEOHead from '../shared/SEOHead';
import { softwareSchemas } from '../../config/seo';

const FEATURE_DATA = {
  planner: {
    name: 'Content Planner',
    tagline: 'Project Management & SEO Checklists',
    icon: LayoutDashboard,
    color: 'primary',
    description: 'Comprehensive project management designed specifically for SEO teams. Track multiple projects, manage team members, and ensure nothing falls through the cracks with our 353-item checklist.',
    longDescription: 'The Content Planner is the command center for your SEO projects. Whether you\'re managing a single website or juggling dozens of client projects, our platform provides the structure and visibility you need to deliver consistent results.',
    features: [
      {
        title: '353-Item SEO Checklist',
        description: 'A comprehensive checklist covering all phases of SEO projects, from initial audit to ongoing optimization.',
        icon: CheckCircle2
      },
      {
        title: 'Multi-Project Dashboard',
        description: 'Visual progress tracking across all your projects with status indicators and completion percentages.',
        icon: BarChart3
      },
      {
        title: 'Team Collaboration',
        description: 'Role-based permissions let you assign tasks, track progress, and collaborate with team members.',
        icon: Users
      },
      {
        title: 'Timeline Management',
        description: 'Set due dates, track milestones, and keep projects on schedule with built-in timeline features.',
        icon: Clock
      },
      {
        title: 'Professional Exports',
        description: 'Generate branded Excel and PDF reports for clients or internal stakeholders.',
        icon: Download
      },
      {
        title: 'Custom Items',
        description: 'Add your own checklist items to adapt the workflow to your specific needs.',
        icon: Settings
      }
    ],
    useCases: [
      'Agency teams managing multiple client SEO projects',
      'In-house teams coordinating SEO initiatives',
      'Consultants tracking deliverables and progress',
      'Enterprise teams with complex approval workflows'
    ],
    stats: [
      { value: '353', label: 'Checklist Items' },
      { value: '6', label: 'Project Phases' },
      { value: '∞', label: 'Projects' }
    ]
  },
  audit: {
    name: 'Technical Audit',
    tagline: 'Analyze Screaming Frog Exports',
    icon: Search,
    color: 'blue',
    description: 'Upload your Screaming Frog exports and get AI-powered recommendations for fixing technical SEO issues. Prioritized by impact, actionable, and client-ready.',
    longDescription: 'Stop spending hours manually analyzing crawl data. Our Technical Audit tool processes Screaming Frog exports and delivers actionable insights in minutes, complete with AI-generated fix suggestions.',
    features: [
      {
        title: 'Large File Support',
        description: 'Upload Screaming Frog ZIP exports up to 5GB for enterprise-scale audits.',
        icon: Layers
      },
      {
        title: '31 Audit Categories',
        description: 'Comprehensive analysis covering all critical technical SEO factors.',
        icon: Target
      },
      {
        title: 'AI-Powered Suggestions',
        description: 'Get contextual fix recommendations powered by Claude AI.',
        icon: Sparkles
      },
      {
        title: 'Health Score',
        description: 'Visual health score provides an at-a-glance assessment of site technical health.',
        icon: BarChart3
      },
      {
        title: 'Issue Prioritization',
        description: 'Issues are automatically prioritized by impact to focus your efforts.',
        icon: Target
      },
      {
        title: 'Client Reports',
        description: 'Export professional audit reports ready for client presentations.',
        icon: Download
      }
    ],
    useCases: [
      'Initial technical audits for new clients',
      'Ongoing site health monitoring',
      'Pre-launch technical reviews',
      'Competitive analysis and benchmarking'
    ],
    stats: [
      { value: '31', label: 'Audit Categories' },
      { value: '5GB', label: 'Max File Size' },
      { value: 'AI', label: 'Powered Insights' }
    ]
  },
  accessibility: {
    name: 'Accessibility Analyzer',
    tagline: 'WCAG 2.2 Compliance Scanning',
    icon: Eye,
    color: 'emerald',
    description: 'Scan any URL for accessibility issues using 93 Axe-core rules. Get WCAG 2.2 compliance scores and AI-powered remediation suggestions.',
    longDescription: 'Accessibility isn\'t just the right thing to do—it\'s increasingly a legal requirement. Our Accessibility Analyzer makes it easy to identify and fix issues, with clear guidance on WCAG compliance levels.',
    features: [
      {
        title: 'WCAG 2.2 Scoring',
        description: 'Get compliance scores for Level A, AA, and AAA accessibility standards.',
        icon: Shield
      },
      {
        title: '93 Axe-core Rules',
        description: 'Industry-standard testing using the most comprehensive accessibility rule set.',
        icon: CheckCircle2
      },
      {
        title: 'Impact Prioritization',
        description: 'Issues are categorized by severity: critical, serious, moderate, and minor.',
        icon: Target
      },
      {
        title: 'AI Remediation',
        description: 'Get specific code fixes and implementation guidance for each issue.',
        icon: Sparkles
      },
      {
        title: 'VPAT Generation',
        description: 'Generate Voluntary Product Accessibility Templates for compliance documentation.',
        icon: Download
      },
      {
        title: 'Multi-Page Scanning',
        description: 'Scan multiple pages to get a comprehensive accessibility picture.',
        icon: Globe
      }
    ],
    useCases: [
      'Pre-launch accessibility audits',
      'Ongoing compliance monitoring',
      'ADA/WCAG compliance documentation',
      'Client accessibility reporting'
    ],
    stats: [
      { value: '93', label: 'A11y Rules' },
      { value: 'WCAG', label: '2.2 Compliant' },
      { value: 'VPAT', label: 'Generation' }
    ]
  },
  'meta-generator': {
    name: 'Meta Data Generator',
    tagline: 'AI-Powered Meta Optimization',
    icon: FileText,
    color: 'violet',
    description: 'Generate optimized title tags and meta descriptions using AI. Preview how your pages will appear in search results and on social media.',
    longDescription: 'Writing compelling meta data at scale is time-consuming. Our Meta Data Generator uses AI to create optimized titles and descriptions that drive clicks while staying within character limits.',
    features: [
      {
        title: 'AI Generation',
        description: 'Claude AI generates compelling, keyword-optimized meta content.',
        icon: Sparkles
      },
      {
        title: 'Character Validation',
        description: 'Real-time character counts ensure your meta data fits perfectly.',
        icon: CheckCircle2
      },
      {
        title: 'SERP Preview',
        description: 'See exactly how your pages will appear in Google search results.',
        icon: Search
      },
      {
        title: 'Social Preview',
        description: 'Preview how your content will look when shared on social media.',
        icon: Globe
      },
      {
        title: 'Bulk Generation',
        description: 'Generate meta data for multiple pages in a single session.',
        icon: Layers
      },
      {
        title: 'Easy Export',
        description: 'Copy to clipboard or export for easy implementation.',
        icon: Download
      }
    ],
    useCases: [
      'Optimizing existing page meta data',
      'Creating meta content for new pages',
      'A/B testing different meta approaches',
      'Bulk meta updates for large sites'
    ],
    stats: [
      { value: 'AI', label: 'Powered' },
      { value: '60', label: 'Char Title' },
      { value: '160', label: 'Char Desc' }
    ]
  },
  'schema-generator': {
    name: 'Schema Generator',
    tagline: 'JSON-LD Structured Data',
    icon: Code,
    color: 'orange',
    description: 'Generate valid JSON-LD structured data for 40+ schema types. Improve rich snippet eligibility and help search engines understand your content.',
    longDescription: 'Structured data is essential for modern SEO, but writing valid JSON-LD is tedious and error-prone. Our Schema Generator makes it easy to create properly formatted schema markup for any content type.',
    features: [
      {
        title: '40+ Schema Types',
        description: 'Support for Article, Product, FAQ, HowTo, Organization, and many more.',
        icon: Layers
      },
      {
        title: 'JSON-LD Format',
        description: 'Generate Google-preferred JSON-LD structured data format.',
        icon: Code
      },
      {
        title: 'Real-time Validation',
        description: 'Ensure your schema is valid before implementation.',
        icon: CheckCircle2
      },
      {
        title: 'Rich Snippet Preview',
        description: 'See how your enhanced listings might appear in search.',
        icon: Search
      },
      {
        title: 'Copy-Ready Output',
        description: 'One-click copy for easy implementation on your site.',
        icon: Download
      },
      {
        title: 'Nested Schema',
        description: 'Support for complex, nested schema structures.',
        icon: Settings
      }
    ],
    useCases: [
      'Adding schema to product pages',
      'Creating FAQ rich snippets',
      'Article and blog post markup',
      'Local business schema'
    ],
    stats: [
      { value: '40+', label: 'Schema Types' },
      { value: 'JSON', label: '-LD Format' },
      { value: '100%', label: 'Valid Output' }
    ]
  },
  'image-alt': {
    name: 'Image Alt Generator',
    tagline: 'Bulk Alt Text Generation',
    icon: Image,
    color: 'pink',
    description: 'Generate descriptive, accessible alt text for your images using AI. Improve both accessibility compliance and image SEO at scale.',
    longDescription: 'Missing or poor alt text is one of the most common accessibility issues. Our Image Alt Generator creates descriptive, SEO-friendly alt text that helps all users understand your images.',
    features: [
      {
        title: 'AI Analysis',
        description: 'AI analyzes image content to generate accurate descriptions.',
        icon: Sparkles
      },
      {
        title: 'Bulk Processing',
        description: 'Generate alt text for multiple images in one session.',
        icon: Layers
      },
      {
        title: 'Accessibility Focus',
        description: 'Alt text follows WCAG guidelines for accessibility.',
        icon: Shield
      },
      {
        title: 'SEO Optimization',
        description: 'Descriptions are optimized for image search visibility.',
        icon: Search
      },
      {
        title: 'Context Awareness',
        description: 'Provide page context for more relevant descriptions.',
        icon: Target
      },
      {
        title: 'Easy Implementation',
        description: 'Copy alt text directly or export for batch updates.',
        icon: Download
      }
    ],
    useCases: [
      'Fixing missing alt text site-wide',
      'Accessibility compliance remediation',
      'Image SEO optimization',
      'E-commerce product image descriptions'
    ],
    stats: [
      { value: 'AI', label: 'Powered' },
      { value: 'Bulk', label: 'Processing' },
      { value: 'A11y', label: 'Compliant' }
    ]
  }
};

const getColorClasses = (color) => {
  const colors = {
    primary: {
      bg: 'bg-primary-50',
      bgDark: 'bg-primary-100',
      icon: 'text-primary-600',
      border: 'border-primary-200',
      gradient: 'from-primary-500 to-primary-700',
      light: 'text-primary-100'
    },
    blue: {
      bg: 'bg-blue-50',
      bgDark: 'bg-blue-100',
      icon: 'text-blue-600',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-700',
      light: 'text-blue-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      bgDark: 'bg-emerald-100',
      icon: 'text-emerald-600',
      border: 'border-emerald-200',
      gradient: 'from-emerald-500 to-emerald-700',
      light: 'text-emerald-100'
    },
    violet: {
      bg: 'bg-violet-50',
      bgDark: 'bg-violet-100',
      icon: 'text-violet-600',
      border: 'border-violet-200',
      gradient: 'from-violet-500 to-violet-700',
      light: 'text-violet-100'
    },
    orange: {
      bg: 'bg-orange-50',
      bgDark: 'bg-orange-100',
      icon: 'text-orange-600',
      border: 'border-orange-200',
      gradient: 'from-orange-500 to-orange-700',
      light: 'text-orange-100'
    },
    pink: {
      bg: 'bg-pink-50',
      bgDark: 'bg-pink-100',
      icon: 'text-pink-600',
      border: 'border-pink-200',
      gradient: 'from-pink-500 to-pink-700',
      light: 'text-pink-100'
    }
  };
  return colors[color] || colors.primary;
};

// Map feature slugs to schema keys
const SCHEMA_KEY_MAP = {
  'planner': 'planner',
  'audit': 'audit',
  'accessibility': 'accessibility',
  'meta-generator': 'meta-generator',
  'schema-generator': 'schema-generator',
  'image-alt': 'image-alt'
};

export default function FeatureDetailPage() {
  const { featureSlug } = useParams();
  const feature = FEATURE_DATA[featureSlug];

  if (!feature) {
    return <Navigate to="/features" replace />;
  }

  const colors = getColorClasses(feature.color);
  const Icon = feature.icon;
  const schemaKey = SCHEMA_KEY_MAP[featureSlug];
  const featureSchema = schemaKey ? softwareSchemas[schemaKey] : null;

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={`${feature.name} - ${feature.tagline} | Content Strategy Portal`}
        description={feature.description}
        canonical={`/features/${featureSlug}`}
        schema={featureSchema}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Features', url: '/features' },
          { name: feature.name }
        ]}
      />
      {/* Hero Section */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${colors.gradient} pt-16 pb-24 lg:pt-24 lg:pb-32`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/features"
            className={`inline-flex items-center gap-2 ${colors.light} hover:text-white mb-8 transition-colors`}
          >
            <ArrowLeft className="w-4 h-4" />
            All Features
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                {feature.name}
              </h1>
              <p className={`mt-2 text-xl ${colors.light}`}>
                {feature.tagline}
              </p>
              <p className="mt-6 text-white/90 text-lg leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-charcoal-50 text-charcoal-900 font-semibold rounded-xl shadow-lg transition-all duration-200"
                >
                  Try {feature.name}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/help/getting-started"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl border border-white/30 transition-colors"
                >
                  Learn How It Works
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-3 gap-6">
                  {feature.stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold text-white">{stat.value}</div>
                      <div className={`mt-1 text-sm ${colors.light}`}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Stats */}
      <section className={`lg:hidden py-8 ${colors.bg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6">
            {feature.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-2xl font-bold ${colors.icon}`}>{stat.value}</div>
                <div className="mt-1 text-sm text-charcoal-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-charcoal-900">Overview</h2>
            <p className="mt-6 text-lg text-charcoal-600 leading-relaxed">
              {feature.longDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-28 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-charcoal-900">Key Capabilities</h2>
            <p className="mt-4 text-lg text-charcoal-600">
              Everything you need to get the most out of {feature.name}.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feature.features.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <h3 className="text-lg font-semibold text-charcoal-900">{item.title}</h3>
                <p className="mt-2 text-charcoal-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-charcoal-900">Perfect For</h2>
              <p className="mt-4 text-lg text-charcoal-600">
                {feature.name} is designed for a variety of SEO workflows and team needs.
              </p>
              <ul className="mt-8 space-y-4">
                {feature.useCases.map((useCase, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                    <span className="text-charcoal-700">{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${colors.bg} rounded-3xl p-8 lg:p-12`}>
              <div className="flex items-center gap-2 mb-6">
                <Zap className={`w-5 h-5 ${colors.icon}`} />
                <span className={`font-medium ${colors.icon}`}>Pro Tip</span>
              </div>
              <p className="text-charcoal-700 leading-relaxed">
                Get the most out of {feature.name} by combining it with other tools in Content Strategy Portal.
                Your projects, audits, and optimizations all work together seamlessly.
              </p>
              <Link
                to="/features"
                className={`mt-6 inline-flex items-center gap-2 font-medium ${colors.icon}`}
              >
                See all features
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 lg:py-28 bg-gradient-to-br ${colors.gradient}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Ready to Try {feature.name}?
          </h2>
          <p className={`mt-4 text-xl ${colors.light}`}>
            Start using {feature.name} today with a free account. No credit card required.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-charcoal-50 text-charcoal-900 font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl border border-white/30 transition-colors"
            >
              Explore Other Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
