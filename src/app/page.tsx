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
import {Mic, Text, Pause, Play} from 'lucide-react';

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const articleData = {
  A1: {
    title: "The Little Prince",
    excerpt: "Once when I was six years old I saw a magnificent picture in a book about the jungle. It showed a snake swallowing a wild beast. I worked hard drawing my first picture. Then I showed the grown-ups and asked if they were scared. They said, 'Why be scared of a hat?'",
  },
  A2: {
    title: "Alice's Adventures in Wonderland",
    excerpt: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do. Once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, and what is the use of a book, thought Alice, without pictures or conversations?",
  },
  B1: {
    title: "The Adventures of Sherlock Holmes",
    excerpt: "To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.",
  },
  B2: {
    title: "Pride and Prejudice",
    excerpt: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
  },
  C1: {
    title: "Moby Dick",
    excerpt: "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation.",
  },
  C2: {
    title: "Ulysses",
    excerpt: "Stately, plump Buck Mulligan came from the stairhead, bearing a bowl of lather on which a mirror and a razor lay crossed. Buck Mulligan paused at the stairhead. 'He is a bold fellow,' he said. 'He dares to violate, descends from the tower, halts, reasons with himself, half decides to return, surmounts all, and then sails gaily forth.'",
  },
};

const Home = () => {
  const [inputText, setInputText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [clarityFeedback, setClarityFeedback] = useState('');
  const [enhancedSentences, setEnhancedSentences] = useState<string[]>([]);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const {toast} = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('B2');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // State for pronunciation assessment
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);

  // State and refs for media recording
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
  }, []);

  const handleSpeak = () => {
    if (!speechSynthesisRef.current) return;

    const text = articleData[selectedLevel as keyof typeof articleData]?.excerpt || '';

    if (speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesisRef.current.speak(utterance);
  };

  // Placeholder for AI-powered voice reading
  const handleAISpeak = async () => {
    toast({
      title: 'AI Voice Reading',
      description: 'This feature is currently a placeholder. Integrating a high-quality AI text-to-speech service requires additional API integration and setup.',
    });
  };

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      setMediaRecorder(recorder);
      setAudioChunks([]); // Clear previous audio chunks
      setAudioUrl(null); // Revoke previous audio URL if it exists

      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting media recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Failed to start recording. Please check microphone permissions.',
        variant: 'destructive',
      });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const hasCorrections = correctedText !== '' && correctedText !== inputText;

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
  };

  const currentArticle = articleData[selectedLevel as keyof typeof articleData];

  // Placeholder for pronunciation assessment
  const handlePronunciationAssessment = async () => {
    setIsAssessing(true);
    // Simulate assessment delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setAssessmentScore(Math.floor(Math.random() * 100)); // Generate a random score
    setIsAssessing(false);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Toaster/>
      <h1 className="text-3xl font-bold text-center mb-8">
        <span style={{color: '#A0D2EB'}}>Lingua</span>
        <span style={{color: '#008080'}}>Leap</span>
      </h1>

      {/* Article Display Section */}
      <Card className="mb-6">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Challenge Article ({selectedLevel})</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleSpeak} aria-label="Read Article">
              {isSpeaking ? <Pause/> : <Play/>}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleAISpeak} aria-label="Read Article with AI">
              🤖
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{currentArticle?.excerpt}</p>
          <div className="flex justify-between items-center">
            <span>From: {currentArticle?.title}</span>
            <select
              className="border rounded p-2"
              value={selectedLevel}
              onChange={(e) => handleLevelChange(e.target.value)}
            >
              {cefrLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Pronunciation Assessment Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pronunciation Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handlePronunciationAssessment} disabled={isAssessing}>
            {isAssessing ? 'Assessing...' : 'Assess Pronunciation'}
          </Button>
          {assessmentScore !== null && (
            <div className="mt-4">
              <p>Pronunciation Score: {assessmentScore}/100</p>
            </div>
          )}
        </CardContent>
      </Card>

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
            {/* Audio Playback */}
            {audioUrl && (
              <div className="mt-4">
                <audio controls src={audioUrl} ref={audioRef}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
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
    </div>
  );
};

export default Home;
