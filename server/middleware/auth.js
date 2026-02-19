/**
 * Firebase Auth Token Verification Middleware
 * Verifies Authorization: Bearer {token} header using Firebase Admin SDK
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) return;

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // GCP environments with Application Default Credentials
      admin.initializeApp();
    } else {
      console.warn('[AUTH] No Firebase credentials configured — auth verification disabled');
      return;
    }
    firebaseInitialized = true;
    console.log('[AUTH] Firebase Admin SDK initialized');
  } catch (err) {
    console.error('[AUTH] Failed to initialize Firebase Admin:', err.message);
  }
}

// Initialize on module load
initializeFirebase();

/**
 * Auth middleware — verifies Firebase ID token
 * Attaches req.user = { uid, email, plan } on success
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing or invalid Authorization header. Expected: Bearer {token}',
      code: 'AUTH_MISSING'
    });
  }

  const token = authHeader.substring(7);

  if (!firebaseInitialized) {
    // Firebase not configured — log warning but allow request through in dev
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AUTH] Firebase not configured — allowing request in development mode');
      req.user = { uid: 'dev-user', email: 'dev@localhost', plan: 'free' };
      return next();
    }
    return res.status(503).json({
      error: 'Authentication service unavailable',
      code: 'AUTH_UNAVAILABLE'
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      plan: decodedToken.plan || 'free',  // Custom claim for rate limit tier
      role: decodedToken.role || null
    };

    next();
  } catch (err) {
    const isExpired = err.code === 'auth/id-token-expired';
    return res.status(401).json({
      error: isExpired
        ? 'Authentication token expired. Please refresh and try again.'
        : 'Invalid authentication token.',
      code: isExpired ? 'AUTH_EXPIRED' : 'AUTH_INVALID'
    });
  }
}

module.exports = { authMiddleware };
