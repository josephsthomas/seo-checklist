import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { ArrowLeft, ArrowRight, Check, X, HelpCircle, Info, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';

// Help content for each project type
const PROJECT_TYPE_HELP = {
  'Net New Site': {
    description: 'A brand new website being built from the ground up.',
    bestFor: 'New businesses, rebranding projects, or replacing legacy sites',
    seoFocus: 'Foundation setup, site architecture, technical SEO from day one'
  },
  'Site Refresh': {
    description: 'An existing website getting design and/or content updates.',
    bestFor: 'Outdated sites needing modernization while preserving SEO equity',
    seoFocus: 'URL preservation, redirect mapping, content migration'
  },
  'Campaign Landing Page': {
    description: 'Focused pages for specific marketing campaigns or promotions.',
    bestFor: 'PPC campaigns, product launches, seasonal promotions',
    seoFocus: 'Conversion optimization, page speed, targeted keywords'
  },
  'Microsite': {
    description: 'A small, standalone site for a specific purpose or brand initiative.',
    bestFor: 'Events, specific products, partner programs',
    seoFocus: 'Domain strategy, cross-linking, brand consistency'
  }
};

// Help content for each status
const STATUS_HELP = {
  'Planning': 'Initial phase for gathering requirements and defining scope',
  'Active': 'Project is currently being worked on by the team',
  'On Hold': 'Temporarily paused - work will resume later',
  'Completed': 'All work finished and deliverables handed off',
  'Archived': 'Historical reference - no longer actively managed'
};

const STEPS = [
  { id: 1, name: 'Basic Information', description: 'Project name and type' },
  { id: 2, name: 'Timeline', description: 'Dates and status' },
  { id: 3, name: 'Budget & Team', description: 'Hours and team members' },
  { id: 4, name: 'Details', description: 'Description and contacts' }
];

const PROJECT_TYPES = [
  'Net New Site',
  'Site Refresh',
  'Campaign Landing Page',
  'Microsite'
];

const PROJECT_STATUSES = [
  'Planning',
  'Active',
  'On Hold',
  'Completed',
  'Archived'
];

export default function ProjectCreationWizard() {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    projectType: 'Net New Site',
    status: 'Planning',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    targetLaunchDate: '',
    actualLaunchDate: null,
    estimatedHours: '',
    budget: '',
    description: '',
    primaryContact: {
      name: '',
      email: '',
      phone: ''
    },
    teamMembers: [],
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contact.')) {
      const contactField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        primaryContact: {
          ...prev.primaryContact,
          [contactField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Project name is required';
      if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
      if (!formData.projectType) newErrors.projectType = 'Project type is required';
    }

    if (step === 2) {
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.targetLaunchDate) newErrors.targetLaunchDate = 'Target launch date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Convert dates to proper format
      const projectData = {
        ...formData,
        startDate: new Date(formData.startDate),
        targetLaunchDate: new Date(formData.targetLaunchDate),
        estimatedHours: parseFloat(formData.estimatedHours) || 0,
        budget: parseFloat(formData.budget) || 0
      };

      const projectId = await createProject(projectData);
      navigate(`/planner/projects/${projectId}`);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      navigate('/planner');
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="text-charcoal-600 hover:text-charcoal-900 flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Content Planner
          </button>
          <h1 className="text-3xl font-bold text-charcoal-900">Create New Project</h1>
          <p className="text-charcoal-600 mt-1">Set up your content project in 4 easy steps</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex-1">
                <div className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2
                        ${currentStep > step.id
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : currentStep === step.id
                            ? 'border-primary-600 text-primary-600'
                            : 'border-charcoal-200 text-charcoal-400'
                        }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-charcoal-900' : 'text-charcoal-400'}`}>
                        {step.name}
                      </div>
                      <div className="text-xs text-charcoal-500 hidden sm:block">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 ${currentStep > step.id ? 'bg-primary-600' : 'bg-charcoal-300'}`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-charcoal-900">Basic Information</h2>
                <div className="text-xs text-charcoal-500 bg-charcoal-100 px-2 py-1 rounded">Step 1 of 4</div>
              </div>

              {/* Step 1 Help Tip */}
              <div className="p-4 rounded-lg bg-primary-50 border border-primary-100">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-primary-800">
                    <strong>Getting started:</strong> Choose a descriptive project name that includes the client and project scope.
                    The project type determines which checklist items are most relevant for your workflow.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="e.g., Acme Corp Website Redesign"
                />
                <p className="mt-1 text-xs text-charcoal-500">
                  Use a clear, descriptive name. Example: "ClientName - ProjectType - Year"
                </p>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  className={`input ${errors.clientName ? 'border-red-500' : ''}`}
                  placeholder="e.g., Acme Corporation"
                />
                <p className="mt-1 text-xs text-charcoal-500">
                  The company or organization this project is for
                </p>
                {errors.clientName && <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Project Type *
                </label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="input"
                >
                  {PROJECT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                {/* Project Type Help Card */}
                {formData.projectType && PROJECT_TYPE_HELP[formData.projectType] && (
                  <div className="mt-3 p-4 rounded-lg bg-charcoal-50 border border-charcoal-200">
                    <div className="flex items-start gap-3">
                      <Info className="w-4 h-4 text-charcoal-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-charcoal-700 mb-2">{PROJECT_TYPE_HELP[formData.projectType].description}</p>
                        <div className="space-y-1 text-xs text-charcoal-600">
                          <p><strong>Best for:</strong> {PROJECT_TYPE_HELP[formData.projectType].bestFor}</p>
                          <p><strong>SEO Focus:</strong> {PROJECT_TYPE_HELP[formData.projectType].seoFocus}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-charcoal-900">Timeline</h2>
                <div className="text-xs text-charcoal-500 bg-charcoal-100 px-2 py-1 rounded">Step 2 of 4</div>
              </div>

              {/* Step 2 Help Tip */}
              <div className="p-4 rounded-lg bg-primary-50 border border-primary-100">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-primary-800">
                    <strong>Setting expectations:</strong> The target launch date helps track progress and prioritize tasks.
                    You can update these dates later as the project evolves.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`input ${errors.startDate ? 'border-red-500' : ''}`}
                />
                <p className="mt-1 text-xs text-charcoal-500">
                  When the project officially begins (defaults to today)
                </p>
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Target Launch Date *
                </label>
                <input
                  type="date"
                  name="targetLaunchDate"
                  value={formData.targetLaunchDate}
                  onChange={handleChange}
                  className={`input ${errors.targetLaunchDate ? 'border-red-500' : ''}`}
                />
                <p className="mt-1 text-xs text-charcoal-500">
                  The deadline for completing all SEO deliverables (can be adjusted later)
                </p>
                {errors.targetLaunchDate && <p className="mt-1 text-sm text-red-600">{errors.targetLaunchDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Current Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                >
                  {PROJECT_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                {/* Status Help */}
                {formData.status && STATUS_HELP[formData.status] && (
                  <p className="mt-2 text-xs text-charcoal-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {STATUS_HELP[formData.status]}
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-charcoal-900">Budget & Team</h2>
                <div className="text-xs text-charcoal-500 bg-charcoal-100 px-2 py-1 rounded">Step 3 of 4</div>
              </div>

              {/* Step 3 Help Tip */}
              <div className="p-4 rounded-lg bg-primary-50 border border-primary-100">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-primary-800">
                    <strong>Optional but helpful:</strong> Budget information helps track project scope and resource allocation.
                    You can leave these blank and fill them in later.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., 120"
                  min="0"
                  step="0.5"
                />
                <p className="mt-1 text-xs text-charcoal-500">
                  Total estimated hours for all SEO work on this project
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Budget (in dollars)
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., 15000"
                  min="0"
                  step="0.01"
                />
                <p className="mt-1 text-xs text-charcoal-500">
                  Optional: Project budget for tracking and reporting
                </p>
              </div>

              {/* Budget Guide */}
              <div className="p-4 rounded-lg bg-charcoal-50 border border-charcoal-200">
                <h4 className="text-sm font-medium text-charcoal-700 mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Typical SEO Project Hours
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-charcoal-600">
                  <div>• Campaign Landing Page: 20-40 hrs</div>
                  <div>• Microsite: 40-80 hrs</div>
                  <div>• Site Refresh: 80-160 hrs</div>
                  <div>• Net New Site: 120-300+ hrs</div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-charcoal-900">Details</h2>
                <div className="text-xs text-charcoal-500 bg-charcoal-100 px-2 py-1 rounded">Step 4 of 4</div>
              </div>

              {/* Step 4 Help Tip */}
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-emerald-800">
                    <strong>Almost done!</strong> Add any additional context that will help your team understand this project.
                    All fields on this page are optional.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input min-h-[100px]"
                  placeholder="Brief description of the project..."
                />
                <p className="mt-1 text-xs text-charcoal-500">
                  Include project goals, target audience, or key deliverables
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-charcoal-900 mb-2">Primary Contact</h3>
                <p className="text-sm text-charcoal-500 mb-4">
                  The main point of contact at the client organization
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="contact.name"
                      value={formData.primaryContact.name}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g., John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="contact.email"
                      value={formData.primaryContact.email}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g., john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="contact.phone"
                      value={formData.primaryContact.phone}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g., (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Special Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input min-h-[80px]"
                  placeholder="Any special requirements or notes..."
                />
                <p className="mt-1 text-xs text-charcoal-500">
                  Include any special requirements, constraints, or context for the team
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={handleCancel}
              className="btn btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>

            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={loading}
                className="btn btn-primary flex items-center gap-2"
              >
                {currentStep === 4 ? (
                  <>
                    <Check className="w-4 h-4" />
                    {loading ? 'Creating...' : 'Create Project'}
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
