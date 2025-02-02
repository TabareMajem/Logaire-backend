done done done

import { createMiddleware } from "./middleware";
import { RateLimiter } from "../rate-limiter";
import { ExternalAPIError } from "../errors";

const rateLimiters = new Map<string, RateLimiter>();

export const withRateLimit = createMiddleware(async (request, context) => {
  const clientId = context.client;
  
  if (!rateLimiters.has(clientId)) {
    rateLimiters.set(clientId, new RateLimiter({
      requestsPerSecond: 10,
      requestsPerMinute: 100,
      requestsPerHour: 1000
    }));
  }

  const limiter = rateLimiters.get(clientId)!;

  try {
    await limiter.checkRateLimit();
    return await context.next();
  } catch (error) {
    throw new ExternalAPIError(
      'Rate limit exceeded',
      'RATE_LIMIT_EXCEEDED',
      429,
      clientId
    );
  }
});