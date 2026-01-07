import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Lightbulb,
  ClipboardList,
  Search,
  Accessibility,
  Image,
  Tags,
  Code2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getRecommendations, getHomeRecommendations, getContextualTip, TOOLS } from '../../lib/recommendations';

// Icon mapping
const ICONS = {
  ClipboardList,
  Search,
  Accessibility,
  Image,
  Tags,
  Code2
};

// Color classes
const COLOR_CLASSES = {
  primary: 'from-primary-500 to-primary-600 text-white',
  cyan: 'from-cyan-500 to-cyan-600 text-white',
  purple: 'from-purple-500 to-purple-600 text-white',
  emerald: 'from-emerald-500 to-emerald-600 text-white',
  amber: 'from-amber-500 to-amber-600 text-white',
  rose: 'from-rose-500 to-rose-600 text-white'
};

const COLOR_CLASSES_LIGHT = {
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200'
};

/**
 * Individual recommendation card
 */
function RecommendationCard({ tool, compact = false }) {
  const Icon = ICONS[tool.icon] || Search;
  const colorClass = COLOR_CLASSES[tool.color] || COLOR_CLASSES.primary;
  const lightColorClass = COLOR_CLASSES_LIGHT[tool.color] || COLOR_CLASSES_LIGHT.primary;

  if (compact) {
    return (
      <Link
        to={tool.path}
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-md ${lightColorClass}`}
      >
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{tool.name}</p>
          <p className="text-xs opacity-75 truncate">{tool.reason}</p>
        </div>
        <ChevronRight className="w-4 h-4 opacity-50" />
      </Link>
    );
  }

  return (
    <Link
      to={tool.path}
      className="group block bg-white rounded-xl border border-charcoal-100 p-4 hover:border-charcoal-200 hover:shadow-lg transition-all"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-charcoal-900 group-hover:text-primary-600 transition-colors">
            {tool.name}
          </h4>
          <p className="text-sm text-charcoal-500 mt-1">{tool.description}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-primary-600 font-medium">
            <Lightbulb className="w-3 h-3" />
            {tool.reason}
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-charcoal-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

/**
 * Recommendations panel for tool pages
 */
export function ToolPageRecommendations({ currentTool, contextData = {}, className = '' }) {
  const recommendations = getRecommendations(currentTool, contextData, 3);
  const tip = getContextualTip(currentTool, contextData);

  if (recommendations.length === 0 && !tip) return null;

  return (
    <div className={`bg-gradient-to-br from-charcoal-50 to-white rounded-2xl border border-charcoal-100 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-cyan-50 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-600" />
        </div>
        <h3 className="font-semibold text-charcoal-900">Recommended Next Steps</h3>
      </div>

      {/* Contextual Tip */}
      {tip && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">{tip.title}</p>
              <p className="text-sm text-amber-700 mt-1">{tip.message}</p>
              {tip.action && (
                <Link
                  to={tip.action.path}
                  className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-700 hover:text-amber-900"
                >
                  {tip.action.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-3">
        {recommendations.map((tool) => (
          <RecommendationCard key={tool.id} tool={tool} compact={true} />
        ))}
      </div>
    </div>
  );
}

/**
 * Home page recommendations widget
 */
export function HomeRecommendations({ activity = {}, className = '' }) {
  const recommendations = getHomeRecommendations(activity);

  if (recommendations.length === 0) return null;

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-cyan-50 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-600" />
          </div>
          <h3 className="font-semibold text-charcoal-900">Suggested for You</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((tool) => (
          <RecommendationCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}

/**
 * Inline recommendation banner
 */
export function RecommendationBanner({ tool, onDismiss }) {
  const Icon = ICONS[tool.icon] || Search;
  const colorClass = COLOR_CLASSES[tool.color] || COLOR_CLASSES.primary;

  return (
    <div className="bg-gradient-to-r from-charcoal-800 to-charcoal-900 rounded-xl p-4 text-white">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="font-medium">{tool.reason}</p>
          <p className="text-sm text-charcoal-300 mt-0.5">
            Try {tool.name} to continue optimizing
          </p>
        </div>
        <Link
          to={tool.path}
          className="px-4 py-2 bg-white text-charcoal-900 rounded-lg font-medium hover:bg-charcoal-100 transition-colors"
        >
          Open Tool
        </Link>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-charcoal-400 hover:text-white transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Quick actions grid for all tools
 */
export function QuickToolsGrid({ exclude = [], className = '' }) {
  const tools = Object.values(TOOLS).filter(t => !exclude.includes(t.id));

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
      {tools.map((tool) => {
        const Icon = ICONS[tool.icon] || Search;
        const colorClass = COLOR_CLASSES[tool.color] || COLOR_CLASSES.primary;

        return (
          <Link
            key={tool.id}
            to={tool.path}
            className="group flex flex-col items-center p-4 bg-white rounded-xl border border-charcoal-100 hover:border-charcoal-200 hover:shadow-lg transition-all text-center"
          >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
              <Icon className="w-7 h-7" />
            </div>
            <p className="font-medium text-charcoal-900 text-sm">{tool.name}</p>
          </Link>
        );
      })}
    </div>
  );
}

export default ToolPageRecommendations;
