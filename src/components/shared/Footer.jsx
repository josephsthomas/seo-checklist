import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-lg">Flipside SEO Portal</span>
          </div>
          <p className="text-sm text-gray-400">
            All-in-one SEO suite for organic health & visibility
          </p>
          <p className="text-xs text-gray-500 mt-2">
            © {new Date().getFullYear()} Flipside Group. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
