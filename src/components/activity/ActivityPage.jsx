import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import ActivityTimeline from './ActivityTimeline';

/**
 * Full Activity Page
 */
export default function ActivityPage() {
  return (
    <div className="min-h-screen bg-charcoal-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-charcoal-600 hover:text-charcoal-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-charcoal-900">Activity Timeline</h1>
              <p className="text-charcoal-500">Your complete activity history across all tools</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
          <ActivityTimeline showFilters={true} />
        </div>
      </div>
    </div>
  );
}
