import React from 'react';
import { Wifi, RefreshCw } from 'lucide-react';
import Button from '@components/common/Button';

const NetworkErrorFallback = ({ retry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <Wifi className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Connection Problem
      </h3>

      <p className="text-gray-600 mb-4 max-w-sm">
        Please check your internet connection and try again.
      </p>

      <Button
        leftIcon={<RefreshCw className="w-4 h-4" />}
        onClick={retry}
        size="sm"
      >
        Try Again
      </Button>
    </div>
  );
};

export default NetworkErrorFallback;
