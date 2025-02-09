import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Clock, CheckSquare, AlertTriangle } from 'lucide-react';

const TestInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <Code2 className="h-10 w-10 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">TechNova Coding Assessment</h1>
          </div>

          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold text-purple-800">Time Limit</h2>
              </div>
              <p className="text-gray-700">You will have 60 minutes to complete the assessment.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Instructions:</h2>
              <ul className="list-disc list-inside space-y-3 text-gray-700">
                <li>The assessment consists of 2 coding problems.</li>
                <li>You can choose between Python and C++ programming languages.</li>
                <li>Each problem has multiple test cases that your solution must pass.</li>
                <li>You can submit each problem multiple times until it passes all test cases.</li>
                <li>Make sure to test your code thoroughly before final submission.</li>
                <li>You can submit the test early if you complete it before the time limit.</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <h2 className="text-xl font-semibold text-yellow-800">Important Notes</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Do not refresh or close the browser window during the test.</li>
                <li>Ensure you have a stable internet connection.</li>
                <li>The timer will start as soon as you begin the test.</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckSquare className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-green-800">Ready to Begin?</h2>
              </div>
              <p className="text-gray-700 mb-4">
                Once you click the start button, the timer will begin and you cannot pause the test.
              </p>
              <button
                onClick={() => navigate('/assessment')}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-200"
              >
                Start Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInstructions; 