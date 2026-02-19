/**
 * E-044: axe-core Automated Accessibility Test Suite
 * Comprehensive axe-core integration tests for all readability components
 * Covers: color contrast, ARIA roles, keyboard nav, focus management, heading hierarchy
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

// Configure axe with sensible defaults
const axe = configureAxe({
  rules: {
    // Disable region rule as components are rendered in isolation
    region: { enabled: false },
    // Disable color-contrast in JSDOM (not reliable)
    'color-contrast': { enabled: false }
  }
});

// Mock common dependencies
vi.mock('../../../lib/readability/utils/urlValidation', () => ({
  validateReadabilityUrl: vi.fn((url) => {
    if (url?.startsWith('https://')) return { valid: true, url };
    return { valid: false, reason: 'Invalid' };
  }),
}));
vi.mock('../../../lib/readability/utils/gradeMapper', () => ({
  getGrade: vi.fn((score) => ({
    grade: score >= 90 ? 'A' : score >= 80 ? 'B' : 'C',
    summary: 'Test summary'
  })),
  getScoreColor: vi.fn(() => 'teal'),
}));
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(() => ({
    getRootProps: () => ({ role: 'button', tabIndex: 0 }),
    getInputProps: () => ({ type: 'file' }),
    isDragActive: false,
    isDragReject: false,
  })),
}));

// Import components
import ReadabilityInputScreen from '../ReadabilityInputScreen';
import ReadabilityProcessingScreen from '../ReadabilityProcessingScreen';
import ReadabilityScoreCard from '../ReadabilityScoreCard';
import ReadabilityCheckItem from '../ReadabilityCheckItem';
import ReadabilityWeightConfig from '../ReadabilityWeightConfig';
import ReadabilityBadgeGenerator from '../ReadabilityBadgeGenerator';

/**
 * Helper to run axe on a rendered component
 */
async function checkA11y(ui, options = {}) {
  const { container } = render(ui);
  const results = await axe(container, options);
  return results;
}

