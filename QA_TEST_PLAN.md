# QA Test Plan - SEO Checklist Application
## Phase 9: Agency Operations Features - Quality Assurance

**Document Version:** 1.0
**Date:** October 24, 2025
**QA Manager:** Claude
**Application:** SEO Checklist - Agency Operations Platform
**Test Scope:** Phase 9 Features + WCAG 2.1 AA Accessibility Compliance

---

## Executive Summary

This comprehensive test plan covers quality assurance for the SEO Checklist application with emphasis on Phase 9 agency operations features. The plan includes functional testing, accessibility compliance (WCAG 2.1 AA), security testing, performance validation, and cross-browser compatibility verification.

**Total Test Cases:** 187
**Priority Breakdown:**
- Critical (P0): 68 test cases
- High (P1): 82 test cases
- Medium (P2): 37 test cases

**Accessibility Standards:** WCAG 2.1 Level AA Compliance
**Security Standards:** OWASP Top 10
**Performance Targets:** < 3s page load, < 100ms interaction response

---

## Test Scope

### In Scope
- All Phase 9 features (Timeline, Filter Presets, PDF Export, Time Tracking, File Attachments)
- Core application features (Projects, Checklists, Assignments, Comments)
- WCAG 2.1 AA compliance across all pages and components
- Security validation (authentication, authorization, data protection)
- Performance benchmarks
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness

### Out of Scope
- Backend infrastructure testing (Firebase console)
- Third-party library unit tests
- Load testing with >100 concurrent users
- Penetration testing (requires separate security audit)

---

## Test Environment

**Application URL:** http://localhost:3000
**Browsers:**
- Chrome 118+ (Primary)
- Firefox 119+
- Safari 17+
- Edge 118+

**Devices:**
- Desktop: 1920x1080, 1366x768
- Tablet: iPad (1024x768)
- Mobile: iPhone 14 (390x844), Android (360x800)

**Screen Readers:**
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)

**Testing Tools:**
- axe DevTools (Accessibility)
- WAVE Browser Extension
- Lighthouse (Performance & Accessibility)
- Chrome DevTools (Performance, Network)
- Pa11y (Automated accessibility)

---

## Test Strategy

### 1. Functional Testing (Manual + Automated)
Test all features work as designed with positive and negative test cases

### 2. Accessibility Testing (WCAG 2.1 AA)
Validate compliance with all WCAG 2.1 Level A and AA success criteria

### 3. Security Testing
Verify authentication, authorization, and data protection mechanisms

### 4. Performance Testing
Measure and validate load times, response times, and resource usage

### 5. Compatibility Testing
Test across browsers, devices, and screen sizes

### 6. Integration Testing
Verify feature interactions and data flow between components

---

## Functional Test Cases

### 1. Authentication & User Management

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| AUTH-001 | User Registration | 1. Navigate to signup<br>2. Enter email/password<br>3. Submit form | User account created, redirected to dashboard | P0 | Pending |
| AUTH-002 | User Login | 1. Navigate to login<br>2. Enter valid credentials<br>3. Submit | User authenticated, redirected to projects | P0 | Pending |
| AUTH-003 | Invalid Login | 1. Enter invalid credentials<br>2. Submit | Error message displayed, not authenticated | P1 | Pending |
| AUTH-004 | Password Reset | 1. Click "Forgot Password"<br>2. Enter email<br>3. Check inbox | Reset email sent, link works | P1 | Pending |
| AUTH-005 | Logout | 1. Click logout button | User logged out, redirected to login | P0 | Pending |
| AUTH-006 | Session Persistence | 1. Login<br>2. Close browser<br>3. Reopen app | User remains logged in | P1 | Pending |
| AUTH-007 | Protected Routes | 1. Logout<br>2. Try accessing /projects directly | Redirected to login page | P0 | Pending |
| AUTH-008 | Email Verification | 1. Register new account<br>2. Check email | Verification email received, link works | P2 | Pending |

### 2. Project Management

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| PROJ-001 | Create Project | 1. Click "New Project"<br>2. Enter name<br>3. Save | Project created, appears in list | P0 | Pending |
| PROJ-002 | Edit Project | 1. Open project<br>2. Click edit<br>3. Change name<br>4. Save | Changes saved and displayed | P1 | Pending |
| PROJ-003 | Delete Project | 1. Select project<br>2. Click delete<br>3. Confirm | Project removed from list | P1 | Pending |
| PROJ-004 | Project Validation | 1. Try creating project with empty name | Error message, project not created | P1 | Pending |
| PROJ-005 | Project List View | 1. Create 5+ projects<br>2. View list | All projects displayed with details | P1 | Pending |
| PROJ-006 | Project Selection | 1. Click project card | Project opens, checklist loads | P0 | Pending |
| PROJ-007 | Project Search | 1. Use search bar<br>2. Enter project name | Matching projects filtered | P2 | Pending |

