import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: Schema.Types.ObjectId;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender: { type: String, enum: ['user', 'ai'], required: true },
    text: { type: String, required: true },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } }
);

export const Message = model<IMessage>('Message', MessageSchema);
export default Message;
