/**
 * WCAG 2.2 Success Criteria Reference Data
 * Complete mapping of all 86 WCAG 2.2 success criteria
 * (Note: 4.1.1 Parsing was removed in WCAG 2.2)
 *
 * Based on: https://www.w3.org/WAI/WCAG22/quickref/
 */

// WCAG Levels
export const WCAG_LEVELS = {
  A: 'A',
  AA: 'AA',
  AAA: 'AAA'
};

// WCAG Principles (POUR) - Simple name mapping for UI
export const WCAG_PRINCIPLES = {
  perceivable: 'Perceivable',
  operable: 'Operable',
  understandable: 'Understandable',
  robust: 'Robust'
};

// WCAG Principles (POUR) - Detailed info
export const WCAG_PRINCIPLES_DETAIL = {
  perceivable: {
    id: 'perceivable',
    number: '1',
    name: 'Perceivable',
    description: 'Information and user interface components must be presentable to users in ways they can perceive.'
  },
  operable: {
    id: 'operable',
    number: '2',
    name: 'Operable',
    description: 'User interface components and navigation must be operable.'
  },
  understandable: {
    id: 'understandable',
    number: '3',
    name: 'Understandable',
    description: 'Information and the operation of the user interface must be understandable.'
  },
  robust: {
    id: 'robust',
    number: '4',
    name: 'Robust',
    description: 'Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.'
  }
};

// Automation status for criteria
export const AUTOMATION_STATUS = {
  AUTOMATED: 'automated',      // Fully automated by Axe-core
  PARTIAL: 'partial',          // Some aspects automated, manual review needed
  MANUAL: 'manual'             // Requires manual testing only
};

// WCAG Guidelines (organized by principle)
export const WCAG_GUIDELINES = {
  // Principle 1: Perceivable
  '1.1': { id: '1.1', name: 'Text Alternatives', principle: 'perceivable' },
  '1.2': { id: '1.2', name: 'Time-based Media', principle: 'perceivable' },
  '1.3': { id: '1.3', name: 'Adaptable', principle: 'perceivable' },
  '1.4': { id: '1.4', name: 'Distinguishable', principle: 'perceivable' },

  // Principle 2: Operable
  '2.1': { id: '2.1', name: 'Keyboard Accessible', principle: 'operable' },
  '2.2': { id: '2.2', name: 'Enough Time', principle: 'operable' },
  '2.3': { id: '2.3', name: 'Seizures and Physical Reactions', principle: 'operable' },
  '2.4': { id: '2.4', name: 'Navigable', principle: 'operable' },
  '2.5': { id: '2.5', name: 'Input Modalities', principle: 'operable' },

  // Principle 3: Understandable
  '3.1': { id: '3.1', name: 'Readable', principle: 'understandable' },
  '3.2': { id: '3.2', name: 'Predictable', principle: 'understandable' },
  '3.3': { id: '3.3', name: 'Input Assistance', principle: 'understandable' },

  // Principle 4: Robust
  '4.1': { id: '4.1', name: 'Compatible', principle: 'robust' }
};

/**
 * Complete WCAG 2.2 Success Criteria
 * All 86 criteria with metadata (4.1.1 removed in 2.2)
 */
