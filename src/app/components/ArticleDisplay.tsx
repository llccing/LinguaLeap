'use client';

import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Pause, Play} from 'lucide-react';
import {useToast} from "@/hooks/use-toast";

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

const ArticleDisplay = () => {
  const [selectedLevel, setSelectedLevel] = useState('B2');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesisRef] = useState(() => typeof window !== 'undefined' ? window.speechSynthesis : null);
  const {toast} = useToast();

  const handleSpeak = () => {
    if (!speechSynthesisRef) return;

    const text = articleData[selectedLevel as keyof typeof articleData]?.excerpt || '';

    if (speechSynthesisRef.speaking) {
      speechSynthesisRef.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesisRef.speak(utterance);
  };

  // Placeholder for AI-powered voice reading
  const handleAISpeak = async () => {
    toast({
      title: 'AI Voice Reading',
      description: 'This feature is currently a placeholder. Integrating a high-quality AI text-to-speech service requires additional API integration and setup.',
    });
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
  };

  const currentArticle = articleData[selectedLevel as keyof typeof articleData];

  return (
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
  );
};

export default ArticleDisplay;
