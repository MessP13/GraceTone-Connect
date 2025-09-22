// src/app/api/generate-bio/route.ts
import { ai } from '@/ai/genkit';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { artistName, preferredStyle, preferredRhythm } = await req.json();

  const prompt = ai.definePrompt({
    name: 'generateBioPrompt',
    prompt: `Você é um especialista em marketing para músicos cristãos na GraceTone.
Use as seguintes informações:
Nome do Artista: ${artistName}
Estilo Musical: ${preferredStyle}
Ritmo Preferido: ${preferredRhythm}
Gere uma biografia curta e impactante (máx. 280 caracteres).`,
  });

  const { output } = await prompt({});
  return NextResponse.json({ bio: output });
}
