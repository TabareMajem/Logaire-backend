export class CarrierError extends Error {
  constructor(
    message: string,
    public code: string,
    public carrier: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'CarrierError';
  }

  static apiError(response: Response, context: { carrier: string; endpoint: string }) {
    return new CarrierError(
      `Carrier API error: ${response.status} ${response.statusText}`,
      'API_ERROR',
      context.carrier,
      { endpoint: context.endpoint, status: response.status }
    );
  }

  static validationError(message: string, carrier: string) {
    return new CarrierError(message, 'VALIDATION_ERROR', carrier);
  }

  static connectionError(carrier: string, originalError: Error) {
    return new CarrierError(
      'Failed to connect to carrier API',
      'CONNECTION_ERROR',
      carrier,
      originalError
    );
  }
}