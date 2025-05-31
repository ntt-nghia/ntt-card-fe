import React from 'react';
import { Lock, Unlock, CreditCard, Star, Users, Play } from 'lucide-react';
import Button from '@components/common/Button';

const DeckCard = ({
  deck,
  onUnlock,
  onDeckSelect,
  isUnlocking = false,
  hasAccess = false
}) => {
  if (!deck) {
    return null;
  }

  const {
    id,
    name,
    description,
    tier,
    price = 0,
    currency = 'USD',
    cardCount = { total: 0, free: 0, premium: 0 },
    tags = [],
    statistics = {},
    status,
    relationshipType,
    iconUrl,
    isUnlocked = false
  } = deck;

  // Get display text (support multilingual)
  const displayName = typeof name === 'object' ? name.en : name;
  const displayDescription = typeof description === 'object' ? description.en : description;

  // Determine access status
  const isPremium = tier === 'PREMIUM';
  const canAccess = tier === 'FREE' || isUnlocked || hasAccess;
  const needsUnlock = isPremium && !canAccess;

  // Format price
  const formatPrice = (amount, curr) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr
    }).format(amount);
  };

  // Get relationship type color
  const getRelationshipColor = (type) => {
    const colors = {
      friends: 'bg-blue-500',
      colleagues: 'bg-green-500',
      new_couples: 'bg-pink-500',
      established_couples: 'bg-red-500',
      family: 'bg-purple-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const handleUnlockClick = (e) => {
    e.stopPropagation();
    if (onUnlock && needsUnlock) {
      onUnlock(id);
    }
  };

  const handleCardClick = () => {
    if (onDeckSelect && canAccess) {
      onDeckSelect(deck);
    }
  };

  return (
    <div
      className={`card p-6 transition-all duration-200 ${
        canAccess 
          ? 'hover:shadow-card-hover cursor-pointer' 
          : 'opacity-75'
      } ${needsUnlock ? 'border-warning-200' : ''}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        {/* Deck Icon or Relationship Type Indicator */}
        <div className="flex items-center space-x-3">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={displayName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className={`w-12 h-12 rounded-lg ${getRelationshipColor(relationshipType)} flex items-center justify-center`}>
              <Users className="w-6 h-6 text-white" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {displayName}
            </h3>
            <p className="text-sm text-gray-600 capitalize">
              {relationshipType?.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Tier Badge */}
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
            isPremium 
              ? 'bg-warning-100 text-warning-800' 
              : 'bg-success-100 text-success-800'
          }`}>
            {isPremium ? (
              <>
                <Lock className="w-3 h-3 mr-1" />
                PREMIUM
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3 mr-1" />
                FREE
              </>
            )}
          </span>

          {/* Price */}
          {isPremium && (
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(price, currency)}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {displayDescription}
      </p>

      {/* Card Count and Statistics */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span>{cardCount.total} cards</span>
          {statistics.rating && (
            <div className="flex items-center">
              <Star className="w-3 h-3 text-yellow-400 mr-1" />
              <span>{statistics.rating.toFixed(1)}</span>
            </div>
          )}
          {statistics.sessionsPlayed && (
            <span>{statistics.sessionsPlayed} sessions</span>
          )}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-4">
        {needsUnlock ? (
          <Button
            variant="warning"
            fullWidth
            leftIcon={<CreditCard className="w-4 h-4" />}
            onClick={handleUnlockClick}
            loading={isUnlocking}
            disabled={isUnlocking}
          >
            {isUnlocking ? 'Unlocking...' : `Unlock for ${formatPrice(price, currency)}`}
          </Button>
        ) : canAccess ? (
          <Button
            variant="primary"
            fullWidth
            leftIcon={<Play className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            Select Deck
          </Button>
        ) : (
          <Button
            variant="outline"
            fullWidth
            disabled
          >
            Not Available
          </Button>
        )}
      </div>

      {/* Access Status Indicator */}
      {canAccess && isPremium && (
        <div className="mt-2 flex items-center justify-center text-xs text-success-600">
          <Unlock className="w-3 h-3 mr-1" />
          <span>Unlocked</span>
        </div>
      )}

      {/* Status Indicator */}
      {status === 'draft' && (
        <div className="mt-2 flex items-center justify-center text-xs text-gray-500">
          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
          Draft
        </div>
      )}
    </div>
  );
};

export default DeckCard;
