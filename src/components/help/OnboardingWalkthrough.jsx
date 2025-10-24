import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const onboardingSteps = [
  {
    id: 1,
    title: "Welcome to SEO Checklist Pro!",
    description: "Let's take a quick tour of the platform to get you started. This will only take 2 minutes.",
    image: "🎉",
    target: null
  },
  {
    id: 2,
    title: "Projects Dashboard",
    description: "Create and manage multiple SEO projects. Each project tracks 321 professional checklist items tailored to your project type.",
    image: "📁",
    target: "#projects-page"
  },
  {
    id: 3,
    title: "Create Your First Project",
    description: "Click 'New Project' to get started. You'll enter project details, client info, timeline, and budget in a simple 4-step wizard.",
    image: "➕",
    target: "#new-project-button"
  },
  {
    id: 4,
    title: "SEO Checklist",
    description: "Each project has a comprehensive 321-item checklist covering Discovery, Strategy, Build, Pre-Launch, Launch, and Post-Launch phases.",
    image: "✅",
    target: "#checklist-view"
  },
  {
    id: 5,
    title: "Task Details & Collaboration",
    description: "Click any checklist item to see detailed help, assign tasks to team members, add comments with @mentions, and track activity.",
    image: "💬",
    target: "#item-modal"
  },
  {
    id: 6,
    title: "My Tasks",
    description: "View all tasks assigned to you across all projects. Filter by status, due date, and priority to stay organized.",
    image: "📋",
    target: "#my-tasks-link"
  },
  {
    id: 7,
    title: "Team Management",
    description: "Admins and Project Managers can manage team members, assign roles, and control permissions from the Team page.",
    image: "👥",
    target: "#team-link"
  },
  {
    id: 8,
    title: "Help & Resources",
    description: "Access comprehensive guides, SEO glossary, and video tutorials anytime from the Help menu.",
    image: "📚",
    target: "#help-link"
  },
  {
    id: 9,
    title: "Notifications",
    description: "Get real-time notifications when you're assigned tasks, mentioned in comments, or when important deadlines approach.",
    image: "🔔",
    target: "#notifications-bell"
  },
  {
    id: 10,
    title: "You're All Set!",
    description: "You're ready to start managing your SEO projects like a pro. Create your first project to begin!",
    image: "🚀",
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

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full relative">
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-t-xl overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {onboardingSteps.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Skip tour
              </button>
            </div>

            {/* Main Content */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{step.image}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {step.title}
              </h2>
              <p className="text-gray-600 text-lg">
                {step.description}
              </p>
            </div>

            {/* Step Dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {onboardingSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-primary-600 w-8'
                      : index < currentStep
                      ? 'bg-primary-400'
                      : 'bg-gray-300'
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
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
}
