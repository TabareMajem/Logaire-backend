import { NextApiRequest } from 'next';
import { z } from 'zod';

export class RequestValidator {
  static validateMetricsRequest(req: NextApiRequest) {
    const schema = z.object({
      query: z.object({
        range: z.string().regex(/^[1-9][0-9]*(h|d|w)$/),
        agentType: z.string().optional()
      })
    });

    return schema.parse(req);
  }

  static validateAlertRequest(req: NextApiRequest) {
    const schema = z.object({
      body: z.object({
        action: z.enum(['resolve', 'acknowledge']),
        alertId: z.string().uuid(),
        comment: z.string().optional()
      })
    });

    return schema.parse(req);
  }

  static validateProfilerRequest(req: NextApiRequest) {
    const schema = z.object({
      body: z.object({
        action: z.enum(['start', 'stop']),
        duration: z.number().min(1).max(3600).optional()
      })
    });

    return schema.parse(req);
  }
} 