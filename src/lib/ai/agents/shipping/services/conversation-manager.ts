import { ErrorLogger } from '@/lib/errors/logger';
import { ShippingDetails } from '../types';

interface ConversationState {
  intent: string;
  extractedInfo: ShippingDetails;
  missingInformation: string[];
  previousInteractions: string[];
}

interface GeneratedResponse {
  message: string;
  confidence: number;
  suggestedActions: string[];
}

export class ConversationManager {
  private readonly followUpQuestions: Record<string, string> = {
    origin: "Could you please specify where you're shipping from?",
    destination: "Where would you like to ship this package to?",
    weight: "What's the weight of your package?",
    dimensions: "Could you provide the package dimensions (length, width, and height)?",
    serviceType: "What type of shipping service would you prefer (standard, express, or overnight)?",
    specialHandling: "Does your package require any special handling?"
  };

  private readonly responseTemplates: Record<string, string[]> = {
    greeting: [
      "Hello! I'm here to help you with your shipping needs. What can I do for you today?",
      "Welcome! How can I assist you with your shipping request?"
    ],
    confirmation: [
      "I've got all the details. Let me summarize your shipping request:",
      "Perfect! Here's what I understand about your shipment:"
    ],
    missingInfo: [
      "I need a few more details to help you better.",
      "To provide you with accurate information, I'll need some additional details."
    ],
    error: [
      "I apologize, but I'm having trouble processing that request. Could you please rephrase it?",
      "I didn't quite catch that. Could you please provide more details?"
    ]
  };

  async generateResponse(state: ConversationState): Promise<GeneratedResponse> {
    try {
      let message = '';
      let confidence = 1.0;
      const suggestedActions: string[] = [];

      // Handle initial greeting
      if (state.previousInteractions.length === 0) {
        return this.generateInitialGreeting();
      }

      // Handle missing information
      if (state.missingInformation.length > 0) {
        return this.generateMissingInfoResponse(state);
      }

      // Handle confirmation when all info is collected
      if (this.isReadyForConfirmation(state)) {
        return this.generateConfirmation(state);
      }

      // Handle specific intents
      switch (state.intent) {
        case 'get_quote':
          return this.generateQuoteResponse(state);
        case 'track_shipment':
          return this.generateTrackingResponse(state);
        case 'request_info':
          return this.generateInfoResponse(state);
        default:
          return this.generateDefaultResponse(state);
      }

    } catch (error) {
      ErrorLogger.error('Error generating conversation response:', error as Error);
      return {
        message: this.getRandomTemplate('error'),
        confidence: 0.5,
        suggestedActions: ['rephrase_request', 'start_over', 'help']
      };
    }
  }

  private generateInitialGreeting(): GeneratedResponse {
    return {
      message: this.getRandomTemplate('greeting'),
      confidence: 1.0,
      suggestedActions: ['new_shipment', 'track_package', 'get_quote']
    };
  }

  private generateMissingInfoResponse(state: ConversationState): GeneratedResponse {
    const missingField = state.missingInformation[0];
    const followUpQuestion = this.followUpQuestions[missingField];
    
    return {
      message: `${this.getRandomTemplate('missingInfo')} ${followUpQuestion}`,
      confidence: 0.9,
      suggestedActions: this.getSuggestedActionsForMissingField(missingField)
    };
  }

  private generateConfirmation(state: ConversationState): GeneratedResponse {
    const info = state.extractedInfo;
    const summary = `
      From: ${info.origin}
      To: ${info.destination}
      ${info.weight ? `Weight: ${info.weight} kg` : ''}
      ${info.serviceType ? `Service: ${info.serviceType}` : ''}
      ${info.specialHandling ? `Special Handling: ${info.specialHandling.join(', ')}` : ''}
    `.trim();

    return {
      message: `${this.getRandomTemplate('confirmation')}\n${summary}`,
      confidence: 0.95,
      suggestedActions: ['confirm', 'modify', 'start_over']
    };
  }

  private generateQuoteResponse(state: ConversationState): GeneratedResponse {
    // Implementation for generating shipping quote response
    return {
      message: "I'll calculate a quote based on your shipping details.",
      confidence: 0.9,
      suggestedActions: ['view_details', 'modify', 'proceed']
    };
  }

  private generateTrackingResponse(state: ConversationState): GeneratedResponse {
    // Implementation for generating tracking response
    return {
      message: "I'll help you track your shipment.",
      confidence: 0.9,
      suggestedActions: ['view_details', 'get_updates', 'contact_support']
    };
  }

  private generateInfoResponse(state: ConversationState): GeneratedResponse {
    // Implementation for generating information response
    return {
      message: "I'll provide you with the requested information.",
      confidence: 0.9,
      suggestedActions: ['learn_more', 'get_quote', 'contact_support']
    };
  }

  private generateDefaultResponse(state: ConversationState): GeneratedResponse {
    return {
      message: "I'm here to help with your shipping needs. What would you like to know?",
      confidence: 0.7,
      suggestedActions: ['new_shipment', 'track_package', 'get_quote', 'help']
    };
  }

  private getRandomTemplate(type: string): string {
    const templates = this.responseTemplates[type];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private getSuggestedActionsForMissingField(field: string): string[] {
    const commonActions = ['provide_info', 'skip', 'help'];
    switch (field) {
      case 'serviceType':
        return ['standard', 'express', 'overnight', ...commonActions];
      case 'specialHandling':
        return ['fragile', 'perishable', 'hazardous', ...commonActions];
      default:
        return commonActions;
    }
  }

  private isReadyForConfirmation(state: ConversationState): boolean {
    return (
      !!state.extractedInfo.origin &&
      !!state.extractedInfo.destination &&
      state.missingInformation.length === 0
    );
  }
} 