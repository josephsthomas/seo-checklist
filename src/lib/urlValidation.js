/**
 * URL Validation Utility
 * Provides detailed URL validation with helpful error messages
 */

/**
 * Validate a URL with detailed checks and helpful error messages
 * @param {string} url - The URL to validate
 * @returns {{ valid: boolean, error?: string, warning?: string, normalized?: string }}
 */
export function validateUrl(url) {
  const trimmedUrl = url?.trim() || '';

  if (!trimmedUrl) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  // Check for common typos and issues
  if (trimmedUrl.includes(' ')) {
    return { valid: false, error: 'URL contains spaces - did you mean to remove them?' };
  }

  if (trimmedUrl.startsWith('htp://') || trimmedUrl.startsWith('htps://')) {
    return { valid: false, error: 'Possible typo in protocol - check http:// or https://' };
  }

  // Add protocol if missing
  const urlWithProtocol = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;

  try {
    const parsed = new URL(urlWithProtocol);

    // Check for valid hostname
    if (!parsed.hostname || parsed.hostname.length < 3) {
      return { valid: false, error: 'Invalid hostname' };
    }

    // Check for localhost/internal URLs (warning but allow)
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./)
    ) {
      return { valid: true, normalized: urlWithProtocol, warning: 'This appears to be a local/internal URL' };
    }

    // Check for valid TLD (basic check)
    const hostParts = parsed.hostname.split('.');
    if (hostParts.length < 2 || hostParts[hostParts.length - 1].length < 2) {
      return { valid: false, error: 'Invalid domain - missing or invalid TLD (e.g., .com, .org)' };
    }

    // Check for common invalid characters in domain
    if (parsed.hostname.match(/[<>'"\\]/)) {
      return { valid: false, error: 'Domain contains invalid characters' };
    }

    return { valid: true, normalized: urlWithProtocol };
  } catch {
    return { valid: false, error: 'Invalid URL format - please check the URL structure' };
  }
}

/**
 * Validate multiple URLs and return results
 * @param {string[]} urls - Array of URLs to validate
 * @returns {{ valid: string[], invalid: Array<{ url: string, error: string }>, warnings: Array<{ url: string, warning: string }> }}
 */
export function validateMultipleUrls(urls) {
  const valid = [];
  const invalid = [];
  const warnings = [];

  urls.forEach((url) => {
    const result = validateUrl(url);
    if (result.valid) {
      valid.push(result.normalized);
      if (result.warning) {
        warnings.push({ url: result.normalized, warning: result.warning });
      }
    } else {
      invalid.push({ url, error: result.error });
    }
  });

  return { valid, invalid, warnings };
}
