import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service.js';

export class ChatController {
  constructor(private chatService: ChatService) {}

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { message, sessionId } = req.body;
      const result = await this.chatService.processUserMessage(message, sessionId);
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const result = await this.chatService.getChatHistory(sessionId);
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ChatController;
