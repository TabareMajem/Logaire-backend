import { verifyToken } from '@/lib/auth/token-verifier';
import { ErrorLogger } from '@/lib/errors/logger';
import { NextApiRequest, NextApiResponse } from 'next';
import { RateLimiter } from './rate-limiter';

export async function securityMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) {
  try {
    // Check authentication
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const verified = await verifyToken(token);
    if (!verified) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Rate limiting
    const rateLimiter = RateLimiter.getInstance();
    const allowed = await rateLimiter.checkLimit(req.ip);
    if (!allowed) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    // CORS check
    const origin = req.headers.origin;
    if (origin && !isAllowedOrigin(origin)) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }

    await next();
  } catch (error) {
    ErrorLogger.error('Security middleware error', error as Error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 