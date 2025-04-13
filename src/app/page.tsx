
'use client';

import React, {useState, useCallback} from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {analyzeClarityAndCoherence} from '@/ai/flows/clarity-and-coherence-feedback';
import {grammarAndSpellingCheck} from '@/ai/flows/grammar-and-spelling-check';
import {enhanceSentence} from '@/ai/flows/sentence-enhancement';
import {Separator} from '@/components/ui/separator';
import {ScrollArea} from "@/components/ui/scroll-area";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";

const Home = () => {
  const [inputText, setInputText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [clarityFeedback, setClarityFeedback] = useState('');
  const [enhancedSentences, setEnhancedSentences] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleGrammarCheck = useCallback(async () => {
    const result = await grammarAndSpellingCheck({text: inputText});
    setCorrectedText(result.correctedText);
  }, [inputText]);

  const handleClarityCheck = useCallback(async () => {
    const result = await analyzeClarityAndCoherence({text: inputText});
    setClarityFeedback(result.feedback);
  }, [inputText]);

  const handleSentenceEnhancement = useCallback(async () => {
    const sentences = inputText.split('.').filter(sentence => sentence.trim() !== '');
    const enhanced = await Promise.all(
      sentences.map(async sentence => {
        const result = await enhanceSentence({sentence: sentence.trim()});
        return result.enhancedSentence;
      })
    );
    setEnhancedSentences(enhanced);
  }, [inputText]);

  const hasCorrections = correctedText !== '' && correctedText !== inputText;

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        <span style={{color: '#A0D2EB'}}>Lingua</span>
        <span style={{color: '#008080'}}>Leap</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Text Area */}
        <Card>
          <CardHeader>
            <CardTitle>Original Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your English text here..."
              value={inputText}
              onChange={handleInputChange}
              className="bg-light-gray"
            />
          </CardContent>
        </Card>

        {/* Improved Text Area */}
        <Card>
          <CardHeader>
            <CardTitle>Improved Text</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] md:h-auto">
            {hasCorrections ? (
              <div>
                {/* Display with Highlighted Changes */}
                <p>
                  {correctedText.split(' ').map((word, index) => {
                    if (inputText.split(' ').includes(word)) {
                      return <span key={index}>{word} </span>;
                    } else {
                      return (
                        <span key={index} className="font-semibold text-teal-500">
                          {word}{' '}
                        </span>
                      );
                    }
                  })}
                </p>
              </div>
            ) : (
              <p>No corrections available yet. Please input text and click the "Check Grammar" button.</p>
            )}
             </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-6 gap-4">
        <Button onClick={handleGrammarCheck} style={{backgroundColor: '#008080', color: 'white'}}>
          Check Grammar
        </Button>
        <Button onClick={handleSentenceEnhancement} style={{backgroundColor: '#008080', color: 'white'}}>
          Enhance Sentences
        </Button>
      </div>

      {clarityFeedback && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Clarity and Coherence Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{clarityFeedback}</p>
          </CardContent>
        </Card>
      )}

      {enhancedSentences.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Enhanced Sentences</CardTitle>
          </CardHeader>
          <CardContent>
            {enhancedSentences.map((sentence, index) => (
              <div key={index} className="mb-4">
                <Badge className="mr-2">{`Sentence ${index + 1}`}</Badge>
                <p>{sentence}</p>
                {index < enhancedSentences.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <Toaster/>
    </div>
  );
};

import {
  useToast,
  TOAST_LIMIT,
  TOAST_REMOVE_DELAY
} from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

export default Home;
