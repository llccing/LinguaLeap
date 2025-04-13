'use client';

import React, {useState, useCallback, useRef, useEffect} from 'react';
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
import {useToast} from "@/hooks/use-toast";
import {Toaster} from "@/components/ui/toaster";
import {Mic, Text, Pause} from 'lucide-react';

const Home = () => {
  const [inputText, setInputText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [clarityFeedback, setClarityFeedback] = useState('');
  const [enhancedSentences, setEnhancedSentences] = useState<string[]>([]);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const {toast} = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current!.continuous = true;
      recognitionRef.current!.interimResults = true;

      recognitionRef.current!.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setInputText(prevText => prevText + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognitionRef.current!.onstart = () => {
        setIsRecording(true);
        toast({
          title: 'Voice Input Started',
          description: 'Speak now, and your words will be converted to text.',
        });
      };

      recognitionRef.current!.onend = () => {
        setIsRecording(false);
        toast({
          title: 'Voice Input Ended',
          description: 'Voice input has been stopped.',
        });
      };

      recognitionRef.current!.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsRecording(false);
        console.error('Speech recognition error:', event.error);
        toast({
          title: 'Voice Input Error',
          description: `An error occurred during voice input: ${event.error}`,
          variant: 'destructive',
        });
      };

    } else {
      console.warn('Speech Recognition API not supported in this browser.');
      toast({
        title: 'Voice Input Not Supported',
        description: 'Your browser does not support the Speech Recognition API.',
        variant: 'destructive',
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
      }
    };
  }, [toast]);

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

  const handleToggleInputMethod = () => {
    setIsVoiceInput(prev => !prev);
    setInputText(''); // Clear the input text when switching
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

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
            <div className="relative">
              <Textarea
                placeholder="Enter your English text here..."
                value={inputText}
                onChange={handleInputChange}
                disabled={isVoiceInput}
                className="bg-light-gray pr-12"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleInputMethod}
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                aria-label="Toggle Input Method"
              >
                {isVoiceInput ? <Text/> : <Mic/>}
              </Button>
              {isVoiceInput && (
                <div className="absolute bottom-2 right-2">
                  {isRecording ? (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={stopRecording}
                      aria-label="Stop Recording"
                    >
                      <Pause/>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={startRecording}
                      aria-label="Start Recording"
                    >
                      <Mic/>
                    </Button>
                  )}
                </div>
              )}
            </div>
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
                {index < enhancedSentences.length - 1 && <Separator/>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <Toaster/>
    </div>
  );
};

export default Home;
