import React, { createContext, useContext, useState } from 'react';

interface TestResult {
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
}

interface SubmissionContextType {
  submissions: Submission[];
  addSubmission: (submission: Submission) => void;
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

export const SubmissionProvider = ({ children }: { children: React.ReactNode }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const addSubmission = (submission: Submission) => {
    setSubmissions(prev => [...prev, submission]);
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