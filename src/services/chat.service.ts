import { IConversationRepository, IMessageRepository } from '../repositories/interfaces.js';
import OpenAIService, { ChatMessage } from './openai.service.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export class ChatService {
  constructor(
    private conversationRepo: IConversationRepository,
    private messageRepo: IMessageRepository
  ) {}

  async processUserMessage(message: string, sessionId?: string) {
    logger.info(`[ChatService.processUserMessage] Started processing message. sessionId=${sessionId || 'new'}`);

    // 1. Validate message
    if (!message || message.trim() === '') {
      logger.warn(`[ChatService.processUserMessage] Validation failed: Empty message content.`);
      throw new BadRequestError('Message cannot be empty.', 'EMPTY_MESSAGE');
    }

    let conversationId = sessionId;

    try {
      // 2. Create conversation if sessionId not provided
      if (!conversationId) {
        const conv = await this.conversationRepo.createConversation();
        conversationId = conv._id.toString();
        logger.info(`[ChatService.processUserMessage] Created new conversation session. id=${conversationId}`);
      } else {
        const exists = await this.conversationRepo.getConversationById(conversationId);
        if (!exists) {
          logger.warn(`[ChatService.processUserMessage] Session not found. id=${conversationId}`);
          throw new NotFoundError(`Session with ID '${conversationId}' not found.`, 'SESSION_NOT_FOUND');
        }
        logger.info(`[ChatService.processUserMessage] Found existing conversation session. id=${conversationId}`);
      }

      // 3. Save user message
      await this.messageRepo.createMessage(conversationId, 'user', message);
      logger.debug(`[ChatService.processUserMessage] Saved user message to conversation: ${conversationId}`);

      // 4. Fetch recent conversation history
      const history = await this.messageRepo.getConversationMessages(conversationId, 10);
      logger.debug(`[ChatService.processUserMessage] Fetched ${history.length} messages for context history.`);
      
      const formattedHistory: ChatMessage[] = history
        .reverse()
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        }));

      // 5. Generate AI reply
      logger.info(`[ChatService.processUserMessage] Invoking AI generation...`);
      const replyText = await OpenAIService.generateAIResponse(formattedHistory);
      logger.info(`[ChatService.processUserMessage] AI reply generated successfully.`);

      // 6. Save AI message
      await this.messageRepo.createMessage(conversationId, 'ai', replyText);
      logger.debug(`[ChatService.processUserMessage] Saved AI message to conversation: ${conversationId}`);

      // 7. Return reply and sessionId
      return {
        reply: replyText,
        sessionId: conversationId,
      };
    } catch (error) {
      logger.error(`[ChatService.processUserMessage] Error processing message: ${error}`);
      throw error;
    }
  }

  async getChatHistory(sessionId: string) {
    logger.info(`[ChatService.getChatHistory] Fetching history. sessionId=${sessionId}`);
    
    const conversation = await this.conversationRepo.getConversationById(sessionId);
    if (!conversation) {
      logger.warn(`[ChatService.getChatHistory] Session not found. id=${sessionId}`);
      throw new NotFoundError(`Session with ID '${sessionId}' not found.`, 'SESSION_NOT_FOUND');
    }

    const messages = await this.messageRepo.getConversationMessages(sessionId);
    logger.info(`[ChatService.getChatHistory] Fetched ${messages.length} messages. sessionId=${sessionId}`);

    return {
      sessionId,
      messages: messages.reverse().map(msg => ({
        _id: msg._id.toString(),
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp || (msg as any).createdAt,
      })),
    };
  }
}

export default ChatService;
