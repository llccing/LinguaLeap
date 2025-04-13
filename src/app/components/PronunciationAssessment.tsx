'use client';

import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

const PronunciationAssessment = () => {
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);

  const handlePronunciationAssessment = async () => {
    setIsAssessing(true);
    // Simulate assessment delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setAssessmentScore(Math.floor(Math.random() * 100)); // Generate a random score
    setIsAssessing(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Pronunciation Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handlePronunciationAssessment} disabled={isAssessing}>
          {isAssessing ? 'Assessing Pronunciation...' : 'Assess Pronunciation'}
        </Button>
        {assessmentScore !== null && (
          <div className="mt-4">
            <p>Pronunciation Score: {assessmentScore}/100</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PronunciationAssessment;
