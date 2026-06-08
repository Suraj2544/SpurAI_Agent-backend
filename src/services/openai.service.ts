import openai from '../config/openai.js';
import logger from '../utils/logger.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIService {
  private static SYSTEM_PROMPT = `
You are an intelligent, helpful, and empathetic Customer Support AI Assistant for Spur Store.
Your goal is to resolve customer inquiries quickly, politely, and accurately.

Key Store Policies & Information to use when answering customer questions:
- Return Policy: We offer a 30-day hassle-free return policy for a full refund. Items must be unused, in their original packaging, and in the same condition as received. Return shipping is completely free!
- Shipping Policy: We ship worldwide. Free standard shipping is available within the USA for all orders over $50. For orders under $50, standard shipping in the USA costs $4.99.
- Delivery Times: USA shipping takes 3-5 business days. International shipping takes 7-14 business days.
- Order Tracking: Customers can check their order status and tracking details using the tracking link provided in the shipping confirmation email sent once the order leaves our warehouse.
- Payment Methods Accepted: We accept Visa, Mastercard, American Express, Discover, PayPal, Apple Pay, and Google Pay.
- Canceling/Modifying Orders: Orders can be canceled or modified within 1 hour of placing them. After 1 hour, the order has entered our fulfillment system and cannot be changed, but can be returned free of charge after delivery.
- Damaged/Incorrect Items: If an item is received damaged or incorrect, the customer should notify support within 7 days of delivery with photos of the issue. We will arrange a free immediate replacement.
- Warranty: All physical products carry a 1-year limited warranty covering manufacturing defects.

Style & Rules:
- Be concise and clear in your responses.
- Maintain a warm, friendly, and helpful tone.
- If the customer asks a question you do not know the answer to, or requests to speak to a human, or exhibits high distress/anger, call the 'request_human_handoff' function.
`;

  static async generateAIResponse(history: ChatMessage[]): Promise<string> {
    try {
      const messages = [
        { role: 'system', content: this.SYSTEM_PROMPT },
        ...history,
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages as any,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'I apologize, but I am having trouble processing that request.';
    } catch (error) {
      logger.error(`Error in OpenAIService.generateAIResponse: ${error}`);
      throw error;
    }
  }

  // Real-time generator for streaming tokens to Socket.io connection
  static async *generateAIResponseStream(history: ChatMessage[]) {
    try {
      const messages = [
        { role: 'system', content: this.SYSTEM_PROMPT },
        ...history,
      ];

      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages as any,
        temperature: 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) yield text;
      }
    } catch (error) {
      logger.error(`Error in OpenAIService.generateAIResponseStream: ${error}`);
      throw error;
    }
  }
}

export default OpenAIService;
