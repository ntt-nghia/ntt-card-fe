import React from 'react';
import { CheckCircle, SkipForward } from 'lucide-react';
import Button from '@components/common/Button';

const CardDisplay = ({
  card,
  onComplete,
  onSkip,
  isLoading = false
}) => {
  if (!card) {
    return null;
  }

  return (
    <div className="text-center">
      <div className="card p-8 mb-8 max-w-2xl mx-auto">
        <div className="mb-6">
          {/* Card Type Badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-4">
            {card.type?.charAt(0).toUpperCase() + card.type?.slice(1)} Card
          </span>

          {/* Card Content */}
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4 text-balance">
            {card.displayContent || card.content}
          </h2>

          {/* Card Categories */}
          {card.categories && card.categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {card.categories.map((category, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
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
                  className="text-xs px-2 py-1 bg-warning-100 text-warning-700 rounded-full"
                >
                  ⚠️ {warning}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="success"
            size="lg"
            leftIcon={<CheckCircle className="w-5 h-5" />}
            onClick={onComplete}
            disabled={isLoading}
            className="btn-touch"
          >
            Complete
          </Button>
          <Button
            variant="outline"
            size="lg"
            leftIcon={<SkipForward className="w-5 h-5" />}
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
