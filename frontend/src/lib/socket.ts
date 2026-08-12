import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocketInstance(token?: string): Socket | null {
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (!socket) {
    socket = io('http://localhost:5000', {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('🔌 Real-time WebSocket Connected (Socket.IO)');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Real-time WebSocket Disconnected');
    });
  }

  return socket;
}
