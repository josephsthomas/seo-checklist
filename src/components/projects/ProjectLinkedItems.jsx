import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Link2,
  Unlink,
  Search,
  Accessibility,
  Image,
  Tags,
  Code2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MoreVertical
} from 'lucide-react';
import { useProjectLinkedItems, LINKED_ITEM_TYPES, ITEM_TYPE_INFO } from '../../hooks/useProjectLinkedItems';
import { formatDistanceToNow } from 'date-fns';

// Icon mapping
const ICONS = {
  Search,
  Accessibility,
  Image,
  Tags,
  Code2
};

// Path mapping for different item types
const ITEM_PATHS = {
  [LINKED_ITEM_TYPES.AUDIT]: (itemId) => `/audit/${itemId}`,
  [LINKED_ITEM_TYPES.ACCESSIBILITY]: () => '/accessibility',
  [LINKED_ITEM_TYPES.IMAGE_ALT]: () => '/image-alt',
  [LINKED_ITEM_TYPES.META_DATA]: () => '/meta-generator',
  [LINKED_ITEM_TYPES.SCHEMA]: () => '/schema-generator'
};

// Color classes for item types
const COLOR_CLASSES = {
  cyan: 'from-cyan-100 to-cyan-50 text-cyan-600 border-cyan-200',
  purple: 'from-purple-100 to-purple-50 text-purple-600 border-purple-200',
  emerald: 'from-emerald-100 to-emerald-50 text-emerald-600 border-emerald-200',
  amber: 'from-amber-100 to-amber-50 text-amber-600 border-amber-200',
  rose: 'from-rose-100 to-rose-50 text-rose-600 border-rose-200'
};

/**
 * Component to display linked items within a project
 */
export default function ProjectLinkedItems({ projectId, collapsible = true }) {
  const { linkedItems, loading, unlinkItem, stats } = useProjectLinkedItems(projectId);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-charcoal-100 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-charcoal-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (linkedItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-charcoal-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Link2 className="w-6 h-6 text-charcoal-400" />
          </div>
          <p className="text-charcoal-600 font-medium">No linked items</p>
          <p className="text-charcoal-400 text-sm mt-1">
            Link audits, accessibility reports, and other tool outputs to this project
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
      {/* Header */}
      <div
        className={`p-4 border-b border-charcoal-100 flex items-center justify-between ${collapsible ? 'cursor-pointer hover:bg-charcoal-50' : ''}`}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-cyan-50 rounded-lg flex items-center justify-center">
            <Link2 className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal-900">Linked Items</h3>
            <p className="text-xs text-charcoal-500">
              {stats.total} item{stats.total !== 1 ? 's' : ''} linked to this project
            </p>
          </div>
        </div>
        {collapsible && (
          <button className="p-1.5 hover:bg-charcoal-100 rounded-lg transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-charcoal-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-charcoal-400" />
            )}
          </button>
        )}
      </div>

      {/* Items */}
      {isExpanded && (
        <div className="p-4 space-y-2">
          {linkedItems.map((item) => {
            const typeInfo = ITEM_TYPE_INFO[item.itemType] || { label: 'Item', color: 'charcoal', icon: 'Link2' };
            const Icon = ICONS[typeInfo.icon] || Link2;
            const colorClass = COLOR_CLASSES[typeInfo.color] || 'from-charcoal-100 to-charcoal-50 text-charcoal-600';
            const itemPath = ITEM_PATHS[item.itemType]?.(item.itemId) || '/';

            return (
              <div
                key={item.linkId}
                className="group flex items-center gap-3 p-3 bg-charcoal-50 rounded-xl hover:bg-charcoal-100 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>

                <Link to={itemPath} className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal-900 truncate group-hover:text-primary-600 transition-colors">
                    {item.itemName || 'Untitled'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-charcoal-500">
                    <span>{typeInfo.label}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(item.linkedAt, { addSuffix: true })}
                    </span>
                    {item.itemUrl && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[150px]">{item.itemUrl}</span>
                      </>
                    )}
                  </div>
                </Link>

                {/* Actions */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === item.linkId ? null : item.linkId);
                    }}
                    className="p-1.5 hover:bg-charcoal-200 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <MoreVertical className="w-4 h-4 text-charcoal-500" />
                  </button>

                  {activeMenu === item.linkId && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setActiveMenu(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-charcoal-100 py-1 z-20">
                        <Link
                          to={itemPath}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                          onClick={() => setActiveMenu(null)}
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Details
                        </Link>
                        <button
                          onClick={() => {
                            unlinkItem(item.linkId);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Unlink className="w-4 h-4" />
                          Unlink
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Type Summary */}
      {isExpanded && stats.total > 2 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2 pt-3 border-t border-charcoal-100">
            {Object.entries(stats.byType).map(([type, count]) => {
              if (count === 0) return null;
              const typeInfo = ITEM_TYPE_INFO[type];
              return (
                <span
                  key={type}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-${typeInfo?.color}-100 text-${typeInfo?.color}-700`}
                >
                  {count} {typeInfo?.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact badge version for project cards
 */
export function LinkedItemsBadge({ projectId }) {
  const { stats, loading } = useProjectLinkedItems(projectId);

  if (loading || stats.total === 0) return null;

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
      <Link2 className="w-3 h-3" />
      {stats.total} linked
    </div>
  );
}
