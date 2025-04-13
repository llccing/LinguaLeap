'use client';

import React from 'react';
import ArticleDisplay from './components/ArticleDisplay';
import PronunciationAssessment from './components/PronunciationAssessment';
import InputAndImprovedText from './components/InputAndImprovedText';
import ActionButtons from './components/ActionButtons';
import {Toaster} from "@/components/ui/toaster";

const Home = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <Toaster/>
      <h1 className="text-3xl font-bold text-center mb-8">
        <span style={{color: '#A0D2EB'}}>Lingua</span>
        <span style={{color: '#008080'}}>Leap</span>
      </h1>

      <ArticleDisplay/>

      <PronunciationAssessment/>

      <InputAndImprovedText/>

      <ActionButtons/>
    </div>
  );
};

export default Home;
