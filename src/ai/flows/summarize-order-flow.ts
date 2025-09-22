'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeOrderInputSchema = z.object({
  artist: z.string().describe('O nome do artista.'),
  serviceType: z.string().describe('O tipo de serviço solicitado.'),
  style: z.string().describe('O estilo musical preferido.'),
  rhythm: z.string().describe('O ritmo preferido.'),
  objective: z.string().describe('O objetivo da música.'),
  description: z.string().describe('A descrição do artista para a sua visão.'),
});
export type SummarizeOrderInput = z.infer<typeof SummarizeOrderInputSchema>;

const SummarizeOrderOutputSchema = z.object({
  summary: z.string().describe('O resumo gerado para a equipa de produção.'),
});
export type SummarizeOrderOutput = z.infer<typeof SummarizeOrderOutputSchema>;

export async function summarizeOrder(input: SummarizeOrderInput): Promise<SummarizeOrderOutput> {
  return summarizeOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeOrderPrompt',
  input: { schema: SummarizeOrderInputSchema },
  output: { schema: SummarizeOrderOutputSchema },
  prompt: `Você é um produtor musical experiente na GraceTone, especialista em música gospel.
Sua tarefa é analisar os detalhes de um novo pedido e criar um resumo conciso e útil em formato de tópicos (markdown) para a equipa de produção.

Analise as seguintes informações do pedido:
- Artista: {{{artist}}}
- Tipo de Serviço: {{{serviceType}}}
- Estilo Musical: {{{style}}}
- Ritmo/Andamento: {{{rhythm}}}
- Objetivo: {{{objective}}}
- Descrição do Artista: {{{description}}}

Com base nisso, gere um resumo que inclua:
- **Pontos-Chave:** Um ou dois pontos principais da visão do artista.
- **Sugestões de Produção:** Sugestões iniciais de instrumentação, arranjo ou abordagem vocal.
- **Possíveis Desafios:** Identifique quaisquer ambiguidades ou desafios técnicos.
- **Prioridade Sugerida:** Sugira uma prioridade (Baixa, Média, Alta).

O resumo deve ser curto, direto e prático, mas sem omitir detalhes importantes. Retorne APENAS o texto da biografia.
`,
});

const summarizeOrderFlow = ai.defineFlow(
  {
    name: 'summarizeOrderFlow',
    inputSchema: SummarizeOrderInputSchema,
    outputSchema: SummarizeOrderOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
