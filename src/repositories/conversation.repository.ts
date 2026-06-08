import Conversation, { IConversation } from '../models/conversation.model.js';
import { IConversationRepository } from './interfaces.js';

export class ConversationRepository implements IConversationRepository {
  async getConversationById(id: string): Promise<IConversation | null> {
    return Conversation.findById(id).exec();
  }

  async createConversation(): Promise<IConversation> {
    const conversation = new Conversation({});
    return conversation.save();
  }

  async findAllActive(): Promise<IConversation[]> {
    return Conversation.find()
      .sort({ updatedAt: -1 })
      .exec();
  }

  async deleteConversation(id: string): Promise<boolean> {
    const result = await Conversation.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
}

export default ConversationRepository;
