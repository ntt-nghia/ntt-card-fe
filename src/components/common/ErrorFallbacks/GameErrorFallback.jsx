import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import Button from '@components/common/Button';

const GameErrorFallback = ({ error, retry }) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning-100">
            <AlertTriangle className="h-8 w-8 text-warning-600" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">Game Session Error</h1>

        <p className="mb-6 text-gray-600">
          There was a problem with your game session. Your progress may have been saved.
        </p>

        <div className="flex flex-col gap-3">
          <Button leftIcon={<RotateCcw className="h-4 w-4" />} onClick={retry}>
            Retry Session
          </Button>
          <Button
            variant="outline"
            leftIcon={<Home className="h-4 w-4" />}
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
