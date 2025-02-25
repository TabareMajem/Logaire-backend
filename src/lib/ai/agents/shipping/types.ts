import { AgentConfig } from '../base/types';

export interface ShippingDetails {
  origin: string;
  destination: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  serviceType?: string;
  specialHandling?: string[];
  estimatedDeliveryDate?: Date;
}

export interface ConversationContext {
  currentIntent: string;
  extractedInfo: ShippingDetails;
  confidenceLevel: number;
  requiresHumanIntervention: boolean;
  previousInteractions: string[];
  missingInformation: string[];
}

export interface ConversationResponse {
  message: string;
  voiceAudioUrl?: string;
  suggestedActions: string[];
  context: ConversationContext;
}

export interface ShippingAgentConfig extends AgentConfig {
  id: string;
  type: string;
  enabled: boolean;
  speechToText: {
    enabled: boolean;
    provider: string;
    language: string;
  };
  textToSpeech: {
    enabled: boolean;
    provider: string;
    voice: string;
  };
  humanHandoff: {
    thresholds: {
      lowConfidence: number;
      highComplexity: number;
      customerFrustration: number;
    };
    escalationTriggers: string[];
  };
  shipping: {
    supportedRegions: string[];
    serviceTypes: string[];
    specialHandlingOptions: string[];
  };
} 