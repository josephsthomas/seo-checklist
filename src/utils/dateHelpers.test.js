import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
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
} from './dateHelpers';

describe('dateHelpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      expect(formatDate('2024-06-15')).toBe('Jun 15, 2024');
    });

    it('should format Date object correctly', () => {
      expect(formatDate(new Date('2024-06-15'))).toBe('Jun 15, 2024');
    });

    it('should use custom format string', () => {
      expect(formatDate('2024-06-15', 'yyyy-MM-dd')).toBe('2024-06-15');
    });

    it('should return empty string for null/undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });

    it('should handle invalid date gracefully', () => {
      expect(formatDate('invalid-date')).toBe('');
    });
  });

  describe('formatDateForInput', () => {
    it('should format date for input field', () => {
      expect(formatDateForInput('2024-06-15')).toBe('2024-06-15');
    });

    it('should format Date object for input field', () => {
      expect(formatDateForInput(new Date('2024-06-15'))).toBe('2024-06-15');
    });

    it('should return empty string for null/undefined', () => {
      expect(formatDateForInput(null)).toBe('');
      expect(formatDateForInput(undefined)).toBe('');
    });
  });

  describe('getRelativeDate', () => {
    it('should return "Today" for today', () => {
      expect(getRelativeDate('2024-06-15')).toBe('Today');
    });

    it('should return "Tomorrow" for tomorrow', () => {
      expect(getRelativeDate('2024-06-16')).toBe('Tomorrow');
    });

    it('should return "Yesterday" for yesterday', () => {
      expect(getRelativeDate('2024-06-14')).toBe('Yesterday');
    });

    it('should return "In X days" for future dates within a week', () => {
      expect(getRelativeDate('2024-06-18')).toBe('In 3 days');
    });

    it('should return "X days ago" for past dates within a week', () => {
      expect(getRelativeDate('2024-06-12')).toBe('3 days ago');
    });

    it('should return formatted date for dates beyond a week', () => {
      expect(getRelativeDate('2024-07-01')).toBe('Jul 1, 2024');
    });

    it('should return empty string for null/undefined', () => {
      expect(getRelativeDate(null)).toBe('');
      expect(getRelativeDate(undefined)).toBe('');
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      expect(isOverdue('2024-06-10')).toBe(true);
    });

    it('should return false for today', () => {
      expect(isOverdue('2024-06-15')).toBe(false);
    });

    it('should return false for future dates', () => {
      expect(isOverdue('2024-06-20')).toBe(false);
    });

    it('should return false for completed items', () => {
      expect(isOverdue('2024-06-10', true)).toBe(false);
    });

    it('should return false for null/undefined date', () => {
      expect(isOverdue(null)).toBe(false);
      expect(isOverdue(undefined)).toBe(false);
    });
  });

  describe('isDueSoon', () => {
    it('should return true for dates within 3 days', () => {
      expect(isDueSoon('2024-06-15')).toBe(true); // Today
      expect(isDueSoon('2024-06-16')).toBe(true); // Tomorrow
      expect(isDueSoon('2024-06-18')).toBe(true); // In 3 days
    });

    it('should return false for dates beyond 3 days', () => {
      expect(isDueSoon('2024-06-20')).toBe(false);
    });

    it('should return false for past dates', () => {
      expect(isDueSoon('2024-06-10')).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isDueSoon(null)).toBe(false);
      expect(isDueSoon(undefined)).toBe(false);
    });
  });

  describe('getDueDateColor', () => {
    it('should return green for completed items', () => {
      expect(getDueDateColor('2024-06-10', true)).toBe('text-green-600');
    });

    it('should return red for overdue items', () => {
      expect(getDueDateColor('2024-06-10', false)).toBe('text-red-600');
    });

    it('should return orange for due soon items', () => {
      expect(getDueDateColor('2024-06-16', false)).toBe('text-orange-600');
    });

    it('should return blue for future items', () => {
      expect(getDueDateColor('2024-06-25', false)).toBe('text-blue-600');
    });

    it('should return charcoal for null date', () => {
      expect(getDueDateColor(null)).toBe('text-charcoal-400');
    });
  });

  describe('getDueDateBadgeColor', () => {
    it('should return green badge for completed items', () => {
      expect(getDueDateBadgeColor('2024-06-10', true)).toBe('bg-green-100 text-green-800');
    });

    it('should return red badge for overdue items', () => {
      expect(getDueDateBadgeColor('2024-06-10', false)).toBe('bg-red-100 text-red-800');
    });

    it('should return charcoal badge for null date', () => {
      expect(getDueDateBadgeColor(null)).toBe('bg-charcoal-100 text-charcoal-600');
    });
  });

  describe('filterByDateRange', () => {
    const items = [
      { id: 1, dueDate: '2024-06-15', completed: false }, // Today
      { id: 2, dueDate: '2024-06-10', completed: false }, // Overdue
      { id: 3, dueDate: '2024-06-16', completed: false }, // This week
      { id: 4, dueDate: '2024-06-20', completed: false }, // This week
      { id: 5, dueDate: null, completed: false },
      { id: 6, dueDate: '2024-06-10', completed: true } // Past but completed
    ];

    it('should return all items for "all" filter', () => {
      expect(filterByDateRange(items, 'dueDate', 'all')).toEqual(items);
    });

    it('should return all items when no filter provided', () => {
      expect(filterByDateRange(items, 'dueDate', null)).toEqual(items);
    });

    it('should filter for today', () => {
      const result = filterByDateRange(items, 'dueDate', 'today');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should filter for overdue', () => {
      const result = filterByDateRange(items, 'dueDate', 'overdue');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });
  });

  describe('calculateTimelineStats', () => {
    const items = [
      { id: 1, dueDate: '2024-06-15', completed: true },
      { id: 2, dueDate: '2024-06-10', completed: false },
      { id: 3, dueDate: '2024-06-20', completed: false },
      { id: 4, dueDate: null, completed: false }
    ];

    it('should calculate correct stats', () => {
      const stats = calculateTimelineStats(items);

      expect(stats.totalItems).toBe(4);
      expect(stats.itemsWithDates).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.overdue).toBe(1);
      expect(stats.completionRate).toBe(25);
    });

    it('should handle empty array', () => {
      const stats = calculateTimelineStats([]);

      expect(stats.totalItems).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.completionRate).toBe(0);
    });
  });

  describe('getTimelineFilters', () => {
    it('should return array of filter options', () => {
      const filters = getTimelineFilters();

      expect(Array.isArray(filters)).toBe(true);
      expect(filters.length).toBeGreaterThan(0);
      expect(filters[0]).toHaveProperty('value');
      expect(filters[0]).toHaveProperty('label');
      expect(filters[0]).toHaveProperty('icon');
    });
  });

  describe('sortByDate', () => {
    const items = [
      { id: 1, dueDate: '2024-06-20' },
      { id: 2, dueDate: '2024-06-10' },
      { id: 3, dueDate: null },
      { id: 4, dueDate: '2024-06-15' }
    ];

    it('should sort by date ascending', () => {
      const sorted = sortByDate(items, 'dueDate', 'asc');

      expect(sorted[0].id).toBe(2); // June 10
      expect(sorted[1].id).toBe(4); // June 15
      expect(sorted[2].id).toBe(1); // June 20
      expect(sorted[3].id).toBe(3); // null goes to end
    });

    it('should sort by date descending', () => {
      const sorted = sortByDate(items, 'dueDate', 'desc');

      expect(sorted[0].id).toBe(1); // June 20
      expect(sorted[1].id).toBe(4); // June 15
      expect(sorted[2].id).toBe(2); // June 10
      expect(sorted[3].id).toBe(3); // null goes to end
    });

    it('should not mutate original array', () => {
      const original = [...items];
      sortByDate(items, 'dueDate', 'asc');

      expect(items).toEqual(original);
    });
  });
});