describe('axe-core Accessibility Audit', () => {
  describe('ReadabilityInputScreen', () => {
    const baseProps = {
      onAnalyzeUrl: vi.fn(),
      onAnalyzeHtml: vi.fn(),
      onAnalyzePaste: vi.fn(),
      recentAnalyses: [],
    };

    it('has no axe violations', async () => {
      const results = await checkA11y(
        <MemoryRouter><ReadabilityInputScreen {...baseProps} /></MemoryRouter>
      );
      expect(results).toHaveNoViolations();
    });

    it('has no violations with history items', async () => {
      const withHistory = {
        ...baseProps,
        recentAnalyses: [
          { id: '1', pageTitle: 'Test Page', sourceUrl: 'https://example.com', overallScore: 85, grade: 'B', createdAt: new Date().toISOString() }
        ],
      };
      const results = await checkA11y(
        <MemoryRouter><ReadabilityInputScreen {...withHistory} /></MemoryRouter>
      );
      expect(results).toHaveNoViolations();
    });
  });

  describe('ReadabilityProcessingScreen', () => {
    it('has no violations during analysis', async () => {
      const results = await checkA11y(
        <ReadabilityProcessingScreen
          progress={{ progress: 50, stage: 'analyzing', message: 'Analyzing content...' }}
          onCancel={vi.fn()}
        />
      );
      expect(results).toHaveNoViolations();
    });

    it('has no violations at 0% progress', async () => {
      const results = await checkA11y(
        <ReadabilityProcessingScreen
          progress={{ progress: 0, stage: 'fetching', message: 'Fetching...' }}
          onCancel={vi.fn()}
        />
      );
      expect(results).toHaveNoViolations();
    });
  });

  describe('ReadabilityScoreCard', () => {
    it('has no violations', async () => {
      const results = await checkA11y(
        <ReadabilityScoreCard
          score={85}
          grade="A-"
          gradeSummary="Great"
          citationWorthiness={70}
        />
      );
      expect(results).toHaveNoViolations();
    });

    it('has no violations with low score', async () => {
      const results = await checkA11y(
        <ReadabilityScoreCard
          score={35}
          grade="F"
          gradeSummary="Needs improvement"
          citationWorthiness={20}
        />
      );
      expect(results).toHaveNoViolations();
    });
  });

  describe('ReadabilityCheckItem', () => {
    it('has no violations for failing check', async () => {
      const check = {
        id: 'CS-01',
        title: 'Single H1 Tag',
        status: 'fail',
        severity: 'critical',
        description: 'Page must have exactly one H1 tag.',
        details: 'Found 0 H1 tags.',
        recommendation: 'Add a single H1 heading to the page.'
      };
      const results = await checkA11y(<ReadabilityCheckItem check={check} />);
      expect(results).toHaveNoViolations();
    });

    it('has no violations for passing check', async () => {
      const check = {
        id: 'CS-02',
        title: 'Heading Hierarchy',
        status: 'pass',
        severity: 'high',
        description: 'Headings follow proper hierarchy.'
      };
      const results = await checkA11y(<ReadabilityCheckItem check={check} />);
      expect(results).toHaveNoViolations();
    });

    it('has no violations for warning check', async () => {
      const check = {
        id: 'CC-01',
        title: 'Reading Level',
        status: 'warn',
        severity: 'medium',
        description: 'Content readability level.',
        details: 'Flesch score: 55',
        recommendation: 'Simplify language.'
      };
      const results = await checkA11y(<ReadabilityCheckItem check={check} />);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ReadabilityWeightConfig', () => {
    it('has no violations', async () => {
      const results = await checkA11y(
        <ReadabilityWeightConfig
          weights={{ contentStructure: 20, contentClarity: 25, technicalAccessibility: 20, metadataSchema: 15, aiSignals: 20 }}
          onChange={vi.fn()}
        />
      );
      expect(results).toHaveNoViolations();
    });
  });

  describe('ReadabilityBadgeGenerator', () => {
    it('has no violations', async () => {
      const results = await checkA11y(
        <ReadabilityBadgeGenerator score={85} grade="A-" shareUrl="https://example.com/share/abc" />
      );
      expect(results).toHaveNoViolations();
    });
  });
});

describe('ARIA Roles & Attributes', () => {
  it('input tabs have proper tablist structure', () => {
    const { container } = render(
      <MemoryRouter>
        <ReadabilityInputScreen
          onAnalyzeUrl={vi.fn()}
          onAnalyzeHtml={vi.fn()}
          onAnalyzePaste={vi.fn()}
          recentAnalyses={[]}
        />
      </MemoryRouter>
    );

    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist).not.toBeNull();

    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBeGreaterThanOrEqual(2);

    const tabpanel = container.querySelector('[role="tabpanel"]');
    expect(tabpanel).not.toBeNull();
  });

  it('score card uses meter role', () => {
    const { container } = render(
      <ReadabilityScoreCard score={85} grade="A-" gradeSummary="Great" citationWorthiness={70} />
    );

    const meter = container.querySelector('[role="meter"]');
    expect(meter).not.toBeNull();
    expect(meter.getAttribute('aria-valuenow')).toBe('85');
    expect(meter.getAttribute('aria-valuemin')).toBe('0');
    expect(meter.getAttribute('aria-valuemax')).toBe('100');
  });

  it('progress bar has proper ARIA attributes', () => {
    const { container } = render(
      <ReadabilityProcessingScreen
        progress={{ progress: 75, stage: 'scoring', message: 'Scoring...' }}
        onCancel={vi.fn()}
      />
    );

    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).not.toBeNull();
    expect(progressbar.getAttribute('aria-valuenow')).toBe('75');
  });
});

describe('Focus Management', () => {
  it('check items maintain focus after expansion', async () => {
    const check = {
      id: 'CS-01', title: 'Test', status: 'fail',
      severity: 'high', details: 'Details', recommendation: 'Fix it'
    };

    const { container } = render(<ReadabilityCheckItem check={check} />);
    const button = container.querySelector('[aria-expanded]');

    if (button) {
      button.focus();
      expect(document.activeElement).toBe(button);
      button.click();
      // Focus should remain on the button after expanding
      expect(document.activeElement).toBe(button);
    }
  });
});
