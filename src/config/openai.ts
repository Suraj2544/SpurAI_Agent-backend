import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey && process.env.NODE_ENV === 'production') {
  throw new Error('OPENAI_API_KEY environment variable is required in production.');
}

// Initializing the OpenAI SDK client
export const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key-for-development-placeholder',
});

export default openai;
