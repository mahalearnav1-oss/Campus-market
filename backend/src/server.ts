import http from 'http';
import { createApp } from './app';
import { config } from './config';
import { initializeSocketServer } from './realtime/socketServer';

const app = createApp();
const server = http.createServer(app);

// Initialize Real-time WebSocket Server
initializeSocketServer(server);

server.listen(config.port, () => {
  console.log(`=================================`);
  console.log(`🚀 CampusMarket API & WebSocket Server Ready`);
  console.log(`📡 Listening on http://localhost:${config.port}`);
  console.log(`🔌 WebSockets Active (Socket.IO)`);
  console.log(`⚙️  Environment: ${config.env}`);
  console.log(`=================================`);
});
