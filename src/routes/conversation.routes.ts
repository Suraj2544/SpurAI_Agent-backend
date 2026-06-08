import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller.js';
import { ConversationRepository } from '../repositories/conversation.repository.js';
import { MessageRepository } from '../repositories/message.repository.js';

const router = Router();

// Setup DI
const conversationRepo = new ConversationRepository();
const messageRepo = new MessageRepository();
const conversationController = new ConversationController(conversationRepo, messageRepo);

// Route mappings for conversation lifecycles
router.post('/start', conversationController.startConversation);
router.get('/active', conversationController.getActiveConversations);
router.put('/:conversationId/status', conversationController.updateStatus);
router.put('/:conversationId/assign', conversationController.assignAgent);
router.get('/:conversationId/messages', conversationController.getMessages);
router.delete('/:conversationId', conversationController.deleteConversation);

export default router;
