export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retry: {
    attempts: 3,
    backoff: 1000, // 1 second
  },
  cache: {
    ttl: 300, // 5 minutes
    maxSize: 100, // Maximum number of cached items
  },
} as const;

export const ENDPOINTS = {
  carrier: {
    baseUrl: process.env.CARRIER_API_URL || 'https://api.carrier.com',
    schedules: '/v1/schedules',
    rates: '/v1/rates/quote',
    tracking: '/v1/tracking',
  },
  port: {
    baseUrl: process.env.PORT_API_URL || 'https://api.port.com',
    schedule: '/v1/ports/:code/schedule',
    movements: '/v1/ports/:code/movements',
    congestion: '/v1/ports/:code/congestion',
  },
  weather: {
    baseUrl: process.env.WEATHER_API_URL || 'https://api.weather.com',
    forecast: '/v1/forecast',
    alerts: '/v1/alerts',
    marine: '/v1/marine',
  },
} as const;