/**
 * Date Helper Utilities for Phase 9 Timeline Features
 * Provides date formatting, comparison, and timeline calculations
 */

import {
  format,
  parseISO,
  differenceInDays,
  addDays,
  isAfter,
  isBefore,
  isToday,
  isThisWeek,
  isThisMonth,
  isPast,
  isFuture,
  startOfWeek,
  endOfWeek
} from 'date-fns';

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string for input
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Get relative date text (e.g., "Today", "Tomorrow", "3 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative date text
 */
export const getRelativeDate = (date) => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    const days = differenceInDays(dateObj, today);

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days > 0 && days <= 7) return `In ${days} days`;
    if (days < 0 && days >= -7) return `${Math.abs(days)} days ago`;

    return formatDate(dateObj);
  } catch (error) {
    console.error('Error getting relative date:', error);
    return '';
  }
};

/**
 * Check if date is overdue
 * @param {string|Date} date - Due date
 * @param {boolean} completed - Whether item is completed
 * @returns {boolean} True if overdue
 */
export const isOverdue = (date, completed = false) => {
  if (!date || completed) return false;

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isPast(dateObj) && !isToday(dateObj);
  } catch (error) {
    console.error('Error checking if overdue:', error);
    return false;
  }
};

/**
 * Check if date is due soon (within 3 days)
 * @param {string|Date} date - Due date
 * @returns {boolean} True if due soon
 */
export const isDueSoon = (date) => {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    const days = differenceInDays(dateObj, today);
    return days >= 0 && days <= 3;
  } catch (error) {
    console.error('Error checking if due soon:', error);
    return false;
  }
};

/**
 * Get due date status color
 * @param {string|Date} date - Due date
 * @param {boolean} completed - Whether item is completed
 * @returns {string} Tailwind color class
 */
export const getDueDateColor = (date, completed = false) => {
  if (!date) return 'text-charcoal-400';
  if (completed) return 'text-green-600';

  if (isOverdue(date, completed)) return 'text-red-600';
  if (isDueSoon(date)) return 'text-orange-600';

  return 'text-blue-600';
};

/**
 * Get due date badge color
 * @param {string|Date} date - Due date
 * @param {boolean} completed - Whether item is completed
 * @returns {string} Tailwind bg/text color classes
 */
export const getDueDateBadgeColor = (date, completed = false) => {
  if (!date) return 'bg-charcoal-100 text-charcoal-600';
  if (completed) return 'bg-green-100 text-green-800';

  if (isOverdue(date, completed)) return 'bg-red-100 text-red-800';
  if (isDueSoon(date)) return 'bg-orange-100 text-orange-800';
  if (isToday(date)) return 'bg-yellow-100 text-yellow-800';

  return 'bg-blue-100 text-blue-800';
};

/**
 * Filter items by date range
 * @param {Array} items - Items to filter
 * @param {string} dateField - Field name containing date ('dueDate' or 'startDate')
 * @param {string} filter - Filter type ('today', 'thisWeek', 'thisMonth', 'overdue', 'upcoming')
 * @returns {Array} Filtered items
 */
export const filterByDateRange = (items, dateField = 'dueDate', filter) => {
  if (!filter || filter === 'all') return items;

  return items.filter(item => {
    const date = item[dateField];
    if (!date) return false;

    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;

      switch (filter) {
        case 'today':
          return isToday(dateObj);

        case 'thisWeek':
          return isThisWeek(dateObj, { weekStartsOn: 0 });

        case 'nextWeek': {
          const nextWeekStart = addDays(endOfWeek(new Date(), { weekStartsOn: 0 }), 1);
          const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 0 });
          return isAfter(dateObj, startOfWeek(new Date(), { weekStartsOn: 0 })) &&
                 isBefore(dateObj, nextWeekEnd);
        }

        case 'thisMonth':
          return isThisMonth(dateObj);

        case 'overdue':
          return isOverdue(date, item.completed);

        case 'upcoming': {
          const sevenDaysFromNow = addDays(new Date(), 7);
          return isFuture(dateObj) && isBefore(dateObj, sevenDaysFromNow);
        }

        default:
          return true;
      }
    } catch (error) {
      console.error('Error filtering by date:', error);
      return false;
    }
  });
};

/**
 * Calculate project timeline statistics
 * @param {Array} items - Project items with dates
 * @returns {Object} Timeline statistics
 */
export const calculateTimelineStats = (items) => {
  const itemsWithDates = items.filter(item => item.dueDate);

  const stats = {
    totalItems: items.length,
    itemsWithDates: itemsWithDates.length,
    completed: items.filter(item => item.completed).length,
    overdue: items.filter(item => isOverdue(item.dueDate, item.completed)).length,
    dueToday: items.filter(item => item.dueDate && isToday(parseISO(item.dueDate))).length,
    dueThisWeek: items.filter(item => item.dueDate && isThisWeek(parseISO(item.dueDate))).length,
    upcoming: items.filter(item => {
      if (!item.dueDate) return false;
      const date = parseISO(item.dueDate);
      const sevenDaysFromNow = addDays(new Date(), 7);
      return isFuture(date) && isBefore(date, sevenDaysFromNow);
    }).length
  };

  stats.completionRate = stats.totalItems > 0
    ? Math.round((stats.completed / stats.totalItems) * 100)
    : 0;

  return stats;
};

/**
 * Get timeline quick filters
 * @returns {Array} Timeline filter options
 */
export const getTimelineFilters = () => [
  { value: 'all', label: 'All Items', icon: 'Calendar' },
  { value: 'today', label: 'Due Today', icon: 'CalendarClock' },
  { value: 'thisWeek', label: 'This Week', icon: 'CalendarRange' },
  { value: 'nextWeek', label: 'Next Week', icon: 'CalendarDays' },
  { value: 'overdue', label: 'Overdue', icon: 'AlertCircle' },
  { value: 'upcoming', label: 'Next 7 Days', icon: 'TrendingUp' }
];

/**
 * Sort items by date
 * @param {Array} items - Items to sort
 * @param {string} dateField - Field to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted items
 */
export const sortByDate = (items, dateField = 'dueDate', direction = 'asc') => {
  return [...items].sort((a, b) => {
    const dateA = a[dateField];
    const dateB = b[dateField];

    // Items without dates go to the end
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    try {
      const dateObjA = typeof dateA === 'string' ? parseISO(dateA) : dateA;
      const dateObjB = typeof dateB === 'string' ? parseISO(dateB) : dateB;

      const comparison = dateObjA - dateObjB;
      return direction === 'asc' ? comparison : -comparison;
    } catch (error) {
      console.error('Error sorting by date:', error);
      return 0;
    }
  });
};

export default {
  formatDate,
  formatDateForInput,
  getRelativeDate,
  isOverdue,
  isDueSoon,
  getDueDateColor,
  getDueDateBadgeColor,
  filterByDateRange,
  calculateTimelineStats,
  getTimelineFilters,
  sortByDate
};
