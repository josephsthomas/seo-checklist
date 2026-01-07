import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Target,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

/**
 * Tutorial definitions for each tool
 */
const TUTORIALS = {
  planner: {
    id: 'planner',
    name: 'Content Planner Tutorial',
    description: 'Learn how to create and manage SEO projects',
    path: '/planner',
    steps: [
      {
        id: 1,
        title: 'Welcome to Content Planner',
        description: 'This tool helps you plan and track SEO content projects from start to finish.',
        tip: 'Start by creating your first project to organize your SEO tasks.',
        action: 'Click "New Project" to get started.'
      },
      {
        id: 2,
        title: 'Create a New Project',
        description: 'Enter your project details including name, type, and description.',
        tip: 'Choose the right project type to get relevant checklist items.',
        selector: '[data-tutorial="new-project"]'
      },
      {
        id: 3,
        title: 'Use the Checklist',
        description: 'Work through the SEO checklist items, marking them complete as you go.',
        tip: 'Focus on CRITICAL items first - they have the biggest impact.',
        selector: '[data-tutorial="checklist"]'
      },
      {
        id: 4,
        title: 'Track Progress',
        description: 'Monitor your progress with the progress dashboard.',
        tip: 'Check the progress view to see how all your projects are doing.',
        action: 'Visit Progress Dashboard to see aggregate stats.'
      }
    ]
  },
  audit: {
    id: 'audit',
    name: 'Technical Audit Tutorial',
    description: 'Learn how to run technical SEO audits',
    path: '/audit',
    steps: [
      {
        id: 1,
        title: 'Start Your Audit',
        description: 'Upload a sitemap or crawl file to begin your technical audit.',
        tip: 'XML sitemaps work best for comprehensive audits.'
      },
      {
        id: 2,
        title: 'Review Results',
        description: 'Examine the audit results organized by category and severity.',
        tip: 'Address errors first, then warnings, then suggestions.'
      },
      {
        id: 3,
        title: 'Export Reports',
        description: 'Export your audit results as PDF or Excel for sharing.',
        tip: 'Use the share feature to send results to stakeholders.'
      }
    ]
  },
  accessibility: {
    id: 'accessibility',
    name: 'Accessibility Analyzer Tutorial',
    description: 'Learn how to check for accessibility issues',
    path: '/accessibility',
    steps: [
      {
        id: 1,
        title: 'Enter a URL',
        description: 'Enter the URL of the page you want to check for accessibility.',
        tip: 'Check your most important pages first (homepage, key landing pages).'
      },
      {
        id: 2,
        title: 'Review Issues',
        description: 'Review issues grouped by WCAG criteria and severity.',
        tip: 'Level A issues are most critical for basic accessibility.'
      },
      {
        id: 3,
        title: 'Use AI Suggestions',
        description: 'Get AI-powered suggestions for fixing accessibility issues.',
        tip: 'AI suggestions provide code examples you can copy directly.'
      }
    ]
  },
  'image-alt': {
    id: 'image-alt',
    name: 'Image Alt Generator Tutorial',
    description: 'Learn how to generate alt text for images',
    path: '/image-alt',
    steps: [
      {
        id: 1,
        title: 'Upload Images',
        description: 'Drag and drop images or click to upload multiple files.',
        tip: 'You can upload up to 50 images at once.'
      },
      {
        id: 2,
        title: 'Review Generated Alt Text',
        description: 'Review the AI-generated alt text for each image.',
        tip: 'Edit any alt text that needs refinement for context.'
      },
      {
        id: 3,
        title: 'Export Results',
        description: 'Export your alt texts as Excel or download images with metadata.',
        tip: 'Use the bulk edit panel to make changes to multiple images at once.'
      }
    ]
  },
  'meta-generator': {
    id: 'meta-generator',
    name: 'Meta Generator Tutorial',
    description: 'Learn how to generate meta tags',
    path: '/meta-generator',
    steps: [
      {
        id: 1,
        title: 'Upload Content',
        description: 'Upload a document or paste text to generate meta tags.',
        tip: 'PDF and DOCX files work best for extracting content.'
      },
      {
        id: 2,
        title: 'Review Generated Tags',
        description: 'Review and edit the generated title and description.',
        tip: 'Keep titles under 60 characters and descriptions under 160.'
      },
      {
        id: 3,
        title: 'Create A/B Variants',
        description: 'Generate multiple variations for A/B testing.',
        tip: 'Test different variations to find what performs best.'
      }
    ]
  },
  'schema-generator': {
    id: 'schema-generator',
    name: 'Schema Generator Tutorial',
    description: 'Learn how to create structured data',
    path: '/schema-generator',
    steps: [
      {
        id: 1,
        title: 'Choose Schema Type',
        description: 'Select the type of structured data you want to create.',
        tip: 'Article and LocalBusiness schemas are most commonly used.'
      },
      {
        id: 2,
        title: 'Fill in Details',
        description: 'Enter the required and optional fields for your schema.',
        tip: 'Adding more fields improves your rich snippet chances.'
      },
      {
        id: 3,
        title: 'Validate & Copy',
        description: 'Validate your schema and copy the JSON-LD code.',
        tip: 'Use Google Rich Results Test to verify your schema works.'
      }
    ]
  }
};

