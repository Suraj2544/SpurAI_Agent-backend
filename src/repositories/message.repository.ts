import Message, { IMessage } from '../models/message.model.js';
import { IMessageRepository } from './interfaces.js';

export class MessageRepository implements IMessageRepository {
  async createMessage(
    conversationId: string,
    sender: IMessage['sender'],
    text: string
  ): Promise<IMessage> {
    const message = new Message({
      conversationId,
      sender,
      text,
    });
    return message.save();
  }

  async getConversationMessages(
    conversationId: string,
    limit = 50,
    beforeDate?: Date
  ): Promise<IMessage[]> {
    const query: any = { conversationId };
    if (beforeDate) {
      query.timestamp = { $lt: beforeDate };
    }

    return Message.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async deleteMessagesByConversationId(conversationId: string): Promise<void> {
    await Message.deleteMany({ conversationId }).exec();
  }
}

export default MessageRepository;
