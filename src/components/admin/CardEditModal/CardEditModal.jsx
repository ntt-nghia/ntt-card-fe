// src/components/admin/CardEditModal/CardEditModal.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

import Button from '@components/common/Button';
import { CARD_CONNECTION_LEVELS, CARD_STATUSES, CARD_TIERS } from '@utils/constants';

const CardEditModal = ({
  card,
  isOpen,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
  } = useForm({
    defaultValues: {
      content: '',
      status: 'active',
      tier: 'FREE',
      connectionLevel: 1,
    }
  });

  // Initialize form when card data changes
  useEffect(() => {
    if (card && isOpen) {
      const contentValue = typeof card.content === 'object'
        ? card.content.en || ''
        : card.content || '';

      reset({
        content: contentValue,
        status: card.status || 'active',
        tier: card.tier || 'FREE',
        connectionLevel: card.connectionLevel || 1,
      });
    }
  }, [card, isOpen, reset]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) {
      return;
    }
    onClose();
  };

  const onSubmit = async (formData) => {
    try {
      setIsSaving(true);

      // Always structure content as an object with language keys
      // Preserve existing language content while updating English
      const existingContent = typeof card.content === 'object' ? card.content : {};

      const updateData = {
        content: {
          ...existingContent, // Preserve all existing languages (vi, fr, etc.)
          en: formData.content.trim(), // Update only English content
        },
        status: formData.status,
        tier: formData.tier,
        connectionLevel: parseInt(formData.connectionLevel),
      };

      await onSave(card.id, updateData);
      toast.success('Card updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to update card:', error);
      toast.error('Failed to update card');
    } finally {
      setIsSaving(false);
    }
  };

  // Get status badge styling
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      archived: 'bg-gray-100 text-gray-800 border-gray-200',
      draft: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[status] || colors.active;
  };

  // Get tier badge styling
  const getTierColor = (tier) => {
    const colors = {
      FREE: 'bg-green-100 text-green-800 border-green-200',
      PREMIUM: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[tier] || colors.FREE;
  };

  // Watch form values for preview
  const watchedValues = watch();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="font-heading text-xl font-bold text-gray-900">
                Edit Card
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Update card content and properties
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Section */}
              <div className="space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Content Field */}
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                      Card Content (English) *
                    </label>
                    <textarea
                      {...register('content', {
                        required: 'Card content is required',
                        minLength: {
                          value: 10,
                          message: 'Content must be at least 10 characters',
                        },
                        maxLength: {
                          value: 1000,
                          message: 'Content must not exceed 1000 characters',
                        },
                      })}
                      rows={6}
                      className={`
                        w-full px-3 py-2 border rounded-md shadow-sm resize-none
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                        ${errors.content ? 'border-red-300 text-red-900' : 'border-gray-300'}
                      `}
                      placeholder="Enter card content in English..."
                    />
                    {errors.content && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.content.message}
                      </p>
                    )}
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                      <span>{watchedValues.content?.length || 0}/1000 characters</span>
                      {(() => {
                        // Show info about other languages if they exist
                        const otherLanguages = card && typeof card.content === 'object'
                          ? Object.keys(card.content).filter(lang => lang !== 'en')
                          : [];

                        return otherLanguages.length > 0 && (
                          <span className="text-blue-600">
                            Other languages preserved: {otherLanguages.join(', ')}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Status Field */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      {...register('status')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {CARD_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tier Field */}
                  <div>
                    <label htmlFor="tier" className="block text-sm font-medium text-gray-700 mb-2">
                      Tier
                    </label>
                    <select
                      {...register('tier')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {CARD_TIERS.map((tier) => (
                        <option key={tier.value} value={tier.value}>
                          {tier.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Connection Level Field */}
                  <div>
                    <label htmlFor="connectionLevel" className="block text-sm font-medium text-gray-700 mb-2">
                      Connection Level
                    </label>
                    <select
                      {...register('connectionLevel', {
                        valueAsNumber: true,
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {CARD_CONNECTION_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
              </div>

              {/* Preview Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Preview</h3>

                {/* Card Preview */}
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-white min-h-[200px]">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`
                      inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                      ${getStatusColor(watchedValues.status)}
                    `}>
                      {watchedValues.status}
                    </span>
                    <span className={`
                      inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                      ${getTierColor(watchedValues.tier)}
                    `}>
                      {watchedValues.tier}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Level {watchedValues.connectionLevel}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="text-sm text-gray-900 leading-relaxed">
                    {watchedValues.content || 'Enter content to see preview...'}
                  </div>
                </div>

                {/* Card Metadata */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Card ID: {card?.id}</div>
                  {card?.createdAt && (
                    <div>
                      Created: {new Date(card.createdAt._seconds * 1000).toLocaleDateString()}
                    </div>
                  )}
                  {card?.updatedAt && (
                    <div>
                      Last Updated: {new Date(card.updatedAt._seconds * 1000).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {isDirty && (
                <span className="text-sm text-amber-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  You have unsaved changes
                </span>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSaving || isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                loading={isSaving || isLoading}
                disabled={isSaving || isLoading || !isDirty}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardEditModal;
