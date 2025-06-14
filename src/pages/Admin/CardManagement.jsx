// src/pages/Admin/CardManagement.jsx - Updated to use AdminCard component
import React, { useCallback, useEffect, useState } from 'react';
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
import Button from '@components/common/Button/index.js';
import AdminCard from '@components/admin/AdminCard';
import adminService from '@services/admin.js';
import { CARD_CONNECTION_LEVELS, CARD_RELATIONSHIP_TYPES, CARD_STATUSES, CARD_TYPES } from '@utils/constants.js';

const toast = {
  success: (message) => console.log('SUCCESS:', message),
  error: (message) => console.log('ERROR:', message),
  info: (message) => console.log('INFO:', message),
};

export const CardManagement = () => {
  // State for cards data
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  // Filter state
  const [filters, setFilters] = useState({
    relationshipType: '',
    connectionLevel: '',
    type: '',
    status: '',
    tier: '',
    searchQuery: '',
    deckId: '',
    language: 'en',
  });

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableDecks, setAvailableDecks] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [editingCard, setEditingCard] = useState(null);

  // Load cards from backend
  const loadCards = useCallback(async (resetPagination = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentOffset = resetPagination ? 0 : pagination.offset;

      // Build query parameters
      const queryParams = {
        limit: pagination.limit,
        offset: currentOffset,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      // Add filters
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          queryParams[key] = filters[key];
        }
      });

      const response = await adminService.getAllCards(queryParams);
      const { cards: newCards, pagination: newPagination } = response.data.data;

      if (resetPagination) {
        setCards(newCards);
        setPagination({
          ...pagination,
          ...newPagination,
          offset: 0,
        });
      } else {
        setCards(prev => currentOffset === 0 ? newCards : [...prev, ...newCards]);
        setPagination(prev => ({ ...prev, ...newPagination }));
      }

    } catch (err) {
      console.error('Failed to load cards:', err);
      setError('Failed to load cards. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  // Load available decks
  const loadDecks = useCallback(async () => {
    try {
      const response = await adminService.getAllDecks();
      setAvailableDecks(response.data.data.decks || []);
    } catch (err) {
      console.error('Failed to load decks:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadCards(true);
    loadDecks();
  }, []);

  // Reload when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCards(true);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Search handling
  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  // Filter handling
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
  const handleViewCard = (card) => {
    setEditingCard(card);
    // Could open a modal or navigate to detail view
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    // Navigate to edit form or open modal
  };

  const handleDeleteCard = async (card) => {
    if (!confirm(`Are you sure you want to delete this card?`)) {
      return;
    }

    try {
      await adminService.deleteCard(card.id);
      toast.success('Card deleted successfully');
      loadCards(true);
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

      await adminService.createCard(duplicatedCard);
      toast.success('Card duplicated successfully');
      loadCards(true);
    } catch (err) {
      console.error('Duplication failed:', err);
      toast.error('Failed to duplicate card');
    }
  };

  const handleArchiveCard = async (card) => {
    try {
      await adminService.updateCard(card.id, { status: 'archived' });
      toast.success('Card archived successfully');
      loadCards(true);
    } catch (err) {
      console.error('Archive failed:', err);
      toast.error('Failed to archive card');
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!selectedCards.length) return;

    if (!confirm(`Are you sure you want to delete ${selectedCards.length} cards?`)) {
      return;
    }

    try {
      for (const cardId of selectedCards) {
        await adminService.deleteCard(cardId);
      }

      toast.success(`${selectedCards.length} cards deleted successfully`);
      clearSelection();
      loadCards(true);
    } catch (err) {
      console.error('Bulk delete failed:', err);
      toast.error('Failed to delete cards');
    }
  };

  // Calculate active filter count
  const activeFilterCount = Object.values(filters).filter(value => value && value !== '' && value !== 'en').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Card Management</h1>
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
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
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
              onClick={() => loadCards(true)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                value={filters.relationshipType}
                onChange={(e) => handleFilterChange('relationshipType', e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Relationship Types</option>
                {CARD_RELATIONSHIP_TYPES.map((it) => (
                  <option key={it.value} value={it.value}>{it.label}</option>
                ))}
              </select>

              <select
                value={filters.connectionLevel}
                onChange={(e) => handleFilterChange('connectionLevel', e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Connection Levels</option>
                {CARD_CONNECTION_LEVELS.map((it) => (
                  <option key={it.value} value={it.value}>Level {it.value} - {it.label}</option>
                ))}
              </select>

              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Card Types</option>
                {CARD_TYPES.map((it) => (
                  <option key={it.value} value={it.value}>{it.label}</option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                {CARD_STATUSES.map((it) => (
                  <option key={it.value} value={it.value}>{it.label}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
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
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {loading && cards.length === 0 ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Loading cards...</p>
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
              onView={handleViewCard}
              onEdit={handleEditCard}
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
      {pagination.hasMore && !loading && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => loadCards(false)}
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
