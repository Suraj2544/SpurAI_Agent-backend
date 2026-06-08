import { Schema, model, Document } from 'mongoose';

export interface IConversation extends Document {
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {},
  { timestamps: true }
);

export const Conversation = model<IConversation>('Conversation', ConversationSchema);
export default Conversation;
