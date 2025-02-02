import { z } from 'zod';

export const WorkflowSchema = z.object({
  id: z.string(),
  steps: z.array(z.object({
    id: z.string(),
    type: z.string(),
    config: z.record(z.any()),
    dependencies: z.array(z.string()).optional()
  })),
  metadata: z.record(z.any()).optional()
});

export class WorkflowValidator {
  static validate(workflow: unknown) {
    return WorkflowSchema.parse(workflow);
  }
}