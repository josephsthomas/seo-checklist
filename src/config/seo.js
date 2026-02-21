/**
 * SEO Configuration
 *
 * Centralized SEO metadata and schema markup for all public pages.
 * Used with react-helmet-async for dynamic meta tag management.
 */

const SITE_NAME = 'Content Strategy Portal';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://contentstrategyportal.com';
const SITE_DESCRIPTION = 'AI-powered SEO management platform with project planning, technical audits, accessibility compliance, and content optimization tools for agencies and enterprise teams.';

/**
 * Default meta tags applied to all pages
 */
export const defaultMeta = {
  siteName: SITE_NAME,
  siteUrl: SITE_URL,
  twitterHandle: '@csp_seo',
  ogType: 'website',
  ogImage: `${SITE_URL}/og-image.png`,
  themeColor: '#0066FF'
};

/**
 * Page-specific SEO configuration
 */
export const pageSEO = {
  home: {
    title: 'SEO Project Management & Technical Audits for Agencies | Content Strategy Portal',
    description: 'Manage SEO projects with 353-item checklists, run technical audits in minutes, ensure WCAG accessibility compliance. Free tier available for agencies managing multiple client sites.',
    canonical: '/',
    keywords: 'SEO project management, technical SEO audit, content checklist, SEO agency tools, WCAG compliance'
  },

  about: {
    title: 'About Us - AI-Powered SEO Tools for Modern Agencies | Content Strategy Portal',
    description: 'Content Strategy Portal unifies SEO project management, technical audits, accessibility analysis, and AI-powered content tools in one platform. Built for agencies and enterprise teams.',
    canonical: '/about',
    keywords: 'about content strategy portal, SEO platform, agency SEO tools'
  },

  features: {
    title: '6 SEO Tools: Content Planner, Audits, Accessibility & More | Content Strategy Portal',
    description: 'Explore our integrated SEO suite: Content Planner (353-item checklist), Technical Audit (31 categories), Accessibility Analyzer (WCAG 2.2), Meta Generator, Schema Generator, and Image Alt Generator.',
    canonical: '/features',
    keywords: 'SEO tools, content planner, technical audit tool, accessibility checker, meta generator, schema markup'
  },

  'features/planner': {
    title: 'Content Planner - 353-Item SEO Checklist & Project Management | CSP',
    description: 'Manage SEO projects with our comprehensive 353-item checklist. Track progress across 6 phases, collaborate with teams, and export branded PDF/Excel reports. Free tier available.',
    canonical: '/features/planner',
    keywords: 'SEO checklist, content planner, SEO project management, website launch checklist'
  },

  'features/audit': {
    title: 'Technical SEO Audit Tool - Analyze Screaming Frog Exports | CSP',
    description: 'Upload Screaming Frog exports and get AI-powered technical SEO recommendations in minutes. 31 audit categories, health scoring, and client-ready reports.',
    canonical: '/features/audit',
    keywords: 'technical SEO audit, Screaming Frog analysis, SEO audit tool, site health check'
  },

  'features/accessibility': {
    title: 'Accessibility Analyzer - WCAG 2.2 Compliance Scanning | CSP',
    description: 'Scan any URL for accessibility issues using 93 Axe-core rules. Get WCAG 2.2 compliance scores, AI-powered fix suggestions, and generate VPAT documentation.',
    canonical: '/features/accessibility',
    keywords: 'accessibility checker, WCAG 2.2, ADA compliance, accessibility audit, VPAT generator'
  },

  'features/meta-generator': {
    title: 'Meta Data Generator - AI-Powered Title & Description Optimization | CSP',
    description: 'Generate optimized title tags and meta descriptions using Claude AI. Preview SERP appearance, social cards, and bulk generate meta data for large sites.',
    canonical: '/features/meta-generator',
    keywords: 'meta description generator, title tag generator, SEO meta tags, SERP preview'
  },

  'features/schema-generator': {
    title: 'Schema Generator - JSON-LD Structured Data Markup | CSP',
    description: 'Generate valid JSON-LD structured data for 40+ schema types. Product, Article, FAQ, HowTo, Organization and more. Preview rich snippets before implementation.',
    canonical: '/features/schema-generator',
    keywords: 'schema markup generator, JSON-LD generator, structured data, rich snippets'
  },

  'features/image-alt': {
    title: 'Image Alt Text Generator - AI-Powered Accessibility | CSP',
    description: 'Generate descriptive, WCAG-compliant alt text for images using AI. Batch process up to 100 images, embed EXIF metadata, and improve image SEO.',
    canonical: '/features/image-alt',
    keywords: 'alt text generator, image accessibility, AI image description, bulk alt text'
  },

  'features/readability': {
    title: 'Readability Analyzer - Content Scoring & Optimization | CSP',
    description: 'Analyze content readability with Flesch-Kincaid, Gunning Fog, and other scoring algorithms. Get AI-powered suggestions to improve clarity and engagement.',
    canonical: '/features/readability',
    keywords: 'readability analyzer, content scoring, Flesch-Kincaid, readability checker, content optimization'
  },

  help: {
    title: 'Help Center - Guides, FAQ & Resources | Content Strategy Portal',
    description: 'Get help with Content Strategy Portal. Browse getting started guides, tool tutorials, FAQ, SEO glossary, and 200+ curated resources.',
    canonical: '/help',
    keywords: 'content strategy portal help, SEO tool guides, FAQ, support'
  },

  'help/getting-started': {
    title: 'Getting Started Guide - Set Up in 5 Minutes | Content Strategy Portal',
    description: 'Learn how to set up Content Strategy Portal in 5 minutes. Create your account, start your first project, run audits, and configure your workspace.',
    canonical: '/help/getting-started',
    keywords: 'getting started, setup guide, onboarding, quick start'
  },

  'help/resources': {
    title: 'Resource Library - 200+ SEO Guides & Templates | Content Strategy Portal',
    description: 'Browse our curated library of 200+ SEO resources including guides, templates, checklists, and best practices for technical SEO, content strategy, and more.',
    canonical: '/help/resources',
    keywords: 'SEO resources, SEO guides, SEO templates, content strategy resources'
  },

  'help/glossary': {
    title: 'SEO Glossary - 30+ Terms Explained Simply | Content Strategy Portal',
    description: 'Comprehensive SEO glossary with 30+ terms explained in plain language. From anchor text to XML sitemaps, understand the terminology that matters.',
    canonical: '/help/glossary',
    keywords: 'SEO glossary, SEO terms, SEO definitions, SEO terminology'
  },

  login: {
    title: 'Sign In | Content Strategy Portal',
    description: 'Sign in to your Content Strategy Portal account to access your SEO projects, audits, and tools.',
    canonical: '/login',
    noindex: true
  },

  register: {
    title: 'Create Free Account | Content Strategy Portal',
    description: 'Create your free Content Strategy Portal account. Access SEO project management, technical audits, accessibility tools, and AI-powered content optimization.',
    canonical: '/register',
    keywords: 'sign up, create account, free SEO tools'
  }
};

