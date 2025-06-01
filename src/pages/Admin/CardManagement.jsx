// Card Management Component
import Button from '@components/common/Button/index.js';
import { Plus, Upload } from 'lucide-react';
import React from 'react';

export const CardManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Card Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>
            Bulk Import
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />}>Create Card</Button>
        </div>
      </div>

      <div className="card p-6">
        <p className="text-gray-600">Card management interface coming soon...</p>
      </div>
    </div>
  );
};
