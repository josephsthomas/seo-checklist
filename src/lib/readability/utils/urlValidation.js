/**
 * URL Validation for AI Readability Checker
 * Extends base validation with SSRF protection
 */

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^0\.0\.0\.0/,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/
];

const BLOCKED_PROTOCOLS = ['ftp:', 'file:', 'javascript:', 'data:', 'vbscript:', 'blob:'];

/**
 * Validate URL for readability analysis
 * @param {string} input - URL string to validate
 * @returns {{ valid: boolean, url: string|null, reason: string|null }}
 */
export function validateReadabilityUrl(input) {
  const trimmed = (input || '').trim();

  if (!trimmed) {
    return { valid: false, url: null, reason: 'URL cannot be empty' };
  }

  if (trimmed.includes(' ')) {
    return { valid: false, url: null, reason: 'URL cannot contain spaces' };
  }

  // Auto-prepend https:// if no protocol
  let urlStr = trimmed;
  if (!/^https?:\/\//i.test(urlStr) && !urlStr.includes('://')) {
    urlStr = `https://${urlStr}`;
  }

  let parsed;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { valid: false, url: null, reason: 'Invalid URL format' };
  }

  // Block non-HTTP protocols
  if (BLOCKED_PROTOCOLS.includes(parsed.protocol)) {
    return { valid: false, url: null, reason: `Protocol "${parsed.protocol}" is not allowed. Only HTTP and HTTPS are supported.` };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, url: null, reason: `Protocol "${parsed.protocol}" is not supported. Use HTTP or HTTPS.` };
  }

  // Block localhost
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname === '0.0.0.0') {
    return { valid: false, url: null, reason: 'Local addresses are not allowed' };
  }

  // Block private IPs
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { valid: false, url: null, reason: 'Private IP addresses are not allowed' };
    }
  }

  // Basic hostname validation
  if (!parsed.hostname || parsed.hostname.length < 1) {
    return { valid: false, url: null, reason: 'Invalid hostname' };
  }

  // Check for valid TLD (at least 2 parts with valid TLD)
  const parts = parsed.hostname.split('.');
  // Allow IDN domains (which may have non-ASCII chars) and standard domains
  if (parts.length < 2) {
    return { valid: false, url: null, reason: 'Invalid domain format' };
  }

  const tld = parts[parts.length - 1];
  if (tld.length < 2) {
    return { valid: false, url: null, reason: 'Invalid top-level domain' };
  }

  // Block non-standard ports (only allow 80, 443, or default no port)
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    return { valid: false, url: null, reason: 'Non-standard ports are not allowed. Only ports 80 and 443 are supported.' };
  }

  return { valid: true, url: parsed.href, reason: null };
}

/**
 * Sanitize URL for display (truncate if too long)
 * @param {string} url
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeUrlForDisplay(url, maxLength = 80) {
  if (!url) return '';
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}

/**
 * Extract domain from URL for display
 * @param {string} url
 * @returns {string}
 */
export function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return url;
  }
}

/**
 * Generate URL slug for filenames
 * @param {string} url
 * @returns {string}
 */
export function urlToSlug(url) {
  try {
    const parsed = new URL(url);
    const slug = (parsed.hostname + parsed.pathname)
      .replace(/^www\./, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    return slug.substring(0, 60);
  } catch {
    return 'unknown';
  }
}
