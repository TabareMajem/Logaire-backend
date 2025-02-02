import { verifyToken } from '@/lib/auth/token-verifier';
import { ErrorLogger } from '@/lib/errors/logger';
import { NextApiResponseWithSocket } from '@/types/next';
import { NextApiRequest } from 'next';
import { Server } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/api/monitoring/socket',
      addTrailingSlash: false,
    });

    // Add authentication middleware
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const isValid = await verifyToken(token);
        if (!isValid) {
          return next(new Error('Invalid token'));
        }

        next();
      } catch (error) {
        ErrorLogger.error('Socket authentication error', error as Error);
        next(new Error('Authentication failed'));
      }
    });

    // Handle connections
    io.on('connection', (socket) => {
      socket.on('error', (error) => {
        ErrorLogger.error('Socket error', error);
      });

      socket.on('disconnect', () => {
        // Cleanup
      });
    });

    res.socket.server.io = io;
  }

  res.end();
} 