/**
 * Organization schema - used on About page and as default
 */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Content Strategy Portal',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: SITE_DESCRIPTION,
  foundingDate: '2024-01-01'
};

/**
 * Software application schema for feature pages
 */
export const softwareSchemas = {
  planner: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Content Planner',
    description: 'Comprehensive 353-item SEO checklist and project management tool for website launches and refreshes.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available'
    },
    featureList: [
      '353 content checklist items',
      'Multi-project dashboard',
      'Team collaboration',
      'PDF & Excel export',
      'Progress tracking',
      'Role-based permissions'
    ],
    screenshot: `${SITE_URL}/screenshots/planner.png`
  },

  audit: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Technical SEO Audit Tool',
    description: 'Upload Screaming Frog exports to generate comprehensive technical SEO audits with AI-powered recommendations.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      '31 audit categories',
      'AI-powered recommendations',
      'Health score calculation',
      'Client-ready reports',
      'Issue prioritization'
    ],
    screenshot: `${SITE_URL}/screenshots/audit.png`
  },

  accessibility: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Accessibility Analyzer',
    description: 'WCAG 2.2 compliance auditing with 93 Axe-core rules and AI-powered fix suggestions.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      'WCAG 2.2 compliance scoring',
      '93 Axe-core rules',
      'AI fix suggestions',
      'VPAT generation',
      'Multi-page scanning'
    ],
    screenshot: `${SITE_URL}/screenshots/accessibility.png`
  },

  'meta-generator': {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Meta Data Generator',
    description: 'AI-powered SEO metadata generation for titles, descriptions, OG tags, and Twitter Cards.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      'AI-powered generation',
      'SERP preview',
      'Social card preview',
      'Bulk generation',
      'Character validation'
    ],
    screenshot: `${SITE_URL}/screenshots/meta-generator.png`
  },

  'schema-generator': {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Schema Markup Generator',
    description: 'Generate valid JSON-LD structured data for 40+ schema types.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      '40+ schema types',
      'JSON-LD format',
      'Real-time validation',
      'Rich snippet preview',
      'Copy-ready output'
    ],
    screenshot: `${SITE_URL}/screenshots/schema-generator.png`
  },

  'image-alt': {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Image Alt Text Generator',
    description: 'AI-powered alt text generation for images with batch processing support.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      'AI image analysis',
      'Batch processing (100 images)',
      'WCAG compliance',
      'SEO optimization',
      'EXIF embedding'
    ],
    screenshot: `${SITE_URL}/screenshots/image-alt.png`
  }
};

/**
 * Generate breadcrumb schema for a page
 */
export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${item.url}` : undefined
    }))
  };
}

/**
 * FAQ schema generator
 */
export function generateFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * HowTo schema generator for Getting Started page
 */
export const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Getting Started with Content Strategy Portal',
  description: 'Learn how to set up and start using Content Strategy Portal in 5 minutes.',
  totalTime: 'PT5M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'USD',
    value: '0'
  },
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Create Your Account',
      text: 'Sign up for a free account using your email address. Verify your email to activate all features.',
      url: `${SITE_URL}/register`
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Set Up Your Workspace',
      text: 'Configure your profile, set your timezone, and customize notification preferences.',
      url: `${SITE_URL}/app/settings`
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Create Your First Project',
      text: 'Start a new project in Content Planner by entering client details and selecting relevant checklist items.',
      url: `${SITE_URL}/app/planner/new`
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Run Your First Audit',
      text: 'Upload a Screaming Frog export to the Technical Audit tool and receive AI-powered recommendations.',
      url: `${SITE_URL}/app/audit`
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Invite Team Members',
      text: 'Add team members and assign roles to collaborate on projects together.',
      url: `${SITE_URL}/app/team`
    },
    {
      '@type': 'HowToStep',
      position: 6,
      name: 'Explore Additional Tools',
      text: 'Discover the Accessibility Analyzer, Meta Generator, Schema Generator, and Image Alt tools.',
      url: `${SITE_URL}/features`
    }
  ]
};

export default {
  defaultMeta,
  pageSEO,
  organizationSchema,
  softwareSchemas,
  generateBreadcrumbSchema,
  generateFAQSchema,
  howToSchema
};
