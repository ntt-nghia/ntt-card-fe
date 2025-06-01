import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  Filter,
  X,
  CreditCard,
  Users,
  Heart,
  Briefcase,
  Home as HomeIcon,
  Star,
  TrendingUp,
} from 'lucide-react';

import { useDecks } from '@hooks/useDecks';
import { useGame } from '@hooks/useGame';
import { useAuth } from '@hooks/useAuth';
import Button from '@components/common/Button';
import DeckGrid from '@components/deck/DeckGrid/DeckGrid';
import { RELATIONSHIP_TYPES, DECK_TIERS } from '@utils/constants';

const Decks = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const {
    filteredDecks,
    filters,
    pagination,
    isLoading,
    isUnlocking,
    error,
    getAllDecks,
    setFilters,
    unlockDeck,
    loadMoreDecks,
    clearError,
  } = useDecks();

  const { startSession } = useGame();

  // Local state for UI
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [showDeckModal, setShowDeckModal] = useState(false);

  // Initialize filters from URL params
  useEffect(() => {
    const relationshipType = searchParams.get('relationshipType');
    const tier = searchParams.get('tier');
    const search = searchParams.get('search');

    const urlFilters = {};
    if (relationshipType) urlFilters.relationshipType = relationshipType;
    if (tier) urlFilters.tier = tier;
    if (search) {
      urlFilters.searchQuery = search;
      setSearchQuery(search);
    }

    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
    }

    // Load decks
    getAllDecks(filters);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.relationshipType) params.set('relationshipType', filters.relationshipType);
    if (filters.tier) params.set('tier', filters.tier);
    if (filters.searchQuery) params.set('search', filters.searchQuery);

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const relationshipTypeOptions = [
    { value: RELATIONSHIP_TYPES.FRIENDS, label: 'Friends', icon: <Users className="h-4 w-4" /> },
    {
      value: RELATIONSHIP_TYPES.ESTABLISHED_COUPLES,
      label: 'Couples',
      icon: <Heart className="h-4 w-4" />,
    },
    {
      value: RELATIONSHIP_TYPES.COLLEAGUES,
      label: 'Colleagues',
      icon: <Briefcase className="h-4 w-4" />,
    },
    { value: RELATIONSHIP_TYPES.FAMILY, label: 'Family', icon: <HomeIcon className="h-4 w-4" /> },
  ];

  const tierOptions = [
    { value: DECK_TIERS.FREE, label: 'Free Decks', icon: <Star className="h-4 w-4" /> },
    { value: DECK_TIERS.PREMIUM, label: 'Premium Decks', icon: <CreditCard className="h-4 w-4" /> },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, searchQuery: searchQuery.trim() });
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters };

    if (newFilters[filterType] === value) {
      // Remove filter if clicking the same one
      delete newFilters[filterType];
    } else {
      newFilters[filterType] = value;
    }

    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const handleDeckSelect = (deck) => {
    setSelectedDeck(deck);
    setShowDeckModal(true);
  };

  const handleStartGame = async (deckIds = []) => {
    if (!selectedDeck || deckIds.length === 0) return;

    const sessionData = {
      relationshipType: selectedDeck.relationshipType,
      selectedDeckIds: deckIds,
      language: user?.language || 'en',
    };

    try {
      await startSession(sessionData);
      // Game saga will handle navigation to the game
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleUnlock = async (deckId) => {
    try {
      // In a real app, this would integrate with a payment processor
      const mockTransactionId = `txn_${Date.now()}`;
      await unlockDeck(deckId, mockTransactionId, 'stripe');
    } catch (error) {
      console.error('Failed to unlock deck:', error);
    }
  };

  const activeFilterCount =
    Object.keys(filters).filter((key) => filters[key] && key !== 'searchQuery').length +
    (filters.searchQuery ? 1 : 0);

  return (
    <>
      <Helmet>
        <title>Browse Decks - Connection Game</title>
        <meta
          name="description"
          content="Browse and unlock card decks for your Connection Game sessions"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-2 font-heading text-3xl font-bold text-gray-900">Browse Decks</h1>
            <p className="text-gray-600">
              Discover and unlock card decks to enhance your connection-building sessions
            </p>
          </div>

          {/* Search and Filters */}
          <div className="card mb-8 p-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search decks by name, description, or tags..."
                    className="input-field pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit">Search</Button>
                <Button
                  variant="outline"
                  leftIcon={<Filter className="h-4 w-4" />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
              </div>
            </form>

            {/* Filter Panel */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Relationship Type Filter */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-gray-900">Relationship Type</h3>
                    <div className="space-y-2">
                      {relationshipTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleFilterChange('relationshipType', option.value)}
                          className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${
                            filters.relationshipType === option.value
                              ? 'border border-primary-200 bg-primary-100 text-primary-700'
                              : 'border border-transparent bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {option.icon}
                          <span className="ml-2">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tier Filter */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-gray-900">Deck Type</h3>
                    <div className="space-y-2">
                      {tierOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleFilterChange('tier', option.value)}
                          className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${
                            filters.tier === option.value
                              ? 'border border-primary-200 bg-primary-100 text-primary-700'
                              : 'border border-transparent bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {option.icon}
                          <span className="ml-2">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-gray-900">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        leftIcon={<TrendingUp className="h-4 w-4" />}
                        onClick={() => {
                          // Sort by popularity - this would be handled in the slice
                          console.log('Sort by popularity');
                        }}
                      >
                        Popular Decks
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        leftIcon={<X className="h-4 w-4" />}
                        onClick={clearAllFilters}
                        disabled={activeFilterCount === 0}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4">
                {filters.relationshipType && (
                  <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-800">
                    {
                      relationshipTypeOptions.find((opt) => opt.value === filters.relationshipType)
                        ?.label
                    }
                    <button
                      onClick={() =>
                        handleFilterChange('relationshipType', filters.relationshipType)
                      }
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.tier && (
                  <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-800">
                    {tierOptions.find((opt) => opt.value === filters.tier)?.label}
                    <button
                      onClick={() => handleFilterChange('tier', filters.tier)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.searchQuery && (
                  <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-800">
                    Search: "{filters.searchQuery}"
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilters({ ...filters, searchQuery: '' });
                      }}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                {isLoading ? 'Loading...' : `${filteredDecks.length} decks found`}
              </p>
            </div>
          </div>

          {/* Deck Grid */}
          <DeckGrid
            decks={filteredDecks}
            isLoading={isLoading}
            onDeckSelect={handleDeckSelect}
            onUnlock={handleUnlock}
            isUnlocking={isUnlocking}
            error={error}
            onRetry={() => {
              clearError();
              getAllDecks(filters);
            }}
            hasMore={pagination.hasMore}
            onLoadMore={loadMoreDecks}
            isLoadingMore={isLoading && filteredDecks.length > 0}
          />

          {/* Deck Selection Modal */}
          {showDeckModal && selectedDeck && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Start Game with{' '}
                  {typeof selectedDeck.name === 'object' ? selectedDeck.name.en : selectedDeck.name}
                </h3>
                <p className="mb-6 text-gray-600">
                  You're about to start a new {selectedDeck.relationshipType?.replace('_', ' ')}{' '}
                  session with this deck.
                </p>
                <div className="flex space-x-4">
                  <Button variant="outline" fullWidth onClick={() => setShowDeckModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => handleStartGame([selectedDeck.id])}
                  >
                    Start Game
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Decks;
