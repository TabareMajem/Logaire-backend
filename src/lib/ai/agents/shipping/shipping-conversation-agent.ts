import { ErrorLogger } from '@/lib/errors/logger';
import { EnhancedBaseAgent } from '../base/enhanced-base-agent';
import { ShippingAgentConfig, ConversationContext, ConversationResponse, ShippingDetails } from './types';
import { SpeechToTextService } from './services/speech-to-text-service';
import { TextToSpeechService } from './services/text-to-speech-service';
import { IntentRecognizer } from './services/intent-recognizer';
import { ShippingInfoExtractor } from './services/shipping-info-extractor';
import { ConversationManager } from './services/conversation-manager';
import { HumanHandoffManager } from './services/human-handoff-manager';

export class ShippingConversationAgent extends EnhancedBaseAgent {
  private speechToText: SpeechToTextService;
  private textToSpeech: TextToSpeechService;
  private intentRecognizer: IntentRecognizer;
  private shippingExtractor: ShippingInfoExtractor;
  private conversationManager: ConversationManager;
  private handoffManager: HumanHandoffManager;
  private context!: ConversationContext;

  constructor(config: ShippingAgentConfig) {
    super(config.id, {
      maxRetries: 2,
      timeout: 30000,
      recoveryEnabled: true,
      validateOutput: true,
    });
    this.speechToText = new SpeechToTextService(config.speechToText);
    this.textToSpeech = new TextToSpeechService(config.textToSpeech);
    this.intentRecognizer = new IntentRecognizer();
    this.shippingExtractor = new ShippingInfoExtractor(config.shipping);
    this.conversationManager = new ConversationManager();
    this.handoffManager = new HumanHandoffManager(config.humanHandoff);
    
    this.initializeContext();
  }

  public async initialize(): Promise<void> {
    this.initializeContext();
  }

  private initializeContext(): void {
    this.context = {
      currentIntent: '',
      extractedInfo: {
        origin: '',
        destination: ''
      },
      confidenceLevel: 1.0,
      requiresHumanIntervention: false,
      previousInteractions: [],
      missingInformation: []
    };
  }

  async processUserInput(input: string | ArrayBuffer): Promise<ConversationResponse> {
    try {
      // Convert speech to text if input is audio
      const textInput = ArrayBuffer.isView(input) 
        ? await this.speechToText.convert(input as ArrayBuffer)
        : input as string;

      // Update conversation context
      this.context.previousInteractions.push(textInput);

      // Recognize intent
      const intent = await this.intentRecognizer.recognize(textInput);
      this.context.currentIntent = intent;

      // Extract shipping information
      const extractedInfo = await this.shippingExtractor.extract(textInput);
      this.updateShippingInfo(extractedInfo);

      // Generate response based on context
      const response = await this.generateResponse();

      // Check if human handoff is needed
      this.context.requiresHumanIntervention = this.handoffManager.shouldHandoff({
        intent,
        confidenceLevel: this.context.confidenceLevel,
        extractedInfo: this.context.extractedInfo,
        previousInteractions: this.context.previousInteractions
      });

      // Convert response to speech if needed
      const voiceAudioUrl = this.context.requiresHumanIntervention 
        ? undefined 
        : await this.textToSpeech.convert(response.message);

      return {
        ...response,
        voiceAudioUrl
      };

    } catch (error) {
      ErrorLogger.error('Error processing user input:', error as Error);
      throw error;
    }
  }

  private updateShippingInfo(newInfo: Partial<ShippingDetails>): void {
    this.context.extractedInfo = {
      ...this.context.extractedInfo,
      ...newInfo
    };

    // Update missing information list
    this.context.missingInformation = this.identifyMissingInfo();
  }

  private identifyMissingInfo(): string[] {
    const missing: string[] = [];
    const info = this.context.extractedInfo;

    if (!info.origin) missing.push('origin');
    if (!info.destination) missing.push('destination');
    if (info.serviceType && !info.weight) missing.push('weight');
    if (info.serviceType && !info.dimensions) missing.push('dimensions');

    return missing;
  }

  private async generateResponse(): Promise<ConversationResponse> {
    const response = await this.conversationManager.generateResponse({
      intent: this.context.currentIntent,
      extractedInfo: this.context.extractedInfo,
      missingInformation: this.context.missingInformation,
      previousInteractions: this.context.previousInteractions
    });

    // Update confidence level based on response generation
    this.context.confidenceLevel = response.confidence || 1.0;

    return {
      message: response.message,
      suggestedActions: response.suggestedActions || [],
      context: { ...this.context }
    };
  }

  protected getAgentType(): string {
    return 'shipping-conversation';
  }

  protected getContext(): Record<string, any> {
    return this.context;
  }

  protected async processInternal(input: any): Promise<any> {
    // Implement the internal processing logic
    return this.processUserInput(input);
  }

  protected async validateResult(result: any): Promise<void> {
    // Implement result validation logic
    if (!result || typeof result.message !== 'string') {
      throw new Error('Invalid result format');
    }
  }
} 