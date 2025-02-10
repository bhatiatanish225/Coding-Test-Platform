import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Timer, Code2, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubmissions } from '../context/SubmissionContext';
import { useAuth } from '../context/AuthContext';

const questions = [
  {
    id: 1,
    title: 'Binary Tree Right Side View',
    description: `Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.

Constraints:
- The number of nodes in the tree is in the range [0, 100]
- -100 <= Node.val <= 100`,
    examples: [
      {
        input: 'root = [1,2,3,null,5,null,4]',
        output: '[1,3,4]',
        explanation: 'When viewing from the right side, you can see nodes 1, 3, and 4.'
      },
      {
        input: 'root = [1,2,3,4,null,null,null,5]',
        output: '[1,3,4,5]',
        explanation: 'When viewing from the right side, you can see nodes 1, 3, 4, and 5.'
      }
    ],
    templates: {
      cpp: `/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    vector<int> rightSideView(TreeNode* root) {
        // Write your code here
        // Return the values visible from the right side
        return {};
    }
};`,
      python: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        # Write your code here
        # Return the values visible from the right side
        return []`
    }
  },
  {
    id: 2,
    title: 'Longest Increasing Path in a Matrix',
    description: 'Given an m x n integer matrix matrix, return the length of the longest increasing path in matrix.',
    examples: [
      {
        input: 'matrix = [[9,9,4],[6,6,8],[2,1,1]]',
        output: '4',
        explanation: 'The longest increasing path is [1, 2, 6, 9].'
      },
      {
        input: 'matrix = [[3,4,5],[3,2,6],[2,2,1]]',
        output: '4',
        explanation: 'The longest increasing path is [1, 2, 3, 4].'
      }
    ],
    testCases: [
      { input: { matrix: [[9,9,4],[6,6,8],[2,1,1]] }, expected: "4" },
      { input: { matrix: [[3,4,5],[3,2,6],[2,2,1]] }, expected: "4" },
      { input: { matrix: [[1]] }, expected: "1" },
      { input: { matrix: [[1,2,3],[6,5,4],[7,8,9]] }, expected: "9" },
      { input: { matrix: [[1,1,1],[1,1,1],[1,1,1]] }, expected: "1" },
      { input: { matrix: [[1,2],[3,4]] }, expected: "4" },
      { input: { matrix: [[10,9,8],[11,8,7],[12,7,6]] }, expected: "6" },
      { input: { matrix: [[7,6,1],[2,3,4],[5,8,9]] }, expected: "6" },
      { input: { matrix: [[1,2,3,4],[5,6,7,8],[9,10,11,12]] }, expected: "12" },
      { input: { matrix: [[1,2,3],[6,5,4],[7,8,9]] }, expected: "9" }
    ],
    templates: {
      cpp: `class Solution {
public:
    int longestIncreasingPath(vector<vector<int>>& matrix) {
        // Write your code here
        // Return the length of the longest increasing path
        return 0;
    }
};`,
      python: `class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        # Write your code here
        # Return the length of the longest increasing path
        return 0`
    }
  }
];

const Assessment = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [language, setLanguage] = useState<'cpp' | 'python'>('python');
  const [code, setCode] = useState({
    cpp: questions[0].templates.cpp,
    python: questions[0].templates.python
  });
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [submissions, setSubmissions] = useState<Record<number, { 
    code: string; 
    language: string; 
    passed: boolean;
    testResults: Array<{ passed: boolean; input: string; expected: string; actual: string }>;
  }>>({});
  const [testResults, setTestResults] = useState<{ 
    passing: boolean; 
    loading: boolean;
    results: Array<{ passed: boolean; input: string; expected: string; actual: string }>;
  }>({ 
    passing: false, 
    loading: false,
    results: []
  });
  const [showFinalSubmit, setShowFinalSubmit] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const { addSubmission } = useSubmissions();
  const { isAuthenticated } = useAuth();
  const [username, setUsername] = useState('anjum_test'); // or get from auth context
  const [fullscreenWarnings, setFullscreenWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Update code templates when changing questions
    if (!submissions[currentQuestion]) {
      setCode({
        cpp: questions[currentQuestion].templates.cpp,
        python: questions[currentQuestion].templates.python
      });
    } else {
      // If question was already submitted, show the submitted code
      setCode(prev => ({
        ...prev,
        [language]: submissions[currentQuestion].code
      }));
    }
  }, [currentQuestion]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleFinalSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check if all questions are submitted and passed
    const allSubmitted = Object.keys(submissions).length === questions.length;
    const allPassed = Object.values(submissions).every(s => s.passed);
    setShowFinalSubmit(allSubmitted && allPassed);
  }, [submissions]);

  useEffect(() => {
    // Prevent exiting fullscreen
    const handleFullscreenChange = async () => {
      if (!document.fullscreenElement) {
        try {
          setFullscreenWarnings(prev => {
            const newWarnings = prev + 1;
            if (newWarnings >= 3) {
              handleFinalSubmit();
              return prev;
            }
            return newWarnings;
          });
          setShowWarningModal(true);
          // Small delay to ensure smooth transition back to fullscreen
          await new Promise(resolve => setTimeout(resolve, 500));
          await document.documentElement.requestFullscreen();
        } catch (err) {
          console.error('Failed to return to fullscreen:', err);
        }
      }
    };

    // Prevent right click and copy-paste
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmitQuestion = async () => {
    // Remove test case validation
    const submission = {
      code: code[language],
      language,
      passed: true, // Always set to true since we're not validating
      testResults: [] // Empty array since we're not running tests
    };
    
    setSubmissions(prev => ({
      ...prev,
      [currentQuestion]: submission
    }));

    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      }
    }, 2000);
  };

  const handleFinalSubmit = async () => {
    const submissionData = {
      id: Date.now().toString(),
      username: username,
      submittedAt: new Date().toISOString(),
      timeSpent: 3600 - timeLeft,
      submissions: submissions
    };
    
    console.log('Final submission:', submissionData);
    addSubmission(submissionData);
    setShowThankYouModal(true);
  };

  const handleEarlySubmission = () => {
    if (window.confirm('Are you sure you want to submit the test early? This action cannot be undone.')) {
      handleFinalSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Code2 className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl">Coding Assessment</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-red-600">
              <Timer className="h-5 w-5" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'cpp' | 'python')}
              className="border rounded p-1"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
            </select>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">{questions[currentQuestion].title}</h2>
          <p className="mb-4">{questions[currentQuestion].description}</p>
          
          <h3 className="font-bold mb-2">Examples:</h3>
          {questions[currentQuestion].examples.map((example, index) => (
            <div key={index} className="mb-4 bg-gray-50 p-4 rounded">
              <p><strong>Input:</strong> {example.input}</p>
              <p><strong>Output:</strong> {example.output}</p>
              <p><strong>Explanation:</strong> {example.explanation}</p>
            </div>
          ))}

          {submissions[currentQuestion] && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 text-green-600 mb-4">
                <CheckCircle className="h-5 w-5" />
                <span>Question completed!</span>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-bold mb-2">Test Results:</h4>
                {submissions[currentQuestion].testResults.map((result, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <div className="flex items-center space-x-2">
                      {result.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Test Case {index + 1}</span>
                    </div>
                    <div className="ml-6 text-sm">
                      <p><strong>Input:</strong> {result.input}</p>
                      <p><strong>Expected:</strong> {result.expected}</p>
                      <p><strong>Your Output:</strong> {result.actual}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <CodeMirror
            value={code[language]}
            height="500px"
            theme={vscodeDark}
            extensions={[language === 'cpp' ? cpp() : python()]}
            onChange={(value) => setCode(prev => ({ ...prev, [language]: value }))}
          />
          
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>

            <div className="flex items-center space-x-4">
              {testResults.loading ? (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Running tests...</span>
                </div>
              ) : testResults.results.length > 0 && (
                <div className="text-sm">
                  <span className={testResults.passing ? "text-green-600" : "text-red-600"}>
                    {testResults.results.filter(r => r.passed).length} / {testResults.results.length} tests passed
                  </span>
                </div>
              )}

              <button
                onClick={handleSubmitQuestion}
                disabled={testResults.loading || submissions[currentQuestion]?.passed}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Submit Solution
              </button>
            </div>

            <button
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestion === questions.length - 1}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {!submissions[currentQuestion] && testResults.results.length > 0 && (
            <div className="mt-4 bg-gray-50 p-4 rounded">
              <h4 className="font-bold mb-2">Test Results:</h4>
              {testResults.results.map((result, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  <div className="flex items-center space-x-2">
                    {result.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>Test Case {index + 1}</span>
                  </div>
                  <div className="ml-6 text-sm">
                    <p><strong>Input:</strong> {result.input}</p>
                    <p><strong>Expected:</strong> {result.expected}</p>
                    <p><strong>Your Output:</strong> {result.actual}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 mt-4">
        <button
          onClick={handleEarlySubmission}
          className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 mb-4"
        >
          Submit Test Early
        </button>
      </div>

      {showThankYouModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-center mb-4">Thank You!</h2>
            <div className="text-center mb-6">
              <p className="mb-4">Thank you for completing the TechNova assessment.</p>
              <p className="text-gray-600">Our recruiting team will review your submission and contact you soon.</p>
              <p className="text-gray-600 mt-4">You may now close this window.</p>
            </div>
            <div className="flex justify-center">
              <svg className="checkmark w-16 h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="#7e22ce" strokeWidth="2"/>
                <path className="checkmark__check" fill="none" stroke="#7e22ce" strokeWidth="2" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-4">Warning!</h2>
              <p className="mb-4">
                You have exited fullscreen mode. This is warning {fullscreenWarnings} of 3.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Your test will be automatically submitted after 3 warnings.
              </p>
              <p className="font-medium">
                Remaining warnings: {3 - fullscreenWarnings}
              </p>
            </div>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-200 mt-4"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Success message without test results */}
      {showSuccessMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">Solution Submitted!</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = `
  .checkmark__circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  }

  .checkmark__check {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
  }

  @keyframes stroke {
    100% {
      stroke-dashoffset: 0;
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Assessment;