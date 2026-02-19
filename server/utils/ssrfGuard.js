/**
 * SSRF Protection for server-side URL fetching
 * Validates URLs and resolved IPs to prevent Server-Side Request Forgery
 */

const dns = require('dns');
const { URL } = require('url');

// Private/reserved IPv4 ranges
const PRIVATE_IPV4_RANGES = [
  { start: '0.0.0.0', end: '0.255.255.255' },       // Current network
  { start: '10.0.0.0', end: '10.255.255.255' },      // Class A private
  { start: '100.64.0.0', end: '100.127.255.255' },   // Carrier-grade NAT
  { start: '127.0.0.0', end: '127.255.255.255' },    // Loopback
  { start: '169.254.0.0', end: '169.254.255.255' },  // Link-local / cloud metadata
  { start: '172.16.0.0', end: '172.31.255.255' },    // Class B private
  { start: '192.0.0.0', end: '192.0.0.255' },        // IETF protocol assignments
  { start: '192.168.0.0', end: '192.168.255.255' },  // Class C private
  { start: '198.18.0.0', end: '198.19.255.255' },    // Benchmarking
];

function ipToLong(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isPrivateIPv4(ip) {
  const ipLong = ipToLong(ip);
  return PRIVATE_IPV4_RANGES.some(range =>
    ipLong >= ipToLong(range.start) && ipLong <= ipToLong(range.end)
  );
}

function isPrivateIPv6(ip) {
  const lower = ip.toLowerCase();
  return (
    lower === '::1' ||
    lower.startsWith('fe80:') ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower === '::' ||
    lower.startsWith('::ffff:127.') ||
    lower.startsWith('::ffff:10.') ||
    lower.startsWith('::ffff:192.168.') ||
    lower.startsWith('::ffff:172.16.') ||
    lower.startsWith('::ffff:169.254.')
  );
}

/**
 * Validate a URL for safe server-side fetching
 * @param {string} urlString - URL to validate
 * @returns {{ valid: boolean, url?: URL, error?: string }}
 */
function validateUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Protocol check
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: `Blocked protocol: ${parsed.protocol}` };
  }

  // Port check — allow only 80 and 443 (or default)
  const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
  if (port !== 80 && port !== 443) {
    return { valid: false, error: `Blocked non-standard port: ${port}` };
  }

  // Hostname checks
  const hostname = parsed.hostname.toLowerCase();

  if (hostname === 'localhost' || hostname === '0.0.0.0') {
    return { valid: false, error: 'Blocked: localhost' };
  }

  // Check if hostname is a raw IP address
  const ipv4Match = hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/);
  if (ipv4Match && isPrivateIPv4(hostname)) {
    return { valid: false, error: 'Blocked: private IP address' };
  }

  if (hostname.startsWith('[') || isPrivateIPv6(hostname)) {
    return { valid: false, error: 'Blocked: private IPv6 address' };
  }

  return { valid: true, url: parsed };
}

/**
 * Resolve hostname and validate resolved IPs are not private
 * @param {string} hostname
 * @returns {Promise<{ safe: boolean, addresses?: string[], error?: string }>}
 */
async function validateResolvedIps(hostname) {
  try {
    const addresses = await dns.promises.resolve4(hostname);

    for (const addr of addresses) {
      if (isPrivateIPv4(addr)) {
        return { safe: false, error: `DNS resolved to private IP: ${addr}` };
      }
    }

    return { safe: true, addresses };
  } catch (err) {
    // Try IPv6 if v4 fails
    try {
      const addresses6 = await dns.promises.resolve6(hostname);
      for (const addr of addresses6) {
        if (isPrivateIPv6(addr)) {
          return { safe: false, error: `DNS resolved to private IPv6: ${addr}` };
        }
      }
      return { safe: true, addresses: addresses6 };
    } catch {
      return { safe: false, error: `DNS resolution failed: ${err.message}` };
    }
  }
}

/**
 * Full SSRF validation: URL format + DNS resolution
 * @param {string} urlString
 * @returns {Promise<{ safe: boolean, url?: URL, error?: string }>}
 */
async function validateUrlForFetch(urlString) {
  const urlCheck = validateUrl(urlString);
  if (!urlCheck.valid) {
    return { safe: false, error: urlCheck.error };
  }

  const dnsCheck = await validateResolvedIps(urlCheck.url.hostname);
  if (!dnsCheck.safe) {
    return { safe: false, error: dnsCheck.error };
  }

  return { safe: true, url: urlCheck.url };
}

module.exports = { validateUrl, validateResolvedIps, validateUrlForFetch };
