// src/app/api/summarize-order/route.ts
import { ai } from '@/ai/genkit';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { artist, serviceType, style, rhythm, objective, description } = await req.json();

  const prompt = ai.definePrompt({
    name: 'summarizeOrderPrompt',
    prompt: `Você é um produtor musical experiente na GraceTone.
Analise o pedido:
- Artista: ${artist}
- Tipo de Serviço: ${serviceType}
- Estilo: ${style}
- Ritmo: ${rhythm}
- Objetivo: ${objective}
- Descrição: ${description}
Gere um resumo conciso em markdown com pontos-chave, sugestões, desafios e prioridade.`,
  });

  const { output } = await prompt({});
  return NextResponse.json({ summary: output });
}
