/**
 * Content Clarity Checks (CC-01 to CC-10)
 * Category weight: 25%
 */

import { fleschReadingEase, averageSentenceLength, detectPassiveVoice, detectJargon, splitSentences, countWords } from '../utils/textAnalysis.js';

const CATEGORY = 'Content Clarity';

export function checkFleschReadability(parsedData) {
  const score = fleschReadingEase(parsedData.textContent, parsedData.language);
  if (score === null) {
    return {
      id: 'CC-01', category: CATEGORY, title: 'Flesch Reading Ease',
      status: 'na', severity: 'high',
      details: parsedData.language ? `Flesch Reading Ease is only calculated for English content. Detected language: ${parsedData.language}.` : 'Unable to determine content language. Flesch score skipped.',
      affectedElements: [], recommendation: ''
    };
  }
  return {
    id: 'CC-01', category: CATEGORY, title: 'Flesch Reading Ease',
    status: score >= 60 ? 'pass' : score >= 40 ? 'warn' : 'fail',
    severity: 'high',
    details: `Flesch Reading Ease score: ${score}. ${score >= 60 ? 'Content is easy to read.' : score >= 40 ? 'Content is somewhat difficult to read.' : 'Content is difficult to read.'}`,
    affectedElements: [],
    recommendation: score < 60 ? 'Simplify sentence structure and use shorter, more common words to improve readability.' : ''
  };
}

export function checkSentenceLength(parsedData) {
  const avg = averageSentenceLength(parsedData.textContent);
  return {
    id: 'CC-02', category: CATEGORY, title: 'Average sentence length',
    status: avg <= 20 ? 'pass' : avg <= 25 ? 'warn' : 'fail',
    severity: 'medium',
    details: `Average sentence length: ${avg} words.`,
    affectedElements: [],
    recommendation: avg > 20 ? 'Shorten sentences to an average of 20 words or fewer. Break complex sentences into simpler ones.' : ''
  };
}

export function checkPassiveVoice(parsedData) {
  const result = detectPassiveVoice(parsedData.textContent);
  return {
    id: 'CC-03', category: CATEGORY, title: 'Passive voice usage',
    status: result.percentage < 15 ? 'pass' : result.percentage < 25 ? 'warn' : 'fail',
    severity: 'low',
    details: `${result.percentage}% of sentences use passive voice (${result.count} of ${result.total}).`,
    affectedElements: result.passiveSentences.slice(0, 3),
    recommendation: result.percentage >= 15 ? 'Rewrite passive voice sentences to active voice for clearer, more direct communication.' : ''
  };
}

export function checkJargonDensity(parsedData) {
  const result = detectJargon(parsedData.textContent);
  return {
    id: 'CC-04', category: CATEGORY, title: 'Jargon/acronym density',
    status: result.jargonDensity < 5 ? 'pass' : result.jargonDensity < 10 ? 'warn' : 'fail',
    severity: 'medium',
    details: `Jargon density: ${result.jargonDensity}%. Found ${result.count} unexplained acronym(s).`,
    affectedElements: result.acronyms.slice(0, 5),
    recommendation: result.jargonDensity >= 5 ? 'Define acronyms on first use and minimize technical jargon for broader accessibility.' : ''
  };
}

export function checkAnswerReadyContent(parsedData) {
  const text = parsedData.textContent;
  const sentences = splitSentences(text);
  const qaPatterns = [
    /\bwhat\s+is\b/i, /\bhow\s+to\b/i, /\bwhy\s+(do|does|is|are|should)\b/i,
    /\bwhen\s+(should|do|does|is|are)\b/i, /\?\s*$/
  ];
  const definitionPatterns = [
    /\bis\s+(a|an|the)\b/i, /\brefers\s+to\b/i, /\bmeans\b/i,
    /\bdefined\s+as\b/i, /\bis\s+when\b/i
  ];

  const questionSentences = sentences.filter(s => qaPatterns.some(p => p.test(s)));
  const definitionSentences = sentences.filter(s => definitionPatterns.some(p => p.test(s)));
  const answerReady = questionSentences.length + definitionSentences.length;

  return {
    id: 'CC-05', category: CATEGORY, title: 'Answer-ready content',
    status: answerReady >= 3 ? 'pass' : answerReady >= 1 ? 'warn' : 'fail',
    severity: 'high',
    details: `Found ${questionSentences.length} Q&A pattern(s) and ${definitionSentences.length} definition pattern(s).`,
    affectedElements: [],
    recommendation: answerReady < 3 ? 'Include direct answers to common questions. Use "What is...", "How to..." patterns that AI models can easily extract.' : ''
  };
}

export function checkTopicSentences(parsedData) {
  const headings = parsedData.headings.filter(h => h.level >= 2);
  if (headings.length === 0) {
    return {
      id: 'CC-06', category: CATEGORY, title: 'Topic sentence presence',
      status: 'warn', severity: 'medium',
      details: 'No section headings found to evaluate topic sentences.',
      affectedElements: [], recommendation: 'Add section headings followed by clear topic sentences.'
    };
  }
  const paragraphs = parsedData.paragraphs;
  const hasParagraphs = paragraphs.length >= headings.length;
  return {
    id: 'CC-06', category: CATEGORY, title: 'Topic sentence presence',
    status: hasParagraphs ? 'pass' : 'warn',
    severity: 'medium',
    details: hasParagraphs ? 'Sections appear to have topic sentences.' : 'Some sections may lack clear topic sentences.',
    affectedElements: [],
    recommendation: !hasParagraphs ? 'Begin each section with a clear topic sentence that summarizes the section content.' : ''
  };
}

