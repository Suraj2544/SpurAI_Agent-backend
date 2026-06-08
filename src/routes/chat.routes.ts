import { Router } from 'express';
import { z } from 'zod';
import { ChatController } from '../controllers/chat.controller.js';
import { ChatService } from '../services/chat.service.js';
import { validateRequest } from '../middleware/validation.middleware.js';

import { ConversationRepository } from '../repositories/conversation.repository.js';
import { MessageRepository } from '../repositories/message.repository.js';

const router = Router();

// Zod Validation Schemas
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const SendMessageSchema = z.object({
  body: z.object({
    message: z.string({ required_error: 'Message is required.' }).min(1, 'Message cannot be empty.'),
    sessionId: z.string().regex(objectIdRegex, 'Invalid sessionId format.').optional(),
  }),
});

const GetHistorySchema = z.object({
  params: z.object({
    sessionId: z.string().regex(objectIdRegex, 'Invalid sessionId format.'),
  }),
});

// Setup DI
const conversationRepo = new ConversationRepository();
const messageRepo = new MessageRepository();
const chatService = new ChatService(conversationRepo, messageRepo);
const chatController = new ChatController(chatService);

// Bind routes
router.post('/message', validateRequest(SendMessageSchema), chatController.sendMessage);
router.get('/history/:sessionId', validateRequest(GetHistorySchema), chatController.getHistory);

export default router;
