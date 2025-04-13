'use server';
/**
 * @fileOverview A grammar and spelling check AI agent.
 *
 * - grammarAndSpellingCheck - A function that handles the grammar and spelling check process.
 * - GrammarAndSpellingCheckInput - The input type for the grammarAndSpellingCheck function.
 * - GrammarAndSpellingCheckOutput - The return type for the grammarAndSpellingCheck function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GrammarAndSpellingCheckInputSchema = z.object({
  text: z.string().describe('The text to check for grammar and spelling errors.'),
});
export type GrammarAndSpellingCheckInput = z.infer<typeof GrammarAndSpellingCheckInputSchema>;

const GrammarAndSpellingCheckOutputSchema = z.object({
  correctedText: z.string().describe('The text corrected for grammar and spelling errors.'),
});
export type GrammarAndSpellingCheckOutput = z.infer<typeof GrammarAndSpellingCheckOutputSchema>;

export async function grammarAndSpellingCheck(input: GrammarAndSpellingCheckInput): Promise<GrammarAndSpellingCheckOutput> {
  return grammarAndSpellingCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'grammarAndSpellingCheckPrompt',
  input: {
    schema: z.object({
      text: z.string().describe('The text to check for grammar and spelling errors.'),
    }),
  },
  output: {
    schema: z.object({
      correctedText: z.string().describe('The text corrected for grammar and spelling errors.'),
    }),
  },
  prompt: `You are an AI expert in grammar and spelling.

You will be given a text, and you will return the text corrected for grammar and spelling errors.

Text: {{{text}}}
`,
});

const grammarAndSpellingCheckFlow = ai.defineFlow<
  typeof GrammarAndSpellingCheckInputSchema,
  typeof GrammarAndSpellingCheckOutputSchema
>({
  name: 'grammarAndSpellingCheckFlow',
  inputSchema: GrammarAndSpellingCheckInputSchema,
  outputSchema: GrammarAndSpellingCheckOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
