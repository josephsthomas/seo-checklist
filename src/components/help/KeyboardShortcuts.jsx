import React, { useState, useEffect } from 'react';
import { X, Keyboard, Command } from 'lucide-react';

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: ["G", "P"], description: "Go to Projects" },
      { keys: ["G", "T"], description: "Go to My Tasks" },
      { keys: ["G", "M"], description: "Go to Team Management" },
      { keys: ["G", "H"], description: "Go to Help" },
      { keys: ["G", "R"], description: "Go to Resources" },
      { keys: ["G", "L"], description: "Go to Glossary" }
    ]
  },
  {
    category: "Actions",
    items: [
      { keys: ["N"], description: "Create New Project" },
      { keys: ["S"], description: "Focus Search" },
      { keys: ["/"], description: "Quick Search (anywhere)" },
      { keys: ["?"], description: "Show Keyboard Shortcuts" },
      { keys: ["Esc"], description: "Close Modal/Panel" }
    ]
  },
  {
    category: "Checklist",
    items: [
      { keys: ["Space"], description: "Toggle Item Completion" },
      { keys: ["Enter"], description: "Open Item Details" },
      { keys: ["C"], description: "Add Comment" },
      { keys: ["A"], description: "Assign Task" },
      { keys: ["↑", "↓"], description: "Navigate Items" }
    ]
  },
  {
    category: "General",
    items: [
      { keys: ["Ctrl/Cmd", "K"], description: "Command Palette" },
      { keys: ["Ctrl/Cmd", "S"], description: "Save Changes" },
      { keys: ["Ctrl/Cmd", "Z"], description: "Undo" },
      { keys: ["Ctrl/Cmd", "Shift", "Z"], description: "Redo" }
    ]
  }
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Open shortcuts panel with "?"
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        const target = e.target;
        // Don't trigger if typing in an input
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsOpen(true);
        }
      }

      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isOpen) {
    // Floating shortcut hint button
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors z-40 dark:bg-primary-500 dark:hover:bg-primary-600"
        title="Keyboard Shortcuts (Press ?)"
      >
        <Keyboard className="w-6 h-6" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[70]"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-charcoal-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-charcoal-800 border-b dark:border-charcoal-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Keyboard className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Keyboard Shortcuts</h2>
                <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Work faster with keyboard commands</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-charcoal-400 hover:text-charcoal-600 dark:text-charcoal-500 dark:hover:text-charcoal-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {shortcuts.map((category, idx) => (
                <div key={idx}>
                  <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-4">
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.items.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-charcoal-50 dark:bg-charcoal-700 rounded-lg hover:bg-charcoal-100 dark:hover:bg-charcoal-600 transition-colors"
                      >
                        <span className="text-sm text-charcoal-700 dark:text-charcoal-200">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              {keyIndex > 0 && (
                                <span className="text-charcoal-400 dark:text-charcoal-500 text-xs">+</span>
                              )}
                              <kbd className="px-2 py-1 bg-white dark:bg-charcoal-600 border border-charcoal-200 dark:border-charcoal-500 rounded text-xs font-mono text-charcoal-700 dark:text-charcoal-200 shadow-sm min-w-[32px] text-center">
                                {key}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pro Tip */}
            <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Command className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-primary-900 dark:text-primary-200 mb-1">Pro Tip</h4>
                  <p className="text-sm text-primary-800 dark:text-primary-300">
                    Press <kbd className="px-2 py-1 bg-white dark:bg-charcoal-700 border border-primary-300 dark:border-primary-700 rounded text-xs font-mono mx-1 dark:text-primary-300">?</kbd>
                    anytime to view this shortcuts panel. Most shortcuts work globally throughout the app.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t dark:border-charcoal-700 px-6 py-4 bg-charcoal-50 dark:bg-charcoal-900 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-primary"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
