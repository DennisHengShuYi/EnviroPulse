import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.ILMU_API_KEY || process.env.ANTHROPIC_API_KEY;
const model = process.env.ANTHROPIC_MODEL || 'ilmu-glm-5.1';

console.log('Testing Ilmu API with:');
console.log('API Key:', apiKey ? 'PRESENT' : 'MISSING');
console.log('Model:', model);

const client = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.ilmu.ai/v1/',
});

async function test() {
  try {
    console.log('Sending request...');
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Reply with "OK" and nothing else.' },
        { role: 'user', content: 'Test message' }
      ],
      max_tokens: 100
    });
    console.log('Full Response:', JSON.stringify(response, null, 2));
    console.log('Content:', response.choices[0].message.content);
  } catch (err) {
    console.error('Error during API call:');
    console.error(err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
  }
}

test();
