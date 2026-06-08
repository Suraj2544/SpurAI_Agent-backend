import { Server, Socket } from 'socket.io';
import { ConversationRepository } from '../repositories/conversation.repository.js';
import { MessageRepository } from '../repositories/message.repository.js';
import OpenAIService, { ChatMessage } from '../services/openai.service.js';
import logger from '../utils/logger.js';

export const setupChatSocket = (io: Server) => {
  const conversationRepo = new ConversationRepository();
  const messageRepo = new MessageRepository();

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    // Join room based on conversationId
    socket.on('join_room', (conversationId: string) => {
      socket.join(conversationId);
      logger.info(`Socket ${socket.id} joined room: ${conversationId}`);
    });

    // Handle client/customer sending a message
    socket.on('client_message', async (data: { conversationId: string; text: string }) => {
      const { conversationId, text } = data;

      try {
        // 1. Persist the user's message to MongoDB
        const customerMsg = await messageRepo.createMessage(conversationId, 'user', text);
        
        // Broadcast the message to all clients in the room
        io.to(conversationId).emit('message_received', customerMsg);

        // 2. Send typing indicator
        io.to(conversationId).emit('ai_typing', { typing: true });

        // Retrieve last 10 messages for context
        const rawHistory = await messageRepo.getConversationMessages(conversationId, 10);
        
        // Reverse order to represent chronologically for OpenAI
        const formattedHistory: ChatMessage[] = rawHistory
          .reverse()
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
          }));

        // Call OpenAI completion streaming
        let fullAIResponse = '';
        const stream = OpenAIService.generateAIResponseStream(formattedHistory);

        // Turn off typing indicator right before streaming starts
        io.to(conversationId).emit('ai_typing', { typing: false });

        for await (const chunk of stream) {
          fullAIResponse += chunk;
          io.to(conversationId).emit('ai_chunk', { conversationId, text: chunk });
        }

        // Save the completed AI response to MongoDB
        const aiMsg = await messageRepo.createMessage(conversationId, 'ai', fullAIResponse);
        io.to(conversationId).emit('ai_response_complete', aiMsg);
      } catch (err) {
        logger.error(`Error processing socket message: ${err}`);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });
};
