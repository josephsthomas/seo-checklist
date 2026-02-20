/**
 * E-045: Google AI Overview Optimization Checks
 * 5 new checks targeting Google AI Overview inclusion
 */

/**
 * Check for featured snippet-friendly structure
 */
function checkFeaturedSnippetStructure(extracted) {
  const headings = extracted?.headings || [];
  const bodyText = extracted?.textContent || '';

  // Look for question-answer patterns
  const questionHeadings = headings.filter(h =>
    /^(what|how|why|when|where|who|which|can|does|is|are|do)\b/i.test(h.text)
  );

  // Look for concise answer paragraphs (40-60 words after a heading)
  const hasConciseAnswers = bodyText.includes('. ') && extracted?.paragraphs?.some(p => {
    const text = typeof p === 'string' ? p : p?.text || '';
    const wordCount = text.split(/\s+/).length;
    return wordCount >= 30 && wordCount <= 80;
  });

  const pass = questionHeadings.length >= 1 && hasConciseAnswers;

  return {
    id: 'AIO-01',
    title: 'Featured Snippet Structure',
    category: 'AI-Specific Signals',
    status: pass ? 'pass' : 'warn',
    severity: 'high',
    description: 'Content should include question-format headings with concise answer paragraphs (40-60 words).',
    details: `Found ${questionHeadings.length} question headings. ${hasConciseAnswers ? 'Concise answer paragraphs detected.' : 'No concise answer paragraphs found.'}`,
    recommendation: 'Add H2/H3 headings phrased as questions with a direct 1-2 sentence answer immediately after.',
  };
}

/**
 * Check for FAQ schema presence
 */
function checkFAQSchema(extracted) {
  const structuredData = extracted?.structuredData || [];
  const hasFAQ = structuredData.some(sd => {
    const data = sd?.data || sd;
    return data['@type'] === 'FAQPage' || data['@type'] === 'Question';
  });

  return {
    id: 'AIO-02',
    title: 'FAQ Schema for AI Overviews',
    category: 'AI-Specific Signals',
    status: hasFAQ ? 'pass' : 'warn',
    severity: 'medium',
    description: 'FAQPage schema helps Google surface your Q&A content in AI Overviews.',
    details: hasFAQ ? 'FAQPage or Question schema detected.' : 'No FAQ schema found.',
    recommendation: 'Add FAQPage JSON-LD schema with mainEntity containing Question and acceptedAnswer pairs.',
  };
}

/**
 * Check for "People Also Ask" alignment
 */
function checkPAAAlignment(extracted) {
  const headings = extracted?.headings || [];
  const bodyText = extracted?.textContent || '';

  // Check for interrogative sentences in content
  const questionSentences = (bodyText.match(/[^.!?]*\?/g) || []).length;
  const questionHeadings = headings.filter(h => h.text.includes('?')).length;

  const hasGoodAlignment = questionHeadings >= 2 || questionSentences >= 3;

  return {
    id: 'AIO-03',
    title: 'People Also Ask Alignment',
    category: 'AI-Specific Signals',
    status: hasGoodAlignment ? 'pass' : 'warn',
    severity: 'medium',
    description: 'Content addressing common questions improves chances of AI Overview inclusion.',
    details: `Found ${questionHeadings} question headings and ${questionSentences} question sentences.`,
    recommendation: 'Include 3-5 question-format subheadings that address common user queries about your topic.',
  };
}

/**
 * Check for concise answer paragraphs
 */
function checkConciseAnswers(extracted) {
  const paragraphs = extracted?.paragraphs || [];
  const conciseParagraphs = paragraphs.filter(p => {
    const text = typeof p === 'string' ? p : p?.text || '';
    const wordCount = text.split(/\s+/).length;
    return wordCount >= 20 && wordCount <= 60;
  });

  const ratio = paragraphs.length > 0 ? conciseParagraphs.length / paragraphs.length : 0;
  const pass = ratio >= 0.3;

  return {
    id: 'AIO-04',
    title: 'Concise Answer Paragraphs',
    category: 'AI-Specific Signals',
    status: pass ? 'pass' : 'warn',
    severity: 'medium',
    description: 'Google AI Overviews prefer concise, self-contained answer paragraphs (20-60 words).',
    details: `${conciseParagraphs.length} of ${paragraphs.length} paragraphs are concise (${Math.round(ratio * 100)}%).`,
    recommendation: 'Structure key information as standalone paragraphs of 20-60 words that can be extracted independently.',
  };
}

/**
 * Check for knowledge panel readiness
 */
function checkKnowledgePanelReadiness(extracted) {
  const structuredData = extracted?.structuredData || [];
  const hasOrg = structuredData.some(sd => {
    const data = sd?.data || sd;
    return ['Organization', 'Person', 'LocalBusiness'].includes(data['@type']);
  });
  const hasSameAs = structuredData.some(sd => {
    const data = sd?.data || sd;
    return data.sameAs && (Array.isArray(data.sameAs) ? data.sameAs.length > 0 : true);
  });

  const pass = hasOrg && hasSameAs;

  return {
    id: 'AIO-05',
    title: 'Knowledge Panel Readiness',
    category: 'AI-Specific Signals',
    status: pass ? 'pass' : hasOrg ? 'warn' : 'fail',
    severity: 'low',
    description: 'Organization/Person schema with sameAs links improves knowledge panel eligibility.',
    details: `Organization schema: ${hasOrg ? 'Yes' : 'No'}. sameAs links: ${hasSameAs ? 'Yes' : 'No'}.`,
    recommendation: 'Add Organization or Person schema with sameAs links to Wikipedia, social profiles, and official pages.',
  };
}

/**
 * Run all Google AIO checks
 */
export function runGoogleAIOChecks(extracted) {
  return [
    checkFeaturedSnippetStructure(extracted),
    checkFAQSchema(extracted),
    checkPAAAlignment(extracted),
    checkConciseAnswers(extracted),
    checkKnowledgePanelReadiness(extracted),
  ];
}

export default runGoogleAIOChecks;