### 3. Checklist Management

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| CHECK-001 | Load Checklist | 1. Open project | All 353 items loaded and displayed | P0 | Pending |
| CHECK-002 | Complete Item | 1. Click checkbox on item | Item marked complete, green checkmark | P0 | Pending |
| CHECK-003 | Uncomplete Item | 1. Click completed checkbox | Item marked incomplete | P0 | Pending |
| CHECK-004 | View Item Details | 1. Click item text | Modal opens with full details | P0 | Pending |
| CHECK-005 | Category Filter | 1. Select category filter | Only items from that category shown | P1 | Pending |
| CHECK-006 | Priority Filter | 1. Select priority filter | Only high priority items shown | P1 | Pending |
| CHECK-007 | Completion Filter | 1. Toggle "Show Completed" | Completed items show/hide | P1 | Pending |
| CHECK-008 | Search Items | 1. Enter search term | Matching items displayed | P1 | Pending |
| CHECK-009 | Progress Calculation | 1. Complete 10 items<br>2. Check progress bar | Shows 10/353 = 2.8% | P1 | Pending |
| CHECK-010 | Persistent State | 1. Complete items<br>2. Refresh page | Completions persist | P0 | Pending |

### 4. Phase 9A - Timeline & Deadline Fields

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| TIME-001 | Set Due Date | 1. Open item<br>2. Click due date picker<br>3. Select date | Date saved and displayed | P0 | Pending |
| TIME-002 | Set Start Date | 1. Open item<br>2. Click start date picker<br>3. Select date | Date saved and displayed | P0 | Pending |
| TIME-003 | Date Validation | 1. Set start date > due date | Error/warning shown | P1 | Pending |
| TIME-004 | Clear Dates | 1. Set dates<br>2. Click clear button | Dates removed | P1 | Pending |
| TIME-005 | Overdue Indicator | 1. Set due date in past<br>2. View checklist | Item shows red/overdue indicator | P0 | Pending |
| TIME-006 | Due Soon Indicator | 1. Set due date 2 days away<br>2. View checklist | Item shows yellow/warning indicator | P1 | Pending |
| TIME-007 | Date Filtering | 1. Use "Due This Week" filter | Only items due this week shown | P1 | Pending |
| TIME-008 | Estimated Hours | 1. Enter estimated hours<br>2. Save | Hours saved and displayed | P1 | Pending |
| TIME-009 | Completed Date Auto | 1. Complete item with due date | Completed date auto-populated | P1 | Pending |
| TIME-010 | Timeline Notes | 1. Add notes to timeline<br>2. Save | Notes saved and displayed | P2 | Pending |
| TIME-011 | Date Format | 1. View dates across app | Consistent format (MMM d, yyyy) | P2 | Pending |
| TIME-012 | Timezone Handling | 1. Set dates<br>2. Check stored value | Dates stored correctly in UTC | P1 | Pending |

### 5. Phase 9B - Filter Preset Manager

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| FILT-001 | Save Filter Preset | 1. Apply filters<br>2. Click "Save Preset"<br>3. Name it<br>4. Save | Preset saved to list | P0 | Pending |
| FILT-002 | Load Filter Preset | 1. Click saved preset | Filters applied, items filtered | P0 | Pending |
| FILT-003 | Edit Preset | 1. Click edit on preset<br>2. Modify settings<br>3. Save | Changes saved | P1 | Pending |
| FILT-004 | Delete Preset | 1. Click delete on preset<br>2. Confirm | Preset removed from list | P1 | Pending |
| FILT-005 | Preset Templates | 1. View template list | 5 built-in templates available | P1 | Pending |
| FILT-006 | Export Presets | 1. Click "Export"<br>2. Save JSON | JSON file downloaded with presets | P2 | Pending |
| FILT-007 | Import Presets | 1. Click "Import"<br>2. Select JSON file | Presets imported and displayed | P2 | Pending |
| FILT-008 | Preset Validation | 1. Try saving preset without name | Error shown, preset not saved | P1 | Pending |
| FILT-009 | Preset Persistence | 1. Save preset<br>2. Refresh page | Preset still available | P0 | Pending |
| FILT-010 | Active Preset Indicator | 1. Load preset | UI shows which preset is active | P2 | Pending |

