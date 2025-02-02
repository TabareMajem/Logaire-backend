import { createServer } from 'http';
import { AddressInfo } from 'net';
import { WebSocket, WebSocketServer } from 'ws';
import { wsReconnectionManager } from '../websocket-reconnection-manager';

describe('WebSocket Integration Tests', () => {
  let server: WebSocketServer;
  let httpServer: ReturnType<typeof createServer>;
  let wsUrl: string;

  beforeAll((done) => {
    httpServer = createServer();
    server = new WebSocketServer({ server: httpServer });
    httpServer.listen(() => {
      const address = httpServer.address() as AddressInfo;
      wsUrl = `ws://localhost:${address.port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(() => {
      httpServer.close(done);
    });
  });

  it('should handle reconnection on connection loss', async () => {
    const ws = new WebSocket(wsUrl);
    const connectionId = 'test-connection';
    let reconnectCount = 0;

    const onReconnect = jest.fn().mockImplementation(() => {
      reconnectCount++;
      return Promise.resolve();
    });

    wsReconnectionManager.onReconnected(({ attempts }) => {
      expect(attempts).toBeLessThanOrEqual(3);
    });

    await new Promise<void>((resolve) => {
      ws.on('open', () => {
        // Simulate connection loss
        server.close(() => {
          wsReconnectionManager.scheduleReconnection(
            connectionId,
            onReconnect,
            { maxAttempts: 3 }
          );
          resolve();
        });
      });
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));
    expect(reconnectCount).toBeGreaterThan(0);
  });

  it('should emit maxAttemptsReached event', async () => {
    const connectionId = 'test-max-attempts';
    const maxAttemptsHandler = jest.fn();

    wsReconnectionManager.onMaxAttemptsReached(maxAttemptsHandler);

    const onReconnect = jest.fn().mockRejectedValue(new Error('Connection failed'));

    wsReconnectionManager.scheduleReconnection(
      connectionId,
      onReconnect,
      { maxAttempts: 2, initialDelay: 100 }
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(maxAttemptsHandler).toHaveBeenCalledWith({ connectionId });
  });
}); 