import { ShippingConversationAgent } from './shipping-conversation-agent';

export class CallHandler {
  private agent: ShippingConversationAgent;

  constructor(agent: ShippingConversationAgent) {
    this.agent = agent;
  }

  async handleSpeech(audioBuffer: ArrayBuffer): Promise<string> {
    // Convert speech to text
    const text = await this.agent.convertSpeechToText(audioBuffer);
    
    // Process with agent
    const response = await this.agent.process(text);
    
    // Convert response to speech
    return await this.agent.convertTextToSpeech(response);
  }
} 