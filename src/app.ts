import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import conversationRoutes from './routes/conversation.routes.js';
import chatRoutes from './routes/chat.routes.js';
import errorMiddleware from './middleware/error.middleware.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/conversations', conversationRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Error handling
app.use(errorMiddleware);

export default app;
