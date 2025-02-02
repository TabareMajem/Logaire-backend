import { ErrorLogger } from '@/lib/errors/logger';

export type CommandHandler = (params: any) => Promise<string>;

export class CommandRegistry {
  private commands = new Map<string, CommandHandler>();

  register(command: string, handler: CommandHandler) {
    this.commands.set(command.toLowerCase(), handler);
  }

  async executeCommand(command: string, params: any): Promise<string> {
    try {
      const handler = this.findMatchingHandler(command);
      
      if (!handler) {
        return "I'm sorry, I don't understand that command.";
      }

      return await handler(params);
    } catch (error) {
      ErrorLogger.error('Command execution failed', error as Error);
      return "Sorry, I encountered an error executing that command.";
    }
  }

  private findMatchingHandler(command: string): CommandHandler | undefined {
    const normalizedCommand = command.toLowerCase();
    return this.commands.get(normalizedCommand);
  }
}