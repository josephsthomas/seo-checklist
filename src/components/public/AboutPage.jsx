import { Link } from 'react-router-dom';
import {
  Target,
  Users,
  Lightbulb,
  Heart,
  ArrowRight,
  Shield,
  Zap,
  Globe
} from 'lucide-react';

const VALUES = [
  {
    icon: Target,
    title: 'Results-Driven',
    description: 'Every feature is designed to deliver measurable improvements in your SEO performance.'
  },
  {
    icon: Users,
    title: 'Team-First',
    description: 'Built for collaboration with role-based permissions and seamless team workflows.'
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Leveraging AI and modern technology to solve real SEO challenges efficiently.'
  },
  {
    icon: Heart,
    title: 'User-Centric',
    description: 'Designed with SEO professionals in mind, based on real-world workflows and needs.'
  },
];

const PRINCIPLES = [
  {
    icon: Shield,
    title: 'Security First',
    description: 'Your data is protected with enterprise-grade security. We never share or sell your information.',
    color: 'emerald'
  },
  {
    icon: Zap,
    title: 'Performance Matters',
    description: 'Built for speed and reliability. Our tools process large datasets without compromising performance.',
    color: 'amber'
  },
  {
    icon: Globe,
    title: 'Accessibility for All',
    description: 'We practice what we preach. Our platform is built with accessibility as a core principle.',
    color: 'blue'
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-charcoal-50 via-white to-primary-50 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-100 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-charcoal-900 tracking-tight">
              About Content Strategy Portal
            </h1>
            <p className="mt-6 text-xl text-charcoal-600 leading-relaxed">
              We're on a mission to make professional SEO tools accessible to agencies
              and enterprise teams of all sizes.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-3xl font-bold text-charcoal-900">
                Built by SEO Professionals, For SEO Professionals
              </h2>
              <div className="mt-6 space-y-4 text-charcoal-600 leading-relaxed">
                <p>
                  Content Strategy Portal was born from a simple observation: SEO teams were
                  using dozens of disconnected tools, spreadsheets, and manual processes to
                  manage their content strategies.
                </p>
                <p>
                  We set out to create a unified platform that brings together project management,
                  technical auditing, accessibility compliance, and AI-powered content optimization
                  into one seamless experience.
                </p>
                <p>
                  Today, our platform helps agencies and enterprise teams streamline their workflows,
                  deliver consistent results, and scale their SEO operations efficiently.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-cyan-50 rounded-3xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600">321</div>
                  <div className="mt-1 text-sm text-charcoal-600">Checklist Items</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600">6</div>
                  <div className="mt-1 text-sm text-charcoal-600">Integrated Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600">93</div>
                  <div className="mt-1 text-sm text-charcoal-600">A11y Rules</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600">200+</div>
                  <div className="mt-1 text-sm text-charcoal-600">Resources</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-28 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-charcoal-900">Our Values</h2>
            <p className="mt-4 text-lg text-charcoal-600">
              The principles that guide everything we build.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal-900">{value.title}</h3>
                <p className="mt-2 text-charcoal-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-charcoal-900">Our Commitments</h2>
            <p className="mt-4 text-lg text-charcoal-600">
              What you can expect when you use Content Strategy Portal.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PRINCIPLES.map((principle, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 ${
                  principle.color === 'emerald' ? 'bg-emerald-50' :
                  principle.color === 'amber' ? 'bg-amber-50' :
                  'bg-blue-50'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  principle.color === 'emerald' ? 'bg-emerald-100' :
                  principle.color === 'amber' ? 'bg-amber-100' :
                  'bg-blue-100'
                }`}>
                  <principle.icon className={`w-7 h-7 ${
                    principle.color === 'emerald' ? 'text-emerald-600' :
                    principle.color === 'amber' ? 'text-amber-600' :
                    'text-blue-600'
                  }`} />
                </div>
                <h3 className="text-xl font-semibold text-charcoal-900">{principle.title}</h3>
                <p className="mt-3 text-charcoal-600 leading-relaxed">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-charcoal-900 to-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">
                A Complete Platform, Not Just Another Tool
              </h2>
              <p className="mt-6 text-charcoal-300 leading-relaxed">
                Unlike point solutions that address a single need, Content Strategy Portal
                provides an integrated experience where all your SEO workflows connect.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-charcoal-200">Unified dashboard for all SEO activities</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-charcoal-200">AI-powered insights across all tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-charcoal-200">Team collaboration built-in from the start</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-charcoal-200">Professional exports for client reporting</span>
                </li>
              </ul>
            </div>
            <div className="bg-charcoal-800/50 rounded-2xl p-8 border border-charcoal-700">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary-400">6</div>
                <div className="mt-2 text-xl text-white">Integrated Tools</div>
                <p className="mt-4 text-charcoal-400">
                  Content Planner, Technical Audit, Accessibility Analyzer,
                  Meta Generator, Schema Generator, and Image Alt Generator.
                </p>
                <Link
                  to="/features"
                  className="mt-6 inline-flex items-center gap-2 text-primary-400 font-medium hover:text-primary-300"
                >
                  Explore all features
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            Join the growing community of SEO professionals using Content Strategy Portal.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-charcoal-50 text-primary-600 font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-400/20 hover:bg-primary-400/30 text-white font-semibold rounded-xl border border-primary-400/30 transition-colors"
            >
              View Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
