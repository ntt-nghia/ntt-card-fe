import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import Button from '@components/common/Button';

const GameErrorFallback = ({ error, retry }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-warning-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Game Session Error
        </h1>

        <p className="text-gray-600 mb-6">
          There was a problem with your game session. Your progress may have been saved.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={retry}
          >
            Retry Session
          </Button>
          <Button
            variant="outline"
            leftIcon={<Home className="w-4 h-4" />}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameErrorFallback;
