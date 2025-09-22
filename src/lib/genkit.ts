// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

if (!process.env.GOOGLE_GENAI_API_KEY) {
  throw new Error('A variável de ambiente GOOGLE_GENAI_API_KEY não está definida.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY, // pega do .env
    }),
  ],
  model: 'googleai/gemini-2.5-flash', // string correta
});
