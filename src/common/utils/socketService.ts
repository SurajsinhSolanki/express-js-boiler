import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createChildLogger } from './logger';
import { ENV } from './config';

const logger = createChildLogger('socket-service');

let io: SocketIOServer | null = null;

export const initializeSocketIO = (httpServer: HttpServer): SocketIOServer => {
  if (io) {
    logger.warn('Socket.IO already initialized. Returning existing instance.');
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: ENV.CORS_ORIGIN === '*' ? '*' : ENV.ALLOWED_ORIGINS.split(','),
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('message', (message: string) => {
      logger.info(`Received message from ${socket.id}: ${message}`);
      io?.emit('message', `Server received: ${message}`); // Broadcast message to all connected clients
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.IO initialized.');
  return io;
};

export const getSocketIOInstance = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocketIO first.');
  }
  return io;
};

// Example of another instance or namespace if needed
// export const initializeAdminSocketIO = (httpServer: HttpServer): SocketIOServer => {
//   const adminIo = new SocketIOServer(httpServer, { path: '/admin-socket' });
//   adminIo.on('connection', (socket) => {
//     logger.info(`Admin Socket connected: ${socket.id}`);
//   });
//   return adminIo;
// };
