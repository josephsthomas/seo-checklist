import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const themes = [
  { id: 'light', name: 'Light', icon: Sun, description: 'Light mode' },
  { id: 'dark', name: 'Dark', icon: Moon, description: 'Dark mode' },
  { id: 'system', name: 'System', icon: Monitor, description: 'Follow system' },
];

export default function ThemeSwitcher({ variant = 'dropdown' }) {
  const { theme, setTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTheme = themes.find(t => t.id === theme);
  const CurrentIcon = currentTheme?.icon || Sun;

  if (variant === 'toggle') {
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="p-2 rounded-lg text-charcoal-600 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className="flex items-center gap-1 p-1 rounded-xl bg-charcoal-100 dark:bg-charcoal-800">
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-white shadow-sm'
                  : 'text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-white'
              }`}
              aria-label={t.description}
              aria-pressed={isActive}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <CurrentIcon className="w-4 h-4" />
        <span>{currentTheme?.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 shadow-lg py-1 z-50 animate-fade-in-down">
          <div className="px-3 py-2 border-b border-charcoal-100 dark:border-charcoal-700">
            <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">
              Appearance
            </p>
          </div>
          <ul role="listbox" aria-label="Select theme">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.id;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-50 dark:hover:bg-charcoal-700'
                    }`}
                    role="option"
                    aria-selected={isActive}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{t.name}</span>
                    {isActive && <Check className="w-4 h-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// Quick toggle for navbar
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg text-charcoal-600 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700/50 transition-all group"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <Moon
          className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
    </button>
  );
}
