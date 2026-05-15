import OpenAI from 'openai';

try {
  const client = new OpenAI({
    apiKey: 'sk-test',
    baseURL: 'https://api.ilmu.ai/v1'
  });
  console.log('Client created. baseURL:', client.baseURL);
  
  // Try to manually construct the URL that OpenAI uses internally
  const url = new URL('chat/completions', client.baseURL);
  console.log('Joined URL:', url.toString());
} catch (err) {
  console.error('ERROR:', err);
}
