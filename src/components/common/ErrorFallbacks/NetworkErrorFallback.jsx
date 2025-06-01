import React from 'react';
import { Wifi, RefreshCw } from 'lucide-react';
import Button from '@components/common/Button';

const NetworkErrorFallback = ({ retry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Wifi className="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-gray-900">Connection Problem</h3>

      <p className="mb-4 max-w-sm text-gray-600">
        Please check your internet connection and try again.
      </p>

      <Button leftIcon={<RefreshCw className="h-4 w-4" />} onClick={retry} size="sm">
        Try Again
      </Button>
    </div>
  );
};

export default NetworkErrorFallback;
