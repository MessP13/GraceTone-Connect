'use server';

import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeOrderInputSchema = z.object({
  artist: z.string(),
  serviceType: z.string(),
  style: z.string(),
  rhythm: z.string(),
  objective: z.string(),
  description: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const input = SummarizeOrderInputSchema.parse(body);

  const prompt = ai.definePrompt({
    name: 'summarizeOrderPrompt',
    input: { schema: SummarizeOrderInputSchema },
    output: { schema: z.object({ summary: z.string() }) },
    prompt: `Você é um produtor musical experiente na GraceTone, especialista em música gospel.
Analise o pedido:
- Artista: {{{artist}}}
- Tipo de Serviço: {{{serviceType}}}
- Estilo: {{{style}}}
- Ritmo: {{{rhythm}}}
- Objetivo: {{{objective}}}
- Descrição: {{{description}}}

Gere um resumo curto em tópicos (markdown) incluindo pontos-chave, sugestões de produção, possíveis desafios e prioridade.
Retorne apenas o texto do resumo.`,
  });

  const { output } = await prompt(input);

  return NextResponse.json(output);
}
