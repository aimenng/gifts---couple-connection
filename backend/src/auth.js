import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { supabase } from './supabaseClient.js';

const JWT_ALGORITHMS = ['HS256'];

const normalizeTokenVersion = (value) => {
  const parsed = Number.parseInt(String(value ?? 0), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

export const signToken = (userId, tokenVersion = 0) =>
  jwt.sign(
    { sub: userId, tv: normalizeTokenVersion(tokenVersion) },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
      algorithm: 'HS256',
    }
  );

export const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      algorithms: JWT_ALGORITHMS,
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    });
    const userId = String(payload?.sub || '').trim();
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const tokenVersion = normalizeTokenVersion(payload?.tv);

    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('id,token_version')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      const userErrorMessage = String(userError?.message || '');
      if (
        userErrorMessage.includes("Could not find the 'token_version' column of 'users'") ||
        userErrorMessage.includes("column 'token_version'")
      ) {
        return res
          .status(500)
          .json({ error: 'Database missing users.token_version. Run migration_20260211_token_version.sql first.' });
      }
      console.error('[auth-check] failed to load user token version', userError?.message || userError);
      return res.status(503).json({ error: 'Authentication service temporarily unavailable' });
    }

    if (!userRow) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const currentTokenVersion = normalizeTokenVersion(userRow.token_version);
    if (tokenVersion !== currentTokenVersion) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.authTokenVersion = tokenVersion;
    req.authUserId = userRow.id;
    req.userId = userRow.id;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
