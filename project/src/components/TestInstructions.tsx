import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Clock, CheckSquare, AlertTriangle, Camera, Mic, Maximize } from 'lucide-react';

const TestInstructions = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaError, setMediaError] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mediaAccess, setMediaAccess] = useState({
    camera: false,
    microphone: false
  });

  // Prevent right click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Prevent copy paste
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    // Request camera and microphone access
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setMediaAccess({
          camera: true,
          microphone: true
        });

        // Store the stream to stop it when component unmounts
        return () => {
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (err) {
        console.error('Media access error:', err);
        setMediaError('Please allow camera and microphone access to continue');
      }
    };

    setupMedia();
  }, []);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      console.error('Fullscreen error:', err);
      setMediaError('Unable to enter fullscreen mode');
    }
  };

  const handleStartAssessment = async () => {
    if (!isFullscreen) {
      await enterFullscreen();
    }
    
    if (mediaAccess.camera && mediaAccess.microphone) {
      navigate('/assessment');
    } else {
      setMediaError('Camera and microphone access is required to start the assessment');
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-100 py-8"
      onCopy={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <Code2 className="h-10 w-10 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">TechNova Coding Assessment</h1>
          </div>

          {/* Fullscreen Status */}
          <div className="flex justify-center items-center mb-4">
            <div className={`flex items-center ${isFullscreen ? 'text-green-600' : 'text-red-600'}`}>
              <Maximize className="h-5 w-5 mr-2" />
              <span>{isFullscreen ? 'Fullscreen Mode Active' : 'Fullscreen Required'}</span>
            </div>
          </div>

          {/* Media Access Section */}
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative w-64 h-48 bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex justify-center space-x-4 mb-4">
              <div className={`flex items-center ${mediaAccess.camera ? 'text-green-600' : 'text-red-600'}`}>
                <Camera className="h-5 w-5 mr-2" />
                <span>{mediaAccess.camera ? 'Camera Connected' : 'Camera Required'}</span>
              </div>
              <div className={`flex items-center ${mediaAccess.microphone ? 'text-green-600' : 'text-red-600'}`}>
                <Mic className="h-5 w-5 mr-2" />
                <span>{mediaAccess.microphone ? 'Microphone Connected' : 'Microphone Required'}</span>
              </div>
            </div>

            {mediaError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
                {mediaError}
              </div>
            )}
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
                <li>Right-click and copy-paste functions are disabled.</li>
                <li>You must remain in fullscreen mode during the test.</li>
                <li className="text-red-600 font-medium">
                  Exiting fullscreen mode 3 times will automatically submit your test.
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckSquare className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-green-800">Ready to Begin?</h2>
              </div>
              <p className="text-gray-700 mb-4">
                Once you click the start button, the timer will begin and you cannot pause the test.
                Make sure your camera and microphone are working, and you're ready to enter fullscreen mode.
              </p>
              <button
                onClick={handleStartAssessment}
                disabled={!mediaAccess.camera || !mediaAccess.microphone}
                className={`w-full py-3 rounded-lg transition duration-200 ${
                  mediaAccess.camera && mediaAccess.microphone
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
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