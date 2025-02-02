export class ExternalAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public source: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ExternalAPIError';
  }

  static fromResponse(response: Response, source: string): ExternalAPIError {
    return new ExternalAPIError(
      response.statusText,
      response.status.toString(),
      response.status,
      source
    );
  }

  static networkError(source: string, error: Error): ExternalAPIError {
    return new ExternalAPIError(
      'Network request failed',
      'NETWORK_ERROR',
      0,
      source,
      error
    );
  }

  static timeout(source: string): ExternalAPIError {
    return new ExternalAPIError(
      'Request timed out',
      'TIMEOUT',
      408,
      source
    );
  }
}