### 6. Phase 9C - PDF Export

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| PDF-001 | Open Export Modal | 1. Click "Export PDF" | Modal opens with options | P0 | Pending |
| PDF-002 | Executive Summary Export | 1. Select "Executive Summary"<br>2. Click Generate | 2-3 page PDF downloaded | P0 | Pending |
| PDF-003 | Detailed Report Export | 1. Select "Detailed Report"<br>2. Click Generate | 10+ page PDF downloaded | P0 | Pending |
| PDF-004 | Project Name in PDF | 1. Enter project name<br>2. Generate PDF | Name appears in PDF header | P1 | Pending |
| PDF-005 | Client Name in PDF | 1. Enter client name<br>2. Generate PDF | Name appears in PDF | P1 | Pending |
| PDF-006 | Brand Color | 1. Select brand color<br>2. Generate PDF | Color used in PDF theme | P2 | Pending |
| PDF-007 | Include Completed Toggle | 1. Uncheck "Include Completed"<br>2. Generate | Only incomplete items in PDF | P1 | Pending |
| PDF-008 | PDF Charts | 1. Generate detailed report | Charts render correctly | P1 | Pending |
| PDF-009 | PDF Tables | 1. Generate detailed report | Tables formatted correctly | P1 | Pending |
| PDF-010 | PDF File Naming | 1. Generate PDF | Filename includes project name and date | P2 | Pending |
| PDF-011 | Large Dataset PDF | 1. Complete 200 items<br>2. Generate detailed report | PDF generates without errors | P1 | Pending |
| PDF-012 | PDF Metadata | 1. Generate PDF<br>2. Check properties | Title, author, date set correctly | P2 | Pending |

### 7. Phase 9D - Time Tracking

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| TRACK-001 | Start Timer | 1. Open item<br>2. Go to Time tab<br>3. Click Start | Timer starts counting | P0 | Pending |
| TRACK-002 | Stop Timer | 1. Start timer<br>2. Wait 30s<br>3. Click Stop | Time entry created (0.01 hrs) | P0 | Pending |
| TRACK-003 | Timer Display | 1. Start timer<br>2. Observe | Shows HH:MM:SS format, updates every second | P1 | Pending |
| TRACK-004 | Only One Active Timer | 1. Start timer on item A<br>2. Try starting on item B | Warning or auto-stop previous timer | P0 | Pending |
| TRACK-005 | Manual Time Entry | 1. Click "Add Manual Entry"<br>2. Enter hours<br>3. Add description<br>4. Save | Entry created and listed | P0 | Pending |
| TRACK-006 | Delete Time Entry | 1. Click delete on entry<br>2. Confirm | Entry removed from list | P1 | Pending |
| TRACK-007 | Total Time Calculation | 1. Add multiple entries<br>2. Check total | Sum displayed correctly | P1 | Pending |
| TRACK-008 | Time vs Estimate | 1. Set estimated hours<br>2. Log time<br>3. Check variance | Shows over/under budget indicator | P1 | Pending |
| TRACK-009 | Time Entry Validation | 1. Try entering negative hours | Error shown, entry not saved | P1 | Pending |
| TRACK-010 | Time Entry Description | 1. Add entry with notes | Notes saved and displayed | P2 | Pending |
| TRACK-011 | Time Persistence | 1. Log time<br>2. Close item<br>3. Reopen | Time entries persist | P0 | Pending |
| TRACK-012 | Timer Persistence | 1. Start timer<br>2. Refresh page | Timer continues running | P1 | Pending |
| TRACK-013 | Project Total Time | 1. Log time on multiple items<br>2. View project stats | Project total time calculated | P1 | Pending |
| TRACK-014 | Time Format Display | 1. Log various durations<br>2. View list | Consistent format (e.g., "2.5 hrs") | P2 | Pending |

### 8. Phase 9E - File Attachments

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| FILE-001 | Upload Image (Drag) | 1. Open Files tab<br>2. Drag image to drop zone | File uploads, progress shown, appears in list | P0 | Pending |
| FILE-002 | Upload Image (Click) | 1. Click upload area<br>2. Select image | File uploads successfully | P0 | Pending |
| FILE-003 | Upload PDF | 1. Upload PDF file | File uploads, PDF icon shown | P0 | Pending |
| FILE-004 | Upload Document | 1. Upload .docx file | File uploads, doc icon shown | P1 | Pending |
| FILE-005 | File Size Validation | 1. Try uploading 11MB file | Error: file too large (10MB max) | P0 | Pending |
| FILE-006 | File Type Validation | 1. Try uploading .exe file | Error: file type not allowed | P0 | Pending |
| FILE-007 | Upload Progress Bar | 1. Upload large file<br>2. Watch progress | Progress bar updates 0-100% | P1 | Pending |
| FILE-008 | Multiple Files | 1. Upload 5 files to same item | All files listed separately | P1 | Pending |
| FILE-009 | Download File | 1. Click download button | File downloads to browser | P0 | Pending |
| FILE-010 | Delete File | 1. Click delete<br>2. Confirm | File removed from list and storage | P1 | Pending |
| FILE-011 | File Preview | 1. Upload image<br>2. View list | Thumbnail/icon shown | P2 | Pending |
| FILE-012 | File Size Display | 1. Upload files<br>2. View list | Size shown in appropriate units (KB/MB) | P2 | Pending |
| FILE-013 | File Metadata | 1. Upload file<br>2. View details | Shows uploader, date, size | P1 | Pending |
| FILE-014 | File Persistence | 1. Upload file<br>2. Refresh<br>3. Reopen item | File still listed | P0 | Pending |
| FILE-015 | Upload Error Handling | 1. Disable network<br>2. Try upload | Error message shown | P1 | Pending |
| FILE-016 | Storage Security | 1. Upload file<br>2. Try accessing URL directly without auth | Access denied (requires authentication) | P0 | Pending |

