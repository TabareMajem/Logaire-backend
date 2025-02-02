import { verifyToken } from '@/lib/auth/token-verifier';
import { ErrorLogger } from '@/lib/errors/logger';
import { AlertManager } from '@/lib/monitoring/alerts/alert-manager';
import { AlertSeverity, AlertStatus } from '@/types/monitoring';
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

    const alertManager = AlertManager.getInstance();

    switch (req.method) {
      case 'GET':
        const { status, severity } = req.query;
        const alerts = await alertManager.getAlerts({
          status: status as AlertStatus,
          severity: severity as AlertSeverity
        });
        return res.status(200).json(alerts);

      case 'POST':
        const { alert } = req.body;
        await alertManager.createAlert(alert);
        return res.status(201).json({ message: 'Alert created' });

      case 'PUT':
        const { id, action } = req.body;
        switch (action) {
          case 'acknowledge':
            await alertManager.acknowledgeAlert(id);
            break;
          case 'resolve':
            await alertManager.resolveAlert(id);
            break;
          default:
            return res.status(400).json({ error: 'Invalid action' });
        }
        return res.status(200).json({ message: 'Alert updated' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    ErrorLogger.error('Alerts API error', error as Error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 