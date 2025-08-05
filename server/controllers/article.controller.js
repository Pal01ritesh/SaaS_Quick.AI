import sql from '../config/db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { clerkClient } from '@clerk/express';
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export const generateArticle = async (request, response) => {
  try {
    const { userId } = request.auth();
    const { prompt, length } = request.body;
    const plan = request.plan;
    const free_usage = request.free_usage;

    if (!prompt || !length) {
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
        maxOutputTokens: length
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
      VALUES (${userId}, ${prompt}, ${content}, 'article')
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





// Resume Review


export const resumeReview = async (request, response) => {
  try {
    const { userId } = request.auth();
    const resume = request.file;
    const plan = request.plan;

    if (plan !== 'premium') {
      return response.status(403).json({
        success: false,
        message: 'Feature only available for premium users. Upgrade to continue.',
      });
    }

    if (!resume || !resume.path) {
      return response.status(400).json({
        success: false,
        message: 'No resume file uploaded.',
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return response.status(400).json({
        success: false,
        message: 'Resume file size exceeds allowed size (5MB).',
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfdata = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide detailed, constructive feedback including strengths, weaknesses, and suggested improvements:\n\n${pdfdata.text}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    const content = result.response.text();

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${'Review the uploaded resume'}, ${content}, 'resume-review')
    `;

    response.json({ success: true, content });

  } catch (error) {
    console.error('Resume Review Error:', error.message);
    response.status(500).json({
      success: false,
      message: 'Something went wrong while reviewing the resume.',
    });
  }
};
