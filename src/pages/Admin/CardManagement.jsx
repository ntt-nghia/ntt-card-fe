import React, { useCallback, useEffect, useState } from 'react';
import {
  ChevronRight,
  Clock,
  Download,
  Edit,
  Eye,
  Filter,
  Globe,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';
import Button from '@components/common/Button/index.js';
import adminService from '@services/admin.js';
import {
  CARD_CONNECTION_LEVELS,
  CARD_RELATIONSHIP_TYPES,
  CARD_STATUSES,
  CARD_TIERS,
  CARD_TYPES,
} from '@utils/constants.js';


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

      // Use the getAllCards method from admin service
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
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.offset]);

  // Load available decks for filter
  const loadAvailableDecks = useCallback(async () => {
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
    loadAvailableDecks();
  }, []);

  // Reload when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCards(true);
    }, 300); // Debounce filter changes

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFilters(prev => ({
      ...prev,
      searchQuery: query,
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
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

  // Load more cards (pagination)
  const loadMoreCards = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
    loadCards(false);
  };

  // Handle card selection
  const toggleCardSelection = (cardId) => {
    setSelectedCards(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId],
    );
  };

  const selectAllCards = () => {
    setSelectedCards(cards.map(card => card.id));
  };

  const clearSelection = () => {
    setSelectedCards([]);
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!selectedCards.length) return;

    if (!confirm(`Are you sure you want to delete ${selectedCards.length} cards?`)) {
      return;
    }

    try {
      // Note: You might need to implement a bulk delete endpoint
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

  // Format card content preview
  const formatCardPreview = (content) => {
    if (typeof content === 'string') return content;
    if (content?.en) return content.en;
    if (content && typeof content === 'object') {
      const firstKey = Object.keys(content)[0];
      return content[firstKey];
    }
    return 'No content available';
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get tier badge color
  const getTierColor = (tier) => {
    switch (tier) {
      case 'FREE':
        return 'bg-green-100 text-green-800';
      case 'PREMIUM':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
            onClick={() => toast.info('Bulk import feature coming soon')}
          >
            Bulk Import
          </Button>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => toast.info('Create card feature coming soon')}
          >
            Create Card
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search cards by content, type, or relationship..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              leftIcon={<Filter className="h-4 w-4" />}
              onClick={() => setShowFilters(!showFilters)}
              className={activeFilterCount > 0 ? 'ring-2 ring-primary-500' : ''}
            >
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                leftIcon={<X className="h-4 w-4" />}
                onClick={clearAllFilters}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Relationship Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship Type
                  </label>
                  <select
                    value={filters.relationshipType}
                    onChange={(e) => handleFilterChange('relationshipType', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {CARD_RELATIONSHIP_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Connection Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Connection Level
                  </label>
                  <select
                    value={filters.connectionLevel}
                    onChange={(e) => handleFilterChange('connectionLevel', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    {CARD_CONNECTION_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        Level {level.value} - {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Card Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {CARD_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    {CARD_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tier Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tier
                  </label>
                  <select
                    value={filters.tier}
                    onChange={(e) => handleFilterChange('tier', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Tiers</option>
                    {CARD_TIERS.map(tier => (
                      <option key={tier.value} value={tier.value}>
                        {tier.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deck Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deck
                  </label>
                  <select
                    value={filters.deckId}
                    onChange={(e) => handleFilterChange('deckId', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Decks</option>
                    {availableDecks.map(deck => (
                      <option key={deck.id} value={deck.id}>
                        {typeof deck.name === 'string' ? deck.name : deck.name?.en || 'Unnamed Deck'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={filters.language}
                    onChange={(e) => handleFilterChange('language', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCards.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} selected
              </span>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear Selection
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => toast.info('Export feature coming soon')}
              >
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit className="h-4 w-4" />}
                onClick={() => toast.info('Bulk edit feature coming soon')}
              >
                Bulk Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="space-y-4">
        {/* Loading State */}
        {loading && cards.length === 0 && (
          <div className="card p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Loading cards...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card p-6 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <div className="text-red-400">
                <X className="h-5 w-5" />
              </div>
              <div>
                <p className="text-red-800 font-medium">Error loading cards</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadCards(true)}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && cards.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Tag className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cards found</h3>
            <p className="text-gray-600 mb-4">
              {activeFilterCount > 0
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first card.'
              }
            </p>
            {activeFilterCount > 0 ? (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Create First Card
              </Button>
            )}
          </div>
        )}

        {/* Cards List */}
        {cards.length > 0 && (
          <>
            {/* Header with select all */}
            <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedCards.length === cards.length && cards.length > 0}
                  onChange={(e) => e.target.checked ? selectAllCards() : clearSelection()}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({cards.length})
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Showing {pagination.offset + 1} - {Math.min(pagination.offset + cards.length, pagination.total)} of {pagination.total}
              </div>
            </div>

            {/* Cards */}
            <div className="grid gap-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`card p-6 transition-all duration-200 ${
                    selectedCards.includes(card.id)
                      ? 'ring-2 ring-primary-500 bg-primary-50'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedCards.includes(card.id)}
                      onChange={() => toggleCardSelection(card.id)}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />

                    {/* Card Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Card Title/Content Preview */}
                          <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                            {formatCardPreview(card.content).substring(0, 100)}
                            {formatCardPreview(card.content).length > 100 && '...'}
                          </h3>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(card.status)}`}>
                              {card.status || 'active'}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(card.tier)}`}>
                              {card.tier || 'FREE'}
                            </span>
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {CARD_TYPES.find(t => t.value === card.type)?.label || card.type}
                            </span>
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Level {card.connectionLevel}
                            </span>
                            {card.relationshipTypes && card.relationshipTypes.length > 0 && (
                              <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {CARD_RELATIONSHIP_TYPES.find(r => r.value === card.relationshipTypes[0])?.label || card.relationshipTypes[0]}
                                {card.relationshipTypes.length > 1 && ` +${card.relationshipTypes.length - 1}`}
                              </span>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {card.createdBy && (
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{card.createdBy}</span>
                              </div>
                            )}
                            {card.createdAt && card.createdAt._seconds && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{new Date(card.createdAt._seconds * 1000).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}</span>
                              </div>
                            )}
                            {card.theta && (
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">θ {card.theta}</span>
                              </div>
                            )}
                            {card.languages && card.languages.length > 1 && (
                              <div className="flex items-center space-x-1">
                                <Globe className="h-4 w-4" />
                                <span>{card.languages.length} languages</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="h-4 w-4" />}
                            onClick={() => toast.info(`View card ${card.id}`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Edit className="h-4 w-4" />}
                            onClick={() => toast.info(`Edit card ${card.id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<MoreVertical className="h-4 w-4" />}
                            onClick={() => toast.info(`More options for card ${card.id}`)}
                          >
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="text-center py-6">
                <Button
                  variant="outline"
                  onClick={loadMoreCards}
                  disabled={loading}
                  leftIcon={loading ? <RefreshCw className="h-4 w-4 animate-spin" /> :
                    <ChevronRight className="h-4 w-4" />}
                >
                  {loading ? 'Loading...' : 'Load More Cards'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