export const WCAG_CRITERIA = {
  // ========================================
  // PRINCIPLE 1: PERCEIVABLE
  // ========================================

  // 1.1 Text Alternatives
  '1.1.1': {
    id: '1.1.1',
    name: 'Non-text Content',
    level: WCAG_LEVELS.A,
    guideline: '1.1',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'All non-text content has a text alternative that serves the equivalent purpose.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html',
    techniques: ['G94', 'G95', 'H37', 'H67', 'H86'],
    axeRules: [
      'images_require_alternate_text',
      'image_button_requires_alternate_text',
      'svg_images_graphics_require_accessible_text',
      'object_elements_require_alternate_text',
      'active_area_elements_require_alternate_text',
      'elements_marked_role_img_require_alternate_text',
      'alt_text_should_not_be_repeated_as_text'
    ]
  },

  // 1.2 Time-based Media
  '1.2.1': {
    id: '1.2.1',
    name: 'Audio-only and Video-only (Prerecorded)',
    level: WCAG_LEVELS.A,
    guideline: '1.2',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.PARTIAL,
    description: 'For prerecorded audio-only and prerecorded video-only media, alternatives are provided.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded.html',
    techniques: ['G158', 'G159', 'G166'],
    axeRules: []
  },

  '1.2.2': {
    id: '1.2.2',
    name: 'Captions (Prerecorded)',
    level: WCAG_LEVELS.A,
    guideline: '1.2',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.PARTIAL,
    description: 'Captions are provided for all prerecorded audio content in synchronized media.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html',
    techniques: ['G87', 'G93', 'H95'],
    axeRules: ['video_elements_require_track_for_captions']
  },

  '1.2.3': {
    id: '1.2.3',
    name: 'Audio Description or Media Alternative (Prerecorded)',
    level: WCAG_LEVELS.A,
    guideline: '1.2',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'An alternative for time-based media or audio description is provided.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-description-or-media-alternative-prerecorded.html',
    techniques: ['G69', 'G78', 'G173', 'G8'],
    axeRules: []
  },

  '1.2.4': {
    id: '1.2.4',
    name: 'Captions (Live)',
    level: WCAG_LEVELS.AA,
    guideline: '1.2',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Captions are provided for all live audio content in synchronized media.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/captions-live.html',
    techniques: ['G9', 'G87', 'G93'],
    axeRules: []
  },

  '1.2.5': {
    id: '1.2.5',
    name: 'Audio Description (Prerecorded)',
    level: WCAG_LEVELS.AA,
    guideline: '1.2',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Audio description is provided for all prerecorded video content.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html',
    techniques: ['G8', 'G78', 'G173', 'G203'],
    axeRules: []
  },

  '1.2.6': {
    id: '1.2.6',
    name: 'Sign Language (Prerecorded)',
    level: WCAG_LEVELS.AAA,
    guideline: '1.2',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Sign language interpretation is provided for all prerecorded audio content.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/sign-language-prerecorded.html',
    techniques: ['G54', 'G81'],
    axeRules: []
  },

  '1.2.7': {
    id: '1.2.7',
    name: 'Extended Audio Description (Prerecorded)',
    level: WCAG_LEVELS.AAA,
    guideline: '1.2',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Extended audio description is provided for all prerecorded video content.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/extended-audio-description-prerecorded.html',
    techniques: ['G8'],
    axeRules: []
  },

  '1.2.8': {
    id: '1.2.8',
    name: 'Media Alternative (Prerecorded)',
    level: WCAG_LEVELS.AAA,
    guideline: '1.2',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'An alternative for time-based media is provided for all prerecorded synchronized media.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/media-alternative-prerecorded.html',
    techniques: ['G69', 'G159'],
    axeRules: []
  },

  '1.2.9': {
    id: '1.2.9',
    name: 'Audio-only (Live)',
    level: WCAG_LEVELS.AAA,
    guideline: '1.2',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'An alternative for time-based media is provided for all live audio-only content.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-only-live.html',
    techniques: ['G151', 'G157'],
    axeRules: []
  },

  // 1.3 Adaptable
  '1.3.1': {
    id: '1.3.1',
    name: 'Info and Relationships',
    level: WCAG_LEVELS.A,
    guideline: '1.3',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'Information, structure, and relationships can be programmatically determined.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
    techniques: ['H42', 'H48', 'H51', 'H63', 'H73', 'H97'],
    axeRules: [
      'list_items_must_be_contained_in_list_elements',
      'lists_must_only_contain_li_content_elements',
      'dl_must_only_have_ordered_dt_dd_groups',
      'dt_dd_elements_must_be_contained_by_dl',
      'table_headers_require_discernible_text',
      'th_element_requires_associated_data_cells',
      'scope_attribute_should_be_used_correctly_on_tables'
    ]
  },

  '1.3.2': {
    id: '1.3.2',
    name: 'Meaningful Sequence',
    level: WCAG_LEVELS.A,
    guideline: '1.3',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'When sequence affects meaning, a correct reading sequence can be programmatically determined.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html',
    techniques: ['G57', 'C27', 'C28'],
    axeRules: []
  },

  '1.3.3': {
    id: '1.3.3',
    name: 'Sensory Characteristics',
    level: WCAG_LEVELS.A,
    guideline: '1.3',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Instructions do not rely solely on sensory characteristics.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics.html',
    techniques: ['G96'],
    axeRules: []
  },

  '1.3.4': {
    id: '1.3.4',
    name: 'Orientation',
    level: WCAG_LEVELS.AA,
    guideline: '1.3',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Content does not restrict its view and operation to a single display orientation.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/orientation.html',
    techniques: ['G214'],
    axeRules: []
  },

  '1.3.5': {
    id: '1.3.5',
    name: 'Identify Input Purpose',
    level: WCAG_LEVELS.AA,
    guideline: '1.3',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'The purpose of input fields can be programmatically determined.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html',
    techniques: ['H98'],
    axeRules: ['autocomplete_attribute_must_be_used_correctly']
  },

  '1.3.6': {
    id: '1.3.6',
    name: 'Identify Purpose',
    level: WCAG_LEVELS.AAA,
    guideline: '1.3',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'The purpose of UI components, icons, and regions can be programmatically determined.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/identify-purpose.html',
    techniques: ['ARIA11'],
    axeRules: [
      'all_page_content_must_be_contained_by_landmarks',
      'landmarks_require_unique_role_or_accessible_name'
    ]
  },

  // 1.4 Distinguishable
  '1.4.1': {
    id: '1.4.1',
    name: 'Use of Color',
    level: WCAG_LEVELS.A,
    guideline: '1.4',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Color is not used as the only visual means of conveying information.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html',
    techniques: ['G14', 'G111', 'G182', 'G183'],
    axeRules: []
  },

  '1.4.2': {
    id: '1.4.2',
    name: 'Audio Control',
    level: WCAG_LEVELS.A,
    guideline: '1.4',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'Audio that plays automatically can be paused, stopped, or volume controlled.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html',
    techniques: ['G60', 'G170', 'G171'],
    axeRules: ['video_or_audio_elements_must_not_autoplay']
  },

  '1.4.3': {
    id: '1.4.3',
    name: 'Contrast (Minimum)',
    level: WCAG_LEVELS.AA,
    guideline: '1.4',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'Text has a contrast ratio of at least 4.5:1 (3:1 for large text).',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
    techniques: ['G18', 'G145', 'G174'],
    axeRules: ['text_requires_higher_color_contrast_ratio']
  },

  '1.4.4': {
    id: '1.4.4',
    name: 'Resize Text',
    level: WCAG_LEVELS.AA,
    guideline: '1.4',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'Text can be resized up to 200% without loss of content or functionality.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html',
    techniques: ['G142', 'G178', 'G179', 'C28'],
    axeRules: [
      'meta_viewport_zoom_scaling_disabled',
      'meta_viewport_should_allow_zoom_scale_up_to_500_'
    ]
  },

  '1.4.5': {
    id: '1.4.5',
    name: 'Images of Text',
    level: WCAG_LEVELS.AA,
    guideline: '1.4',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Text is used to convey information rather than images of text.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html',
    techniques: ['C22', 'C30', 'G140'],
    axeRules: []
  },

  '1.4.6': {
    id: '1.4.6',
    name: 'Contrast (Enhanced)',
    level: WCAG_LEVELS.AAA,
    guideline: '1.4',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'Text has a contrast ratio of at least 7:1 (4.5:1 for large text).',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html',
    techniques: ['G17', 'G148', 'G174'],
    axeRules: ['text_requires_higher_color_contrast_to_background']
  },

  '1.4.7': {
    id: '1.4.7',
    name: 'Low or No Background Audio',
    level: WCAG_LEVELS.AAA,
    guideline: '1.4',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Prerecorded audio-only content has no or low background sounds.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/low-or-no-background-audio.html',
    techniques: ['G56'],
    axeRules: []
  },

  '1.4.8': {
    id: '1.4.8',
    name: 'Visual Presentation',
    level: WCAG_LEVELS.AAA,
    guideline: '1.4',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'For text blocks: colors, width, justification, spacing, and sizing are customizable.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html',
    techniques: ['C19', 'C20', 'C21', 'G146', 'G148', 'G156', 'G175'],
    axeRules: []
  },

  '1.4.9': {
    id: '1.4.9',
    name: 'Images of Text (No Exception)',
    level: WCAG_LEVELS.AAA,
    guideline: '1.4',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Images of text are only used for decoration or where essential.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/images-of-text-no-exception.html',
    techniques: ['C22', 'C30', 'G140'],
    axeRules: []
  },

  '1.4.10': {
    id: '1.4.10',
    name: 'Reflow',
    level: WCAG_LEVELS.AA,
    guideline: '1.4',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Content can be presented without requiring scrolling in two dimensions.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/reflow.html',
    techniques: ['C31', 'C32', 'C33', 'C38'],
    axeRules: []
  },

  '1.4.11': {
    id: '1.4.11',
    name: 'Non-text Contrast',
    level: WCAG_LEVELS.AA,
    guideline: '1.4',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'UI components and graphical objects have a contrast ratio of at least 3:1.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html',
    techniques: ['G174', 'G195', 'G207'],
    axeRules: []
  },

  '1.4.12': {
    id: '1.4.12',
    name: 'Text Spacing',
    level: WCAG_LEVELS.AA,
    guideline: '1.4',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'No loss of content when text spacing is adjusted.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html',
    techniques: ['C35', 'C36'],
    axeRules: ['inline_text_spacing_must_be_adjustable']
  },

  '1.4.13': {
    id: '1.4.13',
    name: 'Content on Hover or Focus',
    level: WCAG_LEVELS.AA,
    guideline: '1.4',
    principle: 'perceivable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Additional content appearing on hover/focus can be dismissed and is hoverable.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html',
    techniques: ['SCR39'],
    axeRules: []
  },

  // ========================================
  // PRINCIPLE 2: OPERABLE
  // ========================================

  // 2.1 Keyboard Accessible
  '2.1.1': {
    id: '2.1.1',
    name: 'Keyboard',
    level: WCAG_LEVELS.A,
    guideline: '2.1',
    principle: 'operable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'All functionality is operable through a keyboard interface.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html',
    techniques: ['G202', 'H91', 'SCR2', 'SCR20', 'SCR35'],
    axeRules: [
      'scrollable_region_requires_keyboard_access',
      'interactive_controls_must_not_be_nested',
      'frames_with_focusable_content_must_not_use_tabindex_1'
    ]
  },

  '2.1.2': {
    id: '2.1.2',
    name: 'No Keyboard Trap',
    level: WCAG_LEVELS.A,
    guideline: '2.1',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Keyboard focus can be moved away from any component using only a keyboard.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html',
    techniques: ['G21', 'F10'],
    axeRules: []
  },

  '2.1.3': {
    id: '2.1.3',
    name: 'Keyboard (No Exception)',
    level: WCAG_LEVELS.AAA,
    guideline: '2.1',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'All functionality is operable through a keyboard interface without exception.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard-no-exception.html',
    techniques: ['G202'],
    axeRules: []
  },

  '2.1.4': {
    id: '2.1.4',
    name: 'Character Key Shortcuts',
    level: WCAG_LEVELS.A,
    guideline: '2.1',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Character key shortcuts can be turned off or remapped.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html',
    techniques: ['G217'],
    axeRules: []
  },

  // 2.2 Enough Time
  '2.2.1': {
    id: '2.2.1',
    name: 'Timing Adjustable',
    level: WCAG_LEVELS.A,
    guideline: '2.2',
    principle: 'operable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'Users can turn off, adjust, or extend time limits.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html',
    techniques: ['G133', 'G180', 'G198', 'SCR16'],
    axeRules: [
      'timed_meta_refresh_must_not_exist',
      'delayed_meta_refresh_must_not_be_used'
    ]
  },

  '2.2.2': {
    id: '2.2.2',
    name: 'Pause, Stop, Hide',
    level: WCAG_LEVELS.A,
    guideline: '2.2',
    principle: 'operable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'Moving, blinking, scrolling, or auto-updating content can be paused, stopped, or hidden.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html',
    techniques: ['G4', 'G186', 'G187', 'G191'],
    axeRules: [
      'blink_elements_deprecated_must_not_be_used',
      'deprecated_marquee_element_must_not_be_used'
    ]
  },

  '2.2.3': {
    id: '2.2.3',
    name: 'No Timing',
    level: WCAG_LEVELS.AAA,
    guideline: '2.2',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Timing is not an essential part of the event or activity presented by the content.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/no-timing.html',
    techniques: ['G5'],
    axeRules: []
  },

  '2.2.4': {
    id: '2.2.4',
    name: 'Interruptions',
    level: WCAG_LEVELS.AAA,
    guideline: '2.2',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Interruptions can be postponed or suppressed by the user.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/interruptions.html',
    techniques: ['G75', 'G76'],
    axeRules: []
  },

  '2.2.5': {
    id: '2.2.5',
    name: 'Re-authenticating',
    level: WCAG_LEVELS.AAA,
    guideline: '2.2',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Data is saved when an authenticated session expires.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/re-authenticating.html',
    techniques: ['G105', 'G181'],
    axeRules: []
  },

  '2.2.6': {
    id: '2.2.6',
    name: 'Timeouts',
    level: WCAG_LEVELS.AAA,
    guideline: '2.2',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Users are warned of the duration of any user inactivity that could cause data loss.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/timeouts.html',
    techniques: ['G180', 'G198'],
    axeRules: []
  },

  // 2.3 Seizures
  '2.3.1': {
    id: '2.3.1',
    name: 'Three Flashes or Below Threshold',
    level: WCAG_LEVELS.A,
    guideline: '2.3',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Content does not flash more than three times per second.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html',
    techniques: ['G15', 'G19', 'G176'],
    axeRules: []
  },

  '2.3.2': {
    id: '2.3.2',
    name: 'Three Flashes',
    level: WCAG_LEVELS.AAA,
    guideline: '2.3',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Web pages do not contain anything that flashes more than three times in any one second period.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/three-flashes.html',
    techniques: ['G19'],
    axeRules: []
  },

  '2.3.3': {
    id: '2.3.3',
    name: 'Animation from Interactions',
    level: WCAG_LEVELS.AAA,
    guideline: '2.3',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Motion animation triggered by interaction can be disabled.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html',
    techniques: ['C39'],
    axeRules: []
  },

  // 2.4 Navigable
  '2.4.1': {
    id: '2.4.1',
    name: 'Bypass Blocks',
    level: WCAG_LEVELS.A,
    guideline: '2.4',
    principle: 'operable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'A mechanism is available to bypass blocks of content that are repeated.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html',
    techniques: ['G1', 'G123', 'G124', 'H69', 'ARIA11'],
    axeRules: [
      'page_requires_means_to_bypass_repeated_blocks',
      'skiplink_target_should_exist_be_focusable'
    ]
  },

  '2.4.2': {
    id: '2.4.2',
    name: 'Page Titled',
    level: WCAG_LEVELS.A,
    guideline: '2.4',
    principle: 'operable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'Web pages have titles that describe topic or purpose.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html',
    techniques: ['G88', 'H25'],
    axeRules: ['page_must_contain_title']
  },

  '2.4.3': {
    id: '2.4.3',
    name: 'Focus Order',
    level: WCAG_LEVELS.A,
    guideline: '2.4',
    principle: 'operable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'Components receive focus in an order that preserves meaning.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html',
    techniques: ['G59', 'H4', 'C27', 'SCR26', 'SCR37'],
    axeRules: ['elements_must_not_have_tabindex_greater_than_zero']
  },

  '2.4.4': {
    id: '2.4.4',
    name: 'Link Purpose (In Context)',
    level: WCAG_LEVELS.A,
    guideline: '2.4',
    principle: 'operable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'The purpose of each link can be determined from the link text alone.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html',
    techniques: ['G53', 'G91', 'H24', 'H30', 'H77', 'H78', 'H79', 'H80', 'H81'],
    axeRules: [
      'links_require_discernible_text',
      'links_must_be_distinguishable'
    ]
  },

  '2.4.5': {
    id: '2.4.5',
    name: 'Multiple Ways',
    level: WCAG_LEVELS.AA,
    guideline: '2.4',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'More than one way is available to locate a Web page within a set of pages.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways.html',
    techniques: ['G63', 'G64', 'G125', 'G126', 'G161', 'G185'],
    axeRules: []
  },

  '2.4.6': {
    id: '2.4.6',
    name: 'Headings and Labels',
    level: WCAG_LEVELS.AA,
    guideline: '2.4',
    principle: 'operable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'Headings and labels describe topic or purpose.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html',
    techniques: ['G130', 'G131'],
    axeRules: [
      'headings_should_not_be_empty',
      'page_must_contain_h1'
    ]
  },

  '2.4.7': {
    id: '2.4.7',
    name: 'Focus Visible',
    level: WCAG_LEVELS.AA,
    guideline: '2.4',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Any keyboard operable UI has a visible keyboard focus indicator.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html',
    techniques: ['G149', 'G165', 'G195', 'C15', 'C40', 'SCR31'],
    axeRules: []
  },

  '2.4.8': {
    id: '2.4.8',
    name: 'Location',
    level: WCAG_LEVELS.AAA,
    guideline: '2.4',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Information about the user\'s location within a set of Web pages is available.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/location.html',
    techniques: ['G63', 'G65', 'G128'],
    axeRules: []
  },

  '2.4.9': {
    id: '2.4.9',
    name: 'Link Purpose (Link Only)',
    level: WCAG_LEVELS.AAA,
    guideline: '2.4',
    principle: 'operable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'A mechanism is available to identify the purpose of each link from link text alone.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-link-only.html',
    techniques: ['G91', 'H30', 'ARIA8'],
    axeRules: ['links_with_same_accessible_name']
  },

  '2.4.10': {
    id: '2.4.10',
    name: 'Section Headings',
    level: WCAG_LEVELS.AAA,
    guideline: '2.4',
    principle: 'operable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'Section headings are used to organize content.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/section-headings.html',
    techniques: ['G141', 'H69'],
    axeRules: ['heading_levels_should_only_increase_by_one']
  },

  '2.4.11': {
    id: '2.4.11',
    name: 'Focus Not Obscured (Minimum)',
    level: WCAG_LEVELS.AA,
    guideline: '2.4',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'The component with keyboard focus is not entirely hidden by author-created content.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html',
    techniques: ['C43'],
    axeRules: []
  },

  '2.4.12': {
    id: '2.4.12',
    name: 'Focus Not Obscured (Enhanced)',
    level: WCAG_LEVELS.AAA,
    guideline: '2.4',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'No part of the component with keyboard focus is hidden by author-created content.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html',
    techniques: ['C43'],
    axeRules: []
  },

  '2.4.13': {
    id: '2.4.13',
    name: 'Focus Appearance',
    level: WCAG_LEVELS.AAA,
    guideline: '2.4',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Focus indicators have sufficient size, contrast, and are not obscured.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html',
    techniques: ['C40', 'C41'],
    axeRules: []
  },

  // 2.5 Input Modalities
  '2.5.1': {
    id: '2.5.1',
    name: 'Pointer Gestures',
    level: WCAG_LEVELS.A,
    guideline: '2.5',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Multipoint or path-based gestures have single-pointer alternatives.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html',
    techniques: ['G215', 'G216'],
    axeRules: []
  },

  '2.5.2': {
    id: '2.5.2',
    name: 'Pointer Cancellation',
    level: WCAG_LEVELS.A,
    guideline: '2.5',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Single pointer functionality can be cancelled or undone.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html',
    techniques: ['G210', 'G212'],
    axeRules: []
  },

  '2.5.3': {
    id: '2.5.3',
    name: 'Label in Name',
    level: WCAG_LEVELS.A,
    guideline: '2.5',
    principle: 'operable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'Visible labels of UI components contain the accessible name.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html',
    techniques: ['G208', 'G211'],
    axeRules: [
      'buttons_require_discernible_text',
      'input_buttons_require_discernible_text'
    ]
  },

  '2.5.4': {
    id: '2.5.4',
    name: 'Motion Actuation',
    level: WCAG_LEVELS.A,
    guideline: '2.5',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Functions triggered by device motion have UI alternatives and can be disabled.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html',
    techniques: ['G213'],
    axeRules: []
  },

  '2.5.5': {
    id: '2.5.5',
    name: 'Target Size (Enhanced)',
    level: WCAG_LEVELS.AAA,
    guideline: '2.5',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Interactive targets are at least 44 by 44 CSS pixels.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html',
    techniques: [],
    axeRules: []
  },

  '2.5.6': {
    id: '2.5.6',
    name: 'Concurrent Input Mechanisms',
    level: WCAG_LEVELS.AAA,
    guideline: '2.5',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Content does not restrict use of input modalities available on a platform.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/concurrent-input-mechanisms.html',
    techniques: ['G212'],
    axeRules: []
  },

  '2.5.7': {
    id: '2.5.7',
    name: 'Dragging Movements',
    level: WCAG_LEVELS.AA,
    guideline: '2.5',
    principle: 'operable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Dragging-based functionality has single pointer alternatives.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html',
    techniques: ['G219'],
    axeRules: []
  },

  '2.5.8': {
    id: '2.5.8',
    name: 'Target Size (Minimum)',
    level: WCAG_LEVELS.AA,
    guideline: '2.5',
    principle: 'operable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'Interactive targets are at least 24 by 24 CSS pixels.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html',
    techniques: ['C42'],
    axeRules: ['touch_targets_require_sufficient_size_spacing']
  },

  // ========================================
  // PRINCIPLE 3: UNDERSTANDABLE
  // ========================================

  // 3.1 Readable
  '3.1.1': {
    id: '3.1.1',
    name: 'Language of Page',
    level: WCAG_LEVELS.A,
    guideline: '3.1',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'The default human language of each page can be programmatically determined.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html',
    techniques: ['H57'],
    axeRules: ['html_element_requires_lang_attribute']
  },

  '3.1.2': {
    id: '3.1.2',
    name: 'Language of Parts',
    level: WCAG_LEVELS.AA,
    guideline: '3.1',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'The human language of each passage or phrase can be programmatically determined.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html',
    techniques: ['H58'],
    axeRules: [
      'html_element_lang_attribute_value_must_be_valid',
      'lang_attribute_requires_valid_value',
      'html_lang_xml_lang_value_should_match'
    ]
  },

  '3.1.3': {
    id: '3.1.3',
    name: 'Unusual Words',
    level: WCAG_LEVELS.AAA,
    guideline: '3.1',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'A mechanism is available for identifying definitions of unusual words or phrases.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/unusual-words.html',
    techniques: ['G55', 'G62', 'G70', 'G101', 'G112', 'H40', 'H60'],
    axeRules: []
  },

  '3.1.4': {
    id: '3.1.4',
    name: 'Abbreviations',
    level: WCAG_LEVELS.AAA,
    guideline: '3.1',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'A mechanism for identifying the expanded form of abbreviations is available.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/abbreviations.html',
    techniques: ['G55', 'G62', 'G70', 'G97', 'G102', 'H28'],
    axeRules: []
  },

  '3.1.5': {
    id: '3.1.5',
    name: 'Reading Level',
    level: WCAG_LEVELS.AAA,
    guideline: '3.1',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Supplemental content or simpler versions are available for complex text.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html',
    techniques: ['G79', 'G86', 'G103', 'G153', 'G160'],
    axeRules: []
  },

  '3.1.6': {
    id: '3.1.6',
    name: 'Pronunciation',
    level: WCAG_LEVELS.AAA,
    guideline: '3.1',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'A mechanism is available for identifying pronunciation of words.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/pronunciation.html',
    techniques: ['G62', 'G120', 'G121', 'G163', 'H62'],
    axeRules: []
  },

  // 3.2 Predictable
  '3.2.1': {
    id: '3.2.1',
    name: 'On Focus',
    level: WCAG_LEVELS.A,
    guideline: '3.2',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Receiving focus does not initiate a change of context.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html',
    techniques: ['G107'],
    axeRules: []
  },

  '3.2.2': {
    id: '3.2.2',
    name: 'On Input',
    level: WCAG_LEVELS.A,
    guideline: '3.2',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Changing a UI component setting does not automatically cause a change of context.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/on-input.html',
    techniques: ['G80', 'G13', 'H32', 'H84', 'SCR19'],
    axeRules: []
  },

  '3.2.3': {
    id: '3.2.3',
    name: 'Consistent Navigation',
    level: WCAG_LEVELS.AA,
    guideline: '3.2',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Navigation mechanisms that are repeated are in the same relative order.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html',
    techniques: ['G61'],
    axeRules: []
  },

  '3.2.4': {
    id: '3.2.4',
    name: 'Consistent Identification',
    level: WCAG_LEVELS.AA,
    guideline: '3.2',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Components with the same functionality are identified consistently.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html',
    techniques: ['G197'],
    axeRules: []
  },

  '3.2.5': {
    id: '3.2.5',
    name: 'Change on Request',
    level: WCAG_LEVELS.AAA,
    guideline: '3.2',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Changes of context are initiated only by user request or a mechanism is available to turn them off.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/change-on-request.html',
    techniques: ['G76', 'G110', 'H32', 'H76', 'H83'],
    axeRules: []
  },

  '3.2.6': {
    id: '3.2.6',
    name: 'Consistent Help',
    level: WCAG_LEVELS.A,
    guideline: '3.2',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Help mechanisms occur in the same relative order across pages.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html',
    techniques: ['G220'],
    axeRules: []
  },

  // 3.3 Input Assistance
  '3.3.1': {
    id: '3.3.1',
    name: 'Error Identification',
    level: WCAG_LEVELS.A,
    guideline: '3.3',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Input errors are automatically detected and described to the user in text.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html',
    techniques: ['G83', 'G84', 'G85', 'ARIA18', 'ARIA19', 'ARIA21', 'SCR18'],
    axeRules: []
  },

  '3.3.2': {
    id: '3.3.2',
    name: 'Labels or Instructions',
    level: WCAG_LEVELS.A,
    guideline: '3.3',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'Labels or instructions are provided when content requires user input.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html',
    techniques: ['G13', 'G89', 'G131', 'G162', 'G184', 'H44', 'H65', 'H71', 'ARIA1', 'ARIA9', 'ARIA17'],
    axeRules: [
      'form_input_elements_require_labels',
      'form_elements_should_have_visible_label',
      'select_element_requires_accessible_name',
      'form_field_must_not_have_multiple_label_elements'
    ]
  },

  '3.3.3': {
    id: '3.3.3',
    name: 'Error Suggestion',
    level: WCAG_LEVELS.AA,
    guideline: '3.3',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'If an input error is detected, suggestions for correction are provided.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html',
    techniques: ['G83', 'G84', 'G85', 'G177', 'ARIA2', 'ARIA18'],
    axeRules: []
  },

  '3.3.4': {
    id: '3.3.4',
    name: 'Error Prevention (Legal, Financial, Data)',
    level: WCAG_LEVELS.AA,
    guideline: '3.3',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Submissions are reversible, checked, or confirmed for legal/financial/data actions.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html',
    techniques: ['G98', 'G99', 'G155', 'G164', 'G168'],
    axeRules: []
  },

  '3.3.5': {
    id: '3.3.5',
    name: 'Help',
    level: WCAG_LEVELS.AAA,
    guideline: '3.3',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Context-sensitive help is available.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/help.html',
    techniques: ['G71', 'G89', 'G184', 'G193', 'G194'],
    axeRules: []
  },

  '3.3.6': {
    id: '3.3.6',
    name: 'Error Prevention (All)',
    level: WCAG_LEVELS.AAA,
    guideline: '3.3',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Submissions are reversible, checked, or confirmed for all user input.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-all.html',
    techniques: ['G98', 'G99', 'G155', 'G164', 'G168'],
    axeRules: []
  },

  '3.3.7': {
    id: '3.3.7',
    name: 'Redundant Entry',
    level: WCAG_LEVELS.A,
    guideline: '3.3',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Information previously entered is auto-populated or available for selection.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html',
    techniques: ['G221'],
    axeRules: []
  },

  '3.3.8': {
    id: '3.3.8',
    name: 'Accessible Authentication (Minimum)',
    level: WCAG_LEVELS.AA,
    guideline: '3.3',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Cognitive function tests are not required for authentication unless alternatives exist.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html',
    techniques: ['G218'],
    axeRules: []
  },

  '3.3.9': {
    id: '3.3.9',
    name: 'Accessible Authentication (Enhanced)',
    level: WCAG_LEVELS.AAA,
    guideline: '3.3',
    principle: 'understandable',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'No cognitive function test is required for any step in an authentication process.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-enhanced.html',
    techniques: ['G218'],
    axeRules: []
  },

  // ========================================
  // PRINCIPLE 4: ROBUST
  // ========================================

  // 4.1 Compatible
  '4.1.2': {
    id: '4.1.2',
    name: 'Name, Role, Value',
    level: WCAG_LEVELS.A,
    guideline: '4.1',
    principle: 'robust',
    automation: AUTOMATION_STATUS.AUTOMATED,
    description: 'For all UI components, the name, role, and state can be programmatically determined.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html',
    techniques: ['ARIA4', 'ARIA5', 'ARIA14', 'ARIA16', 'G108', 'G135', 'H64', 'H65', 'H88', 'H91'],
    axeRules: [
      // ARIA role validation
      'aria_roles_require_valid_values',
      'aria_attributes_require_valid_names',
      'aria_attributes_require_valid_values',
      'required_aria_attributes_must_be_provided',
      'aria_attribute_must_be_used_as_specified_for_role',
      'elements_must_only_use_permitted_aria_attributes',
      'elements_must_use_allowed_aria_attributes',
      'aria_roles_must_be_contained_by_required_parent',
      'certain_aria_roles_must_contain_specific_children',
      'deprecated_aria_roles_must_not_be_used',
      // Accessible names
      'aria_commands_require_accessible_name',
      'aria_input_fields_require_accessible_name',
      'aria_toggle_fields_require_accessible_name',
      'aria_dialog_alertdialog_require_accessible_name',
      'aria_meter_nodes_require_accessible_name',
      'aria_progressbar_nodes_require_accessible_name',
      'aria_tooltip_nodes_require_accessible_name',
      'aria_treeitem_nodes_require_accessible_name',
      'summary_elements_require_discernible_text',
      // Frames
      'frames_require_title_attribute',
      'frames_require_unique_title_attribute',
      'ids_used_in_aria_labels_must_be_unique',
      // aria-hidden issues
      'ariahidden_true_must_not_be_used_in_body',
      'ariahidden_elements_contains_focusable_elements',
      'role_text_should_have_no_focusable_descendants',
      'ensure_elements_marked_presentational_are_ignored'
    ]
  },

  '4.1.3': {
    id: '4.1.3',
    name: 'Status Messages',
    level: WCAG_LEVELS.AA,
    guideline: '4.1',
    principle: 'robust',
    automation: AUTOMATION_STATUS.MANUAL,
    description: 'Status messages can be programmatically determined without receiving focus.',
    understanding: 'https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html',
    techniques: ['ARIA19', 'ARIA22', 'ARIA23', 'G199'],
    axeRules: []
  }
};

