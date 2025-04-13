'use server';
/**
 * @fileOverview Provides feedback on the overall clarity and coherence of a given text.
 *
 * - analyzeClarityAndCoherence - A function that analyzes the text and returns feedback.
 * - ClarityAndCoherenceInput - The input type for the analyzeClarityAndCoherence function.
 * - ClarityAndCoherenceOutput - The return type for the analyzeClarityAndCoherence function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ClarityAndCoherenceInputSchema = z.object({
  text: z.string().describe('The text to analyze for clarity and coherence.'),
});
export type ClarityAndCoherenceInput = z.infer<typeof ClarityAndCoherenceInputSchema>;

const ClarityAndCoherenceOutputSchema = z.object({
  feedback: z.string().describe('Feedback on the clarity and coherence of the text.'),
});
export type ClarityAndCoherenceOutput = z.infer<typeof ClarityAndCoherenceOutputSchema>;

export async function analyzeClarityAndCoherence(input: ClarityAndCoherenceInput): Promise<ClarityAndCoherenceOutput> {
  return clarityAndCoherenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'clarityAndCoherencePrompt',
  input: {
    schema: z.object({
      text: z.string().describe('The text to analyze for clarity and coherence.'),
    }),
  },
  output: {
    schema: z.object({
      feedback: z.string().describe('Feedback on the clarity and coherence of the text.'),
    }),
  },
  prompt: `You are an AI writing assistant that specializes in clarity and coherence.

  Please provide feedback on the following text, focusing on how to improve its clarity and coherence. Suggest specific changes to improve the flow of ideas and ensure the text is easily understandable.

  Text: {{{text}}}`,
});

const clarityAndCoherenceFlow = ai.defineFlow<
  typeof ClarityAndCoherenceInputSchema,
  typeof ClarityAndCoherenceOutputSchema
>({
  name: 'clarityAndCoherenceFlow',
  inputSchema: ClarityAndCoherenceInputSchema,
  outputSchema: ClarityAndCoherenceOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
