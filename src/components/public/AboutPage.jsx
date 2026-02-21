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
import SEOHead from '../shared/SEOHead';
import { organizationSchema } from '../../config/seo';

const VALUES = [
  {
    icon: Target,
    title: 'Automate the Boring Parts',
    description: 'Content strategists should strategize, not wrangle spreadsheets. We automate the technical work so you can focus on what matters.'
  },
  {
    icon: Shield,
    title: 'Accuracy Over Speed',
    description: 'Our AI labels every suggestion as a suggestion. We never pretend AI output is finished work — you review, you decide.'
  },
  {
    icon: Heart,
    title: 'Practitioner-Built',
    description: 'Every feature was designed by someone who has done the work, not just studied it. Real workflows, real pain points, real solutions.'
  },
  {
    icon: Lightbulb,
    title: 'Transparent Tooling',
    description: 'You always see how scores are calculated, why issues are flagged, and what our AI is doing. No black boxes.'
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
      <SEOHead
        pageKey="about"
        schema={organizationSchema}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About' }
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
            <h1 className="text-4xl sm:text-5xl font-bold text-charcoal-900 tracking-tight">
              We Built the Platform We Wished Existed
            </h1>
            <p className="mt-6 text-xl text-charcoal-600 leading-relaxed">
              Content strategists deserve tools as sophisticated as the strategies they build.
              We're making that happen.
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
                Built by Content Professionals, For Content Professionals
              </h2>
              <div className="mt-6 space-y-4 text-charcoal-600 leading-relaxed">
                <p>
                  Content Strategy Portal was born from a simple observation: content strategists
                  were spending more time on manual execution — auditing, checklist tracking,
                  metadata writing, accessibility checks — than on actual strategy.
                </p>
                <p>
                  We set out to automate the minutiae. Our integrated tools handle the
                  technical busywork so content teams can focus on what they do best:
                  planning, creating, and delivering content that drives results.
                </p>
                <p>
                  Today, agencies and enterprise teams use our platform to reclaim hours
                  every week, deliver consistent quality, and scale their content operations
                  without scaling their headcount.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-cyan-50 rounded-3xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600">353</div>
                  <div className="mt-1 text-sm text-charcoal-600">Checklist Items</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600">40+</div>
                  <div className="mt-1 text-sm text-charcoal-600">Schema Types</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600">93</div>
                  <div className="mt-1 text-sm text-charcoal-600">Accessibility Checks</div>
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
                Every Tool a Content Strategist Needs — in One Tab
              </h2>
              <p className="mt-6 text-charcoal-300 leading-relaxed">
                Unlike point solutions that address a single need, Content Strategy Portal
                automates the entire content workflow so your team can focus on strategy, not execution.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-charcoal-200">Unified dashboard for all content activities</span>
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
                <div className="text-5xl font-bold text-primary-400">7</div>
                <div className="mt-2 text-xl text-white">Integrated Tools</div>
                <p className="mt-4 text-charcoal-400">
                  Content Planner, Technical Audit, Accessibility Analyzer,
                  Meta Generator, Schema Generator, Image Alt Generator,
                  and AI Readability Checker.
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
            See for yourself. It's free.
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            No credit card. No sales calls. Just better content strategy.
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