### 9. Task Assignments

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| ASSIGN-001 | Assign Task | 1. Open item<br>2. Assign to user | User assigned, notification sent | P0 | Pending |
| ASSIGN-002 | Unassign Task | 1. Remove user from assignment | User removed | P1 | Pending |
| ASSIGN-003 | Multiple Assignees | 1. Assign task to 3 users | All users listed | P1 | Pending |
| ASSIGN-004 | Assignment Filter | 1. Filter "Assigned to Me" | Only my tasks shown | P1 | Pending |

### 10. Comments

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| COMM-001 | Add Comment | 1. Go to Comments tab<br>2. Type comment<br>3. Post | Comment appears in thread | P1 | Pending |
| COMM-002 | Edit Comment | 1. Click edit<br>2. Modify text<br>3. Save | Comment updated | P2 | Pending |
| COMM-003 | Delete Comment | 1. Click delete<br>2. Confirm | Comment removed | P2 | Pending |
| COMM-004 | Comment Timestamps | 1. Add comment<br>2. View | Shows relative time (e.g., "2 minutes ago") | P2 | Pending |

### 11. Activity Log

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| ACT-001 | View Activity | 1. Open Activity tab | All actions logged chronologically | P1 | Pending |
| ACT-002 | Activity Types | 1. Complete item<br>2. Assign<br>3. Comment<br>4. Check log | All activity types recorded | P1 | Pending |

### 12. Help System

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| HELP-001 | Open Help | 1. Click help button | Help modal opens | P2 | Pending |
| HELP-002 | Search Help | 1. Use help search | Relevant results shown | P2 | Pending |
| HELP-003 | Help Navigation | 1. Click through sections | All sections accessible | P2 | Pending |

### 13. Excel Export

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| EXCEL-001 | Export to Excel | 1. Click Excel export | .xlsx file downloads | P1 | Pending |
| EXCEL-002 | Excel Data Integrity | 1. Export<br>2. Open in Excel | All data present and formatted | P1 | Pending |

---

## WCAG 2.1 Level AA Accessibility Test Cases

### Principle 1: Perceivable

#### 1.1 Text Alternatives

| Test ID | Test Case | Steps | Expected Result | WCAG Criterion | Priority | Status |
|---------|-----------|-------|-----------------|----------------|----------|--------|
| A11Y-001 | Images Have Alt Text | 1. Use screen reader<br>2. Navigate to all images | All images have meaningful alt text | 1.1.1 (A) | P0 | Pending |
| A11Y-002 | Icon Buttons Labeled | 1. Use screen reader<br>2. Navigate buttons | All icon buttons have accessible names | 1.1.1 (A) | P0 | Pending |
| A11Y-003 | Form Input Labels | 1. Use screen reader<br>2. Navigate forms | All inputs have associated labels | 1.1.1 (A) | P0 | Pending |

#### 1.2 Time-based Media

| Test ID | Test Case | Steps | Expected Result | WCAG Criterion | Priority | Status |
|---------|-----------|-------|-----------------|----------------|----------|--------|
| A11Y-004 | No Audio/Video | N/A - No multimedia content | N/A | 1.2.1 (A) | N/A | N/A |

#### 1.3 Adaptable

| Test ID | Test Case | Steps | Expected Result | WCAG Criterion | Priority | Status |
|---------|-----------|-------|-----------------|----------------|----------|--------|
| A11Y-005 | Semantic HTML | 1. Inspect DOM<br>2. Check semantic elements | Proper use of header, nav, main, article, section | 1.3.1 (A) | P0 | Pending |
| A11Y-006 | Heading Hierarchy | 1. Use screen reader<br>2. Navigate by headings | Logical heading structure (h1 > h2 > h3) | 1.3.1 (A) | P0 | Pending |
| A11Y-007 | Reading Order | 1. Tab through page<br>2. Use screen reader | Content follows logical reading order | 1.3.2 (A) | P0 | Pending |
| A11Y-008 | Instructions Not Sensory | 1. Review all instructions | Instructions don't rely solely on shape/color/location | 1.3.3 (A) | P1 | Pending |
| A11Y-009 | Orientation Freedom | 1. Rotate device to portrait<br>2. Rotate to landscape | Content works in both orientations | 1.3.4 (AA) | P1 | Pending |
| A11Y-010 | Input Purpose | 1. Inspect autocomplete attributes | Form inputs have autocomplete attributes where appropriate | 1.3.5 (AA) | P1 | Pending |

#### 1.4 Distinguishable

