import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-50 via-white to-primary-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[12rem] sm:text-[16rem] font-bold text-charcoal-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary-50 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 text-primary-400" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-900">
          Page Not Found
        </h1>
        <p className="mt-4 text-lg text-charcoal-600 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-charcoal-50 text-charcoal-700 font-semibold rounded-xl border border-charcoal-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-16 pt-8 border-t border-charcoal-200">
          <p className="text-sm text-charcoal-500 mb-6">
            Here are some helpful links instead:
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/features"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Features
            </Link>
            <Link
              to="/help"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Help Center
            </Link>
            <Link
              to="/about"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              About
            </Link>
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="mt-12">
          <div className="inline-flex items-center gap-2 text-sm text-charcoal-500">
            <HelpCircle className="w-4 h-4" />
            Need help?{' '}
            <Link to="/help" className="text-primary-600 hover:text-primary-700 font-medium">
              Visit our Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
