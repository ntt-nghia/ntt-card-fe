import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  ChevronRight,
  Download,
  Filter,
  Grid3X3,
  List,
  Plus,
  RefreshCw,
  Search,
  Square,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAdmin } from '@hooks/useAdmin';

import Button from '@components/common/Button';
import AdminCard from '@components/admin/AdminCard';
import Loading from '@components/common/Loading';

import { CARD_CONNECTION_LEVELS, CARD_RELATIONSHIP_TYPES, CARD_STATUSES, CARD_TYPES } from '@utils/constants';
import { ChoiceChips } from '@components/common/ChoiceChips/index.js';

export const CardManagement = () => {
  // Use custom hooks following your Redux patterns
  const {
    cards,
    pagination,
    filters,
    isLoading,
    error,
    getAllCards,
    deleteCard,
    updateCard,
    bulkDeleteCards,
    setFilters,
    clearError,
  } = useAdmin();
// Local UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Load initial data
  useEffect(() => {
    getAllCards({ limit: 20, offset: 0 });
  }, [getAllCards]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({ ...filters, searchQuery });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, setFilters]);

  useEffect(() => {
    getAllCards({
      ...filters,
      limit: 20,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }, [getAllCards]);

  // Search handling
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Filter handling
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      relationshipType: '',
      connectionLevel: '',
      type: '',
      status: '',
      tier: '',
      searchQuery: '',
      deckId: '',
      language: 'en',
    });
    setSearchQuery('');
  };

  // Reload when filters change
  const onFilterTrigger = () => {
    getAllCards({
      ...filters,
      limit: 20,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  // Card selection
  const toggleCardSelection = (cardId, isSelected) => {
    if (isSelected) {
      setSelectedCards(prev => [...prev, cardId]);
    } else {
      setSelectedCards(prev => prev.filter(id => id !== cardId));
    }
  };

  const selectAllCards = () => {
    setSelectedCards(cards.map(card => card.id));
  };

  const clearSelection = () => {
    setSelectedCards([]);
  };

  // Card actions
  const handleDeleteCard = async (card) => {
    try {
      await deleteCard(card.id);
      toast.success('Card deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete card');
    }
  };

  const handleDuplicateCard = async (card) => {
    try {
      const duplicatedCard = {
        ...card,
        content: `${card.content} (Copy)`,
        status: 'draft',
      };
      delete duplicatedCard.id;
      delete duplicatedCard.createdAt;
      delete duplicatedCard.updatedAt;

      // You would need to implement createCard in your admin hook
      // await createCard(duplicatedCard);
      toast.success('Card duplicated successfully');
    } catch (err) {
      console.error('Duplication failed:', err);
      toast.error('Failed to duplicate card');
    }
  };

  const handleArchiveCard = async (card) => {
    try {
      await updateCard(card.id, { status: 'archived' });
      toast.success('Card archived successfully');
    } catch (err) {
      console.error('Archive failed:', err);
      toast.error('Failed to archive card');
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!selectedCards.length) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedCards.length} cards?`)) {
      return;
    }

    try {
      await bulkDeleteCards(selectedCards);
      toast.success(`${selectedCards.length} cards deleted successfully`);
      clearSelection();
    } catch (err) {
      console.error('Bulk delete failed:', err);
      toast.error('Failed to delete cards');
    }
  };

  // Load more cards
  const loadMoreCards = () => {
    getAllCards({
      ...filters,
      limit: 20,
      offset: pagination.offset + 20,
      append: true, // Flag to append instead of replace
    });
  };

  // Calculate active filter count
  const activeFilterCount = Object.values(filters).filter(
    value => value && value !== '' && value !== 'en',
  ).length;

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
          <p className="text-red-600">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearError}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">
            Card Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your connection game cards
            {pagination.total > 0 && ` (${pagination.total} total)`}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Import
          </Button>
          <Button
            variant="outline"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Card
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* View Mode and Filters */}
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-md border border-gray-300 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-400'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-400'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="h-4 w-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
              {activeFilterCount > 0 && (
                <span
                  className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => getAllCards({ ...filters, limit: 20, offset: 0 })}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <ChoiceChips
              label="Select Relationship Type"
              options={CARD_RELATIONSHIP_TYPES}
              value={filters.relationshipType}
              onChange={(val) => handleFilterChange('relationshipType', val)}
              emptyValue=""
              className="mt-2"
            />

            <ChoiceChips
              label="Select Connection Level"
              options={CARD_CONNECTION_LEVELS}
              value={filters.connectionLevel}
              onChange={(val) => handleFilterChange('connectionLevel', val)}
              emptyValue=""
              className="mt-2"
            />

            <ChoiceChips
              label="Select Card Type"
              options={CARD_TYPES}
              value={filters.type}
              onChange={(val) => handleFilterChange('type', val)}
              emptyValue=""
              className="mt-2"
            />

            <ChoiceChips
              label="Select Status"
              options={CARD_STATUSES}
              value={filters.status}
              onChange={(val) => handleFilterChange('status', val)}
              emptyValue=""
              className="mt-2"
            />

            <div className="mt-2 flex justify-end">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFilterTrigger}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCards.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-primary-700">
                {selectedCards.length} cards selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                leftIcon={<X className="h-4 w-4" />}
              >
                Clear Selection
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid/List */}
      {isLoading && cards.length === 0 ? (
        <div className="text-center py-12">
          <Loading size="large" text="Loading cards..." />
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No cards found matching your criteria.</p>
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }
        `}>
          {cards.map((card) => (
            <AdminCard
              key={card.id}
              card={card}
              isSelected={selectedCards.includes(card.id)}
              onSelect={toggleCardSelection}
              onEdit={(card) => {
                // Navigate to edit or open modal
                console.log('Edit card:', card.id);
              }}
              onDelete={handleDeleteCard}
              onDuplicate={handleDuplicateCard}
              onArchive={handleArchiveCard}
              showSelection={true}
              showActions={true}
              variant={viewMode === 'list' ? 'compact' : 'default'}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {pagination.hasMore && !isLoading && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMoreCards}
            leftIcon={<ChevronRight className="h-4 w-4" />}
          >
            Load More Cards
          </Button>
        </div>
      )}

      {/* Selection Controls */}
      {cards.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <button
              onClick={selectedCards.length === cards.length ? clearSelection : selectAllCards}
              className="flex items-center space-x-2 hover:text-gray-900"
            >
              {selectedCards.length === cards.length ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span>
                {selectedCards.length === cards.length ? 'Deselect All' : 'Select All'}
              </span>
            </button>
          </div>
          <div>
            Showing {cards.length} of {pagination.total} cards
          </div>
        </div>
      )}
    </div>
  );
};