/**
 * Tutorial Step Component
 */
function TutorialStep({ step, isActive, isComplete, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 p-3 rounded-lg transition-all text-left w-full ${
        isActive
          ? 'bg-primary-50 border-2 border-primary-500'
          : isComplete
            ? 'bg-emerald-50 border border-emerald-200'
            : 'bg-charcoal-50 border border-charcoal-100 hover:bg-charcoal-100'
      }`}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
        isComplete
          ? 'bg-emerald-500 text-white'
          : isActive
            ? 'bg-primary-500 text-white'
            : 'bg-charcoal-200 text-charcoal-500'
      }`}>
        {isComplete ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <span className="text-xs font-bold">{step.id}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${
          isActive ? 'text-primary-700' : isComplete ? 'text-emerald-700' : 'text-charcoal-700'
        }`}>
          {step.title}
        </p>
        {isActive && (
          <p className="text-xs text-charcoal-500 mt-1">{step.description}</p>
        )}
      </div>
    </button>
  );
}

/**
 * Tutorial Card for Selection
 */
export function TutorialCard({ tutorial, onStart }) {
  return (
    <div className="bg-white rounded-xl border border-charcoal-100 p-5 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Play className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-charcoal-900">{tutorial.name}</h3>
          <p className="text-sm text-charcoal-500 mt-1">{tutorial.description}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-charcoal-400">
              {tutorial.steps.length} steps
            </span>
            <span className="text-charcoal-300">•</span>
            <span className="text-xs text-charcoal-400">
              ~{tutorial.steps.length * 2} min
            </span>
          </div>
        </div>
        <button
          onClick={() => onStart(tutorial)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Start
        </button>
      </div>
    </div>
  );
}

/**
 * Interactive Tutorial Sidebar
 */
export default function InteractiveTutorial({
  tutorialId,
  onClose,
  className = ''
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const tutorial = TUTORIALS[tutorialId];

  useEffect(() => {
    // Reset when tutorial changes
    setCurrentStep(0);
    setCompletedSteps(new Set());
  }, [tutorialId]);

  const handleNext = useCallback(() => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < tutorial.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, tutorial?.steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    // Save completion to localStorage
    try {
      const completed = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
      if (!completed.includes(tutorialId)) {
        completed.push(tutorialId);
        localStorage.setItem('completedTutorials', JSON.stringify(completed));
      }
    } catch (error) {
      console.error('Error saving tutorial completion:', error);
    }
    onClose?.();
  }, [currentStep, tutorialId, onClose]);

  if (!tutorial) return null;

  const step = tutorial.steps[currentStep];
  const isLastStep = currentStep === tutorial.steps.length - 1;
  const progress = ((completedSteps.size + (currentStep === tutorial.steps.length - 1 ? 1 : 0)) / tutorial.steps.length) * 100;

  return (
    <div className={`bg-white rounded-2xl border border-charcoal-100 shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-cyan-500 p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <span className="font-semibold">{tutorial.name}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-white/80 mt-2">
          Step {currentStep + 1} of {tutorial.steps.length}
        </p>
      </div>

      {/* Current Step Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-charcoal-900 mb-2">{step.title}</h3>
        <p className="text-charcoal-600 mb-4">{step.description}</p>

        {/* Tip */}
        {step.tip && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl mb-4">
            <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">{step.tip}</p>
          </div>
        )}

        {/* Action */}
        {step.action && (
          <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg text-sm text-primary-700 font-medium">
            <ArrowRight className="w-4 h-4" />
            {step.action}
          </div>
        )}
      </div>

      {/* Step List */}
      <div className="px-5 pb-3">
        <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-2">All Steps</p>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {tutorial.steps.map((s, idx) => (
            <TutorialStep
              key={s.id}
              step={s}
              isActive={idx === currentStep}
              isComplete={completedSteps.has(idx)}
              onClick={() => setCurrentStep(idx)}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-charcoal-100 flex items-center gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="btn btn-secondary flex items-center gap-1 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex-1" />
        {isLastStep ? (
          <button
            onClick={handleComplete}
            className="btn btn-primary flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Tutorial
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn btn-primary flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Get all available tutorials
 */
export function getTutorials() {
  return Object.values(TUTORIALS);
}

/**
 * Check if a tutorial is completed
 */
export function isTutorialCompleted(tutorialId) {
  try {
    const completed = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
    return completed.includes(tutorialId);
  } catch (error) {
    console.error('Error checking tutorial completion:', error);
    return false;
  }
}
