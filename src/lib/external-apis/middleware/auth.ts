done done

import { createMiddleware } from "./middleware";
import { ExternalAPIError } from "../errors";
import { API_CONFIG } from "../config";

export const withAuth = createMiddleware(async (request) => {
  const apiKey = request.headers.get('x-api-key');
  
  if (!apiKey) {
    throw new ExternalAPIError(
      'API key is required',
      'UNAUTHORIZED',
      401,
      'auth-middleware'
    );
  }

  // Validate API key format
  if (!isValidApiKey(apiKey)) {
    throw new ExternalAPIError(
      'Invalid API key format',
      'INVALID_API_KEY',
      401,
      'auth-middleware'
    );
  }

  return { apiKey };
});

function isValidApiKey(key: string): boolean {
  // Add API key validation logic
  return /^[a-zA-Z0-9-_]{32,}$/.test(key);
}