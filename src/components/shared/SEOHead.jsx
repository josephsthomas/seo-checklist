/**
 * SEOHead Component
 *
 * Reusable component for managing page-specific SEO meta tags and schema markup.
 * Uses react-helmet-async for dynamic head management.
 */

import { Helmet } from 'react-helmet-async';
import { defaultMeta, pageSEO, generateBreadcrumbSchema } from '../../config/seo';

export default function SEOHead({
  pageKey,
  title,
  description,
  canonical,
  noindex = false,
  schema,
  breadcrumbs,
  children
}) {
  // Get page-specific SEO or use provided props
  const seo = pageKey ? pageSEO[pageKey] : {};
  const pageTitle = title || seo.title || `${defaultMeta.siteName}`;
  const pageDescription = description || seo.description || '';
  const pageCanonical = canonical || seo.canonical || '/';
  const fullCanonicalUrl = `${defaultMeta.siteUrl}${pageCanonical}`;

  // Generate breadcrumb schema if breadcrumbs provided
  const breadcrumbSchema = breadcrumbs ? generateBreadcrumbSchema(breadcrumbs) : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Robots */}
      {(noindex || seo.noindex) && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={defaultMeta.ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={defaultMeta.ogImage} />
      <meta property="og:site_name" content={defaultMeta.siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={defaultMeta.twitterHandle} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={defaultMeta.ogImage} />

      {/* Theme Color */}
      <meta name="theme-color" content={defaultMeta.themeColor} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}

      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Additional head elements */}
      {children}
    </Helmet>
  );
}

/**
 * Breadcrumb component for visual breadcrumbs with schema support
 */
export function Breadcrumbs({ items, className = '' }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-sm text-charcoal-500">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-charcoal-300" aria-hidden="true">/</span>
            )}
            {item.url ? (
              <a
                href={item.url}
                className="hover:text-primary-600 transition-colors"
              >
                {item.name}
              </a>
            ) : (
              <span className="text-charcoal-700 font-medium" aria-current="page">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
