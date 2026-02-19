/**
 * Structured Request Logger Middleware
 * Logs method, path, user, provider, status, and latency
 */

/**
 * Request logging middleware
 * Logs structured info on response finish
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.uid || 'anonymous';
    const provider = req.body?.provider || null;
    const task = req.body?.task || null;

    const logEntry = {
      timestamp: new Date().toISOString(),
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