| Test ID | Test Case | Steps | Expected Result | WCAG Criterion | Priority | Status |
|---------|-----------|-------|-----------------|----------------|----------|--------|
| A11Y-011 | Color Not Sole Indicator | 1. View in grayscale<br>2. Check info conveyance | Information not conveyed by color alone | 1.4.1 (A) | P0 | Pending |
| A11Y-012 | Audio Control | N/A - No auto-playing audio | N/A | 1.4.2 (A) | N/A | N/A |
| A11Y-013 | Contrast Ratio - Text | 1. Use contrast checker<br>2. Test all text | Normal text: 4.5:1 minimum<br>Large text: 3:1 minimum | 1.4.3 (AA) | P0 | Pending |
| A11Y-014 | Text Resize to 200% | 1. Zoom browser to 200%<br>2. Test all pages | Content readable, no horizontal scroll, no overlapping | 1.4.4 (AA) | P0 | Pending |
| A11Y-015 | Images of Text | 1. Review all text content | No images of text (except logos) | 1.4.5 (AA) | P1 | Pending |
| A11Y-016 | Reflow at 320px | 1. Set viewport to 320px width<br>2. Navigate pages | No horizontal scrolling, content reflows | 1.4.10 (AA) | P0 | Pending |
| A11Y-017 | Non-Text Contrast | 1. Check UI components<br>2. Check graphics | 3:1 contrast for UI controls and meaningful graphics | 1.4.11 (AA) | P0 | Pending |
| A11Y-018 | Text Spacing | 1. Apply CSS:<br>line-height: 1.5<br>paragraph spacing: 2x font-size<br>letter-spacing: 0.12x font-size<br>word-spacing: 0.16x font-size | Content readable, no loss of functionality | 1.4.12 (AA) | P1 | Pending |
| A11Y-019 | Content on Hover/Focus | 1. Hover over tooltips<br>2. Tab to elements | Hover content is dismissible, hoverable, and persistent | 1.4.13 (AA) | P1 | Pending |

### Principle 2: Operable

#### 2.1 Keyboard Accessible

| Test ID | Test Case | Steps | Expected Result | WCAG Criterion | Priority | Status |
|---------|-----------|-------|-----------------|----------------|----------|--------|
| A11Y-020 | Keyboard Navigation | 1. Use only keyboard<br>2. Navigate entire app | All functionality accessible via keyboard | 2.1.1 (A) | P0 | Pending |
| A11Y-021 | No Keyboard Trap | 1. Tab through all elements | Can move away from all elements using keyboard | 2.1.2 (A) | P0 | Pending |
| A11Y-022 | Keyboard Shortcuts | 1. Check for character key shortcuts | Single-key shortcuts can be turned off or remapped | 2.1.4 (A) | P1 | Pending |

#### 2.2 Enough Time

| Test ID | Test Case | Steps | Expected Result | WCAG Criterion | Priority | Status |
|---------|-----------|-------|-----------------|----------------|----------|--------|
| A11Y-023 | No Time Limits | 1. Review all functionality | No time limits (or adjustable/extendable) | 2.2.1 (A) | P1 | Pending |
| A11Y-024 | Pause, Stop, Hide | 1. Check for auto-updating content | No auto-updating content (or controls provided) | 2.2.2 (A) | P1 | Pending |

#### 2.3 Seizures and Physical Reactions

| Test ID | Test Case | Steps | Expected Result | WCAG Criterion | Priority | Status |
|---------|-----------|-------|-----------------|----------------|----------|--------|
| A11Y-025 | No Flashing Content | 1. Review all animations | Nothing flashes more than 3 times per second | 2.3.1 (A) | P0 | Pending |

#### 2.4 Navigable

| Test ID | Test Case | Steps | Expected Result | WCAG Criterion | Priority | Status |
|---------|-----------|-------|-----------------|----------------|----------|--------|
| A11Y-026 | Skip to Main Content | 1. Tab on page load<br>2. Check first focusable element | Skip link available and functional | 2.4.1 (A) | P0 | Pending |
| A11Y-027 | Page Titles | 1. Navigate pages<br>2. Check browser tab | Each page has descriptive title | 2.4.2 (A) | P0 | Pending |
| A11Y-028 | Focus Order | 1. Tab through page | Focus order is logical and preserves meaning | 2.4.3 (A) | P0 | Pending |
| A11Y-029 | Link Purpose | 1. Use screen reader<br>2. Navigate links | Link purpose clear from text (or context) | 2.4.4 (A) | P0 | Pending |
| A11Y-030 | Multiple Ways to Navigate | 1. Check navigation options | Multiple ways to find pages (menu, search, etc.) | 2.4.5 (AA) | P1 | Pending |
| A11Y-031 | Headings and Labels | 1. Review all headings/labels | Headings and labels describe topic/purpose | 2.4.6 (AA) | P1 | Pending |
| A11Y-032 | Focus Visible | 1. Tab through page<br>2. Observe focus indicators | Keyboard focus indicator always visible | 2.4.7 (AA) | P0 | Pending |

