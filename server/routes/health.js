/**
 * Health Check Route (E-038)
 * GET /health — structured health check, no auth required
 */

const express = require('express');
const { getConfiguredProviders } = require('../utils/providers');

const router = express.Router();
const startTime = Date.now();

router.get('/', (req, res) => {
  const providers = getConfiguredProviders();
  const memUsage = process.memoryUsage();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.round((Date.now() - startTime) / 1000),
    version: '1.0.0',
    services: {
      anthropic: providers.anthropic ? 'configured' : 'not_configured',
      openai: providers.openai ? 'configured' : 'not_configured',
      gemini: providers.gemini ? 'configured' : 'not_configured',
      firebase: process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'configured' : 'not_configured'
    },
    memory: {
      heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
      rssMB: Math.round(memUsage.rss / 1024 / 1024)
    }
  });
});

module.exports = router;
