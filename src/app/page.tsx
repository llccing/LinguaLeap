'use client';

import React, {useCallback, useState} from 'react';
import ArticleDisplay from './components/ArticleDisplay';
import PronunciationAssessment from './components/PronunciationAssessment';
import InputAndImprovedText from './components/InputAndImprovedText';
import FeedbackDisplay from './components/FeedbackDisplay';
import {Toaster} from "@/components/ui/toaster";
import {grammarAndSpellingCheck} from "@/ai/flows/grammar-and-spelling-check";

const Home = () => {
  const [inputText, setInputText] = useState('');

  const grammarCheck = useCallback(async (text: string) => {
    try {
      const result = await grammarAndSpellingCheck({text: text});
      return result.correctedText;
    } catch (error) {
      console.error('Grammar check failed:', error);
      return undefined;
    }
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <Toaster/>
      <h1 className="text-3xl font-bold text-center mb-8">
        <span style={{color: '#A0D2EB'}}>Lingua</span>
        <span style={{color: '#008080'}}>Leap</span>
      </h1>

      <ArticleDisplay/>

      <PronunciationAssessment/>

      {/* <InputAndImprovedText onGrammarCheck={grammarCheck} />
      <FeedbackDisplay inputText={inputText}/> */}
    </div>
  );
};

export default Home;