export function checkConclusionPresent(parsedData) {
  const text = parsedData.textContent.toLowerCase();
  const headings = parsedData.headings;
  const conclusionPatterns = ['conclusion', 'summary', 'final thoughts', 'key takeaways', 'in conclusion', 'to summarize', 'wrapping up', 'bottom line'];

  const hasConclusionHeading = headings.some(h => conclusionPatterns.some(p => h.text.toLowerCase().includes(p)));
  const hasConclusionText = conclusionPatterns.some(p => text.includes(p));
  const hasConclusion = hasConclusionHeading || hasConclusionText;

  return {
    id: 'CC-07', category: CATEGORY, title: 'Conclusion/summary present',
    status: hasConclusion ? 'pass' : 'warn',
    severity: 'low',
    details: hasConclusion ? 'Content includes a conclusion or summary section.' : 'No clear conclusion or summary section detected.',
    affectedElements: [],
    recommendation: !hasConclusion ? 'Add a conclusion or summary section to wrap up key points.' : ''
  };
}

export function checkEntityClarity(parsedData) {
  const text = parsedData.textContent;
  const properNounPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const matches = text.match(properNounPattern) || [];
  const entityCounts = {};
  matches.forEach(m => {
    if (m.length > 2) entityCounts[m] = (entityCounts[m] || 0) + 1;
  });

  const frequentEntities = Object.entries(entityCounts).filter(([, c]) => c >= 3).map(([e]) => e);
  const firstThird = text.substring(0, Math.floor(text.length / 3));
  const undefinedEntities = frequentEntities.filter(e => !firstThird.includes(e));

  return {
    id: 'CC-08', category: CATEGORY, title: 'Entity clarity',
    status: undefinedEntities.length === 0 ? 'pass' : undefinedEntities.length <= 2 ? 'warn' : 'fail',
    severity: 'medium',
    details: `Found ${frequentEntities.length} key entities. ${undefinedEntities.length} not introduced early in the content.`,
    affectedElements: undefinedEntities.slice(0, 5),
    recommendation: undefinedEntities.length > 0 ? 'Introduce key entities early in the content with clear definitions or context.' : ''
  };
}

export function checkFactualAttribution(parsedData) {
  const text = parsedData.textContent;
  const links = parsedData.links;
  const externalLinks = links.filter(l => !l.isInternal);

  const claimPatterns = [/\baccording to\b/i, /\bresearch shows\b/i, /\bstudies\s+(show|indicate|suggest)\b/i, /\breported\b/i, /\bfound that\b/i, /\bdata\s+(shows|suggests|indicates)\b/i];
  const claims = claimPatterns.filter(p => p.test(text)).length;

  return {
    id: 'CC-09', category: CATEGORY, title: 'Factual claim attribution',
    status: externalLinks.length >= 2 || claims >= 2 ? 'pass' : externalLinks.length >= 1 || claims >= 1 ? 'warn' : 'fail',
    severity: 'medium',
    details: `Found ${externalLinks.length} external link(s) and ${claims} attribution pattern(s).`,
    affectedElements: [],
    recommendation: externalLinks.length < 2 ? 'Add citations and links to external sources to support factual claims.' : ''
  };
}

export function checkContentFreshness(parsedData) {
  const text = parsedData.textContent.toLowerCase();
  const freshnessPatterns = ['updated', 'last modified', 'as of', 'current', new Date().getFullYear().toString(), (new Date().getFullYear() - 1).toString()];
  const datePatterns = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s*\d{4}\b/i;

  const hasFreshnessLang = freshnessPatterns.some(p => text.includes(p));
  const hasDateRef = datePatterns.test(parsedData.textContent);
  const hasMeta = !!(parsedData.metadata.datePublished || parsedData.metadata.dateModified);

  return {
    id: 'CC-10', category: CATEGORY, title: 'Content freshness language',
    status: hasFreshnessLang || hasDateRef || hasMeta ? 'pass' : 'warn',
    severity: 'low',
    details: hasFreshnessLang || hasDateRef ? 'Content includes freshness indicators.' : hasMeta ? 'Date metadata present but no in-content freshness language.' : 'No freshness indicators found.',
    affectedElements: [],
    recommendation: !hasFreshnessLang && !hasDateRef ? 'Add date references or "last updated" language to signal content freshness.' : ''
  };
}

export function runContentClarityChecks(parsedData) {
  return [
    checkFleschReadability(parsedData),
    checkSentenceLength(parsedData),
    checkPassiveVoice(parsedData),
    checkJargonDensity(parsedData),
    checkAnswerReadyContent(parsedData),
    checkTopicSentences(parsedData),
    checkConclusionPresent(parsedData),
    checkEntityClarity(parsedData),
    checkFactualAttribution(parsedData),
    checkContentFreshness(parsedData)
  ];
}

export default runContentClarityChecks;
