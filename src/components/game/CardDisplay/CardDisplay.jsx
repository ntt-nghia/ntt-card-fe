import React from 'react';
import { CheckCircle, SkipForward } from 'lucide-react';
import Button from '@components/common/Button';

const CardDisplay = ({ card, onComplete, onSkip, isLoading = false }) => {
  if (!card) {
    return null;
  }

  return (
    <div className="text-center">
      <div className="card mx-auto mb-8 max-w-2xl p-8">
        <div className="mb-6">
          {/* Card Type Badge */}
          <span className="mb-4 inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
            {card.type?.charAt(0).toUpperCase() + card.type?.slice(1)} Card
          </span>

          {/* Card Content */}
          <h2 className="mb-4 text-balance font-heading text-2xl font-bold text-gray-900">
            {card.displayContent || card.content}
          </h2>

          {/* Card Categories */}
          {card.categories && card.categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {card.categories.map((category, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Content Warnings */}
          {card.contentWarnings && card.contentWarnings.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {card.contentWarnings.map((warning, index) => (
                <span
                  key={index}
                  className="rounded-full bg-warning-100 px-2 py-1 text-xs text-warning-700"
                >
                  ⚠️ {warning}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Actions */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            variant="success"
            size="lg"
            leftIcon={<CheckCircle className="h-5 w-5" />}
            onClick={onComplete}
            disabled={isLoading}
            className="btn-touch"
          >
            Complete
          </Button>
          <Button
            variant="outline"
            size="lg"
            leftIcon={<SkipForward className="h-5 w-5" />}
            onClick={onSkip}
            disabled={isLoading}
            className="btn-touch"
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CardDisplay;
