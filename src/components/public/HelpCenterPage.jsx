import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  FileText,
  Search,
  ArrowRight,
  LayoutDashboard,
  Eye,
  Code,
  Image,
  HelpCircle,
  MessageSquare,
  Video,
  Zap
} from 'lucide-react';

const HELP_SECTIONS = [
  {
    title: 'Getting Started',
    description: 'New to Content Strategy Portal? Start here.',
    href: '/help/getting-started',
    icon: Sparkles,
    color: 'primary',
    articles: [
      'Creating your first project',
      'Understanding the dashboard',
      'Inviting team members',
      'Your first technical audit'
    ]
  },
  {
    title: 'Resource Library',
    description: '200+ curated SEO resources and tutorials.',
    href: '/help/resources',
    icon: BookOpen,
    color: 'emerald',
    articles: [
      'Technical SEO guides',
      'Content strategy templates',
      'Link building resources',
      'Video tutorials'
    ]
  },
  {
    title: 'Glossary',
    description: 'SEO terminology explained simply.',
    href: '/help/glossary',
    icon: FileText,
    color: 'violet',
    articles: [
      'Common SEO terms',
      'Technical terminology',
      'Metrics and KPIs',
      'Industry acronyms'
    ]
  }
];

const TOOL_GUIDES = [
  {
    name: 'Content Planner',
    description: 'Project management and checklists',
    icon: LayoutDashboard,
    href: '/features/planner'
  },
  {
    name: 'Technical Audit',
    description: 'Screaming Frog analysis',
    icon: Search,
    href: '/features/audit'
  },
  {
    name: 'Accessibility Analyzer',
    description: 'WCAG compliance testing',
    icon: Eye,
    href: '/features/accessibility'
  },
  {
    name: 'Meta Generator',
    description: 'AI-powered meta optimization',
    icon: FileText,
    href: '/features/meta-generator'
  },
  {
    name: 'Schema Generator',
    description: 'JSON-LD structured data',
    icon: Code,
    href: '/features/schema-generator'
  },
  {
    name: 'Image Alt Generator',
    description: 'Bulk alt text creation',
    icon: Image,
    href: '/features/image-alt'
  }
];

const FAQ_ITEMS = [
  {
    question: 'Is there a free tier?',
    answer: 'Yes! You can start using Content Strategy Portal for free. Create an account to access all features with generous usage limits.'
  },
  {
    question: 'How do I upload a Screaming Frog export?',
    answer: 'Navigate to the Technical Audit tool and click "Upload Export". Select your ZIP file (up to 5GB) and our system will process it automatically.'
  },
  {
    question: 'Can I invite team members?',
    answer: 'Absolutely! Open any project and use the team management feature to invite collaborators. You can assign roles and permissions for each member.'
  },
  {
    question: 'How does the AI feature work?',
    answer: 'We use Claude AI to provide intelligent recommendations, generate content, and analyze your data. AI features are available across all tools.'
  },
  {
    question: 'Can I export reports for clients?',
    answer: 'Yes, all tools support professional exports. Generate branded PDF and Excel reports suitable for client presentations.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Your data is protected with enterprise-grade security. We use Firebase for authentication and data storage, with strict access controls.'
  }
];

const getColorClasses = (color) => {
  const colors = {
    primary: { bg: 'bg-primary-50', icon: 'text-primary-600', border: 'border-primary-200' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-200' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-200' }
  };
  return colors[color] || colors.primary;
};

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-charcoal-50 via-white to-emerald-50 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-100 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-sm font-medium mb-8">
              <HelpCircle className="w-4 h-4" />
              Help Center
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-charcoal-900 tracking-tight">
              How Can We Help?
            </h1>
            <p className="mt-6 text-xl text-charcoal-600 leading-relaxed">
              Find guides, tutorials, and resources to help you get the most out of Content Strategy Portal.
            </p>
          </div>
        </div>
      </section>

      {/* Help Sections */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {HELP_SECTIONS.map((section) => {
              const colors = getColorClasses(section.color);
              return (
                <Link
                  key={section.href}
                  to={section.href}
                  className="group bg-white rounded-2xl border border-charcoal-100 p-6 hover:border-charcoal-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center mb-6`}>
                    <section.icon className={`w-7 h-7 ${colors.icon}`} />
                  </div>
                  <h2 className="text-xl font-semibold text-charcoal-900 group-hover:text-primary-600 transition-colors">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-charcoal-600">
                    {section.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {section.articles.map((article, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-charcoal-500">
                        <span className="w-1 h-1 bg-charcoal-300 rounded-full" />
                        {article}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 inline-flex items-center text-sm font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tool Guides */}
      <section className="py-20 lg:py-28 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-charcoal-900">Tool Guides</h2>
            <p className="mt-4 text-lg text-charcoal-600">
              Learn how to use each tool effectively.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOL_GUIDES.map((tool) => (
              <Link
                key={tool.href}
                to={tool.href}
                className="flex items-center gap-4 bg-white rounded-xl p-4 border border-charcoal-100 hover:border-primary-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <tool.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <div className="font-medium text-charcoal-900">{tool.name}</div>
                  <div className="text-sm text-charcoal-500">{tool.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-charcoal-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-charcoal-600">
              Quick answers to common questions.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <div key={index} className="bg-charcoal-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-charcoal-900">{item.question}</h3>
                  <p className="mt-2 text-charcoal-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-charcoal-900 to-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Video Tutorials</h3>
              <p className="mt-2 text-charcoal-400 text-sm">
                Watch step-by-step guides for each feature.
              </p>
              <Link
                to="/help/resources"
                className="mt-4 inline-flex items-center gap-1 text-primary-400 font-medium hover:text-primary-300"
              >
                Browse videos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Quick Start</h3>
              <p className="mt-2 text-charcoal-400 text-sm">
                Get up and running in under 5 minutes.
              </p>
              <Link
                to="/help/getting-started"
                className="mt-4 inline-flex items-center gap-1 text-emerald-400 font-medium hover:text-emerald-300"
              >
                Start now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Need More Help?</h3>
              <p className="mt-2 text-charcoal-400 text-sm">
                Can't find what you're looking for? Let us know.
              </p>
              <Link
                to="/register"
                className="mt-4 inline-flex items-center gap-1 text-violet-400 font-medium hover:text-violet-300"
              >
                Get in touch <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-emerald-500 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-xl text-emerald-100">
            Create your free account and start optimizing today.
          </p>
          <div className="mt-10">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-charcoal-50 text-emerald-600 font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
