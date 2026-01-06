/**
 * Axe-core Rules Reference Data
 * Maps Screaming Frog accessibility export files to WCAG criteria
 *
 * Based on actual Screaming Frog 17+ Multi Export file structure
 * 93 individual Axe-core rules + summary files
 */

// Impact/Severity levels from Axe-core
export const IMPACT_LEVELS = {
  CRITICAL: 'critical',
  SERIOUS: 'serious',
  MODERATE: 'moderate',
  MINOR: 'minor'
};

// Categories for grouping rules
export const RULE_CATEGORIES = {
  TEXT_ALTERNATIVES: 'text_alternatives',
  TIME_BASED_MEDIA: 'time_based_media',
  ADAPTABLE: 'adaptable',
  DISTINGUISHABLE: 'distinguishable',
  KEYBOARD: 'keyboard',
  TIMING: 'timing',
  NAVIGATION: 'navigation',
  INPUT_MODALITIES: 'input_modalities',
  READABLE: 'readable',
  PREDICTABLE: 'predictable',
  INPUT_ASSISTANCE: 'input_assistance',
  ARIA: 'aria',
  LANDMARKS: 'landmarks',
  FRAMES: 'frames',
  BEST_PRACTICE: 'best_practice'
};

/**
 * Axe-core Rules with WCAG mappings
 * File names match Screaming Frog export format: accessibility_[rule_id].xlsx
 */
