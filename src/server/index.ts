import { Server } from 'socket.io';
import { createServer } from 'http';
import type { Express } from 'express';
import { setupTestRoutes } from './test-server';

export function createTestServer(app: Express) {
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  setupTestRoutes(app, io);

  return httpServer;
} 