#### 2.5 Input Modalities

| Test ID | Test Case | Steps | Expected Result | WCAG Criterion | Priority | Status |
|---------|-----------|-------|-----------------|----------------|----------|--------|
| A11Y-033 | Pointer Gestures | 1. Test all interactions | No complex gestures required (or alternative) | 2.5.1 (A) | P1 | Pending |
| A11Y-034 | Pointer Cancellation | 1. Click elements<br>2. Test down/up events | Can cancel pointer activation | 2.5.2 (A) | P1 | Pending |
| A11Y-035 | Label in Name | 1. Review form controls | Accessible name matches visible label | 2.5.3 (A) | P0 | Pending |
| A11Y-036 | Motion Actuation | 1. Check for motion controls | No device motion required (or alternative) | 2.5.4 (A) | P1 | Pending |
| A11Y-037 | Target Size | 1. Measure clickable areas<br>2. Test on mobile | Touch targets at least 44x44 CSS pixels | 2.5.5 (AAA)* | P1 | Pending |

*Note: 2.5.5 is AAA but included as best practice

### Principle 3: Understandable

#### 3.1 Readable

| Test ID | Test Case | Steps | Expected Result | WCAG Criterion | Priority | Status |
|---------|-----------|-------|-----------------|----------------|----------|--------|
| A11Y-038 | Page Language | 1. Inspect html element | lang attribute set correctly | 3.1.1 (A) | P0 | Pending |
| A11Y-039 | Language Changes | 1. Check for foreign words | Language changes marked with lang attribute | 3.1.2 (AA) | P2 | Pending |

#### 3.2 Predictable

| Test ID | Test Case | Steps | Expected Result | WCAG Criterion | Priority | Status |
|---------|-----------|-------|-----------------|----------------|----------|--------|
| A11Y-040 | Focus Doesn't Trigger Change | 1. Tab through page | Receiving focus doesn't cause unexpected changes | 3.2.1 (A) | P0 | Pending |
| A11Y-041 | Input Doesn't Trigger Change | 1. Fill out forms | Changing input doesn't cause unexpected changes | 3.2.2 (A) | P0 | Pending |
| A11Y-042 | Consistent Navigation | 1. Navigate multiple pages | Navigation in same order on all pages | 3.2.3 (AA) | P1 | Pending |
| A11Y-043 | Consistent Identification | 1. Review UI across pages | Same icons/buttons have same labels throughout | 3.2.4 (AA) | P1 | Pending |

#### 3.3 Input Assistance

| Test ID | Test Case | Steps | Expected Result | WCAG Criterion | Priority | Status |
|---------|-----------|-------|-----------------|----------------|----------|--------|
| A11Y-044 | Error Identification | 1. Submit invalid form<br>2. Check error | Errors identified and described in text | 3.3.1 (A) | P0 | Pending |
| A11Y-045 | Labels or Instructions | 1. Review all forms | Labels/instructions provided for user input | 3.3.2 (A) | P0 | Pending |
| A11Y-046 | Error Suggestions | 1. Trigger validation errors | Suggestions provided when errors detected | 3.3.3 (AA) | P1 | Pending |
| A11Y-047 | Error Prevention (Legal/Financial) | 1. Review submission processes | Can review/correct before final submission | 3.3.4 (AA) | P1 | Pending |

### Principle 4: Robust

#### 4.1 Compatible

| Test ID | Test Case | Steps | Expected Result | WCAG Criterion | Priority | Status |
|---------|-----------|-------|-----------------|----------------|----------|--------|
| A11Y-048 | Valid HTML | 1. Run HTML validator | No parsing errors that affect assistive tech | 4.1.1 (A) | P1 | Pending |
| A11Y-049 | Name, Role, Value | 1. Use screen reader<br>2. Test all controls | All UI components have correct name, role, value | 4.1.2 (A) | P0 | Pending |
| A11Y-050 | Status Messages | 1. Trigger notifications/alerts<br>2. Use screen reader | Status messages announced without focus change | 4.1.3 (AA) | P1 | Pending |

---

## Security Test Cases

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| SEC-001 | SQL Injection Protection | 1. Enter SQL in form fields | Input sanitized, no execution | P0 | Pending |
| SEC-002 | XSS Protection | 1. Enter script tags in inputs | Scripts not executed | P0 | Pending |
| SEC-003 | CSRF Protection | 1. Attempt cross-site request | Request rejected | P0 | Pending |
| SEC-004 | Password Strength | 1. Try weak password | Minimum requirements enforced | P1 | Pending |
| SEC-005 | File Upload Security | 1. Upload malicious file | File type validated, malicious content blocked | P0 | Pending |
| SEC-006 | Authentication Required | 1. Try accessing API without auth | 401 Unauthorized returned | P0 | Pending |
| SEC-007 | Authorization Checks | 1. Try accessing other user's data | 403 Forbidden returned | P0 | Pending |
| SEC-008 | Secure Storage Rules | 1. Try direct Firebase Storage access | Rules enforced, unauthorized access denied | P0 | Pending |
| SEC-009 | Data Encryption | 1. Check network traffic | Sensitive data encrypted in transit (HTTPS) | P0 | Pending |
| SEC-010 | Session Timeout | 1. Leave session idle for extended period | Session expires, re-auth required | P1 | Pending |

