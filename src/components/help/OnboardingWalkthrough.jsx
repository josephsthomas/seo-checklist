import { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  ClipboardList,
  Search,
  Accessibility,
  Image,
  Tags,
  Code2,
  Users,
  Bell,
  BookOpen,
  Rocket
} from 'lucide-react';

const onboardingSteps = [
  {
    id: 1,
    title: "Welcome to Content Strategy Portal!",
    description: "Your all-in-one hub for SEO content planning and technical optimization. Let's take a quick tour!",
    icon: Sparkles,
    color: 'from-primary-500 to-cyan-500',
    target: null
  },
  {
    id: 2,
    title: "Content Planner",
    description: "Create projects with our comprehensive 321-item SEO checklist. Track progress across Discovery, Design, Development, and Launch phases.",
    icon: ClipboardList,
    color: 'from-primary-500 to-primary-600',
    target: "#projects-page"
  },
  {
    id: 3,
    title: "Technical Audit",
    description: "Upload Screaming Frog exports to run comprehensive technical SEO audits. Get AI-powered recommendations for fixing issues.",
    icon: Search,
    color: 'from-cyan-500 to-cyan-600',
    target: "#audit-tool"
  },
  {
    id: 4,
    title: "Accessibility Analyzer",
    description: "Run WCAG 2.2 compliance audits on any URL. Identify violations and get AI-generated fix suggestions with code examples.",
    icon: Accessibility,
    color: 'from-purple-500 to-purple-600',
    target: "#accessibility-tool"
  },
  {
    id: 5,
    title: "Image Alt Generator",
    description: "Use Claude Vision AI to generate descriptive, SEO-friendly alt text for your images. Batch process up to 100 images at once.",
    icon: Image,
    color: 'from-emerald-500 to-emerald-600',
    target: "#image-alt-tool"
  },
  {
    id: 6,
    title: "Meta Data Generator",
    description: "Upload documents (DOCX, PDF, HTML) and let AI generate optimized titles, descriptions, and Open Graph tags.",
    icon: Tags,
    color: 'from-amber-500 to-amber-600',
    target: "#meta-generator"
  },
  {
    id: 7,
    title: "Schema Generator",
    description: "Generate JSON-LD structured data from your HTML content. Supports 50+ schema types for rich search results.",
    icon: Code2,
    color: 'from-rose-500 to-rose-600',
    target: "#schema-generator"
  },
  {
    id: 8,
    title: "Team Collaboration",
    description: "Assign tasks to team members, add comments with @mentions, and track activity across all your projects.",
    icon: Users,
    color: 'from-indigo-500 to-indigo-600',
    target: "#team-link"
  },
  {
    id: 9,
    title: "Stay Updated",
    description: "Get real-time notifications for task assignments, comments, and deadlines. Customize your notification preferences anytime.",
    icon: Bell,
    color: 'from-orange-500 to-orange-600',
    target: "#notifications-bell"
  },
  {
    id: 10,
    title: "Help & Resources",
    description: "Access guides, tutorials, and an SEO glossary. Press Cmd+K to search across all tools and help content.",
    icon: BookOpen,
    color: 'from-teal-500 to-teal-600',
    target: "#help-link"
  },
  {
    id: 11,
    title: "You're All Set!",
    description: "You're ready to optimize your content like a pro. Start with a project or try any of our SEO tools!",
    icon: Rocket,
    color: 'from-primary-500 to-cyan-500',
    target: null
  }
];

export default function OnboardingWalkthrough({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    if (!hasCompletedOnboarding) {
      // Show onboarding after a short delay
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  // Keyboard navigation: Escape key to close walkthrough
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        localStorage.setItem('hasCompletedOnboarding', 'true');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  if (!isOpen) return null;

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const StepIcon = step.icon;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1.5 bg-charcoal-100">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-charcoal-500">
                Step {currentStep + 1} of {onboardingSteps.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-sm text-charcoal-400 hover:text-charcoal-600 transition-colors"
              >
                Skip tour
              </button>
            </div>

            {/* Main Content */}
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                <StepIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-charcoal-900 mb-3">
                {step.title}
              </h2>
              <p className="text-charcoal-600 text-lg leading-relaxed max-w-md mx-auto">
                {step.description}
              </p>
            </div>

            {/* Step Dots */}
            <div className="flex items-center justify-center gap-1.5 mb-8">
              {onboardingSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  aria-label={`Go to step ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-gradient-to-r from-primary-500 to-cyan-500 w-8'
                      : index < currentStep
                      ? 'bg-primary-400 w-2'
                      : 'bg-charcoal-200 w-2 hover:bg-charcoal-300'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`btn btn-secondary flex items-center gap-2 ${
                  currentStep === 0 ? 'invisible' : ''
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={handleNext}
                className="btn btn-primary flex items-center gap-2"
              >
                {currentStep === onboardingSteps.length - 1 ? (
                  <>
                    <Check className="w-4 h-4" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleSkip}
            aria-label="Close walkthrough"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
