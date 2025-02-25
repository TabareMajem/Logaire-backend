import { Twilio } from 'twilio';

export class TwilioService {
  private client: Twilio;

  constructor() {
    this.client = new Twilio(
      process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID!,
      process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN!
    );
  }

  async handleIncomingCall(callSid: string) {
    return await this.client.calls(callSid)
      .fetch();
  }
} 