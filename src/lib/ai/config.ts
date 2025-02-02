export const AI_CONFIG = {
  model: 'claude-3-opus-20240229',
  defaultMaxTokens: 1024,
  temperature: 0.7,
  systemPrompt: "You are a logistics optimization AI assistant. Provide clear, actionable recommendations.",
  retryAttempts: 3,
  retryDelay: 1000, // ms
} as const;

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
} as const;