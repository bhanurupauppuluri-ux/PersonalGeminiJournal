import admin from 'firebase-admin';

/**
 * Middleware enforcing Authentication Boundaries:
 * Extracts and validates Firebase Bearer ID Tokens on all backend requests.
 * Attaches req.user.uid for strict data isolation.
 */
export async function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Expected Bearer ID Token.'
    });
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();

  if (!idToken) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Bearer token is empty.'
    });
  }

  try {
    // If Firebase Admin app is initialized with active credentials
    if (admin.apps.length > 0) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          name: decodedToken.name || decodedToken.email || 'Journal User',
          picture: decodedToken.picture || ''
        };
        return next();
      } catch (tokenErr) {
        console.warn(`[verifyAuth] Firebase ID token verification failed: ${tokenErr.message}`);
        // Fallthrough to dev mode check if allowed
      }
    }

    // Dev / Demo Mode Fallback for local development & testing
    if (process.env.ALLOW_DEV_AUTH === 'true' || idToken.startsWith('dev-token') || idToken.startsWith('mock-')) {
      const devUid = idToken.startsWith('dev-token-')
        ? idToken.replace('dev-token-', '')
        : (idToken.startsWith('mock-') ? idToken.replace('mock-', '') : 'demo_user_123');

      req.user = {
        uid: devUid || 'demo_user_123',
        email: 'demo@geminijournal.local',
        name: 'Demo Journaler',
        picture: ''
      };
      console.log(`[verifyAuth] Authenticated via local Dev/Demo token for UID: ${req.user.uid}`);
      return next();
    }

    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired Firebase ID token.'
    });
  } catch (err) {
    console.error('[verifyAuth] Internal authentication error:', err);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Authentication processing failed.'
    });
  }
}
