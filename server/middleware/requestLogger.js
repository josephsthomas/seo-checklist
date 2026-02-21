/**
 * Structured Request Logger Middleware
 * Logs method, path, user, provider, status, and latency
 * Adds correlation IDs for request tracing
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Request logging middleware
 * Generates or propagates a correlation ID, sets it on the response,
 * and logs structured info on response finish
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  // Use incoming X-Request-Id header or generate a new UUID
  req.correlationId = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-Id', req.correlationId);

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.uid || 'anonymous';
    const provider = req.body?.provider || null;
    const task = req.body?.task || null;

    const logEntry = {
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId,
      ...(provider && { provider }),
      ...(task && { task })
    };

    // Use different log levels based on status
    if (res.statusCode >= 500) {
      console.error('[REQUEST]', JSON.stringify(logEntry));
    } else if (res.statusCode >= 400) {
      console.warn('[REQUEST]', JSON.stringify(logEntry));
    } else {
      console.log('[REQUEST]', JSON.stringify(logEntry));
    }
  });

  next();
}

module.exports = { requestLogger };
