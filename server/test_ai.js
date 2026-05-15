import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const aiClient = new OpenAI({
  apiKey: process.env.ILMU_API_KEY || process.env.ANTHROPIC_API_KEY || 'sk-dummy-key-for-local-dev',
  baseURL: 'https://api.ilmu.ai/v1/',
  timeout: 60000
});

const AI_MODEL = process.env.ANTHROPIC_MODEL || 'ilmu-glm-5.1';

async function testAI() {
  console.log('Testing AI connection...');
  console.log('Model:', AI_MODEL);
  console.log('Base URL:', aiClient.baseURL);
  
  try {
    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello" }
      ]
    });
    console.log('Response:', JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('AI Error:', err.message);
  }
}

testAI();
