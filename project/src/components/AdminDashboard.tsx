import React, { useState } from 'react';
import { Code2, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubmissions } from '../context/SubmissionContext';

interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
}

interface Submission {
  id: string;
  username: string;
  submittedAt: string;
  timeSpent: number;
  submissions: {
    [key: number]: {
      code: string;
      language: string;
      passed: boolean;
      testResults: TestResult[];
    };
  };
}

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { submissions } = useSubmissions();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  console.log('Admin Dashboard - All submissions:', submissions); // Debug log
  console.log('Admin Dashboard - Auth status:', { isAuthenticated, isAdmin }); // Debug log

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateScore = (submission: Submission) => {
    let totalTests = 0;
    let passedTests = 0;
    
    Object.values(submission.submissions).forEach(sub => {
      totalTests += sub.testResults.length;
      passedTests += sub.testResults.filter(test => test.passed).length;
    });
    
    return `${passedTests}/${totalTests}`;
  };

  const clearSubmissions = () => {
    localStorage.removeItem('submissions');
    window.location.reload();
  };

  const debugSubmissions = () => {
    console.log('Current submissions:', submissions);
    const stored = localStorage.getItem('submissions');
    console.log('Stored submissions:', stored ? JSON.parse(stored) : 'none');
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p>Authentication Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
          <p>Admin Status: {isAdmin ? 'Admin' : 'Not Admin'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Code2 className="h-6 w-6 text-purple-600 mr-2" />
            <h1 className="text-xl font-bold">TechNova Admin Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={debugSubmissions}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Debug
            </button>
            <button
              onClick={clearSubmissions}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear All Submissions
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Recent Submissions</h2>
            {submissions.length === 0 ? (
              <p className="text-gray-500 text-center">No submissions yet</p>
            ) : (
              <div className="space-y-2">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    onClick={() => {
                      console.log('Selected submission:', submission);
                      setSelectedSubmission(submission);
                    }}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedSubmission?.id === submission.id
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="font-medium">{submission.username}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(submission.timeSpent)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Submitted: {formatDate(submission.submittedAt)}
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-purple-600 font-medium">
                        Score: {calculateScore(submission)} tests passed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            {selectedSubmission ? (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="border-b pb-4 mb-4">
                  <h2 className="text-xl font-semibold">Submission Details</h2>
                  <div className="text-gray-600">
                    <p>User: {selectedSubmission.username}</p>
                    <p>Submitted: {formatDate(selectedSubmission.submittedAt)}</p>
                    <p>Time Spent: {formatTime(selectedSubmission.timeSpent)}</p>
                    <p className="mt-2 text-purple-600">
                      Overall Score: {calculateScore(selectedSubmission)} tests passed
                    </p>
                  </div>
                </div>

                {Object.entries(selectedSubmission.submissions).map(([questionId, submission]) => (
                  <div key={questionId} className="mb-6 last:mb-0 border-b pb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Question {parseInt(questionId) + 1}
                    </h3>
                    <div className="bg-gray-50 p-4 rounded mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">Language: {submission.language}</span>
                        <span className={`flex items-center ${
                          submission.passed ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {submission.passed ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-1" />
                          )}
                          {submission.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto">
                        <code>{submission.code}</code>
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Test Results:</h4>
                      {submission.testResults.map((result, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center mb-1">
                            {result.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 mr-2" />
                            )}
                            <span className="font-medium">Test Case {index + 1}</span>
                          </div>
                          <div className="text-sm text-gray-600 ml-6">
                            <p>Input: {result.input}</p>
                            <p>Expected: {result.expected}</p>
                            <p>Actual: {result.actual}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
                Select a submission to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 