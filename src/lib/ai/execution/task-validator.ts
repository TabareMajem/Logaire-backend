import { ErrorLogger } from '@/lib/errors/logger';
import { AgentRegistry } from '../agents/base/agent-registry';

interface ValidationContext {
  agentType: string;
  taskType: string;
  input: Record<string, any>;
}

export class TaskValidator {
  private readonly registry: AgentRegistry;

  constructor() {
    this.registry = AgentRegistry.getInstance();
  }

  async validateTask(context: ValidationContext): Promise<void> {
    try {
      // Validate agent exists
      const agent = await this.registry.getAgent(context.agentType);
      if (!agent) {
        throw new Error(`Invalid agent type: ${context.agentType}`);
      }

      // Validate task type
      if (!agent.capabilities.includes(context.taskType)) {
        throw new Error(
          `Task type ${context.taskType} not supported by agent ${context.agentType}`
        );
      }

      // Validate input schema
      await this.validateInputSchema(context);

      // Validate business rules
      await this.validateBusinessRules(context);

    } catch (error) {
      ErrorLogger.error('Task validation failed', error as Error);
      throw error;
    }
  }

  private async validateInputSchema(context: ValidationContext): Promise<void> {
    // Get required fields for task type
    const requiredFields = await this.getRequiredFields(
      context.agentType,
      context.taskType
    );

    // Check all required fields are present
    for (const field of requiredFields) {
      if (!(field in context.input)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate field types
    await this.validateFieldTypes(context);
  }

  private async getRequiredFields(
    agentType: string,
    taskType: string
  ): Promise<string[]> {
    // Fetch from database or configuration
    return ['input', 'type', 'priority'];
  }

  private async validateFieldTypes(context: ValidationContext): Promise<void> {
    // Implement type validation logic
    // This would check that field values match expected types
  }

  private async validateBusinessRules(context: ValidationContext): Promise<void> {
    // Implement business rule validation
    // This would check things like:
    // - Value ranges
    // - Dependencies between fields
    // - Business logic constraints
  }
}