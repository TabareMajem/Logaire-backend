done done done

import { createMiddleware } from "./middleware";
import { ErrorLogger } from "@/lib/errors/logger";

export const withLogging = createMiddleware(async (request, context) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Log request
    ErrorLogger.info('External API request', {
      requestId,
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    });

    // Wait for response
    const response = await context.next();

    // Log response
    const duration = Date.now() - startTime;
    ErrorLogger.info('External API response', {
      requestId,
      status: response.status,
      duration,
      headers: Object.fromEntries(response.headers.entries())
    });

    return response;
  } catch (error) {
    // Log error
    ErrorLogger.error('External API error', error as Error, {
      requestId,
      duration: Date.now() - startTime
    });
    throw error;
  }
});