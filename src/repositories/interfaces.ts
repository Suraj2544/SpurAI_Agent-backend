import { IConversation } from '../models/conversation.model.js';
import { IMessage } from '../models/message.model.js';

export interface IConversationRepository {
  createConversation(): Promise<IConversation>;
  getConversationById(id: string): Promise<IConversation | null>;
  findAllActive(): Promise<IConversation[]>;
  deleteConversation(id: string): Promise<boolean>;
}

export interface IMessageRepository {
  createMessage(
    conversationId: string,
    sender: IMessage['sender'],
    text: string
  ): Promise<IMessage>;
  getConversationMessages(
    conversationId: string,
    limit?: number,
    beforeDate?: Date
  ): Promise<IMessage[]>;
  deleteMessagesByConversationId(conversationId: string): Promise<void>;
}
