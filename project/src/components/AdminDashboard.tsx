import React, { useState } from 'react';
import { Code2, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubmissions } from '../context/SubmissionContext';
import { Submission, TestResult } from '../context/SubmissionContext';

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { submissions } = useSubmissions();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
        <div className="container mx-auto flex items-center">
          <Code2 className="h-6 w-6 text-purple-600 mr-2" />
          <h1 className="text-xl font-bold">TechNova Admin Dashboard</h1>
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
                      console.log('Selected submission:', submission); // Debug log
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
                    {submission.overallScore && (
                      <div className="mt-2 text-sm">
                        <span className="text-purple-600 font-medium">
                          Score: {submission.overallScore.passedTestCases}/{submission.overallScore.totalTestCases} tests passed
                        </span>
                      </div>
                    )}
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
                    {selectedSubmission.overallScore && (
                      <p className="mt-2 text-purple-600">
                        Overall Score: {selectedSubmission.overallScore.passedTestCases}/{selectedSubmission.overallScore.totalTestCases} tests passed
                      </p>
                    )}
                  </div>
                </div>

                {selectedSubmission.detailedResults?.map((result, index) => (
                  <div key={index} className="mb-8 last:mb-0">
                    <div className="border-b pb-2 mb-4">
                      <h3 className="text-lg font-semibold">
                        Question {index + 1}: {result.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{result.description}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-gray-600">Language: {result.language}</span>
                        <span className={result.passed ? 'text-green-600' : 'text-red-600'}>
                          {result.passedTestCases}/{result.totalTestCases} tests passed
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Submitted Code:</h4>
                      <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto">
                        <code>{result.code || 'No code submitted'}</code>
                      </pre>
                    </div>

                    {result.testResults && result.testResults.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Test Results:</h4>
                        <div className="space-y-2">
                          {result.testResults.map((test: TestResult, testIndex: number) => (
                            <div key={testIndex} className="bg-gray-50 p-3 rounded">
                              <div className="flex items-center mb-1">
                                {test.passed ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                                )}
                                <span className="font-medium">Test Case {testIndex + 1}</span>
                              </div>
                              <div className="text-sm text-gray-600 ml-6">
                                <p>Input: {test.input}</p>
                                <p>Expected: {test.expected}</p>
                                <p>Actual: {test.actual}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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