/**
 * Content Strategy Portal — AI Proxy Server
 *
 * Production-ready Express server that:
 * - Routes AI requests to Claude (Anthropic), GPT-4o (OpenAI), and Gemini (Google)
 * - Fetches URL content for the AI Readability Checker
 * - Validates Firebase authentication tokens
 * - Enforces tiered rate limiting (Free: 10/hr, Pro: 30/hr, Enterprise: 200/hr)
 * - Provides a structured health check endpoint
 *
 * Endpoints:
 *   GET  /health          — Health check (no auth)
 *   POST /                — AI request (legacy format: { prompt, maxTokens })
 *   POST /api/ai          — AI request (multi-provider: { provider, model, content })
 *   POST /api/fetch-url   — Fetch URL content for readability analysis
 *   POST /api/errors      — Client error reporting (no auth)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { authMiddleware } = require('./middleware/auth');
const { rateLimitMiddleware } = require('./middleware/rateLimit');
const { requestLogger } = require('./middleware/requestLogger');
const healthRouter = require('./routes/health');
const aiRouter = require('./routes/ai');
const aiBatchRouter = require('./routes/aiBatch');
const fetchRouter = require('./routes/fetch');
const errorsRouter = require('./routes/errors');

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Security & parsing middleware
// ---------------------------------------------------------------------------

app.use(helmet({
  crossOriginResourcePolicy: false // Allow cross-origin requests from frontend
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// HTTP access logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('short'));
}

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ---------------------------------------------------------------------------
// Business-level request logging
// ---------------------------------------------------------------------------

app.use(requestLogger);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check — no auth required
app.use('/health', healthRouter);

// Client error reporting — no auth required, IP rate limited
app.post('/api/errors', errorsRouter);

// Protected API routes — auth + rate limiting
app.post('/api/fetch-url', authMiddleware, rateLimitMiddleware, fetchRouter);
app.post('/api/ai', authMiddleware, rateLimitMiddleware, aiRouter);

// Batch AI endpoint — auth only (rate limiting handled internally per-token)
app.post('/api/ai/batch', authMiddleware, aiBatchRouter);

// Legacy route: POST / (used by suggestionService, imageAltService, etc.)
// Also used by readability llmPreview.js and aiAnalyzer.js (they POST to VITE_AI_PROXY_URL directly)
app.post('/', authMiddleware, rateLimitMiddleware, aiRouter);

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.path}`,
    code: 'NOT_FOUND'
  });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------

app.use((err, req, res, _next) => {
  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Origin not allowed by CORS policy',
      code: 'CORS_BLOCKED'
    });
  }

  // JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      code: 'INVALID_JSON'
    });
  }

  // Request too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request body exceeds 10MB limit',
      code: 'PAYLOAD_TOO_LARGE'
    });
  }

  console.error('[ERROR]', err.message, err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║  Content Strategy Portal — AI Proxy Server   ║
╠══════════════════════════════════════════════╣
║  Port:     ${String(PORT).padEnd(33)}║
║  Env:      ${String(process.env.NODE_ENV || 'development').padEnd(33)}║
║  CORS:     ${String(allowedOrigins.length + ' origin(s)').padEnd(33)}║
╚══════════════════════════════════════════════╝

Endpoints:
  GET  /health          Health check
  POST /                AI request (legacy format)
  POST /api/ai          AI request (multi-provider)
  POST /api/ai/batch    AI batch request (multiple providers)
  POST /api/fetch-url   Fetch URL content
  POST /api/errors      Client error reporting
`);
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

function shutdown(signal) {
  console.log(`[SHUTDOWN] ${signal} received. Closing HTTP server...`);
  server.close(() => {
    console.log('[SHUTDOWN] HTTP server closed. Exiting.');
    process.exit(0);
  });

  // Force exit after 30 seconds if connections don't close
  setTimeout(() => {
    console.error('[SHUTDOWN] Forced exit after 30s timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
