'use server';

import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBioInputSchema = z.object({
  artistName: z.string(),
  preferredStyle: z.string(),
  preferredRhythm: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const input = GenerateBioInputSchema.parse(body);

  const prompt = ai.definePrompt({
    name: 'generateBioPrompt',
    input: { schema: GenerateBioInputSchema },
    output: { schema: z.object({ bio: z.string() }) },
    prompt: `Você é um especialista em marketing para músicos cristãos na GraceTone.
Use as informações:
Nome: {{{artistName}}}
Estilo: {{{preferredStyle}}}
Ritmo: {{{preferredRhythm}}}
Gere apenas o texto da biografia.`,
  });

  const { output } = await prompt(input);

  return NextResponse.json(output);
}
