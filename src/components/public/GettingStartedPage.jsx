import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  UserPlus,
  FolderPlus,
  Upload,
  BarChart3,
  Users,
  Download,
  ChevronRight,
  Circle
} from 'lucide-react';
import SEOHead from '../shared/SEOHead';
import { howToSchema } from '../../config/seo';

const STEPS = [
  {
    number: '01',
    title: 'Create Your Account',
    description: 'Sign up for free in under a minute. No credit card required.',
    icon: UserPlus,
    details: [
      'Enter your email and create a password',
      'Verify your email address',
      'Choose your first project type or explore the tools'
    ]
  },
  {
    number: '02',
    title: 'Create Your First Project',
    description: 'Set up a project to organize your content workflow.',
    icon: FolderPlus,
    details: [
      'Click "New Project" from the dashboard',
      'Enter project name and URL',
      'Choose your checklist focus areas',
      'Set timeline and milestones'
    ]
  },
  {
    number: '03',
    title: 'Run Your First Audit',
    description: 'Upload a Screaming Frog export to analyze your site.',
    icon: Upload,
    details: [
      'Export your site crawl from Screaming Frog',
      'Upload the ZIP file to Technical Audit',
      'Review AI-powered recommendations',
      'Prioritize issues by impact'
    ]
  },
  {
    number: '04',
    title: 'Track Your Progress',
    description: 'Use the checklist to manage your content strategy tasks.',
    icon: BarChart3,
    details: [
      'Work through the 353-item checklist',
      'Mark items complete as you go',
      'Track progress with visual dashboards',
      'Never miss a content best practice'
    ]
  },
  {
    number: '05',
    title: 'Invite Your Team',
    description: 'Collaborate with colleagues on projects.',
    icon: Users,
    details: [
      'Invite team members by email',
      'Assign roles and permissions',
      'Assign tasks to team members',
      'Track team progress'
    ]
  },
  {
    number: '06',
    title: 'Export Reports',
    description: 'Generate professional reports for clients.',
    icon: Download,
    details: [
      'Choose your export format (PDF or Excel)',
      'Customize report sections',
      'Add your branding',
      'Share with stakeholders'
    ]
  }
];

const QUICK_TIPS = [
  {
    title: 'Start with the Audit',
    description: 'Running a technical audit first helps identify quick wins and prioritize your work.'
  },
  {
    title: 'Use the Checklist',
    description: 'The 353-item checklist ensures you never miss important content strategy elements.'
  },
  {
    title: 'Leverage AI Features',
    description: 'Let AI generate meta descriptions, alt text, and fix suggestions to save time.'
  },
  {
    title: 'Export Regularly',
    description: 'Generate reports to track progress over time and share with stakeholders.'
  }
];

function ProgressIndicator({ steps, currentStep, onStepClick }) {
  return (
    <div className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-40">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-charcoal-100 p-4">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <button
              key={step.number}
              onClick={() => onStepClick(index)}
              className={`flex items-center gap-3 w-full text-left transition-colors rounded-lg px-3 py-2 ${
                currentStep === index
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-50'
              }`}
              aria-label={`Go to step ${index + 1}: ${step.title}`}
            >
              {currentStep > index ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : currentStep === index ? (
                <Circle className="w-5 h-5 text-primary-500 fill-primary-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium whitespace-nowrap">{step.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GettingStartedPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const scrollToStep = (index) => {
    setCurrentStep(index);
    const element = document.getElementById(`step-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        pageKey="gettingStarted"
        schema={howToSchema}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Help Center', url: '/help' },
          { name: 'Getting Started' }
        ]}
      />
      <ProgressIndicator
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={scrollToStep}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-charcoal-50 via-white to-primary-50 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-100 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Link
              to="/help"
              className="inline-flex items-center gap-1 text-charcoal-500 hover:text-charcoal-700 text-sm mb-6"
            >
              Help Center <ChevronRight className="w-4 h-4" /> Getting Started
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Quick Start Guide
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-charcoal-900 tracking-tight">
              Get Started in Minutes
            </h1>
            <p className="mt-6 text-xl text-charcoal-600 leading-relaxed">
              Follow these simple steps to set up your Content Strategy Portal and start optimizing.
            </p>
            <div className="mt-10">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16 lg:space-y-24">
            {STEPS.map((step, index) => (
              <div
                key={step.number}
                id={`step-${index}`}
                className={`grid lg:grid-cols-2 gap-12 items-center scroll-mt-24 ${
                  index % 2 === 1 ? 'lg:grid-flow-dense' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-5xl font-bold text-primary-100">{step.number}</span>
                    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center">
                      <step.icon className="w-7 h-7 text-primary-600" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-charcoal-900">{step.title}</h2>
                  <p className="mt-4 text-lg text-charcoal-600">
                    {step.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-charcoal-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`bg-charcoal-50 rounded-3xl p-8 lg:p-12 ${
                  index % 2 === 1 ? 'lg:col-start-1' : ''
                }`}>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-charcoal-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="font-medium text-charcoal-900">{step.title}</span>
                    </div>
                    <div className="space-y-2">
                      {step.details.slice(0, 3).map((detail, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm text-charcoal-600 bg-charcoal-50 rounded-lg px-3 py-2"
                        >
                          <span className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-xs text-primary-600 font-medium">
                            {i + 1}
                          </span>
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="py-20 lg:py-28 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-charcoal-900">Pro Tips</h2>
            <p className="mt-4 text-lg text-charcoal-600">
              Get the most out of Content Strategy Portal with these tips.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_TIPS.map((tip, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-charcoal-900">{tip.title}</h3>
                <p className="mt-2 text-sm text-charcoal-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-charcoal-900 to-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white">What's Next?</h2>
            <p className="mt-4 text-lg text-charcoal-300">
              After getting started, explore these resources to become a power user.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link
              to="/help/resources"
              className="bg-charcoal-800/50 rounded-2xl p-8 border border-charcoal-700 hover:border-charcoal-600 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white">Resource Library</h3>
              <p className="mt-2 text-charcoal-400">
                Browse 200+ curated SEO resources, templates, and guides.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-primary-400 font-medium">
                Explore <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link
              to="/help/glossary"
              className="bg-charcoal-800/50 rounded-2xl p-8 border border-charcoal-700 hover:border-charcoal-600 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white">SEO Glossary</h3>
              <p className="mt-2 text-charcoal-400">
                Learn SEO terminology with our searchable glossary.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-primary-400 font-medium">
                Browse terms <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link
              to="/features"
              className="bg-charcoal-800/50 rounded-2xl p-8 border border-charcoal-700 hover:border-charcoal-600 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white">All Features</h3>
              <p className="mt-2 text-charcoal-400">
                Discover all seven tools and how they work together.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-primary-400 font-medium">
                View features <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Your first audit takes under 2 minutes.
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            Create your free account and see the difference immediately.
          </p>
          <div className="mt-10">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-charcoal-50 text-primary-600 font-semibold rounded-xl shadow-lg transition-all duration-200"
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
