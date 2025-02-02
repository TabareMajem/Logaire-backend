// src/lib/ai/core/agent-factory.ts -->

import { AIContext } from './types';
import { RouteOptimizationAgent } from '../agents/route-optimization';
import { RateOptimizationAgent } from '../agents/rate-optimization';
import { DocumentAnalysisAgent } from '../agents/document-analysis';
import { SchedulingAgent } from '../agents/scheduling';
import { RiskAssessmentAgent } from '../agents/risk-assessment';

export type AgentType = 
  | 'route' 
  | 'rate' 
  | 'document' 
  | 'schedule' 
  | 'risk'
  | 'capacity';

export class AgentFactory {
  static createAgent(type: AgentType, context: AIContext) {
    switch (type) {
      case 'route':
        return new RouteOptimizationAgent(context);
      case 'rate':
        return new RateOptimizationAgent(context);
      case 'document':
        return new DocumentAnalysisAgent(context);
      case 'schedule':
        return new SchedulingAgent(context);
      case 'risk':
        return new RiskAssessmentAgent(context);
      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
  }
}