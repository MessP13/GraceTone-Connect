import { GenKit } from "@genkit-ai/googleai";

export const genkit = new GenKit({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
  provider: "googleAI",
  model: "googleai/gemini-2.5-flash",
});