/**
 * Get criteria by level
 * @param {string} level - WCAG level (A, AA, AAA)
 * @returns {Array} - Array of criteria at that level
 */
export function getCriteriaByLevel(level) {
  return Object.values(WCAG_CRITERIA).filter(c => c.level === level);
}

/**
 * Get criteria by principle
 * @param {string} principle - WCAG principle (perceivable, operable, understandable, robust)
 * @returns {Array} - Array of criteria for that principle
 */
export function getCriteriaByPrinciple(principle) {
  return Object.values(WCAG_CRITERIA).filter(c => c.principle === principle);
}

/**
 * Get criteria by automation status
 * @param {string} status - Automation status (automated, partial, manual)
 * @returns {Array} - Array of criteria with that automation status
 */
export function getCriteriaByAutomation(status) {
  return Object.values(WCAG_CRITERIA).filter(c => c.automation === status);
}

/**
 * Get criteria that have Axe rules (can be automated)
 * @returns {Array} - Array of criteria with Axe rules
 */
export function getAutomatedCriteria() {
  return Object.values(WCAG_CRITERIA).filter(c => c.axeRules && c.axeRules.length > 0);
}

/**
 * Get criteria that require manual testing
 * @returns {Array} - Array of criteria requiring manual testing
 */
export function getManualCriteria() {
  return Object.values(WCAG_CRITERIA).filter(c => c.automation === AUTOMATION_STATUS.MANUAL);
}

