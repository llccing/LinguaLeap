'use client';

import React, {useCallback, useState} from 'react';
import {Button} from '@/components/ui/button';
import {analyzeClarityAndCoherence} from '@/ai/flows/clarity-and-coherence-feedback';
import {enhanceSentence} from '@/ai/flows/sentence-enhancement';
import {Separator} from '@/components/ui/separator';
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";

interface ActionButtonsProps {
  inputText: string;
}

const ActionButtons = () => {
  const [clarityFeedback, setClarityFeedback] = useState('');
  const [enhancedSentences, setEnhancedSentences] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');

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

  return (
    <>
      <div className="flex justify-center mt-6 gap-4">
        <Button onClick={handleClarityCheck} style={{backgroundColor: '#008080', color: 'white'}}>
          Check Clarity
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
            <ScrollArea>
              {enhancedSentences.map((sentence, index) => (
                <div key={index}>
                  <Badge className="mr-2">{`Sentence ${index + 1}`}</Badge>
                  <p>{sentence}</p>
                  {index < enhancedSentences.length - 1 && <Separator/>}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ActionButtons;