---

## Performance Test Cases

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| PERF-001 | Initial Page Load | 1. Clear cache<br>2. Load homepage<br>3. Measure | < 3 seconds (Lighthouse score > 90) | P0 | Pending |
| PERF-002 | Project List Load | 1. Load 20 projects<br>2. Measure render time | < 1 second | P1 | Pending |
| PERF-003 | Checklist Load (353 items) | 1. Open project<br>2. Measure checklist render | < 2 seconds | P0 | Pending |
| PERF-004 | Search Performance | 1. Enter search term<br>2. Measure response | Results appear < 500ms | P1 | Pending |
| PERF-005 | Filter Performance | 1. Apply complex filters<br>2. Measure update | Results update < 300ms | P1 | Pending |
| PERF-006 | Real-time Updates | 1. Make change in one tab<br>2. Observe other tab | Updates appear < 1 second | P1 | Pending |
| PERF-007 | File Upload Speed | 1. Upload 5MB file<br>2. Measure time | Uploads at reasonable speed (depends on connection) | P2 | Pending |
| PERF-008 | PDF Generation | 1. Generate detailed PDF<br>2. Measure time | < 5 seconds | P1 | Pending |
| PERF-009 | Memory Usage | 1. Use app for 30 minutes<br>2. Check DevTools memory | No memory leaks, stable usage | P1 | Pending |
| PERF-010 | Bundle Size | 1. Check build output<br>2. Measure JS bundle | < 1MB (gzipped) | P2 | Pending |

---

## Cross-Browser Compatibility Test Cases

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| COMPAT-001 | Chrome Functionality | 1. Test all features in Chrome | Everything works | P0 | Pending |
| COMPAT-002 | Firefox Functionality | 1. Test all features in Firefox | Everything works | P0 | Pending |
| COMPAT-003 | Safari Functionality | 1. Test all features in Safari | Everything works | P0 | Pending |
| COMPAT-004 | Edge Functionality | 1. Test all features in Edge | Everything works | P1 | Pending |
| COMPAT-005 | Chrome Visual Consistency | 1. Review all pages in Chrome | UI renders correctly | P1 | Pending |
| COMPAT-006 | Firefox Visual Consistency | 1. Review all pages in Firefox | UI renders correctly | P1 | Pending |
| COMPAT-007 | Safari Visual Consistency | 1. Review all pages in Safari | UI renders correctly | P1 | Pending |
| COMPAT-008 | Edge Visual Consistency | 1. Review all pages in Edge | UI renders correctly | P1 | Pending |

---

## Responsive Design Test Cases

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| RESP-001 | Desktop Layout (1920x1080) | 1. View at 1920x1080 | Optimal layout, no wasted space | P0 | Pending |
| RESP-002 | Laptop Layout (1366x768) | 1. View at 1366x768 | Layout adapts, all content visible | P0 | Pending |
| RESP-003 | Tablet Portrait (768x1024) | 1. View at 768x1024 | Mobile menu, touch-friendly targets | P0 | Pending |
| RESP-004 | Tablet Landscape (1024x768) | 1. View at 1024x768 | Appropriate layout for landscape | P1 | Pending |
| RESP-005 | Mobile Portrait (390x844) | 1. View at 390x844 | Single column, no horizontal scroll | P0 | Pending |
| RESP-006 | Mobile Landscape (844x390) | 1. View at 844x390 | Layout adapts for landscape | P1 | Pending |
| RESP-007 | Small Mobile (360x640) | 1. View at 360x640 | Minimum supported size, readable | P0 | Pending |
| RESP-008 | Touch Interactions (Mobile) | 1. Use on touch device<br>2. Test all interactions | All buttons/controls easily tappable | P0 | Pending |

---

## Integration Test Cases

| Test ID | Test Case | Steps | Expected Result | Priority | Status |
|---------|-----------|-------|-----------------|----------|--------|
| INT-001 | Complete Task Flow | 1. Create project<br>2. Complete item<br>3. Assign task<br>4. Add comment<br>5. Export PDF | All steps work together seamlessly | P0 | Pending |
| INT-002 | Timeline Integration | 1. Set dates<br>2. Log time<br>3. Complete task | Completion date auto-set, time vs estimate shown | P1 | Pending |
| INT-003 | Filter + Export | 1. Apply filters<br>2. Export PDF | PDF includes only filtered items | P1 | Pending |
| INT-004 | File + Comments | 1. Upload file<br>2. Comment about file | Both features work together | P2 | Pending |
| INT-005 | Multi-user Collaboration | 1. User A assigns task to User B<br>2. User B completes<br>3. User A sees update | Real-time updates across users | P0 | Pending |
| INT-006 | Filter Preset + Timeline | 1. Save preset with date filters<br>2. Load preset | Date filters applied correctly | P1 | Pending |

