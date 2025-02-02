export const AI_RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 60,
  REQUESTS_PER_HOUR: 1000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
} as const;

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
} as const;

export const MODEL_CONFIG = {
  DEFAULT_MODEL: 'claude-3-opus-20240229',
  FALLBACK_MODEL: 'claude-3-sonnet-20240229',
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7,
  TOP_P: 0.9,
} as const;

export const SYSTEM_PROMPTS = {
  DEFAULT: "You are a logistics optimization AI assistant focused on providing clear, actionable recommendations.",
  ROUTE_OPTIMIZATION: "You are a route optimization specialist focused on finding the most efficient paths while considering all constraints.",
  RISK_ASSESSMENT: "You are a risk assessment expert focused on identifying and quantifying potential issues in shipping operations.",
} as const;