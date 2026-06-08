import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-chat-agent';

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    logger.info('Successfully connected to MongoDB');
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error}`);
    process.exit(1);
  }
};