---

## Automated Testing Tools

### Tools to Use:
1. **axe DevTools** - Accessibility scanning
2. **WAVE** - Visual accessibility feedback
3. **Lighthouse** - Performance, accessibility, SEO, best practices
4. **Pa11y** - Automated accessibility testing
5. **Jest** - Unit tests (if applicable)
6. **Cypress/Playwright** - E2E tests (if applicable)

### Automated Test Commands:
```bash
# Lighthouse audit
lighthouse http://localhost:3000 --view

# Pa11y accessibility test
pa11y http://localhost:3000

# Run automated suite (if configured)
npm test
```

---

## Test Execution Schedule

### Phase 1: Functional Testing (Est. 8 hours)
- Core features (AUTH, PROJ, CHECK)
- Phase 9A: Timeline fields
- Phase 9B: Filter presets
- Phase 9C: PDF export
- Phase 9D: Time tracking
- Phase 9E: File attachments

### Phase 2: Accessibility Testing (Est. 6 hours)
- Automated scans (axe, WAVE, Pa11y)
- Manual screen reader testing
- Keyboard navigation testing
- WCAG 2.1 AA compliance verification

### Phase 3: Security & Performance (Est. 4 hours)
- Security vulnerability testing
- Performance benchmarking
- Load testing (moderate scale)

### Phase 4: Compatibility & Responsive (Est. 4 hours)
- Cross-browser testing
- Multi-device testing
- Responsive design validation

### Phase 5: Integration Testing (Est. 2 hours)
- End-to-end workflows
- Feature interaction testing

**Total Estimated Time: 24 hours**

---

## Test Results Template

For each test case, record:
- **Status**: Pass / Fail / Blocked / Not Tested
- **Actual Result**: What actually happened
- **Screenshots**: If applicable
- **Bug ID**: If defect found
- **Notes**: Additional observations

---

## Defect Reporting

When defects are found, report with:
- **Severity**: Critical / High / Medium / Low
- **Priority**: P0 / P1 / P2
- **Steps to Reproduce**
- **Expected vs Actual Result**
- **Environment Details**
- **Screenshots/Videos**

---

## Success Criteria

### Must Pass (P0):
- All P0 functional tests pass
- All P0 accessibility tests pass (WCAG 2.1 AA critical)
- No critical security vulnerabilities
- Core user flows work end-to-end

### Should Pass (P1):
- 95%+ of P1 tests pass
- Lighthouse accessibility score > 90
- Page load < 3 seconds
- All browsers supported

### Nice to Have (P2):
- 90%+ of P2 tests pass
- Lighthouse performance score > 90
- Enhanced UX features working

---

## Sign-off

**QA Manager:** Claude
**Date Prepared:** October 24, 2025
**Test Plan Version:** 1.0

**Approval Required From:**
- [ ] Product Owner
- [ ] Development Lead
- [ ] Accessibility Specialist (for WCAG compliance)
- [ ] Security Lead (for security testing)

---

## Appendix A: WCAG 2.1 AA Quick Reference

**Level A (Must Have):**
- Text alternatives
- Keyboard accessible
- Enough time
- Seizure-safe
- Navigable
- Readable
- Predictable
- Input assistance
- Compatible

**Level AA (Required for Compliance):**
- Captions (live)
- Audio description
- Contrast (minimum 4.5:1)
- Resize text
- Images of text
- Reflow
- Non-text contrast
- Text spacing
- Content on hover/focus
- Multiple ways to navigate
- Headings and labels
- Focus visible
- Language changes
- Consistent navigation
- Consistent identification
- Error suggestion
- Error prevention
- Status messages

---

## Appendix B: Testing Checklist Summary

**Before Testing:**
- [ ] Test environment set up
- [ ] All testing tools installed
- [ ] Test data prepared
- [ ] Screen readers configured
- [ ] Browser versions confirmed

**During Testing:**
- [ ] Follow test case steps precisely
- [ ] Record all results
- [ ] Take screenshots of issues
- [ ] Note any deviations
- [ ] Log defects immediately

**After Testing:**
- [ ] All test cases executed
- [ ] Results documented
- [ ] Defects reported
- [ ] Metrics calculated
- [ ] Report prepared
- [ ] Sign-off obtained

---

**END OF TEST PLAN**

*This test plan is comprehensive and ready for execution. Pending approval to proceed with test execution phase.*