/**
 * Get all criteria up to a specific level
 * @param {string} maxLevel - Maximum level to include (A, AA, or AAA)
 * @returns {Array} - Array of criteria up to that level
 */
export function getCriteriaUpToLevel(maxLevel) {
  const levels = [WCAG_LEVELS.A];
  if (maxLevel === WCAG_LEVELS.AA || maxLevel === WCAG_LEVELS.AAA) {
    levels.push(WCAG_LEVELS.AA);
  }
  if (maxLevel === WCAG_LEVELS.AAA) {
    levels.push(WCAG_LEVELS.AAA);
  }
  return Object.values(WCAG_CRITERIA).filter(c => levels.includes(c.level));
}

/**
 * Get coverage statistics
 * @returns {Object} - Coverage statistics by level and automation
 */
export function getCoverageStats() {
  const all = Object.values(WCAG_CRITERIA);

  return {
    total: all.length,
    byLevel: {
      A: getCriteriaByLevel(WCAG_LEVELS.A).length,
      AA: getCriteriaByLevel(WCAG_LEVELS.AA).length,
      AAA: getCriteriaByLevel(WCAG_LEVELS.AAA).length
    },
    byAutomation: {
      automated: getCriteriaByAutomation(AUTOMATION_STATUS.AUTOMATED).length,
      partial: getCriteriaByAutomation(AUTOMATION_STATUS.PARTIAL).length,
      manual: getCriteriaByAutomation(AUTOMATION_STATUS.MANUAL).length
    },
    byPrinciple: {
      perceivable: getCriteriaByPrinciple('perceivable').length,
      operable: getCriteriaByPrinciple('operable').length,
      understandable: getCriteriaByPrinciple('understandable').length,
      robust: getCriteriaByPrinciple('robust').length
    }
  };
}

export default {
  WCAG_LEVELS,
  WCAG_PRINCIPLES,
  WCAG_GUIDELINES,
  WCAG_CRITERIA,
  AUTOMATION_STATUS,
  getCriteriaByLevel,
  getCriteriaByPrinciple,
  getCriteriaByAutomation,
  getAutomatedCriteria,
  getManualCriteria,
  getCriteriaUpToLevel,
  getCoverageStats
};
