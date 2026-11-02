const { createRemoteJWKSet, jwtVerify } = require('jose');

// Firebase ID tokens are signed by Google's securetoken service; verify them without a service account.
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

async function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) return res.status(500).json({ message: 'Server auth is not configured.' });

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    if (!payload.email) return res.status(401).json({ message: 'Account has no email address.' });
    req.user = {
      uid: payload.user_id || payload.sub,
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || '',
    };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

module.exports = { verifyToken };
