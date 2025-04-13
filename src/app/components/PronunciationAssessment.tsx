'use client';

import React, {useEffect, useState, useRef} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useToast} from "@/hooks/use-toast";
import {Mic, Square, Play, Pause} from 'lucide-react';

const PronunciationAssessment = () => {
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMediaRecording, setIsMediaRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const {toast} = useToast();

  const handlePronunciationAssessment = async () => {
    setIsAssessing(true);
    // Simulate assessment delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setAssessmentScore(Math.floor(Math.random() * 100)); // Generate a random score
    setIsAssessing(false);
  };

  const startRecording = async () => {
    try {
      // Ensure mediaDevices is available
      if (!navigator.mediaDevices) {
        // Create a type-safe polyfill
        (navigator as any).mediaDevices = {};
      }

      // Ensure getUserMedia is available
      if (!navigator.mediaDevices.getUserMedia) {
        (navigator.mediaDevices as any).getUserMedia = function(constraints: MediaStreamConstraints) {
          const getUserMedia = (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia;
          
          if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
          }

          return new Promise<MediaStream>((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        }
      }

      // Request microphone permissions with more detailed constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });
      
      // Check if we actually got an audio track
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks found in the stream');
      }
      
      // Log audio track settings for debugging
      console.log('Audio track settings:', audioTracks[0].getSettings());
      
      // Check for supported MIME types
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });

      setMediaRecorder(recorder);
      setAudioChunks([]); // Clear previous audio chunks
      setAudioUrl(null); // Revoke previous audio URL if it exists

      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, {type: mimeType});
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
        setIsMediaRecording(false);  // Set recording state to false
      };

      recorder.start();
      setIsRecording(true);
      setIsMediaRecording(true);  // Set recording state to true
      
      toast({
        title: 'Recording Started',
        description: 'Your pronunciation is being recorded.',
      });
    } catch (error) {
      console.error('Error starting media recording:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to start recording. ';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Microphone access was denied. Please check your browser permissions.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No microphone was found. Please connect a microphone and try again.';
        } else if (error.name === 'NotReadableError') {
          errorMessage += 'Your microphone is busy or not readable. Please check if another application is using it.';
        } else {
          errorMessage += error.message;
        }
      }
      
      toast({
        title: 'Recording Error',
        description: errorMessage,
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
      
      toast({
        title: 'Recording Stopped',
        description: 'Your pronunciation has been recorded.',
      });
    }
  };
  
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Pronunciation Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <Button 
                onClick={startRecording} 
                className="flex items-center gap-2"
                variant="outline"
              >
                <Mic className="h-4 w-4" />
                Start Recording
              </Button>
            ) : (
              <Button 
                onClick={stopRecording} 
                className="flex items-center gap-2"
                variant="destructive"
              >
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            )}
          </div>
          
          {audioUrl && (
            <div className="flex items-center gap-2">
              <Button 
                onClick={togglePlayback} 
                className="flex items-center gap-2"
                variant="outline"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'} Recording
              </Button>
              <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
            </div>
          )}

          <Button 
            onClick={handlePronunciationAssessment} 
            disabled={isAssessing || !audioUrl}
            className="mt-2"
          >
            {isAssessing ? 'Assessing Pronunciation...' : 'Assess Pronunciation'}
          </Button>
          
          {assessmentScore !== null && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-lg font-medium">Pronunciation Score: {assessmentScore}/100</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PronunciationAssessment;
