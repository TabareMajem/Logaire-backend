// src/lib/ai/propmts/index.ts -->

import { disruptionRecovery } from "./disruption-recovery";
import { documentAnalysis } from "./document-analysis";
import { rateOptimization } from "./rate-optimization";
import { ratePrediction } from "./rate-prediction";
import { riskAssessment } from "./risk-assessment";
import { routeOptimization } from "./route-optimization";
import { scheduleOptimization } from "./schedule-optimization";



export const PROMPTS = {
  'route-optimization': routeOptimization,
  'document-analysis': documentAnalysis,
  'rate-optimization': rateOptimization,
  'rate-prediction': ratePrediction,
  'risk-assessment': riskAssessment,
  'schedule-optimization': scheduleOptimization,
  'disruption-recovery': disruptionRecovery,
} as const;

export type PromptTemplate = keyof typeof PROMPTS;