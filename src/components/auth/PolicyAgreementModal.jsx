import { useState, useEffect, useRef } from 'react';
import { X, ScrollText, CheckCircle, ChevronDown } from 'lucide-react';

// Policy content components
import TermsOfServiceContent from './policy-content/TermsOfServiceContent';
import PrivacyPolicyContent from './policy-content/PrivacyPolicyContent';
import AIPolicyContent from './policy-content/AIPolicyContent';

const POLICY_CONFIG = {
  terms: {
    title: 'Terms of Service',
    icon: '📜',
    gradient: 'from-primary-500 to-primary-600',
    Content: TermsOfServiceContent
  },
  privacy: {
    title: 'Privacy & Data Policy',
    icon: '🛡️',
    gradient: 'from-emerald-500 to-emerald-600',
    Content: PrivacyPolicyContent
  },
  ai: {
    title: 'AI Usage Policy',
    icon: '🤖',
    gradient: 'from-amber-500 to-amber-600',
    Content: AIPolicyContent
  }
};

export default function PolicyAgreementModal({
  isOpen,
  onClose,
  policyType,
  onAccept,
  isAccepted = false
}) {
  const [canAccept, setCanAccept] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef(null);
  const modalRef = useRef(null);

  const policy = POLICY_CONFIG[policyType];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCanAccept(false);
      setScrollProgress(0);
      setHasScrolledToBottom(false);

      // Check if content is shorter than container (no scroll needed)
      setTimeout(() => {
        if (contentRef.current) {
          const { scrollHeight, clientHeight } = contentRef.current;
          if (scrollHeight <= clientHeight) {
            setCanAccept(true);
            setScrollProgress(100);
            setHasScrolledToBottom(true);
          }
        }
      }, 100);
    }
  }, [isOpen, policyType]);

  // Handle scroll tracking
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    // Calculate scroll progress percentage
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 100;
    setScrollProgress(Math.min(progress, 100));

    // Check if scrolled to bottom (with 20px threshold)
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      setCanAccept(true);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Trap focus in modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !policy) return null;

  const ContentComponent = policy.Content;

  const handleAccept = () => {
    if (canAccept) {
      onAccept(policyType);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl sm:max-h-[85vh] z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b border-charcoal-100 bg-gradient-to-r ${policy.gradient}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <span className="text-2xl" role="img" aria-hidden="true">{policy.icon}</span>
            </div>
            <div>
              <h2 id="policy-title" className="text-xl font-bold text-white">{policy.title}</h2>
              <p className="text-sm text-white/80">Please read and scroll to the bottom to accept</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scroll Progress Bar */}
        <div className="h-1 bg-charcoal-100 relative">
          <div
            className={`h-full transition-all duration-150 ${hasScrolledToBottom ? 'bg-green-500' : 'bg-primary-500'}`}
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Scroll Indicator */}
        {!hasScrolledToBottom && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-1 px-4 py-2 bg-charcoal-900/80 backdrop-blur rounded-full text-white text-sm animate-bounce">
              <ChevronDown className="w-4 h-4" />
              <span>Scroll to continue</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 prose prose-charcoal max-w-none"
          tabIndex={0}
          aria-label="Policy content - scroll to read all"
        >
          <ContentComponent />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-charcoal-100 bg-charcoal-50">
          {/* Status Message */}
          <div className={`flex items-center justify-center gap-2 mb-3 text-sm ${hasScrolledToBottom ? 'text-green-600' : 'text-charcoal-500'}`}>
            {hasScrolledToBottom ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>You have read the entire document</span>
              </>
            ) : (
              <>
                <ScrollText className="w-4 h-4" />
                <span>Scroll to the bottom to enable acceptance ({Math.round(scrollProgress)}%)</span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={!canAccept}
              className={`btn flex items-center gap-2 ${
                canAccept
                  ? 'btn-primary'
                  : 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
              }`}
              aria-disabled={!canAccept}
            >
              <CheckCircle className="w-4 h-4" />
              {isAccepted ? 'Already Accepted' : 'I Accept'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
