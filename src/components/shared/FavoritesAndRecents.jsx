import { Link } from 'react-router-dom';
import {
  Star,
  Clock,
  ChevronRight,
  Trash2,
  FolderOpen,
  Search,
  ClipboardList,
  Accessibility,
  Image,
  Tags,
  Code2,
  ExternalLink
} from 'lucide-react';
import { useFavoritesAndRecents, ITEM_TYPES } from '../../hooks/useFavoritesAndRecents';
import { formatDistanceToNow } from 'date-fns';

// Icon mapping for different item types
const TYPE_ICONS = {
  [ITEM_TYPES.PROJECT]: ClipboardList,
  [ITEM_TYPES.TOOL]: Search,
  [ITEM_TYPES.AUDIT]: Search,
  [ITEM_TYPES.RESOURCE]: ExternalLink
};

// Tool icon mapping
const TOOL_ICONS = {
  planner: ClipboardList,
  audit: Search,
  accessibility: Accessibility,
  'image-alt': Image,
  'meta-generator': Tags,
  'schema-generator': Code2
};

function getIcon(item) {
  if (item.icon && TOOL_ICONS[item.icon]) {
    return TOOL_ICONS[item.icon];
  }
  return TYPE_ICONS[item.type] || FolderOpen;
}

function getTypeColor(type) {
  switch (type) {
    case ITEM_TYPES.PROJECT:
      return 'from-primary-100 to-primary-50 text-primary-600';
    case ITEM_TYPES.TOOL:
      return 'from-cyan-100 to-cyan-50 text-cyan-600';
    case ITEM_TYPES.AUDIT:
      return 'from-cyan-100 to-cyan-50 text-cyan-600';
    case ITEM_TYPES.RESOURCE:
      return 'from-purple-100 to-purple-50 text-purple-600';
    default:
      return 'from-charcoal-100 to-charcoal-50 text-charcoal-600';
  }
}

/**
 * Recent Items Section
 */
export function RecentItems({ limit = 5, showClear = true }) {
  const { recents, clearRecents, loading } = useFavoritesAndRecents();

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 bg-charcoal-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (recents.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
        <p className="text-charcoal-500 text-sm">No recent activity</p>
        <p className="text-charcoal-400 text-xs mt-1">Items you access will appear here</p>
      </div>
    );
  }

  const displayItems = recents.slice(0, limit);

  return (
    <div>
      {showClear && recents.length > 0 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={clearRecents}
            className="text-xs text-charcoal-500 hover:text-charcoal-700 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear all
          </button>
        </div>
      )}

      <div className="space-y-2">
        {displayItems.map((item) => {
          const Icon = getIcon(item);
          const colorClass = getTypeColor(item.type);

          return (
            <Link
              key={`${item.type}-${item.id}`}
              to={item.path}
              className="flex items-center gap-3 p-3 bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700 rounded-xl hover:border-charcoal-200 dark:hover:border-charcoal-600 hover:shadow-sm transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-charcoal-900 dark:text-white truncate">{item.name}</p>
                <p className="text-xs text-charcoal-500">
                  {formatDistanceToNow(new Date(item.accessedAt), { addSuffix: true })}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-charcoal-300 group-hover:text-charcoal-500 transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Favorites Section
 */
export function FavoriteItems({ limit, type }) {
  const { favorites, removeFromFavorites, loading, getFavoritesByType } = useFavoritesAndRecents();

  const displayItems = type ? getFavoritesByType(type) : favorites;
  const limitedItems = limit ? displayItems.slice(0, limit) : displayItems;

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-14 bg-charcoal-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (limitedItems.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
        <p className="text-charcoal-500 text-sm">No favorites yet</p>
        <p className="text-charcoal-400 text-xs mt-1">Star items to add them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {limitedItems.map((item) => {
        const Icon = getIcon(item);
        const colorClass = getTypeColor(item.type);

        return (
          <div
            key={`${item.type}-${item.id}`}
            className="flex items-center gap-3 p-3 bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700 rounded-xl hover:border-charcoal-200 dark:hover:border-charcoal-600 hover:shadow-sm transition-all group"
          >
            <Link to={item.path} className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-charcoal-900 dark:text-white truncate">{item.name}</p>
                <p className="text-xs text-charcoal-500 capitalize">{item.type}</p>
              </div>
            </Link>
            <button
              onClick={() => removeFromFavorites(item.id, item.type)}
              className="p-1.5 hover:bg-charcoal-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Remove from favorites"
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </button>
            <Link to={item.path}>
              <ChevronRight className="w-4 h-4 text-charcoal-300 group-hover:text-charcoal-500 transition-colors" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Favorite Toggle Button
 */
export function FavoriteButton({ item, size = 'md' }) {
  const { toggleFavorite, isFavorite } = useFavoritesAndRecents();
  const isFav = isFavorite(item.id, item.type);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(item);
      }}
      className={`p-1.5 rounded-lg transition-all ${
        isFav
          ? 'text-amber-500 hover:bg-amber-50'
          : 'text-charcoal-300 hover:text-amber-500 hover:bg-amber-50'
      }`}
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star className={`${sizeClasses[size]} ${isFav ? 'fill-amber-500' : ''}`} />
    </button>
  );
}

/**
 * Combined Favorites & Recents Widget
 */
export default function FavoritesAndRecentsWidget({ className = '' }) {
  const { favorites, recents, loading } = useFavoritesAndRecents();

  if (loading) {
    return (
      <div className={`bg-white dark:bg-charcoal-800 rounded-2xl border border-charcoal-100 dark:border-charcoal-700 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-charcoal-100 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-charcoal-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasContent = favorites.length > 0 || recents.length > 0;

  if (!hasContent) {
    return (
      <div className={`bg-white dark:bg-charcoal-800 rounded-2xl border border-charcoal-100 dark:border-charcoal-700 p-6 ${className}`}>
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-charcoal-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-charcoal-400" />
          </div>
          <p className="text-charcoal-600 font-medium">Your quick access hub</p>
          <p className="text-charcoal-400 text-sm mt-1">
            Favorites and recent items will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-charcoal-800 rounded-2xl border border-charcoal-100 dark:border-charcoal-700 overflow-hidden ${className}`}>
      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="p-6 border-b border-charcoal-100 dark:border-charcoal-700">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-charcoal-700 mb-4">
            <Star className="w-4 h-4 text-amber-500" />
            Favorites
          </h3>
          <FavoriteItems limit={5} />
        </div>
      )}

      {/* Recents Section */}
      {recents.length > 0 && (
        <div className="p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-charcoal-700 mb-4">
            <Clock className="w-4 h-4 text-charcoal-500" />
            Recent
          </h3>
          <RecentItems limit={5} showClear={true} />
        </div>
      )}
    </div>
  );
}
