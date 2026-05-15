import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const aiClient = new OpenAI({
  apiKey: process.env.ILMU_API_KEY || process.env.ANTHROPIC_API_KEY || 'sk-dummy-key-for-local-dev',
  baseURL: 'https://api.ilmu.ai/v1',
});

const AI_MODEL = process.env.ANTHROPIC_MODEL || 'ilmu-glm-5.1';

async function testConnection() {
  console.log(`[TEST_LLM] Testing connection to ${AI_MODEL} at ${aiClient.baseURL}...`);
  try {
    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "user", content: "Say 'LLM_CONNECTION_SUCCESSFUL' if you can read this." }
      ],
      max_tokens: 50
    });

    console.log('[TEST_LLM] RESPONSE:', response.choices[0]?.message?.content);
    process.exit(0);
  } catch (err) {
    console.error('[TEST_LLM] FAILED:', err.message);
    if (err.response) {
      console.error('[TEST_LLM] STATUS:', err.response.status);
      console.error('[TEST_LLM] DATA:', err.response.data);
    }
    process.exit(1);
  }
}

testConnection();
