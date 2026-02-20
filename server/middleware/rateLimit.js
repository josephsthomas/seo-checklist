/**
 * Tiered Rate Limiting Middleware (E-035)
 * In-memory sliding window rate limiter keyed by user UID
 * Tiers: free (10/hr), pro (30/hr), enterprise (200/hr)
 */

const TIER_LIMITS = {
  free: 10,
  pro: 30,
  enterprise: 200
};

const WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Map<userId, number[]> — stores request timestamps
const userRequests = new Map();

/**
 * Get rate limit for a user tier
 */
function getLimit(tier) {
  return TIER_LIMITS[tier] || TIER_LIMITS.free;
}

/**
 * Clean up expired timestamps for a user
 */
function pruneTimestamps(timestamps) {
  const cutoff = Date.now() - WINDOW_MS;
  return timestamps.filter(t => t > cutoff);
}

/**
 * Rate limit middleware
 * Requires req.user.uid (from auth middleware) and req.user.plan
 */
function rateLimitMiddleware(req, res, next) {
  // Use user UID if authenticated, otherwise fall back to IP-based limiting
  const userId = req.user?.uid || `ip:${req.ip || req.connection?.remoteAddress || 'unknown'}`;
  const tier = req.user?.plan || 'free';
  const limit = getLimit(tier);
  const now = Date.now();

  // Get or create timestamp array for this user
  let timestamps = userRequests.get(userId) || [];
  timestamps = pruneTimestamps(timestamps);

  if (timestamps.length >= limit) {
    // Calculate when the oldest request in the window expires
    const oldestInWindow = timestamps[0];
    const retryAfterMs = (oldestInWindow + WINDOW_MS) - now;
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);

    res.set('Retry-After', String(Math.max(1, retryAfterSec)));
    res.set('X-RateLimit-Limit', String(limit));
    res.set('X-RateLimit-Remaining', '0');
    res.set('X-RateLimit-Reset', String(Math.ceil((oldestInWindow + WINDOW_MS) / 1000)));

    return res.status(429).json({
      error: `Rate limit exceeded. Your ${tier} plan allows ${limit} requests per hour. Please retry after ${retryAfterSec} seconds.`,
      code: 'RATE_LIMITED',
      retryAfter: retryAfterSec,
      limit,
      tier
    });
  }

  // Record this request
  timestamps.push(now);
  userRequests.set(userId, timestamps);

  // Set rate limit headers
  res.set('X-RateLimit-Limit', String(limit));
  res.set('X-RateLimit-Remaining', String(limit - timestamps.length));

  next();
}

/**
 * Periodic cleanup of stale entries (run every 5 minutes)
 */
function startCleanupInterval() {
  setInterval(() => {
    const cutoff = Date.now() - WINDOW_MS;
    for (const [userId, timestamps] of userRequests.entries()) {
      const pruned = timestamps.filter(t => t > cutoff);
      if (pruned.length === 0) {
        userRequests.delete(userId);
      } else {
        userRequests.set(userId, pruned);
      }
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

// Start cleanup on module load
startCleanupInterval();

/**
 * Consume N rate-limit tokens at once (for batch requests)
 * @param {string} userId - User UID or IP key
 * @param {string} tier - User tier (free, pro, enterprise)
 * @param {number} count - Number of tokens to consume
 * @returns {null|Object} null if OK, or { message, retryAfter, limit } on limit exceeded
 */
function consumeRateLimitTokens(userId, tier, count) {
  const limit = getLimit(tier);
  const now = Date.now();

  let timestamps = userRequests.get(userId) || [];
  timestamps = pruneTimestamps(timestamps);

  if (timestamps.length + count > limit) {
    const retryAfterMs = timestamps.length > 0
      ? (timestamps[0] + WINDOW_MS) - now
      : WINDOW_MS;
    const retryAfterSec = Math.ceil(Math.max(1, retryAfterMs / 1000));

    return {
      message: `Rate limit exceeded. Your ${tier} plan allows ${limit} requests per hour. Batch of ${count} would exceed remaining ${limit - timestamps.length} slots.`,
      retryAfter: retryAfterSec,
      limit
    };
  }

  // Record all tokens
  for (let i = 0; i < count; i++) {
    timestamps.push(now);
  }
  userRequests.set(userId, timestamps);

  return null;
}

module.exports = { rateLimitMiddleware, consumeRateLimitTokens, TIER_LIMITS };
