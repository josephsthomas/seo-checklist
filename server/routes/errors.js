/**
 * Client Error Reporting Endpoint
 * POST /api/errors — receives structured error reports from the frontend
 * No auth required (client may not have valid token during errors)
 * Rate limited by IP to prevent abuse
 */

const express = require('express');
const router = express.Router();

// Simple IP-based rate limiting for unauthenticated error reporting
const ERROR_RATE_LIMIT = 30;   // max 30 error reports per minute per IP
const WINDOW_MS = 60 * 1000;   // 1-minute window
const ipCounts = new Map();

// Clean up stale entries every 2 minutes
setInterval(() => {
  ipCounts.clear();
}, 2 * 60 * 1000);

function errorRateLimit(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const count = ipCounts.get(ip) || 0;

  if (count >= ERROR_RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many error reports', code: 'RATE_LIMITED' });
  }

  ipCounts.set(ip, count + 1);
  next();
}

router.post('/', errorRateLimit, (req, res) => {
  const { context, message, stack, metadata, timestamp, url } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Missing error message', code: 'INVALID_PAYLOAD' });
  }

  // Structured server-side log
  const logEntry = {
    level: 'error',
    source: 'client',
    context: context || 'unknown',
    message: String(message).slice(0, 2000),
    stack: stack ? String(stack).slice(0, 5000) : undefined,
    metadata: metadata || {},
    clientUrl: url || undefined,
    clientTimestamp: timestamp || undefined,
    receivedAt: new Date().toISOString(),
    ip: req.ip
  };

  console.error('[CLIENT_ERROR]', JSON.stringify(logEntry));

  res.status(202).json({ received: true });
});

module.exports = router;
