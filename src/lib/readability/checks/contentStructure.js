/**
 * Content Structure Checks (CS-01 to CS-10)
 * Category weight: 20%
 */

const CATEGORY = 'Content Structure';

export function checkSingleH1(parsedData) {
  const h1Count = parsedData.headings.filter(h => h.level === 1).length;
  return {
    id: 'CS-01', category: CATEGORY, title: 'Single H1 present',
    status: h1Count === 1 ? 'pass' : 'fail',
    severity: 'high',
    details: h1Count === 0 ? 'No H1 tag found.' : h1Count === 1 ? 'Exactly one H1 tag found.' : `Found ${h1Count} H1 tags. There should be exactly one.`,
    affectedElements: h1Count !== 1 ? parsedData.headings.filter(h => h.level === 1).map(h => h.text) : [],
    recommendation: h1Count === 0 ? 'Add a single H1 tag that clearly describes the page content.' : h1Count > 1 ? 'Remove extra H1 tags. Use H2-H6 for subsections.' : ''
  };
}

export function checkHeadingHierarchy(parsedData) {
  const headings = parsedData.headings;
  if (headings.length === 0) {
    return {
      id: 'CS-02', category: CATEGORY, title: 'Heading hierarchy valid',
      status: 'fail', severity: 'high',
      details: 'No headings found on the page.',
      affectedElements: [],
      recommendation: 'Add headings (H1-H6) to create a clear content hierarchy.'
    };
  }
  const skipped = [];
  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1].level;
    const curr = headings[i].level;
    if (curr > prev + 1) {
      skipped.push(`H${prev} to H${curr} (skipped H${prev + 1}): "${headings[i].text}"`);
    }
  }
  return {
    id: 'CS-02', category: CATEGORY, title: 'Heading hierarchy valid',
    status: skipped.length === 0 ? 'pass' : 'fail',
    severity: 'high',
    details: skipped.length === 0 ? 'Heading hierarchy is valid with no skipped levels.' : `Found ${skipped.length} skipped heading level(s).`,
    affectedElements: skipped,
    recommendation: skipped.length > 0 ? 'Fix heading hierarchy to avoid skipped levels. Each heading should be at most one level deeper than the previous.' : ''
  };
}

export function checkSemanticHtml(parsedData) {
  const sem = parsedData.semanticElements;
  const present = [];
  const missing = [];
  if (sem.hasMain) present.push('main'); else missing.push('main');
  if (sem.hasArticle) present.push('article'); else missing.push('article');
  if (sem.hasSection) present.push('section'); else missing.push('section');
  const hasAny = present.length > 0;
  return {
    id: 'CS-03', category: CATEGORY, title: 'Semantic HTML usage',
    status: present.length >= 2 ? 'pass' : hasAny ? 'warn' : 'fail',
    severity: 'medium',
    details: hasAny ? `Semantic elements found: ${present.join(', ')}. Missing: ${missing.join(', ')}.` : 'No semantic HTML elements (article, section, main) found.',
    affectedElements: missing,
    recommendation: missing.length > 0 ? `Add <${missing[0]}> element to wrap your main content area.` : ''
  };
}

export function checkContentSections(parsedData) {
  const headings = parsedData.headings;
  const sectionCount = headings.filter(h => h.level >= 2).length;
  return {
    id: 'CS-04', category: CATEGORY, title: 'Content organized in sections',
    status: sectionCount >= 3 ? 'pass' : sectionCount >= 1 ? 'warn' : 'fail',
    severity: 'medium',
    details: sectionCount === 0 ? 'No section headings (H2+) found.' : `Found ${sectionCount} section heading(s).`,
    affectedElements: [],
    recommendation: sectionCount < 3 ? 'Break content into logical sections with descriptive H2/H3 headings.' : ''
  };
}

export function checkListUsage(parsedData) {
  const total = parsedData.lists.orderedLists + parsedData.lists.unorderedLists;
  return {
    id: 'CS-05', category: CATEGORY, title: 'Lists used for enumerable content',
    status: total > 0 ? 'pass' : 'warn',
    severity: 'low',
    details: total > 0 ? `Found ${total} list(s) (${parsedData.lists.orderedLists} ordered, ${parsedData.lists.unorderedLists} unordered).` : 'No lists found. Consider using lists for enumerable content.',
    affectedElements: [],
    recommendation: total === 0 ? 'Use <ul> or <ol> to present lists of items, steps, or options.' : ''
  };
}

