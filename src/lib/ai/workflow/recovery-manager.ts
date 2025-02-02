import { ErrorLogger } from '@/lib/errors/logger';
import { ErrorRecoverySystem } from '@/lib/errors/recovery-system';

export class WorkflowRecoveryManager {
  private static readonly MAX_RECOVERY_ATTEMPTS = 3;

  static async attemptRecovery(
    workflowId: string,
    stepId: string,
    error: Error
  ): Promise<boolean> {
    try {
      await ErrorRecoverySystem.attemptRecovery(
        async () => {
          // Recovery logic here
          return true;
        },
        `workflow_${workflowId}_step_${stepId}`,
        1000
      );
      return true;
    } catch (error) {
      ErrorLogger.error('Workflow recovery failed:', error as Error);
      return false;
    }
  }
} 