import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { setupChatSocket } from './sockets/chat.socket.js';
import logger from './utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 5005;

const startServer = async () => {
  // Connect to DB first
  await connectDB();

  // Create HTTP Server
  const server = http.createServer(app);

  // Bind Socket.io Server
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  setupChatSocket(io);

  server.listen(PORT, () => {
    logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer().catch((error) => {
  logger.error(`Critical failure starting server: ${error}`);
  process.exit(1);
});
