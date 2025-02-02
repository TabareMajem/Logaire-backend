import { verifyToken } from '@/lib/auth/token-verifier';
import { ErrorLogger } from '@/lib/errors/logger';
import { SystemHealthMonitor } from '@/lib/monitoring/health/system-health-monitor';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verify auth token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token || !(await verifyToken(token))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const healthMonitor = SystemHealthMonitor.getInstance();

    switch (req.method) {
      case 'GET':
        const status = await healthMonitor.checkSystemHealth();
        return res.status(200).json(status);

      case 'POST':
        if (req.body.action === 'start') {
          healthMonitor.startMonitoring(req.body.interval || 30000);
          return res.status(200).json({ message: 'Monitoring started' });
        } else if (req.body.action === 'stop') {
          healthMonitor.stopMonitoring();
          return res.status(200).json({ message: 'Monitoring stopped' });
        }
        return res.status(400).json({ error: 'Invalid action' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    ErrorLogger.error('Health monitoring API error', error as Error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 