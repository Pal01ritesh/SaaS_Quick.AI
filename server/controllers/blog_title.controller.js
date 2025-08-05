import sql from '../config/db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { clerkClient } from '@clerk/express';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const generateBlogTitle = async (request, response) => {
  try {
    const { userId } = request.auth();
    const { prompt } = request.body;
    const plan = request.plan;
    const free_usage = request.free_usage;

    if (!prompt) {
      return response.status(400).json({
        success: false,
        message: 'Missing prompt or length in request body.'
      });
    }

    if (plan !== 'premium' && free_usage >= 10) {
      return response.status(403).json({
        success: false,
        message: 'Limit reached. Upgrade to continue.'
      });
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100
      }
    });

    const content = result.response.text();

    if (!content) {
      return response.status(500).json({
        success: false,
        message: 'AI did not return any content.'
      });
    }

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    if (plan !== 'premium') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1
        }
      });
    }

    response.json({ success: true, content });
  } catch (error) {
    console.error('AI Generation Error:', error.message);
    response.status(500).json({
      success: false,
      message: 'Something went wrong while generating the article.'
    });
  }
};
