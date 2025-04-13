'use client';

import React, {useState, useCallback, useRef, useEffect} from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {grammarAndSpellingCheck} from '@/ai/flows/grammar-and-spelling-check';
import {Separator} from '@/components/ui/separator';
import {ScrollArea} from "@/components/ui/scroll-area";
import {Mic, Text, Pause} from 'lucide-react';
import {useToast} from "@/hooks/use-toast";

const InputAndImprovedText = () => {
  const [inputText, setInputText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const {toast} = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // State and refs for media recording
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // New state to track media recording status
  const [isMediaRecording, setIsMediaRecording] = useState(false);

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

  const handleToggleInputMethod = () => {
    setIsVoiceInput(prev => !prev);
    setInputText(''); // Clear the input text when switching
    if (recognitionRef.current) {
      if (isRecording) {
        recognitionRef.current.stop();
      } else {
        // Check if recognition is already running before starting
        if (recognitionRef.current.state !== 'running') {
          recognitionRef.current.start();
        }
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      const recorder = new MediaRecorder(stream);

      setMediaRecorder(recorder);
      setAudioChunks([]); // Clear previous audio chunks
      setAudioUrl(null); // Revoke previous audio URL if it exists

      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, {type: 'audio/webm'});
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
        setIsMediaRecording(false);  // Set recording state to false
      };

      recorder.start();
      setIsRecording(true);
      setIsMediaRecording(true);  // Set recording state to true
    } catch (error) {
      console.error('Error starting media recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Failed to start recording. Please check microphone permissions.',
        variant: 'destructive',
      });
      setIsRecording(false);
      setIsMediaRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isMediaRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsMediaRecording(false);
    }
  };

  const hasCorrections = correctedText !== '' && correctedText !== inputText;

  return (
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
                {isMediaRecording ? (
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
  );
};

export default InputAndImprovedText;
