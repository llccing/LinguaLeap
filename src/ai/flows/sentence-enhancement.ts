'use server';
/**
 * @fileOverview Provides suggestions for improving sentences, including structure and vocabulary.
 *
 * - enhanceSentence - A function that enhances the given sentence.
 * - EnhanceSentenceInput - The input type for the enhanceSentence function.
 * - EnhanceSentenceOutput - The return type for the enhanceSentence function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const EnhanceSentenceInputSchema = z.object({
  sentence: z.string().describe('The sentence to be enhanced.'),
});
export type EnhanceSentenceInput = z.infer<typeof EnhanceSentenceInputSchema>;

const EnhanceSentenceOutputSchema = z.object({
  enhancedSentence: z.string().describe('The enhanced sentence with improved structure and vocabulary.'),
  explanation: z.string().describe('Explanation of the changes made to the sentence.'),
});
export type EnhanceSentenceOutput = z.infer<typeof EnhanceSentenceOutputSchema>;

export async function enhanceSentence(input: EnhanceSentenceInput): Promise<EnhanceSentenceOutput> {
  return enhanceSentenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceSentencePrompt',
  input: {
    schema: z.object({
      sentence: z.string().describe('The sentence to be enhanced.'),
    }),
  },
  output: {
    schema: z.object({
      enhancedSentence: z.string().describe('The enhanced sentence with improved structure and vocabulary.'),
      explanation: z.string().describe('Explanation of the changes made to the sentence.'),
    }),
  },
  prompt: `You are an AI English language coach specializing in sentence enhancement.

You will receive a sentence and your goal is to improve it by making suggestions for improving the sentence's structure and vocabulary to make it more engaging and polished.

Sentence: {{{sentence}}}

Respond with the enhanced sentence and a short explanation of the changes you made.
`,
});

const enhanceSentenceFlow = ai.defineFlow<
  typeof EnhanceSentenceInputSchema,
  typeof EnhanceSentenceOutputSchema
>({
  name: 'enhanceSentenceFlow',
  inputSchema: EnhanceSentenceInputSchema,
  outputSchema: EnhanceSentenceOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
