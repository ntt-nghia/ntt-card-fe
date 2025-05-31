import React from 'react';
import { Package, Search, RefreshCw } from 'lucide-react';
import DeckCard from './DeckCard/DeckCard';
import Loading from '@components/common/Loading';
import Button from '@components/common/Button';

const DeckGrid = ({
  decks = [],
  isLoading = false,
  onDeckSelect,
  onUnlock,
  isUnlocking = false,
  error = null,
  onRetry,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false
}) => {
  // Loading state
  if (isLoading && decks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="large" text="Loading decks..." />
      </div>
    );
  }

  // Error state
  if (error && decks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-error-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Decks
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {error}
        </p>
        {onRetry && (
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (!isLoading && decks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Decks Found
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          We couldn't find any decks matching your search criteria.
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deck Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onDeckSelect={onDeckSelect}
            onUnlock={onUnlock}
            isUnlocking={isUnlocking}
            hasAccess={deck.hasAccess || deck.isUnlocked || deck.tier === 'FREE'}
          />
        ))}
      </div>

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="text-center py-6">
          <Loading size="md" text="Loading more decks..." />
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !isLoadingMore && onLoadMore && (
        <div className="text-center py-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            Load More Decks
          </Button>
        </div>
      )}

      {/* End of Results Indicator */}
      {!hasMore && decks.length > 0 && (
        <div className="text-center py-6 text-sm text-gray-500">
          You've seen all available decks
        </div>
      )}

      {/* Error Banner for Partial Failures */}
      {error && decks.length > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-5 w-5 text-warning-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-warning-700">
                Some decks might not be showing due to a connection issue.
              </p>
            </div>
            {onRetry && (
              <div className="ml-auto pl-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRetry}
                >
                  Retry
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckGrid;
