# Accessibility Analyzer - Comprehensive Test Plan

## 1. Data Layer Tests

### 1.1 WCAG Criteria Data (`src/data/wcagCriteria.js`)
- [ ] All 87 WCAG 2.2 criteria are present (31 A + 25 AA + 31 AAA)
- [ ] Each criterion has required fields: id, name, level, guideline, principle
- [ ] Helper functions work correctly:
  - [ ] `getCriteriaByLevel('A')` returns 31 criteria
  - [ ] `getCriteriaByLevel('AA')` returns 25 criteria
  - [ ] `getCriteriaByLevel('AAA')` returns 31 criteria
  - [ ] `getCriteriaByPrinciple()` groups correctly by POUR
  - [ ] `getCriterionById()` returns correct criterion

### 1.2 Axe Rules Data (`src/data/axeRules.js`)
- [ ] All 93 Axe-core rules are present
- [ ] Each rule has: id, fileName, name, wcagCriteria, impact
- [ ] `getRuleByFileName()` correctly maps filenames
- [ ] `getRulesByImpact()` filters by impact level
- [ ] `getAIFixableRules()` returns rules with aiFixable=true

## 2. Parser Tests

### 2.1 Accessibility Parser (`src/lib/accessibility/accessibilityParser.js`)
- [ ] `parseAccessibilityAll()` correctly parses main accessibility file
- [ ] `parseViolationFile()` extracts violation details
- [ ] `parseViolationsSummary()` handles summary file
- [ ] Column mappings match Screaming Frog export format
- [ ] Numeric values are correctly parsed
- [ ] Error handling for malformed files

### 2.2 File Detection
- [ ] `detectAvailableAudits()` identifies accessibility files
- [ ] Returns correct counts for accessibility files

## 3. Audit Engine Tests

### 3.1 Core Engine (`src/lib/accessibility/accessibilityEngine.js`)
- [ ] `runAccessibilityAudit()` processes data correctly
- [ ] Compliance scores calculate correctly (0-100 range)
- [ ] Level breakdown (A/AA/AAA) scores accurate
- [ ] POUR principle scores calculated
- [ ] Impact breakdown counts violations correctly
- [ ] Top issues sorted by URL count descending
- [ ] Worst pages sorted by violations descending

### 3.2 Score Calculations
- [ ] Empty data returns 100% score (no violations)
- [ ] Partial violations return proportional scores
- [ ] Criteria status correctly determined

## 4. UI Component Tests

### 4.1 Upload Screen (`AccessibilityUploadScreen.jsx`)
- [ ] File dropzone accepts .zip files
- [ ] Invalid file types show error
- [ ] Checklist items toggle correctly
- [ ] Tutorial section expands/collapses
- [ ] Feature cards display correctly

### 4.2 Processing Screen (`AccessibilityProcessingScreen.jsx`)
- [ ] Progress bar updates smoothly
- [ ] Stage steps show correct states
- [ ] Completion state displays correctly

### 4.3 Dashboard (`AccessibilityDashboard.jsx`)
- [ ] Overview tab shows all score cards
- [ ] Tab navigation works correctly
- [ ] Violations tab filtering works
- [ ] Search filters violations
- [ ] Pages tab shows URL data
- [ ] WCAG Reference tab shows criteria status
- [ ] Export menu opens/closes
- [ ] All export buttons trigger downloads

### 4.4 Visual/Styling
- [ ] Purple gradient displays correctly
- [ ] Responsive on mobile screens
- [ ] Tab styling matches active state

## 5. Export Tests

### 5.1 PDF Export (`accessibilityExportService.js`)
- [ ] Cover page renders with score
- [ ] Executive summary included
- [ ] Violations table formatted
- [ ] WCAG matrix displays criteria
- [ ] Page numbers in footer

### 5.2 Excel Export
- [ ] Summary sheet has all data
- [ ] Violations sheet populated
- [ ] Pages sheet with URL data
- [ ] WCAG Criteria sheet complete
- [ ] Column widths reasonable

### 5.3 VPAT Export
- [ ] About sheet with product info
- [ ] WCAG 2.2 Report sheet structured
- [ ] Conformance levels correct
- [ ] Legal disclaimer included

## 6. AI Service Tests

### 6.1 Suggestion Service (`aiSuggestionService.js`)
- [ ] `isAIAvailable()` correctly checks config
- [ ] `getStaticFixSuggestion()` returns fallback data
- [ ] Static fix steps defined for common rules

## 7. Integration Tests

### 7.1 Routing
- [ ] `/accessibility` route accessible
- [ ] Protected route requires auth
- [ ] Tool card on home page links correctly

### 7.2 Tools Config
- [ ] Tool appears in tools list
- [ ] Badge shows "New"
- [ ] Purple color theme applied

## 8. Error Handling

- [ ] Missing accessibility_all.xlsx shows helpful error
- [ ] Parse errors display user-friendly messages
- [ ] Network errors during upload handled
- [ ] Empty data handled gracefully

## Test Execution Results

| Test Area | Pass | Fail | Notes |
|-----------|------|------|-------|
| Data Layer | | | |
| Parser | | | |
| Engine | | | |
| UI Components | | | |
| Exports | | | |
| AI Service | | | |
| Integration | | | |
| Error Handling | | | |

## Defects Found

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| | | | |
