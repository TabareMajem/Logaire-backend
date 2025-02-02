import { verifyToken } from '@/lib/auth/token-verifier';
import { ErrorLogger } from '@/lib/errors/logger';
import { MetricsCollector } from '@/lib/monitoring/metrics/metrics-collector';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token || !(await verifyToken(token))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const metricsCollector = MetricsCollector.getInstance();

    switch (req.method) {
      case 'GET':
        const { type, from, to } = req.query;
        const metrics = await metricsCollector.getMetrics({
          type: type as string,
          from: from ? new Date(from as string) : undefined,
          to: to ? new Date(to as string) : undefined
        });
        return res.status(200).json(metrics);

      case 'POST':
        const { metrics: newMetrics } = req.body;
        await metricsCollector.recordMetrics(newMetrics);
        return res.status(201).json({ message: 'Metrics recorded' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    ErrorLogger.error('Metrics API error', error as Error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 