export const AXE_RULES = {
  // ========================================
  // TEXT ALTERNATIVES (1.1.1)
  // ========================================
  images_require_alternate_text: {
    id: 'images_require_alternate_text',
    fileName: 'accessibility_images_require_alternate_text.xlsx',
    name: 'Images require alternate text',
    description: 'Ensures <img> elements have alternate text or a role of none or presentation.',
    help: 'Images must have alternate text',
    wcagCriteria: ['1.1.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.TEXT_ALTERNATIVES,
    tags: ['wcag2a', 'wcag111', 'section508', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Add alt attribute with descriptive text, or role="presentation" for decorative images.'
  },

  image_button_requires_alternate_text: {
    id: 'image_button_requires_alternate_text',
    fileName: 'accessibility_image_button_requires_alternate_text.xlsx',
    name: 'Image buttons require alternate text',
    description: 'Ensures <input type="image"> elements have alternate text.',
    help: 'Image buttons must have alternate text',
    wcagCriteria: ['1.1.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.TEXT_ALTERNATIVES,
    tags: ['wcag2a', 'wcag111', 'section508', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Add alt attribute to describe the button action.'
  },

  svg_images_graphics_require_accessible_text: {
    id: 'svg_images_graphics_require_accessible_text',
    fileName: 'accessibility_svg_images_graphics_require_accessible_text.xlsx',
    name: 'SVG images require accessible text',
    description: 'Ensures SVG elements with role="img" have accessible text.',
    help: 'SVG images and graphics require accessible text',
    wcagCriteria: ['1.1.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.TEXT_ALTERNATIVES,
    tags: ['wcag2a', 'wcag111', 'section508'],
    aiFixable: true,
    fixSuggestion: 'Add <title> element inside SVG or aria-label attribute.'
  },

  object_elements_require_alternate_text: {
    id: 'object_elements_require_alternate_text',
    fileName: 'accessibility_object_elements_require_alternate_text.xlsx',
    name: 'Object elements require alternate text',
    description: 'Ensures <object> elements have alternate text.',
    help: '<object> elements must have alternate text',
    wcagCriteria: ['1.1.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.TEXT_ALTERNATIVES,
    tags: ['wcag2a', 'wcag111', 'section508'],
    aiFixable: false,
    fixSuggestion: 'Add text content inside the <object> element as fallback.'
  },

  active_area_elements_require_alternate_text: {
    id: 'active_area_elements_require_alternate_text',
    fileName: 'accessibility_active_area_elements_require_alternate_text.xlsx',
    name: 'Image map areas require alternate text',
    description: 'Ensures <area> elements of image maps have alternate text.',
    help: 'Active <area> elements must have alternate text',
    wcagCriteria: ['1.1.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.TEXT_ALTERNATIVES,
    tags: ['wcag2a', 'wcag111', 'section508', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Add alt attribute to each <area> element describing the linked destination.'
  },

  elements_marked_role_img_require_alternate_text: {
    id: 'elements_marked_role_img_require_alternate_text',
    fileName: 'accessibility_elements_marked_role_img_require_alternate_text.xlsx',
    name: 'Elements with role="img" require alternate text',
    description: 'Ensures elements with role="img" have accessible names.',
    help: 'Elements with role="img" require an accessible name',
    wcagCriteria: ['1.1.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.TEXT_ALTERNATIVES,
    tags: ['wcag2a', 'wcag111', 'section508', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Add aria-label or aria-labelledby attribute.'
  },

  alt_text_should_not_be_repeated_as_text: {
    id: 'alt_text_should_not_be_repeated_as_text',
    fileName: 'accessibility_alt_text_should_not_be_repeated_as_text.xlsx',
    name: 'Alt text should not duplicate adjacent text',
    description: 'Ensures image alt text is not repeated as adjacent text.',
    help: 'Alternative text should not be the same as the text adjacent to the image',
    wcagCriteria: ['1.1.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.MINOR,
    category: RULE_CATEGORIES.TEXT_ALTERNATIVES,
    tags: ['wcag2a', 'wcag111'],
    aiFixable: true,
    fixSuggestion: 'Use unique alt text or set alt="" if the image is described by adjacent text.'
  },

  // ========================================
  // TIME-BASED MEDIA (1.2.x)
  // ========================================
  video_elements_require_track_for_captions: {
    id: 'video_elements_require_track_for_captions',
    fileName: 'accessibility_video_elements_require_track_for_captions.xlsx',
    name: 'Videos require captions track',
    description: 'Ensures <video> elements have a <track> for captions.',
    help: '<video> elements must have a <track> for captions',
    wcagCriteria: ['1.2.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.TIME_BASED_MEDIA,
    tags: ['wcag2a', 'wcag122', 'section508'],
    aiFixable: false,
    fixSuggestion: 'Add <track kind="captions" src="captions.vtt" srclang="en" label="English">.'
  },

  video_or_audio_elements_must_not_autoplay: {
    id: 'video_or_audio_elements_must_not_autoplay',
    fileName: 'accessibility_video_or_audio_elements_must_not_autoplay.xlsx',
    name: 'Audio/video must not autoplay',
    description: 'Ensures media does not autoplay without user control.',
    help: '<video> or <audio> elements must not autoplay audio for more than 3 seconds',
    wcagCriteria: ['1.4.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.TIME_BASED_MEDIA,
    tags: ['wcag2a', 'wcag142'],
    aiFixable: false,
    fixSuggestion: 'Remove autoplay attribute or add muted attribute.'
  },

  // ========================================
  // ADAPTABLE (1.3.x)
  // ========================================
  list_items_must_be_contained_in_list_elements: {
    id: 'list_items_must_be_contained_in_list_elements',
    fileName: 'accessibility_list_items_must_be_contained_in_list_elements.xlsx',
    name: 'List items must be in list containers',
    description: 'Ensures <li> elements are used semantically.',
    help: '<li> elements must be contained in a <ul> or <ol>',
    wcagCriteria: ['1.3.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ADAPTABLE,
    tags: ['wcag2a', 'wcag131'],
    aiFixable: false,
    fixSuggestion: 'Wrap <li> elements in <ul> or <ol>.'
  },

  lists_must_only_contain_li_content_elements: {
    id: 'lists_must_only_contain_li_content_elements',
    fileName: 'accessibility_lists_must_only_contain_li_content_elements.xlsx',
    name: 'Lists must only contain list items',
    description: 'Ensures <ul> and <ol> elements only contain <li>, <script> or <template>.',
    help: '<ul> and <ol> must only directly contain <li> elements',
    wcagCriteria: ['1.3.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ADAPTABLE,
    tags: ['wcag2a', 'wcag131'],
    aiFixable: false,
    fixSuggestion: 'Move non-<li> content inside <li> elements or outside the list.'
  },

  dl_must_only_have_ordered_dt_dd_groups: {
    id: 'dl_must_only_have_ordered_dt_dd_groups',
    fileName: 'accessibility_dl_must_only_have_ordered_dt_dd_groups.xlsx',
    name: 'Definition lists must be properly structured',
    description: 'Ensures <dl> elements are structured correctly.',
    help: '<dl> elements must only directly contain properly-ordered <dt> and <dd> groups',
    wcagCriteria: ['1.3.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ADAPTABLE,
    tags: ['wcag2a', 'wcag131'],
    aiFixable: false,
    fixSuggestion: 'Ensure <dl> contains <dt>/<dd> pairs in correct order.'
  },

  dt_dd_elements_must_be_contained_by_dl: {
    id: 'dt_dd_elements_must_be_contained_by_dl',
    fileName: 'accessibility_dt_dd_elements_must_be_contained_by_dl.xlsx',
    name: 'DT/DD must be in definition list',
    description: 'Ensures <dt> and <dd> elements are contained by a <dl>.',
    help: '<dt> and <dd> elements must be contained by a <dl>',
    wcagCriteria: ['1.3.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ADAPTABLE,
    tags: ['wcag2a', 'wcag131'],
    aiFixable: false,
    fixSuggestion: 'Wrap <dt>/<dd> elements in a <dl>.'
  },

  table_headers_require_discernible_text: {
    id: 'table_headers_require_discernible_text',
    fileName: 'accessibility_table_headers_require_discernible_text.xlsx',
    name: 'Table headers must have text',
    description: 'Ensures table headers have discernible text.',
    help: 'Table header cells must not be empty',
    wcagCriteria: ['1.3.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ADAPTABLE,
    tags: ['wcag2a', 'wcag131', 'section508'],
    aiFixable: true,
    fixSuggestion: 'Add text content to empty <th> elements.'
  },

  th_element_requires_associated_data_cells: {
    id: 'th_element_requires_associated_data_cells',
    fileName: 'accessibility_th_element_requires_associated_data_cells.xlsx',
    name: 'Table headers must have data cells',
    description: 'Ensures table headers are associated with data cells.',
    help: '<th> elements must have data cells they describe',
    wcagCriteria: ['1.3.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ADAPTABLE,
    tags: ['wcag2a', 'wcag131'],
    aiFixable: false,
    fixSuggestion: 'Ensure each <th> has associated <td> cells or use scope attribute.'
  },

  scope_attribute_should_be_used_correctly_on_tables: {
    id: 'scope_attribute_should_be_used_correctly_on_tables',
    fileName: 'accessibility_scope_attribute_should_be_used_correctly_on_tables.xlsx',
    name: 'Scope attribute must be valid',
    description: 'Ensures the scope attribute is used correctly on tables.',
    help: 'scope attribute should be used correctly',
    wcagCriteria: ['1.3.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.ADAPTABLE,
    tags: ['wcag2a', 'wcag131'],
    aiFixable: false,
    fixSuggestion: 'Use scope="row" or scope="col" appropriately on <th> elements.'
  },

  autocomplete_attribute_must_be_used_correctly: {
    id: 'autocomplete_attribute_must_be_used_correctly',
    fileName: 'accessibility_autocomplete_attribute_must_be_used_correctly.xlsx',
    name: 'Autocomplete must be valid',
    description: 'Ensures the autocomplete attribute is correct and suitable for the form field.',
    help: 'autocomplete attribute must be used correctly',
    wcagCriteria: ['1.3.5'],
    wcagLevel: 'AA',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ADAPTABLE,
    tags: ['wcag21aa', 'wcag135'],
    aiFixable: true,
    fixSuggestion: 'Use valid autocomplete values like "name", "email", "tel", etc.'
  },

  all_page_content_must_be_contained_by_landmarks: {
    id: 'all_page_content_must_be_contained_by_landmarks',
    fileName: 'accessibility_all_page_content_must_be_contained_by_landmarks.xlsx',
    name: 'Content must be in landmarks',
    description: 'Ensures all page content is contained by landmarks.',
    help: 'All page content should be contained by landmarks',
    wcagCriteria: ['1.3.6'],
    wcagLevel: 'AAA',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.LANDMARKS,
    tags: ['wcag2aaa', 'wcag136', 'best-practice'],
    aiFixable: false,
    fixSuggestion: 'Wrap content in semantic elements like <main>, <nav>, <header>, <footer>, <aside>.'
  },

  landmarks_require_unique_role_or_accessible_name: {
    id: 'landmarks_require_unique_role_or_accessible_name',
    fileName: 'accessibility_landmarks_require_unique_role_or_accessible_name.xlsx',
    name: 'Landmarks must be unique',
    description: 'Ensures landmarks have unique roles or accessible names.',
    help: 'Landmarks should have a unique role or accessible name',
    wcagCriteria: ['1.3.6'],
    wcagLevel: 'AAA',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.LANDMARKS,
    tags: ['wcag2aaa', 'wcag136', 'best-practice'],
    aiFixable: true,
    fixSuggestion: 'Add aria-label to distinguish duplicate landmark roles.'
  },

  // ========================================
  // DISTINGUISHABLE (1.4.x)
  // ========================================
  text_requires_higher_color_contrast_ratio: {
    id: 'text_requires_higher_color_contrast_ratio',
    fileName: 'accessibility_text_requires_higher_color_contrast_ratio.xlsx',
    name: 'Color contrast (AA)',
    description: 'Ensures text has sufficient color contrast.',
    help: 'Elements must have sufficient color contrast (4.5:1 for normal text, 3:1 for large text)',
    wcagCriteria: ['1.4.3'],
    wcagLevel: 'AA',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.DISTINGUISHABLE,
    tags: ['wcag2aa', 'wcag143', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Adjust text or background color to achieve at least 4.5:1 contrast ratio.'
  },

  text_requires_higher_color_contrast_to_background: {
    id: 'text_requires_higher_color_contrast_to_background',
    fileName: 'accessibility_text_requires_higher_color_contrast_to_background.xlsx',
    name: 'Color contrast (AAA)',
    description: 'Ensures text has enhanced color contrast.',
    help: 'Elements must have enhanced color contrast (7:1 for normal text, 4.5:1 for large text)',
    wcagCriteria: ['1.4.6'],
    wcagLevel: 'AAA',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.DISTINGUISHABLE,
    tags: ['wcag2aaa', 'wcag146'],
    aiFixable: true,
    fixSuggestion: 'Adjust colors to achieve at least 7:1 contrast ratio.'
  },

  meta_viewport_zoom_scaling_disabled: {
    id: 'meta_viewport_zoom_scaling_disabled',
    fileName: 'accessibility_meta_viewport_zoom_scaling_disabled.xlsx',
    name: 'Zoom must not be disabled',
    description: 'Ensures that zooming and scaling are not disabled.',
    help: 'Zooming and scaling must not be disabled',
    wcagCriteria: ['1.4.4'],
    wcagLevel: 'AA',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.DISTINGUISHABLE,
    tags: ['wcag2aa', 'wcag144', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Remove user-scalable=no and maximum-scale restrictions from viewport meta tag.'
  },

  meta_viewport_should_allow_zoom_scale_up_to_500_: {
    id: 'meta_viewport_should_allow_zoom_scale_up_to_500_',
    fileName: 'accessibility_meta_viewport_should_allow_zoom_scale_up_to_500_.xlsx',
    name: 'Viewport should allow 500% zoom',
    description: 'Ensures that the viewport allows text to be scaled to 500%.',
    help: 'Users should be able to zoom and scale the text up to 500%',
    wcagCriteria: ['1.4.4'],
    wcagLevel: 'AA',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.DISTINGUISHABLE,
    tags: ['wcag2aa', 'wcag144'],
    aiFixable: true,
    fixSuggestion: 'Set maximum-scale to at least 5 or remove the restriction entirely.'
  },

  inline_text_spacing_must_be_adjustable: {
    id: 'inline_text_spacing_must_be_adjustable',
    fileName: 'accessibility_inline_text_spacing_must_be_adjustable.xlsx',
    name: 'Text spacing must be adjustable',
    description: 'Ensures text spacing can be adjusted without loss of content.',
    help: 'Inline text spacing must be adjustable with custom stylesheets',
    wcagCriteria: ['1.4.12'],
    wcagLevel: 'AA',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.DISTINGUISHABLE,
    tags: ['wcag21aa', 'wcag1412'],
    aiFixable: false,
    fixSuggestion: 'Avoid fixed heights on text containers; use relative units for spacing.'
  },

  // ========================================
  // KEYBOARD ACCESSIBLE (2.1.x)
  // ========================================
  scrollable_region_requires_keyboard_access: {
    id: 'scrollable_region_requires_keyboard_access',
    fileName: 'accessibility_scrollable_region_requires_keyboard_access.xlsx',
    name: 'Scrollable regions need keyboard access',
    description: 'Ensures scrollable regions can be accessed with keyboard.',
    help: 'Scrollable region must have keyboard access',
    wcagCriteria: ['2.1.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.KEYBOARD,
    tags: ['wcag2a', 'wcag211'],
    aiFixable: false,
    fixSuggestion: 'Add tabindex="0" to scrollable containers.'
  },

  interactive_controls_must_not_be_nested: {
    id: 'interactive_controls_must_not_be_nested',
    fileName: 'accessibility_interactive_controls_must_not_be_nested.xlsx',
    name: 'Interactive controls cannot be nested',
    description: 'Ensures interactive controls are not nested.',
    help: 'Interactive controls must not be nested',
    wcagCriteria: ['2.1.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.KEYBOARD,
    tags: ['wcag2a', 'wcag211'],
    aiFixable: false,
    fixSuggestion: 'Remove nested interactive elements; use a single interactive parent.'
  },

  frames_with_focusable_content_must_not_use_tabindex_1: {
    id: 'frames_with_focusable_content_must_not_use_tabindex_1',
    fileName: 'accessibility_frames_with_focusable_content_must_not_use_tabindex_1.xlsx',
    name: 'Frames must not hide focusable content',
    description: 'Ensures frames with focusable content do not have tabindex=-1.',
    help: 'Frames with focusable content must not have tabindex="-1"',
    wcagCriteria: ['2.1.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.FRAMES,
    tags: ['wcag2a', 'wcag211'],
    aiFixable: true,
    fixSuggestion: 'Remove tabindex="-1" from frames containing focusable content.'
  },

  elements_must_not_have_tabindex_greater_than_zero: {
    id: 'elements_must_not_have_tabindex_greater_than_zero',
    fileName: 'accessibility_elements_must_not_have_tabindex_greater_than_zero.xlsx',
    name: 'Tabindex should not be positive',
    description: 'Ensures elements do not have positive tabindex values.',
    help: 'Elements should not have tabindex greater than zero',
    wcagCriteria: ['2.4.3'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.KEYBOARD,
    tags: ['wcag2a', 'wcag243', 'best-practice'],
    aiFixable: true,
    fixSuggestion: 'Use tabindex="0" or remove tabindex; rely on DOM order for focus sequence.'
  },

  // ========================================
  // TIMING (2.2.x)
  // ========================================
  timed_meta_refresh_must_not_exist: {
    id: 'timed_meta_refresh_must_not_exist',
    fileName: 'accessibility_timed_meta_refresh_must_not_exist.xlsx',
    name: 'No timed meta refresh',
    description: 'Ensures <meta http-equiv="refresh"> is not used with a time limit.',
    help: 'Timed refresh must not exist',
    wcagCriteria: ['2.2.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.TIMING,
    tags: ['wcag2a', 'wcag221'],
    aiFixable: true,
    fixSuggestion: 'Use JavaScript for redirects with user control, or server-side redirects.'
  },

  delayed_meta_refresh_must_not_be_used: {
    id: 'delayed_meta_refresh_must_not_be_used',
    fileName: 'accessibility_delayed_meta_refresh_must_not_be_used.xlsx',
    name: 'No delayed meta refresh',
    description: 'Ensures delayed meta refresh is not used.',
    help: 'Delayed refresh under 20 hours must not be used',
    wcagCriteria: ['2.2.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.TIMING,
    tags: ['wcag2a', 'wcag221'],
    aiFixable: true,
    fixSuggestion: 'Remove meta refresh or use server-side redirect.'
  },

  blink_elements_deprecated_must_not_be_used: {
    id: 'blink_elements_deprecated_must_not_be_used',
    fileName: 'accessibility_blink_elements_deprecated_must_not_be_used.xlsx',
    name: 'No blink element',
    description: 'Ensures <blink> elements are not used.',
    help: '<blink> element must not be used',
    wcagCriteria: ['2.2.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.TIMING,
    tags: ['wcag2a', 'wcag222', 'section508'],
    aiFixable: true,
    fixSuggestion: 'Remove <blink> element entirely.'
  },

  deprecated_marquee_element_must_not_be_used: {
    id: 'deprecated_marquee_element_must_not_be_used',
    fileName: 'accessibility_deprecated_marquee_element_must_not_be_used.xlsx',
    name: 'No marquee element',
    description: 'Ensures <marquee> elements are not used.',
    help: '<marquee> element must not be used',
    wcagCriteria: ['2.2.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.TIMING,
    tags: ['wcag2a', 'wcag222', 'section508'],
    aiFixable: true,
    fixSuggestion: 'Remove <marquee> element; use CSS animations with pause controls if needed.'
  },

  // ========================================
  // NAVIGATION (2.4.x)
  // ========================================
  page_requires_means_to_bypass_repeated_blocks: {
    id: 'page_requires_means_to_bypass_repeated_blocks',
    fileName: 'accessibility_page_requires_means_to_bypass_repeated_blocks.xlsx',
    name: 'Page needs skip link or landmarks',
    description: 'Ensures skip links or landmarks exist for bypassing repeated content.',
    help: 'Page must have means to bypass repeated blocks',
    wcagCriteria: ['2.4.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.NAVIGATION,
    tags: ['wcag2a', 'wcag241', 'section508'],
    aiFixable: false,
    fixSuggestion: 'Add a skip link at page start or use landmark roles (<main>, <nav>, etc.).'
  },

  skiplink_target_should_exist_be_focusable: {
    id: 'skiplink_target_should_exist_be_focusable',
    fileName: 'accessibility_skiplink_target_should_exist_be_focusable.xlsx',
    name: 'Skip link target must exist and be focusable',
    description: 'Ensures skip link targets exist and are focusable.',
    help: 'The skip-link target should exist and be focusable',
    wcagCriteria: ['2.4.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.NAVIGATION,
    tags: ['wcag2a', 'wcag241', 'best-practice'],
    aiFixable: false,
    fixSuggestion: 'Ensure skip link href points to valid ID; add tabindex="-1" to target if needed.'
  },

  page_must_contain_title: {
    id: 'page_must_contain_title',
    fileName: 'accessibility_page_must_contain_title.xlsx',
    name: 'Page must have title',
    description: 'Ensures the page has a title element.',
    help: 'Document must have a <title> element',
    wcagCriteria: ['2.4.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.NAVIGATION,
    tags: ['wcag2a', 'wcag242', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Add a descriptive <title> element in the <head>.'
  },

  links_require_discernible_text: {
    id: 'links_require_discernible_text',
    fileName: 'accessibility_links_require_discernible_text.xlsx',
    name: 'Links must have discernible text',
    description: 'Ensures links have discernible text.',
    help: 'Links must have discernible text',
    wcagCriteria: ['2.4.4'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.NAVIGATION,
    tags: ['wcag2a', 'wcag244', 'wcag412', 'section508', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Add text content, aria-label, or aria-labelledby to the link.'
  },

  links_must_be_distinguishable: {
    id: 'links_must_be_distinguishable',
    fileName: 'accessibility_links_must_be_distinguishable.xlsx',
    name: 'Links must be visually distinguishable',
    description: 'Ensures links are distinguishable without relying on color alone.',
    help: 'Links must be distinguishable from surrounding text',
    wcagCriteria: ['2.4.4'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.MINOR,
    category: RULE_CATEGORIES.NAVIGATION,
    tags: ['wcag2a', 'wcag244'],
    aiFixable: false,
    fixSuggestion: 'Use underline or other non-color visual indicator for links.'
  },

  headings_should_not_be_empty: {
    id: 'headings_should_not_be_empty',
    fileName: 'accessibility_headings_should_not_be_empty.xlsx',
    name: 'Headings must not be empty',
    description: 'Ensures headings have discernible text.',
    help: 'Headings should not be empty',
    wcagCriteria: ['2.4.6'],
    wcagLevel: 'AA',
    impact: IMPACT_LEVELS.MINOR,
    category: RULE_CATEGORIES.NAVIGATION,
    tags: ['wcag2aa', 'wcag246', 'best-practice'],
    aiFixable: true,
    fixSuggestion: 'Add descriptive text to empty headings or remove the heading element.'
  },

  page_must_contain_h1: {
    id: 'page_must_contain_h1',
    fileName: 'accessibility_page_must_contain_h1.xlsx',
    name: 'Page must have H1',
    description: 'Ensures page has a level-one heading.',
    help: 'Page should contain a level-one heading',
    wcagCriteria: ['2.4.6'],
    wcagLevel: 'AA',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.NAVIGATION,
    tags: ['wcag2aa', 'wcag246', 'best-practice'],
    aiFixable: true,
    fixSuggestion: 'Add an <h1> element with the main page heading.'
  },

  links_with_same_accessible_name: {
    id: 'links_with_same_accessible_name',
    fileName: 'accessibility_links_with_same_accessible_name.xlsx',
    name: 'Links with same name should have same destination',
    description: 'Ensures links with the same accessible name go to the same destination.',
    help: 'Links with the same accessible name should have the same URL',
    wcagCriteria: ['2.4.9'],
    wcagLevel: 'AAA',
    impact: IMPACT_LEVELS.MINOR,
    category: RULE_CATEGORIES.NAVIGATION,
    tags: ['wcag2aaa', 'wcag249'],
    aiFixable: false,
    fixSuggestion: 'Use unique link text for links with different destinations.'
  },

  heading_levels_should_only_increase_by_one: {
    id: 'heading_levels_should_only_increase_by_one',
    fileName: 'accessibility_heading_levels_should_only_increase_by_one.xlsx',
    name: 'Heading levels should not skip',
    description: 'Ensures the heading hierarchy is logical.',
    help: 'Heading levels should only increase by one',
    wcagCriteria: ['2.4.10'],
    wcagLevel: 'AAA',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.NAVIGATION,
    tags: ['wcag2aaa', 'wcag2410', 'best-practice'],
    aiFixable: false,
    fixSuggestion: 'Adjust heading levels to form logical hierarchy (h1 > h2 > h3, etc.).'
  },

  // ========================================
  // INPUT MODALITIES (2.5.x)
  // ========================================
  buttons_require_discernible_text: {
    id: 'buttons_require_discernible_text',
    fileName: 'accessibility_buttons_require_discernible_text.xlsx',
    name: 'Buttons must have discernible text',
    description: 'Ensures buttons have discernible text.',
    help: 'Buttons must have discernible text',
    wcagCriteria: ['2.5.3'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.INPUT_MODALITIES,
    tags: ['wcag2a', 'wcag253', 'wcag412', 'section508', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Add text content, aria-label, or aria-labelledby to the button.'
  },

  input_buttons_require_discernible_text: {
    id: 'input_buttons_require_discernible_text',
    fileName: 'accessibility_input_buttons_require_discernible_text.xlsx',
    name: 'Input buttons must have discernible text',
    description: 'Ensures input buttons have discernible text.',
    help: 'Input buttons must have discernible text',
    wcagCriteria: ['2.5.3'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.INPUT_MODALITIES,
    tags: ['wcag2a', 'wcag253', 'wcag412', 'section508'],
    aiFixable: true,
    fixSuggestion: 'Add value attribute or aria-label to input buttons.'
  },

  touch_targets_require_sufficient_size_spacing: {
    id: 'touch_targets_require_sufficient_size_spacing',
    fileName: 'accessibility_touch_targets_require_sufficient_size_spacing.xlsx',
    name: 'Touch targets must be large enough',
    description: 'Ensures touch targets have sufficient size and spacing.',
    help: 'Touch target must be at least 24 by 24 CSS pixels',
    wcagCriteria: ['2.5.8'],
    wcagLevel: 'AA',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.INPUT_MODALITIES,
    tags: ['wcag22aa', 'wcag258'],
    aiFixable: false,
    fixSuggestion: 'Increase button/link size to at least 24x24 CSS pixels or add spacing.'
  },

  // ========================================
  // READABLE (3.1.x)
  // ========================================
  html_element_requires_lang_attribute: {
    id: 'html_element_requires_lang_attribute',
    fileName: 'accessibility_html_element_requires_lang_attribute.xlsx',
    name: 'HTML must have lang attribute',
    description: 'Ensures the <html> element has a lang attribute.',
    help: '<html> element must have a lang attribute',
    wcagCriteria: ['3.1.1'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.READABLE,
    tags: ['wcag2a', 'wcag311', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Add lang attribute to <html> element (e.g., lang="en").'
  },

  html_element_lang_attribute_value_must_be_valid: {
    id: 'html_element_lang_attribute_value_must_be_valid',
    fileName: 'accessibility_html_element_lang_attribute_value_must_be_valid.xlsx',
    name: 'Lang attribute must be valid',
    description: 'Ensures the lang attribute value is valid.',
    help: '<html> element lang attribute must have a valid value',
    wcagCriteria: ['3.1.2'],
    wcagLevel: 'AA',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.READABLE,
    tags: ['wcag2aa', 'wcag312', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Use valid BCP 47 language tag (e.g., "en", "en-US", "es").'
  },

  lang_attribute_requires_valid_value: {
    id: 'lang_attribute_requires_valid_value',
    fileName: 'accessibility_lang_attribute_requires_valid_value.xlsx',
    name: 'Element lang must be valid',
    description: 'Ensures lang attributes have valid values.',
    help: 'lang attribute must have a valid value',
    wcagCriteria: ['3.1.2'],
    wcagLevel: 'AA',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.READABLE,
    tags: ['wcag2aa', 'wcag312', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Use valid BCP 47 language tag.'
  },

  html_lang_xml_lang_value_should_match: {
    id: 'html_lang_xml_lang_value_should_match',
    fileName: 'accessibility_html_lang_xml_lang_value_should_match.xlsx',
    name: 'Lang and xml:lang must match',
    description: 'Ensures lang and xml:lang attributes have the same base language.',
    help: 'HTML lang and xml:lang should have matching values',
    wcagCriteria: ['3.1.2'],
    wcagLevel: 'AA',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.READABLE,
    tags: ['wcag2aa', 'wcag312', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Ensure lang and xml:lang attributes have the same language value.'
  },

  // ========================================
  // INPUT ASSISTANCE (3.3.x)
  // ========================================
  form_input_elements_require_labels: {
    id: 'form_input_elements_require_labels',
    fileName: 'accessibility_form_input_elements_require_labels.xlsx',
    name: 'Form inputs need labels',
    description: 'Ensures form input elements have labels.',
    help: 'Form elements must have labels',
    wcagCriteria: ['3.3.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.INPUT_ASSISTANCE,
    tags: ['wcag2a', 'wcag332', 'wcag131', 'section508', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Add <label for="id"> or aria-label/aria-labelledby to form inputs.'
  },

  form_elements_should_have_visible_label: {
    id: 'form_elements_should_have_visible_label',
    fileName: 'accessibility_form_elements_should_have_visible_label.xlsx',
    name: 'Form elements should have visible labels',
    description: 'Ensures form elements have visible labels.',
    help: 'Form elements should have a visible label',
    wcagCriteria: ['3.3.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.MINOR,
    category: RULE_CATEGORIES.INPUT_ASSISTANCE,
    tags: ['wcag2a', 'wcag332', 'best-practice'],
    aiFixable: true,
    fixSuggestion: 'Add visible <label> text; avoid relying only on placeholder text.'
  },

  select_element_requires_accessible_name: {
    id: 'select_element_requires_accessible_name',
    fileName: 'accessibility_select_element_requires_accessible_name.xlsx',
    name: 'Select elements need accessible name',
    description: 'Ensures select elements have an accessible name.',
    help: '<select> element must have an accessible name',
    wcagCriteria: ['3.3.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.INPUT_ASSISTANCE,
    tags: ['wcag2a', 'wcag332', 'wcag131', 'section508', 'ACT'],
    aiFixable: true,
    fixSuggestion: 'Add <label for="id"> or aria-label to the select element.'
  },

  form_field_must_not_have_multiple_label_elements: {
    id: 'form_field_must_not_have_multiple_label_elements',
    fileName: 'accessibility_form_field_must_not_have_multiple_label_elements.xlsx',
    name: 'Form fields should have single label',
    description: 'Ensures form fields do not have multiple label elements.',
    help: 'Form field must not have multiple label elements',
    wcagCriteria: ['3.3.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.INPUT_ASSISTANCE,
    tags: ['wcag2a', 'wcag332'],
    aiFixable: false,
    fixSuggestion: 'Remove duplicate labels; use single <label> with aria-describedby for extra text.'
  },

  // ========================================
  // ARIA (4.1.2)
  // ========================================
  aria_roles_require_valid_values: {
    id: 'aria_roles_require_valid_values',
    fileName: 'accessibility_aria_roles_require_valid_values.xlsx',
    name: 'ARIA roles must be valid',
    description: 'Ensures ARIA role attribute values are valid.',
    help: 'ARIA role must have a valid value',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Use valid ARIA role values from the WAI-ARIA specification.'
  },

  aria_attributes_require_valid_names: {
    id: 'aria_attributes_require_valid_names',
    fileName: 'accessibility_aria_attributes_require_valid_names.xlsx',
    name: 'ARIA attributes must have valid names',
    description: 'Ensures ARIA attribute names are valid.',
    help: 'ARIA attributes must have valid names',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Check spelling of ARIA attribute names (e.g., aria-label, aria-hidden).'
  },

  aria_attributes_require_valid_values: {
    id: 'aria_attributes_require_valid_values',
    fileName: 'accessibility_aria_attributes_require_valid_values.xlsx',
    name: 'ARIA attributes must have valid values',
    description: 'Ensures ARIA attribute values are valid.',
    help: 'ARIA attributes must have valid values',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Use valid values for ARIA attributes (e.g., aria-hidden="true" not "yes").'
  },

  required_aria_attributes_must_be_provided: {
    id: 'required_aria_attributes_must_be_provided',
    fileName: 'accessibility_required_aria_attributes_must_be_provided.xlsx',
    name: 'Required ARIA attributes must exist',
    description: 'Ensures required ARIA attributes are provided.',
    help: 'Required ARIA attributes must be provided',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Add required ARIA attributes for the role (e.g., role="slider" needs aria-valuenow).'
  },

  aria_attribute_must_be_used_as_specified_for_role: {
    id: 'aria_attribute_must_be_used_as_specified_for_role',
    fileName: 'accessibility_aria_attribute_must_be_used_as_specified_for_role.xlsx',
    name: 'ARIA attributes must match role',
    description: 'Ensures ARIA attributes are appropriate for the element role.',
    help: 'ARIA attributes must be used as specified for the element\'s role',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Use only ARIA attributes supported by the element\'s role.'
  },

  elements_must_only_use_permitted_aria_attributes: {
    id: 'elements_must_only_use_permitted_aria_attributes',
    fileName: 'accessibility_elements_must_only_use_permitted_aria_attributes.xlsx',
    name: 'Only use permitted ARIA attributes',
    description: 'Ensures elements use only permitted ARIA attributes.',
    help: 'Elements must only use permitted ARIA attributes',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Remove prohibited ARIA attributes for the role.'
  },

  elements_must_use_allowed_aria_attributes: {
    id: 'elements_must_use_allowed_aria_attributes',
    fileName: 'accessibility_elements_must_use_allowed_aria_attributes.xlsx',
    name: 'Use allowed ARIA attributes',
    description: 'Ensures ARIA attributes are allowed on the element.',
    help: 'Elements must use allowed ARIA attributes',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Use only ARIA attributes valid for the element type.'
  },

  aria_roles_must_be_contained_by_required_parent: {
    id: 'aria_roles_must_be_contained_by_required_parent',
    fileName: 'accessibility_aria_roles_must_be_contained_by_required_parent.xlsx',
    name: 'ARIA roles need required parent',
    description: 'Ensures ARIA roles are contained by their required parent roles.',
    help: 'Certain ARIA roles must be contained by specific parent roles',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: false,
    fixSuggestion: 'Wrap element in required parent role (e.g., role="listitem" needs role="list" parent).'
  },

  certain_aria_roles_must_contain_specific_children: {
    id: 'certain_aria_roles_must_contain_specific_children',
    fileName: 'accessibility_certain_aria_roles_must_contain_specific_children.xlsx',
    name: 'ARIA roles need required children',
    description: 'Ensures ARIA roles contain their required child roles.',
    help: 'Certain ARIA roles must contain specific children',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: false,
    fixSuggestion: 'Add required child roles (e.g., role="list" needs children with role="listitem").'
  },

  deprecated_aria_roles_must_not_be_used: {
    id: 'deprecated_aria_roles_must_not_be_used',
    fileName: 'accessibility_deprecated_aria_roles_must_not_be_used.xlsx',
    name: 'No deprecated ARIA roles',
    description: 'Ensures deprecated ARIA roles are not used.',
    help: 'Deprecated ARIA roles must not be used',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Replace deprecated ARIA roles with current alternatives.'
  },

  // ARIA Accessible Names
  aria_commands_require_accessible_name: {
    id: 'aria_commands_require_accessible_name',
    fileName: 'accessibility_aria_commands_require_accessible_name.xlsx',
    name: 'ARIA command widgets need names',
    description: 'Ensures ARIA command widgets have accessible names.',
    help: 'ARIA command roles must have an accessible name',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Add aria-label or aria-labelledby to command widgets.'
  },

  aria_input_fields_require_accessible_name: {
    id: 'aria_input_fields_require_accessible_name',
    fileName: 'accessibility_aria_input_fields_require_accessible_name.xlsx',
    name: 'ARIA input fields need names',
    description: 'Ensures ARIA input fields have accessible names.',
    help: 'ARIA input field roles must have an accessible name',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Add aria-label or aria-labelledby to ARIA input fields.'
  },

  aria_toggle_fields_require_accessible_name: {
    id: 'aria_toggle_fields_require_accessible_name',
    fileName: 'accessibility_aria_toggle_fields_require_accessible_name.xlsx',
    name: 'ARIA toggle fields need names',
    description: 'Ensures ARIA toggle fields have accessible names.',
    help: 'ARIA toggle fields must have an accessible name',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Add aria-label or aria-labelledby to toggle fields.'
  },

  aria_dialog_alertdialog_require_accessible_name: {
    id: 'aria_dialog_alertdialog_require_accessible_name',
    fileName: 'accessibility_aria_dialog_alertdialog_require_accessible_name.xlsx',
    name: 'Dialogs need accessible names',
    description: 'Ensures dialogs have accessible names.',
    help: 'ARIA dialog and alertdialog nodes must have an accessible name',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Add aria-label or aria-labelledby to dialog elements.'
  },

  aria_meter_nodes_require_accessible_name: {
    id: 'aria_meter_nodes_require_accessible_name',
    fileName: 'accessibility_aria_meter_nodes_require_accessible_name.xlsx',
    name: 'Meter elements need names',
    description: 'Ensures ARIA meter nodes have accessible names.',
    help: 'ARIA meter nodes must have an accessible name',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Add aria-label or aria-labelledby to meter elements.'
  },

  aria_progressbar_nodes_require_accessible_name: {
    id: 'aria_progressbar_nodes_require_accessible_name',
    fileName: 'accessibility_aria_progressbar_nodes_require_accessible_name.xlsx',
    name: 'Progress bars need names',
    description: 'Ensures ARIA progressbar nodes have accessible names.',
    help: 'ARIA progressbar nodes must have an accessible name',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Add aria-label or aria-labelledby to progress bars.'
  },

  aria_tooltip_nodes_require_accessible_name: {
    id: 'aria_tooltip_nodes_require_accessible_name',
    fileName: 'accessibility_aria_tooltip_nodes_require_accessible_name.xlsx',
    name: 'Tooltips need accessible names',
    description: 'Ensures ARIA tooltip nodes have accessible names.',
    help: 'ARIA tooltip nodes must have an accessible name',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Ensure tooltip has text content or aria-label.'
  },

  aria_treeitem_nodes_require_accessible_name: {
    id: 'aria_treeitem_nodes_require_accessible_name',
    fileName: 'accessibility_aria_treeitem_nodes_require_accessible_name.xlsx',
    name: 'Tree items need accessible names',
    description: 'Ensures ARIA treeitem nodes have accessible names.',
    help: 'ARIA treeitem nodes must have an accessible name',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Ensure tree items have text content or aria-label.'
  },

  summary_elements_require_discernible_text: {
    id: 'summary_elements_require_discernible_text',
    fileName: 'accessibility_summary_elements_require_discernible_text.xlsx',
    name: 'Summary elements need text',
    description: 'Ensures <summary> elements have discernible text.',
    help: '<summary> elements must have discernible text',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Add descriptive text to <summary> elements.'
  },

  // Frames
  frames_require_title_attribute: {
    id: 'frames_require_title_attribute',
    fileName: 'accessibility_frames_require_title_attribute.xlsx',
    name: 'Frames need titles',
    description: 'Ensures <frame> and <iframe> elements have a title attribute.',
    help: '<frame> and <iframe> elements must have a title attribute',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.FRAMES,
    tags: ['wcag2a', 'wcag412', 'section508'],
    aiFixable: true,
    fixSuggestion: 'Add title attribute describing the frame content.'
  },

  frames_require_unique_title_attribute: {
    id: 'frames_require_unique_title_attribute',
    fileName: 'accessibility_frames_require_unique_title_attribute.xlsx',
    name: 'Frame titles must be unique',
    description: 'Ensures frames have unique title attributes.',
    help: '<frame> and <iframe> elements must have unique title attributes',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.FRAMES,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Use unique, descriptive titles for each frame.'
  },

  ids_used_in_aria_labels_must_be_unique: {
    id: 'ids_used_in_aria_labels_must_be_unique',
    fileName: 'accessibility_ids_used_in_aria_labels_must_be_unique.xlsx',
    name: 'ARIA label IDs must be unique',
    description: 'Ensures IDs used in ARIA attributes are unique.',
    help: 'IDs used in ARIA attributes must be unique',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: false,
    fixSuggestion: 'Ensure all ID values on the page are unique.'
  },

  ariahidden_true_must_not_be_used_in_body: {
    id: 'ariahidden_true_must_not_be_used_in_body',
    fileName: 'accessibility_ariahidden_true_must_not_be_used_in_body.xlsx',
    name: 'aria-hidden not allowed on body',
    description: 'Ensures aria-hidden="true" is not on the document body.',
    help: 'aria-hidden="true" must not be present on the document body',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.CRITICAL,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: true,
    fixSuggestion: 'Remove aria-hidden from body element.'
  },

  ariahidden_elements_contains_focusable_elements: {
    id: 'ariahidden_elements_contains_focusable_elements',
    fileName: 'accessibility_ariahidden_elements_contains_focusable_elements.xlsx',
    name: 'aria-hidden cannot contain focusable elements',
    description: 'Ensures aria-hidden elements do not contain focusable elements.',
    help: 'aria-hidden="true" must not contain focusable elements',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: false,
    fixSuggestion: 'Add tabindex="-1" to focusable elements inside aria-hidden containers.'
  },

  role_text_should_have_no_focusable_descendants: {
    id: 'role_text_should_have_no_focusable_descendants',
    fileName: 'accessibility_role_text_should_have_no_focusable_descendants.xlsx',
    name: 'role="text" cannot have focusable descendants',
    description: 'Ensures elements with role="text" have no focusable descendants.',
    help: 'Elements with role="text" should have no focusable descendants',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: false,
    fixSuggestion: 'Remove role="text" or move focusable elements outside.'
  },

  ensure_elements_marked_presentational_are_ignored: {
    id: 'ensure_elements_marked_presentational_are_ignored',
    fileName: 'accessibility_ensure_elements_marked_presentational_are_ignored.xlsx',
    name: 'Presentational elements must be ignored',
    description: 'Ensures elements marked presentational are properly hidden from AT.',
    help: 'Elements marked role="presentation" or role="none" must be ignored',
    wcagCriteria: ['4.1.2'],
    wcagLevel: 'A',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.ARIA,
    tags: ['wcag2a', 'wcag412'],
    aiFixable: false,
    fixSuggestion: 'Ensure presentational elements have no accessible content.'
  },

  // ========================================
  // LANDMARK STRUCTURE (Best Practice)
  // ========================================
  page_requires_one_main_landmark: {
    id: 'page_requires_one_main_landmark',
    fileName: 'accessibility_page_requires_one_main_landmark.xlsx',
    name: 'Page needs one main landmark',
    description: 'Ensures the page has a main landmark.',
    help: 'Page must have one main landmark',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.LANDMARKS,
    tags: ['best-practice'],
    aiFixable: false,
    fixSuggestion: 'Add <main> element or role="main" to main content area.'
  },

  page_requires_at_most_one_main_landmark: {
    id: 'page_requires_at_most_one_main_landmark',
    fileName: 'accessibility_page_requires_at_most_one_main_landmark.xlsx',
    name: 'Only one main landmark allowed',
    description: 'Ensures the page has at most one main landmark.',
    help: 'Page should have at most one main landmark',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.LANDMARKS,
    tags: ['best-practice'],
    aiFixable: false,
    fixSuggestion: 'Remove duplicate <main> elements or role="main" attributes.'
  },

  main_landmark_must_not_be_in_another_landmark: {
    id: 'main_landmark_must_not_be_in_another_landmark',
    fileName: 'accessibility_main_landmark_must_not_be_in_another_landmark.xlsx',
    name: 'Main landmark must be top-level',
    description: 'Ensures main landmark is not nested in another landmark.',
    help: 'Main landmark must not be contained in another landmark',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.LANDMARKS,
    tags: ['best-practice'],
    aiFixable: false,
    fixSuggestion: 'Move <main> element outside of other landmarks.'
  },

  banner_landmark_must_not_be_in_another_landmark: {
    id: 'banner_landmark_must_not_be_in_another_landmark',
    fileName: 'accessibility_banner_landmark_must_not_be_in_another_landmark.xlsx',
    name: 'Banner must be top-level',
    description: 'Ensures banner landmark is not nested in another landmark.',
    help: 'Banner landmark must not be contained in another landmark',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.LANDMARKS,
    tags: ['best-practice'],
    aiFixable: false,
    fixSuggestion: 'Move <header> (banner) element to be a direct child of <body>.'
  },

  page_must_not_have_more_than_one_banner_landmark: {
    id: 'page_must_not_have_more_than_one_banner_landmark',
    fileName: 'accessibility_page_must_not_have_more_than_one_banner_landmark.xlsx',
    name: 'Only one banner landmark',
    description: 'Ensures page has at most one banner landmark.',
    help: 'Page should have at most one banner landmark',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.LANDMARKS,
    tags: ['best-practice'],
    aiFixable: false,
    fixSuggestion: 'Remove duplicate banner landmarks; use role="banner" only on page header.'
  },

  contentinfo_landmark_must_be_top_level_landmark: {
    id: 'contentinfo_landmark_must_be_top_level_landmark',
    fileName: 'accessibility_contentinfo_landmark_must_be_top_level_landmark.xlsx',
    name: 'Footer must be top-level',
    description: 'Ensures contentinfo landmark is not nested.',
    help: 'Contentinfo landmark must be top level',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.LANDMARKS,
    tags: ['best-practice'],
    aiFixable: false,
    fixSuggestion: 'Move <footer> element to be a direct child of <body>.'
  },

  page_must_not_have_multiple_contentinfo_landmarks: {
    id: 'page_must_not_have_multiple_contentinfo_landmarks',
    fileName: 'accessibility_page_must_not_have_multiple_contentinfo_landmarks.xlsx',
    name: 'Only one contentinfo landmark',
    description: 'Ensures page has at most one contentinfo landmark.',
    help: 'Page should have at most one contentinfo landmark',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.MODERATE,
    category: RULE_CATEGORIES.LANDMARKS,
    tags: ['best-practice'],
    aiFixable: false,
    fixSuggestion: 'Remove duplicate contentinfo landmarks.'
  },

  complementary_landmarks_asides_must_be_top_level: {
    id: 'complementary_landmarks_asides_must_be_top_level',
    fileName: 'accessibility_complementary_landmarks_asides_must_be_top_level.xlsx',
    name: 'Aside should be top-level',
    description: 'Ensures complementary landmarks are top level.',
    help: 'Aside should not be contained in another landmark',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.MINOR,
    category: RULE_CATEGORIES.LANDMARKS,
    tags: ['best-practice'],
    aiFixable: false,
    fixSuggestion: 'Move <aside> elements to be children of <body> or <main>.'
  },

  // ========================================
  // BEST PRACTICE (Non-WCAG)
  // ========================================
  accesskey_attribute_value_must_be_unique: {
    id: 'accesskey_attribute_value_must_be_unique',
    fileName: 'accessibility_accesskey_attribute_value_must_be_unique.xlsx',
    name: 'Accesskeys must be unique',
    description: 'Ensures accesskey attribute values are unique.',
    help: 'accesskey attribute value should be unique',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.BEST_PRACTICE,
    tags: ['best-practice'],
    aiFixable: false,
    fixSuggestion: 'Use unique accesskey values or remove duplicate accesskeys.'
  },

  serverside_image_maps_must_not_be_used: {
    id: 'serverside_image_maps_must_not_be_used',
    fileName: 'accessibility_serverside_image_maps_must_not_be_used.xlsx',
    name: 'No server-side image maps',
    description: 'Ensures server-side image maps are not used.',
    help: 'Server-side image maps should not be used',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.MINOR,
    category: RULE_CATEGORIES.BEST_PRACTICE,
    tags: ['best-practice', 'section508'],
    aiFixable: false,
    fixSuggestion: 'Replace server-side image maps with client-side image maps.'
  },

  table_with_identical_summary_caption_text: {
    id: 'table_with_identical_summary_caption_text',
    fileName: 'accessibility_table_with_identical_summary_caption_text.xlsx',
    name: 'Table summary and caption should differ',
    description: 'Ensures tables do not have identical summary and caption.',
    help: 'Tables should not have identical summary and caption',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.MINOR,
    category: RULE_CATEGORIES.BEST_PRACTICE,
    tags: ['best-practice'],
    aiFixable: false,
    fixSuggestion: 'Make summary and caption provide different information.'
  },

  table_header_attr_must_refer_to_cell_in_same_table: {
    id: 'table_header_attr_must_refer_to_cell_in_same_table',
    fileName: 'accessibility_table_header_attr_must_refer_to_cell_in_same_table.xlsx',
    name: 'Table headers attribute must reference same table',
    description: 'Ensures headers attribute references cells in the same table.',
    help: 'headers attribute must refer to cells within the same table',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.BEST_PRACTICE,
    tags: ['best-practice'],
    aiFixable: false,
    fixSuggestion: 'Update headers attribute to reference valid IDs within the same table.'
  },

  frames_should_be_tested_with_axecore: {
    id: 'frames_should_be_tested_with_axecore',
    fileName: 'accessibility_frames_should_be_tested_with_axecore.xlsx',
    name: 'Frames should be tested separately',
    description: 'Indicates frames should be tested with axe-core.',
    help: 'Frames should be tested with axe-core',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.MINOR,
    category: RULE_CATEGORIES.FRAMES,
    tags: ['best-practice'],
    aiFixable: false,
    fixSuggestion: 'Run accessibility testing on frame content separately.'
  },

  aria_role_should_be_appropriate_for_element: {
    id: 'aria_role_should_be_appropriate_for_element',
    fileName: 'accessibility_aria_role_should_be_appropriate_for_element.xlsx',
    name: 'ARIA role should be appropriate',
    description: 'Ensures ARIA roles are appropriate for the element.',
    help: 'ARIA role should be appropriate for the element',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.MINOR,
    category: RULE_CATEGORIES.BEST_PRACTICE,
    tags: ['best-practice'],
    aiFixable: false,
    fixSuggestion: 'Use semantic HTML elements instead of ARIA roles where possible.'
  },

  ariabraille_require_nonbraille_equivalent: {
    id: 'ariabraille_require_nonbraille_equivalent',
    fileName: 'accessibility_ariabraille_require_nonbraille_equivalent.xlsx',
    name: 'aria-braille needs non-braille equivalent',
    description: 'Ensures aria-braille attributes have non-braille equivalents.',
    help: 'aria-braille* attributes must have non-braille equivalent',
    wcagCriteria: [],
    wcagLevel: 'best-practice',
    impact: IMPACT_LEVELS.SERIOUS,
    category: RULE_CATEGORIES.BEST_PRACTICE,
    tags: ['best-practice'],
    aiFixable: false,
    fixSuggestion: 'Add corresponding aria-label or text content alongside aria-braille attributes.'
  }
};

/**
 * Get all rules for a specific WCAG criterion
 * @param {string} criterionId - WCAG criterion ID (e.g., "1.1.1")
 * @returns {Array} - Array of Axe rules for that criterion
 */
export function getRulesForCriterion(criterionId) {
  return Object.values(AXE_RULES).filter(rule =>
    rule.wcagCriteria && rule.wcagCriteria.includes(criterionId)
  );
}

/**
 * Get all rules at a specific WCAG level
 * @param {string} level - WCAG level (A, AA, AAA)
 * @returns {Array} - Array of Axe rules at that level
 */
export function getRulesByLevel(level) {
  return Object.values(AXE_RULES).filter(rule => rule.wcagLevel === level);
}

/**
 * Get all rules by category
 * @param {string} category - Rule category
 * @returns {Array} - Array of Axe rules in that category
 */
export function getRulesByCategory(category) {
  return Object.values(AXE_RULES).filter(rule => rule.category === category);
}

/**
 * Get all rules by impact level
 * @param {string} impact - Impact level
 * @returns {Array} - Array of Axe rules with that impact
 */
export function getRulesByImpact(impact) {
  return Object.values(AXE_RULES).filter(rule => rule.impact === impact);
}

/**
 * Get all AI-fixable rules
 * @returns {Array} - Array of rules that can be fixed by AI
 */
export function getAIFixableRules() {
  return Object.values(AXE_RULES).filter(rule => rule.aiFixable);
}

/**
 * Get rule by Screaming Frog file name
 * @param {string} fileName - The xlsx file name
 * @returns {Object|null} - The rule or null if not found
 */
export function getRuleByFileName(fileName) {
  return Object.values(AXE_RULES).find(rule => rule.fileName === fileName) || null;
}

/**
 * Get rule statistics
 * @returns {Object} - Statistics about rules
 */
export function getRuleStats() {
  const rules = Object.values(AXE_RULES);

  return {
    total: rules.length,
    byLevel: {
      A: getRulesByLevel('A').length,
      AA: getRulesByLevel('AA').length,
      AAA: getRulesByLevel('AAA').length,
      'best-practice': getRulesByLevel('best-practice').length
    },
    byImpact: {
      critical: getRulesByImpact(IMPACT_LEVELS.CRITICAL).length,
      serious: getRulesByImpact(IMPACT_LEVELS.SERIOUS).length,
      moderate: getRulesByImpact(IMPACT_LEVELS.MODERATE).length,
      minor: getRulesByImpact(IMPACT_LEVELS.MINOR).length
    },
    aiFixable: getAIFixableRules().length
  };
}

export default {
  IMPACT_LEVELS,
  RULE_CATEGORIES,
  AXE_RULES,
  getRulesForCriterion,
  getRulesByLevel,
  getRulesByCategory,
  getRulesByImpact,
  getAIFixableRules,
  getRuleByFileName,
  getRuleStats
};
