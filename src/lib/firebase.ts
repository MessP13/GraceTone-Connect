// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { genkit } from 'genkit';
import { gemini25Flash, googleAI } from '@genkit-ai/googleai';

// --- Firebase ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

// --- Genkit / Google AI ---
if (!process.env.GOOGLE_GENAI_API_KEY) {
  throw new Error("A variável de ambiente GOOGLE_GENAI_API_KEY não está definida.");
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: gemini25Flash,
});

// --- Exemplo de fluxo reutilizável ---
export const helloFlow = ai.defineFlow('helloFlow', async (name: string) => {
  const { text } = await ai.generate(`Hello Gemini, my name is ${name}`);
  return text;
});
