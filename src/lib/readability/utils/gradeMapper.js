/**
 * Grade Mapper for AI Readability Checker
 * Maps numeric scores to letter grades
 */

const GRADE_MAP = [
  { min: 95, max: 100, grade: 'A+', color: 'emerald', label: 'Excellent' },
  { min: 90, max: 94, grade: 'A', color: 'emerald', label: 'Great' },
  { min: 85, max: 89, grade: 'B+', color: 'cyan', label: 'Very Good' },
  { min: 80, max: 84, grade: 'B', color: 'cyan', label: 'Good' },
  { min: 75, max: 79, grade: 'C+', color: 'amber', label: 'Above Average' },
  { min: 70, max: 74, grade: 'C', color: 'amber', label: 'Average' },
  { min: 60, max: 69, grade: 'D', color: 'orange', label: 'Below Average' },
  { min: 0, max: 59, grade: 'F', color: 'red', label: 'Poor' }
];

/**
 * Get grade info from score
 * @param {number} score - Score 0-100
 * @returns {{ grade: string, color: string, label: string }}
 */
export function getGrade(score) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const entry = GRADE_MAP.find(g => clamped >= g.min && clamped <= g.max);
  return entry || GRADE_MAP[GRADE_MAP.length - 1];
}

/**
 * Get color class based on score for Tailwind
 * @param {number} score
 * @returns {string} Tailwind color class prefix (e.g., 'emerald', 'teal')
 */
export function getScoreColor(score) {
  return getGrade(score).color;
}

/**
 * Get summary text based on grade
 * @param {string} grade
 * @returns {string}
 */
export function getGradeSummary(grade) {
  const summaries = {
    'A+': 'This content is exceptionally well-optimized for AI readability.',
    'A': 'This content is highly readable and well-structured for AI models.',
    'B+': 'This content is very good with minor improvements possible.',
    'B': 'This content is good but has room for improvement.',
    'C+': 'This content has several areas that could be improved for AI readability.',
    'C': 'This content needs moderate improvements for better AI comprehension.',
    'D': 'This content has significant issues affecting AI readability.',
    'F': 'This content requires major improvements for AI models to effectively understand it.'
  };
  return summaries[grade] || summaries['F'];
}

export { GRADE_MAP };
export default getGrade;
