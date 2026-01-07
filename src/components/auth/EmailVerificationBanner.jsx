import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, X, RefreshCw, CheckCircle } from 'lucide-react';

export default function EmailVerificationBanner() {
  const { currentUser, resendVerificationEmail, refreshUser } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Don't show if user is verified, not logged in, or banner is dismissed
  if (!currentUser || currentUser.emailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerificationEmail();
    } catch {
      // Error handled in context
    } finally {
      setSending(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      await refreshUser();
      if (currentUser.emailVerified) {
        // Force a page reload to update all components
        window.location.reload();
      }
    } catch {
      // Silently fail
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">
                Please verify your email address
              </p>
              <p className="text-xs text-amber-600">
                We sent a verification email to <strong>{currentUser.email}</strong>.
                Check your inbox (and spam folder) to verify your account.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCheckVerification}
              disabled={checking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {checking ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  I've verified
                </>
              )}
            </button>

            <button
              onClick={handleResend}
              disabled={sending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  Resend email
                </>
              )}
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
