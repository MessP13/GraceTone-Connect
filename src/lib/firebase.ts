import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { GoogleAI } from "@genkit-ai/googleai";
import { Genkit } from "genkit";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializa o Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

// Inicializa o Genkit / Google AI
const googleApiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!googleApiKey) {
  throw new Error("A variável GOOGLE_GENAI_API_KEY não está definida.");
}

export const genkit = new Genkit({
  provider: new GoogleAI({
    apiKey: googleApiKey,
    model: "googleai/gemini-2.5-flash",
  }),
});