export function checkTableStructure(parsedData) {
  const tables = parsedData.tables;
  if (tables.length === 0) {
    return {
      id: 'CS-06', category: CATEGORY, title: 'Tables have proper headers',
      status: 'na', severity: 'medium',
      details: 'No tables found on the page.',
      affectedElements: [], recommendation: ''
    };
  }
  const badTables = tables.filter(t => !t.hasThead && !t.hasTh);
  return {
    id: 'CS-06', category: CATEGORY, title: 'Tables have proper headers',
    status: badTables.length === 0 ? 'pass' : 'fail',
    severity: 'medium',
    details: badTables.length === 0 ? `All ${tables.length} table(s) have proper headers.` : `${badTables.length} of ${tables.length} table(s) missing thead/th elements.`,
    affectedElements: badTables.map((_, i) => `Table ${i + 1} missing headers`),
    recommendation: badTables.length > 0 ? 'Add <thead> and <th> elements to all data tables for proper structure.' : ''
  };
}

export function checkParagraphLength(parsedData) {
  const paragraphs = parsedData.paragraphs;
  if (paragraphs.length === 0) {
    return {
      id: 'CS-07', category: CATEGORY, title: 'Paragraph length reasonable',
      status: 'warn', severity: 'low',
      details: 'No paragraphs found.',
      affectedElements: [], recommendation: 'Wrap content in <p> tags.'
    };
  }
  const totalWords = paragraphs.reduce((s, p) => s + p.wordCount, 0);
  const avgLen = Math.round(totalWords / paragraphs.length);
  const longParas = paragraphs.filter(p => p.wordCount > 150);
  return {
    id: 'CS-07', category: CATEGORY, title: 'Paragraph length reasonable',
    status: avgLen <= 150 ? 'pass' : 'warn',
    severity: 'low',
    details: `Average paragraph length: ${avgLen} words. ${longParas.length} paragraph(s) exceed 150 words.`,
    affectedElements: longParas.slice(0, 3).map(p => `${p.text.substring(0, 60)}... (${p.wordCount} words)`),
    recommendation: avgLen > 150 ? 'Break long paragraphs into shorter ones (aim for under 150 words each).' : ''
  };
}

export function checkContentDepth(parsedData) {
  const wordCount = parsedData.wordCount;
  return {
    id: 'CS-08', category: CATEGORY, title: 'Content depth sufficient',
    status: wordCount >= 300 ? 'pass' : wordCount >= 100 ? 'warn' : 'fail',
    severity: 'medium',
    details: `Main content contains ${wordCount} words.`,
    affectedElements: [],
    recommendation: wordCount < 300 ? `Add more content. Current word count (${wordCount}) is below the recommended minimum of 300 words.` : ''
  };
}

export function checkReadingOrder(parsedData) {
  const headings = parsedData.headings;
  if (headings.length < 2) {
    return {
      id: 'CS-09', category: CATEGORY, title: 'Logical reading order',
      status: headings.length === 0 ? 'warn' : 'pass', severity: 'medium',
      details: headings.length === 0 ? 'No headings to assess reading order.' : 'Single heading present.',
      affectedElements: [], recommendation: ''
    };
  }
  let issues = 0;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level > headings[i - 1].level + 1) {
      issues++;
    }
  }
  return {
    id: 'CS-09', category: CATEGORY, title: 'Logical reading order',
    status: issues === 0 ? 'pass' : 'warn',
    severity: 'medium',
    details: issues === 0 ? 'Content follows a logical reading order.' : `${issues} heading order issue(s) detected.`,
    affectedElements: [],
    recommendation: issues > 0 ? 'Ensure headings follow a logical top-to-bottom reading order.' : ''
  };
}

export function checkContentDuplication(parsedData) {
  const paragraphs = parsedData.paragraphs;
  if (paragraphs.length < 2) {
    return {
      id: 'CS-10', category: CATEGORY, title: 'No content duplication',
      status: 'pass', severity: 'low',
      details: 'Not enough content to check for duplication.',
      affectedElements: [], recommendation: ''
    };
  }
  const seen = new Map();
  const duplicates = [];
  paragraphs.forEach(p => {
    if (p.wordCount < 10) return;
    const normalized = p.text.toLowerCase().trim();
    if (seen.has(normalized)) {
      duplicates.push(p.text.substring(0, 80) + '...');
    } else {
      seen.set(normalized, true);
    }
  });
  return {
    id: 'CS-10', category: CATEGORY, title: 'No content duplication',
    status: duplicates.length === 0 ? 'pass' : 'warn',
    severity: 'low',
    details: duplicates.length === 0 ? 'No duplicate content blocks detected.' : `Found ${duplicates.length} duplicate content block(s).`,
    affectedElements: duplicates.slice(0, 3),
    recommendation: duplicates.length > 0 ? 'Remove or consolidate duplicate content blocks.' : ''
  };
}

export function runContentStructureChecks(parsedData) {
  return [
    checkSingleH1(parsedData),
    checkHeadingHierarchy(parsedData),
    checkSemanticHtml(parsedData),
    checkContentSections(parsedData),
    checkListUsage(parsedData),
    checkTableStructure(parsedData),
    checkParagraphLength(parsedData),
    checkContentDepth(parsedData),
    checkReadingOrder(parsedData),
    checkContentDuplication(parsedData)
  ];
}

export default runContentStructureChecks;
