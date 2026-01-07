import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

const REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
  { id: 'lowercase', label: 'One lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
  { id: 'number', label: 'One number', test: (pwd) => /[0-9]/.test(pwd) },
  { id: 'special', label: 'One special character (!@#$%^&*)', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
];

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };

  const passedRequirements = REQUIREMENTS.filter(req => req.test(password));
  const score = passedRequirements.length;

  if (score <= 1) return { score, label: 'Very Weak', color: 'red' };
  if (score === 2) return { score, label: 'Weak', color: 'orange' };
  if (score === 3) return { score, label: 'Fair', color: 'amber' };
  if (score === 4) return { score, label: 'Good', color: 'lime' };
  return { score, label: 'Strong', color: 'green' };
}

export function isPasswordValid(password) {
  // Minimum requirement: at least 8 characters
  return password.length >= 8;
}

export default function PasswordStrengthMeter({ password, showRequirements = true }) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passedRequirements = useMemo(
    () => REQUIREMENTS.map(req => ({ ...req, passed: req.test(password) })),
    [password]
  );

  if (!password) return null;

  const colorClasses = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    lime: 'bg-lime-500',
    green: 'bg-green-500'
  };

  const textColorClasses = {
    red: 'text-red-600',
    orange: 'text-orange-600',
    amber: 'text-amber-600',
    lime: 'text-lime-600',
    green: 'text-green-600'
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                level <= strength.score
                  ? colorClasses[strength.color]
                  : 'bg-charcoal-200'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${textColorClasses[strength.color]}`}>
          {strength.label}
        </span>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
          {passedRequirements.map((req) => (
            <div
              key={req.id}
              className={`flex items-center gap-1.5 text-xs ${
                req.passed ? 'text-green-600' : 'text-charcoal-400'
              }`}
            >
              {req.passed ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
