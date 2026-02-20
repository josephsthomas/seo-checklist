import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Chrome, CheckCircle, Circle, Eye, EyeOff, FileText, Shield, Bot } from 'lucide-react';
import PolicyAgreementModal from './PolicyAgreementModal';
import PasswordStrengthMeter, { isPasswordValid } from './PasswordStrengthMeter';
import SEOHead from '../shared/SEOHead';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Policy acceptance state - each policy must be individually accepted
  const [policyAcceptance, setPolicyAcceptance] = useState({
    terms: false,
    privacy: false,
    ai: false
  });

  // Modal state
  const [activePolicyModal, setActivePolicyModal] = useState(null);

  const allPoliciesAccepted = policyAcceptance.terms && policyAcceptance.privacy && policyAcceptance.ai;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handlePolicyAccept = (policyType) => {
    setPolicyAcceptance(prev => ({
      ...prev,
      [policyType]: true
    }));
  };

  const openPolicyModal = (policyType) => {
    setActivePolicyModal(policyType);
  };

  const closePolicyModal = () => {
    setActivePolicyModal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!allPoliciesAccepted) {
      return setError('You must read and accept all policies to create an account');
    }

    if (!isPasswordValid(formData.password)) {
      return setError('Password must be at least 8 characters');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      await signup(formData.email, formData.password, formData.name);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!allPoliciesAccepted) {
      return setError('You must read and accept all policies to create an account');
    }

    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const policyButtons = [
    {
      type: 'terms',
      label: 'Terms of Service',
      icon: FileText,
      color: 'primary'
    },
    {
      type: 'privacy',
      label: 'Privacy Policy',
      icon: Shield,
      color: 'emerald'
    },
    {
      type: 'ai',
      label: 'AI Usage Policy',
      icon: Bot,
      color: 'amber'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-8">
      <SEOHead
        title="Sign Up | Content Strategy Portal"
        description="Create your Content Strategy Portal account. Access SEO tools, content planning, accessibility auditing, and AI-powered features."
        canonical="/register"
      />
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">Content Strategy Portal</h1>
          <p className="text-charcoal-600">All-in-one content and SEO suite for organic health & visibility</p>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-semibold text-charcoal-900 mb-6">Sign up</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="name" className="block text-sm font-medium text-charcoal-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 w-5 h-5" aria-hidden="true" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 w-5 h-5" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 w-5 h-5" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  aria-required="true"
                  aria-describedby="password-strength"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div id="password-strength">
                <PasswordStrengthMeter password={formData.password} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 w-5 h-5" aria-hidden="true" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Policy Acceptance Section */}
            <div className="form-group">
              <label className="block text-sm font-medium text-charcoal-700 mb-3">
                Review & Accept Policies
              </label>
              <p className="text-xs text-charcoal-500 mb-3">
                You must read and scroll through each policy to accept. Click each button to open and review.
              </p>

              <div className="space-y-2">
                {policyButtons.map((policy) => {
                  const Icon = policy.icon;
                  const isAccepted = policyAcceptance[policy.type];

                  return (
                    <button
                      key={policy.type}
                      type="button"
                      onClick={() => openPolicyModal(policy.type)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                        isAccepted
                          ? 'border-green-300 bg-green-50 hover:bg-green-100'
                          : 'border-charcoal-200 bg-white hover:border-charcoal-300 hover:bg-charcoal-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isAccepted
                          ? 'bg-green-100'
                          : policy.color === 'primary'
                            ? 'bg-primary-100'
                            : policy.color === 'emerald'
                              ? 'bg-emerald-100'
                              : 'bg-amber-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          isAccepted
                            ? 'text-green-600'
                            : policy.color === 'primary'
                              ? 'text-primary-600'
                              : policy.color === 'emerald'
                                ? 'text-emerald-600'
                                : 'text-amber-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-medium ${
                          isAccepted ? 'text-green-700' : 'text-charcoal-700'
                        }`}>
                          {policy.label}
                        </span>
                        <p className="text-xs text-charcoal-500">
                          {isAccepted ? 'Accepted' : 'Click to read & accept'}
                        </p>
                      </div>
                      {isAccepted ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-charcoal-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Acceptance Status */}
              <div className={`mt-3 p-2 rounded-lg text-center text-sm ${
                allPoliciesAccepted
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {allPoliciesAccepted ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    All policies accepted - Ready to create account
                  </span>
                ) : (
                  <span>
                    {3 - Object.values(policyAcceptance).filter(Boolean).length} of 3 policies remaining
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !allPoliciesAccepted}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                allPoliciesAccepted
                  ? 'btn btn-primary'
                  : 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
              }`}
              aria-busy={loading}
              aria-disabled={!allPoliciesAccepted}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-charcoal-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-charcoal-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading || !allPoliciesAccepted}
              className={`w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                allPoliciesAccepted
                  ? 'btn btn-secondary'
                  : 'bg-charcoal-100 text-charcoal-400 cursor-not-allowed border border-charcoal-200'
              }`}
              aria-busy={loading}
              aria-disabled={!allPoliciesAccepted}
            >
              <Chrome className="w-5 h-5" aria-hidden="true" />
              Sign up with Google
            </button>

            {!allPoliciesAccepted && (
              <p className="text-xs text-charcoal-500 text-center mt-2">
                Accept all policies above to enable account creation
              </p>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-charcoal-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Policy Modals */}
      <PolicyAgreementModal
        isOpen={activePolicyModal !== null}
        onClose={closePolicyModal}
        policyType={activePolicyModal}
        onAccept={handlePolicyAccept}
        isAccepted={activePolicyModal ? policyAcceptance[activePolicyModal] : false}
      />
    </div>
  );
}
