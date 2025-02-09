import React, { createContext, useContext, useState } from 'react';

export interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
}

interface QuestionSubmission {
  code: string;
  language: string;
  passed: boolean;
  testResults: TestResult[];
}

export interface Submission {
  id: string;
  username: string;
  submittedAt: string;
  timeSpent: number;
  submissions: {
    [key: number]: QuestionSubmission;
  };
  detailedResults?: Array<{
    questionId: number;
    title: string;
    description: string;
    code: string;
    language: string;
    passed: boolean;
    testResults: TestResult[];
    totalTestCases: number;
    passedTestCases: number;
  }>;
  overallScore?: {
    totalTestCases: number;
    passedTestCases: number;
  };
}

interface SubmissionContextType {
  submissions: Submission[];
  addSubmission: (submission: Submission) => void;
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

export const SubmissionProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize state from localStorage
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('submissions');
    return saved ? JSON.parse(saved) : [];
  });

  const addSubmission = (submission: Submission) => {
    console.log('Adding submission to context:', submission);
    setSubmissions(prev => {
      const newSubmissions = [...prev, submission];
      // Save to localStorage
      localStorage.setItem('submissions', JSON.stringify(newSubmissions));
      console.log('Updated submissions list:', newSubmissions);
      return newSubmissions;
    });
  };

  return (
    <SubmissionContext.Provider value={{ submissions, addSubmission }}>
      {children}
    </SubmissionContext.Provider>
  );
};

export const useSubmissions = () => {
  const context = useContext(SubmissionContext);
  if (context === undefined) {
    throw new Error('useSubmissions must be used within a SubmissionProvider');
  }
  return context;
};