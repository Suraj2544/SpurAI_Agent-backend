import { Request, Response, NextFunction } from 'express';
import { IConversationRepository, IMessageRepository } from '../repositories/interfaces.js';

export class ConversationController {
  constructor(
    private conversationRepo: IConversationRepository,
    private messageRepo: IMessageRepository
  ) {}

  startConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { initialMessage } = req.body;

      const conversation = await this.conversationRepo.createConversation();

      if (initialMessage) {
        await this.messageRepo.createMessage(
          conversation.id,
          'user',
          initialMessage
        );
      }

      res.status(200).json({ conversation });
    } catch (error) {
      next(error);
    }
  };

  getActiveConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conversations = await this.conversationRepo.findAllActive();
      res.status(200).json({ conversations });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({ message: 'Status deprecated in simplified AI model.' });
    } catch (error) {
      next(error);
    }
  };

  assignAgent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({ message: 'Agent assignment deprecated in simplified AI model.' });
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const { limit, before } = req.query;

      const parsedLimit = limit ? parseInt(limit as string, 10) : 50;
      const parsedBefore = before ? new Date(before as string) : undefined;

      const messages = await this.messageRepo.getConversationMessages(
        conversationId,
        parsedLimit,
        parsedBefore
      );

      res.status(200).json({ messages });
    } catch (error) {
      next(error);
    }
  };

  deleteConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conversationId } = req.params;

      // Delete associated messages first
      await this.messageRepo.deleteMessagesByConversationId(conversationId);

      // Delete the conversation document
      const deleted = await this.conversationRepo.deleteConversation(conversationId);

      if (!deleted) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      res.status(200).json({ message: 'Conversation and all associated messages successfully deleted.' });
    } catch (error) {
      next(error);
    }
  };
}

export default ConversationController;
