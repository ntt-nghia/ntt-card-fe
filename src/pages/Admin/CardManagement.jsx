// src/pages/Admin/CardManagement.jsx - Updated with Edit Modal
import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  ChevronRight,
  Download,
  Filter,
  LayoutDashboard,
  LayoutGrid,
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
import CardEditModal from '@components/admin/CardEditModal';

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
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', or 'masonry'

  // Edit modal state
  const [editingCard, setEditingCard] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
  }, [filters, getAllCards]);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const onFilterTrigger = () => {
    getAllCards({
      ...filters,
      searchQuery,
      limit: 20,
      offset: 0,
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
  const handleEditCard = (card) => {
    setEditingCard(card);
    setIsEditModalOpen(true);
  };

  const handleSaveCard = async (cardId, updateData) => {
    try {
      await updateCard(cardId, updateData);
      // Refresh the cards list to show updated data
      getAllCards({
        ...filters,
        limit: 20,
        offset: 0,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    } catch (error) {
      console.error('Failed to update card:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCard(null);
  };

  const handleDeleteCard = async (card) => {
    if (!window.confirm(`Are you sure you want to delete this card?`)) {
      return;
    }

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
        content: typeof card.content === 'object'
          ? { ...card.content, en: `${card.content.en || card.content} (Copy)` }
          : `${card.content} (Copy)`,
        status: 'draft',
      };
      delete duplicatedCard.id;
      delete duplicatedCard.createdAt;
      delete duplicatedCard.updatedAt;

      // Note: You'll need to implement createCard in your admin hook
      // await createCard(duplicatedCard);
      console.log('Duplicate card data:', duplicatedCard);
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

  // Masonry helpers
  const getMasonryColumnCount = () => {
    if (window.innerWidth >= 1280) return 4; // xl
    if (window.innerWidth >= 768) return 3;  // md
    return 2; // sm
  };

  const distributeMasonryCards = (cards, columnCount) => {
    const columns = Array.from({ length: columnCount }, () => []);
    cards.forEach((card, index) => {
      columns[index % columnCount].push(card);
    });
    return columns;
  };

  // Render cards based on view mode
  const renderCards = () => {
    if (viewMode === 'masonry') {
      const columnCount = getMasonryColumnCount();
      const columns = distributeMasonryCards(cards, columnCount);

      return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {columns.map((columnCards, columnIndex) => (
            <div key={columnIndex} className="flex flex-col gap-4">
              {columnCards.map((card) => (
                <AdminCard
                  key={card.id}
                  card={card}
                  isSelected={selectedCards.includes(card.id)}
                  onSelect={toggleCardSelection}
                  onEdit={handleEditCard}
                  onDelete={handleDeleteCard}
                  onDuplicate={handleDuplicateCard}
                  onArchive={handleArchiveCard}
                  showSelection={true}
                  showActions={true}
                  variant="masonry"
                />
              ))}
            </div>
          ))}
        </div>
      );
    }

    const containerClasses = viewMode === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
      : 'space-y-4';

    return (
      <div className={containerClasses}>
        {cards.map((card) => (
          <AdminCard
            key={card.id}
            card={card}
            isSelected={selectedCards.includes(card.id)}
            onSelect={toggleCardSelection}
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
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">
            Card Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your card collection
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Import
          </Button>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Card
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
            {[
              { mode: 'grid', icon: LayoutGrid, label: 'Grid' },
              { mode: 'list', icon: List, label: 'List' },
              { mode: 'masonry', icon: LayoutDashboard, label: 'Masonry' },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={label}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {/* Filter Toggle */}
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

          <Button
            size="sm"
            variant="outline"
            onClick={() => getAllCards({ ...filters, limit: 20, offset: 0 })}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <ChoiceChips
              label="Connection Level"
              options={CARD_CONNECTION_LEVELS}
              value={filters.connectionLevel}
              onChange={(val) => handleFilterChange('connectionLevel', val)}
              emptyValue=""
              className="mt-2"
            />

            <ChoiceChips
              label="Card Type"
              options={CARD_TYPES}
              value={filters.type}
              onChange={(val) => handleFilterChange('type', val)}
              emptyValue=""
              className="mt-2"
            />

            <ChoiceChips
              label="Relationship Type"
              options={CARD_RELATIONSHIP_TYPES}
              value={filters.relationshipType}
              onChange={(val) => handleFilterChange('relationshipType', val)}
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
                onClick={selectAllCards}
                leftIcon={<CheckSquare className="h-4 w-4" />}
              >
                Select All
              </Button>
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

      {/* Cards Grid/List/Masonry */}
      {isLoading && cards.length === 0 ? (
        <div className="text-center py-12">
          <Loading size="large" text="Loading cards..." />
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No cards found</p>
        </div>
      ) : (
        <>
          {renderCards()}

          {/* Load More */}
          {pagination.hasMore && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                onClick={loadMoreCards}
                loading={isLoading}
                disabled={isLoading}
              >
                Load More Cards
              </Button>
            </div>
          )}
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Card Edit Modal */}
      <CardEditModal
        card={editingCard}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveCard}
        isLoading={isLoading}
      />
    </div>
  );
};
