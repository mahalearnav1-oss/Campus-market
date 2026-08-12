import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/tokenUtils';

let io: SocketIOServer | null = null;

export function initializeSocketServer(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  // JWT Socket Authentication Middleware
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return next(new Error('Authentication required for WebSocket connection.'));
      }
      const decoded = verifyAccessToken(token);
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token for WebSocket connection.'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    if (user?.id) {
      const roomName = `user:${user.id}`;
      socket.join(roomName);
      console.log(`🔌 WebSocket User Connected: ${user.email} (Joined Room: ${roomName})`);
    }

    socket.on('disconnect', () => {
      console.log(`🔌 WebSocket User Disconnected: ${user?.email || 'Unknown'}`);
    });
  });

  return io;
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}

export function emitToUser(userId: string, event: string, payload: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
  }
}
