'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBioInputSchema = z.object({
  artistName: z.string().describe('O nome artístico do músico ou banda.'),
  preferredStyle: z.string().describe('O estilo musical principal do artista.'),
  preferredRhythm: z.string().describe('O ritmo ou andamento preferido do artista.'),
});
export type GenerateBioInput = z.infer<typeof GenerateBioInputSchema>;

const GenerateBioOutputSchema = z.object({
  bio: z.string().describe('A biografia gerada para o artista.'),
});
export type GenerateBioOutput = z.infer<typeof GenerateBioOutputSchema>;

export async function generateBio(input: GenerateBioInput): Promise<GenerateBioOutput> {
  return generateBioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBioPrompt',
  input: { schema: GenerateBioInputSchema },
  output: { schema: GenerateBioOutputSchema },
  prompt: `Você é um especialista em marketing para músicos cristãos na GraceTone.
Sua tarefa é escrever uma biografia curta e impactante (no máximo 280 caracteres) para um artista.

Use as seguintes informações:
Nome do Artista: {{{artistName}}}
Estilo Musical: {{{preferredStyle}}}
Ritmo Preferido: {{{preferredRhythm}}}

A biografia deve ser inspiradora, profissional e adequada para um público gospel.
Concentre-se em transmitir a paixão e o ministério do artista através da música.
Gere apenas o texto da biografia.
`,
});

const generateBioFlow = ai.defineFlow(
  {
    name: 'generateBioFlow',
    inputSchema: GenerateBioInputSchema,
    outputSchema: GenerateBioOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
