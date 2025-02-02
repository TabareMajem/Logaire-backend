done done done

import { createMiddleware } from "./middleware";
import { MetricsService } from "../monitoring/metrics-service";

export const withMetrics = createMiddleware(async (request, context) => {
  const metricsService = new MetricsService();
  const startTime = Date.now();

  try {
    const response = await context.next();
    
    // Record successful request
    await metricsService.recordMetric(
      context.client,
      new URL(request.url).pathname,
      Date.now() - startTime,
      true
    );

    return response;
  } catch (error) {
    // Record failed request
    await metricsService.recordMetric(
      context.client,
      new URL(request.url).pathname,
      Date.now() - startTime,
      false
    );
    
    throw error;
  }
});