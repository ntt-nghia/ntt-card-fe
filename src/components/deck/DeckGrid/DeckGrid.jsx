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
  isLoadingMore = false,
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
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-100">
          <Package className="h-8 w-8 text-error-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Failed to Load Decks</h3>
        <p className="mx-auto mb-6 max-w-md text-gray-600">{error}</p>
        {onRetry && (
          <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (!isLoading && decks.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">No Decks Found</h3>
        <p className="mx-auto max-w-md text-gray-600">
          We couldn't find any decks matching your search criteria. Try adjusting your filters or
          search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deck Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        <div className="py-6 text-center">
          <Loading size="md" text="Loading more decks..." />
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !isLoadingMore && onLoadMore && (
        <div className="py-6 text-center">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoadingMore}>
            Load More Decks
          </Button>
        </div>
      )}

      {/* End of Results Indicator */}
      {!hasMore && decks.length > 0 && (
        <div className="py-6 text-center text-sm text-gray-500">
          You've seen all available decks
        </div>
      )}

      {/* Error Banner for Partial Failures */}
      {error && decks.length > 0 && (
        <div className="rounded-md border border-warning-200 bg-warning-50 p-4">
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
                <Button variant="ghost" size="sm" onClick={onRetry}>
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
