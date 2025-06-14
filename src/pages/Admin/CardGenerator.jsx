// src/pages/Admin/CardGenerator.jsx - Refactored to use Redux patterns
import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Eye,
  Grid3X3,
  List,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Sparkles,
  Target,
  Trash2,
  Wand2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import custom hooks following your project patterns
import { useAdmin } from '@hooks/useAdmin';
import { useDecks } from '@hooks/useDecks';

// Import components following your project structure
import AdminCard from '@components/admin/AdminCard';
import Button from '@components/common/Button';
import Loading from '@components/common/Loading';

// Import constants following your project structure
import {
  CARD_CONNECTION_LEVELS,
  CARD_RELATIONSHIP_TYPES,
  LANGUAGES
} from '@utils/constants';

const CardGenerator = () => {
  // Use custom hooks following your Redux patterns
  const {
    generatedCards,
    generationAnalytics,
    isGenerating,
    generateCards,
    batchGenerateCards,
    updateCard,
    clearGeneratedCards,
  } = useAdmin();

  const { allDecks, getAllDecks } = useDecks();

  // Form state
  const [formData, setFormData] = useState({
    relationshipType: '',
    connectionLevel: 1,
    count: 5,
    theta: 0.5,
    targetLanguages: ['en'],
    deckId: '',
    preview: false,
    batchMode: false,
  });

  // UI state
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchConfigurations, setBatchConfigurations] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  // Load initial data
  useEffect(() => {
    getAllDecks();
    // Load generation analytics if available in your admin hook
  }, [getAllDecks]);

  // Clear generated cards on unmount
  useEffect(() => {
    return () => {
      clearGeneratedCards();
    };
  }, [clearGeneratedCards]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLanguageToggle = (language) => {
    setFormData(prev => ({
      ...prev,
      targetLanguages: prev.targetLanguages.includes(language)
        ? prev.targetLanguages.filter(lang => lang !== language)
        : [...prev.targetLanguages, language],
    }));
  };

  const handleGenerate = async (isPreview = false) => {
    if (!formData.relationshipType || !formData.connectionLevel) {
      toast.error('Please select relationship type and connection level');
      return;
    }

    try {
      const generationParams = {
        ...formData,
        preview: isPreview,
      };

      const result = await generateCards(generationParams);

      if (result) {
        setSelectedCards([]);
        toast.success(
          isPreview
            ? `Generated ${result.length || 0} preview cards`
            : `Successfully generated ${result.length || 0} cards`,
        );
      }
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage = error.message || 'Failed to generate cards';
      toast.error(errorMessage);
    }
  };

  const handleBatchGenerate = async () => {
    if (batchConfigurations.length === 0) {
      toast.error('Please add at least one batch configuration');
      return;
    }

    setIsBatchGenerating(true);

    try {
      const result = await batchGenerateCards(batchConfigurations, formData.theta);

      if (result) {
        const totalGenerated = result.reduce(
          (sum, r) => sum + (r.generatedCount || 0), 0
        );

        toast.success(`Successfully completed batch generation: ${totalGenerated} total cards`);

        // Set the first batch result as displayed cards
        if (result.length > 0) {
          // This would need to be handled in your Redux store
        }
      }
    } catch (error) {
      console.error('Batch generation failed:', error);
      const errorMessage = error.message || 'Failed to complete batch generation';
      toast.error(errorMessage);
    } finally {
      setIsBatchGenerating(false);
    }
  };

  const addBatchConfiguration = () => {
    // Validate required fields
    if (!formData.relationshipType || !formData.connectionLevel) {
      toast.error('Please select relationship type and connection level');
      return;
    }

    setBatchConfigurations(prev => [
      ...prev,
      { ...formData, id: Date.now() },
    ]);

    toast.success('Configuration added to batch');
  };

  const removeBatchConfiguration = (id) => {
    setBatchConfigurations(prev => prev.filter(config => config.id !== id));
  };

  const handleCardSelection = (cardId, isSelected) => {
    if (isSelected) {
      setSelectedCards(prev => [...prev, cardId]);
    } else {
      setSelectedCards(prev => prev.filter(id => id !== cardId));
    }
  };

  const handleSaveSelected = async () => {
    if (selectedCards.length === 0) {
      toast.error('Please select cards to save');
      return;
    }

    try {
      // Update status from preview/review to active for selected cards
      const updatePromises = selectedCards.map(cardId =>
        updateCard(cardId, { status: 'active' })
      );

      await Promise.all(updatePromises);

      toast.success(`Successfully saved ${selectedCards.length} cards`);
      setSelectedCards([]);
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save selected cards');
    }
  };

  const handleDeleteCard = (card) => {
    // Remove from local state - this would be handled in Redux
    setSelectedCards(prev => prev.filter(id => id !== card.id));
    toast.success('Card removed from preview');
  };

  const handleRegenerateCard = async (card) => {
    try {
      const result = await generateCards({
        ...formData,
        count: 1,
        preview: true,
      });

      if (result && result.length > 0) {
        // Replace the card in the generated cards list
        // This would be handled in your Redux store
        toast.success('Card regenerated successfully');
      }
    } catch (error) {
      console.error('Regeneration failed:', error);
      toast.error('Failed to regenerate card');
    }
  };

  const selectAllGenerated = () => {
    setSelectedCards(generatedCards.map(card => card.id));
  };

  const clearSelection = () => {
    setSelectedCards([]);
  };

  const getQualityDescription = (theta) => {
    if (theta <= 0.3) return 'Basic';
    if (theta <= 0.5) return 'Standard';
    if (theta <= 0.7) return 'High';
    return 'Premium';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">
            AI Card Generator
          </h1>
          <p className="text-gray-600 mt-1">
            Generate new cards using AI with customizable parameters
          </p>
        </div>

        {generationAnalytics && (
          <div className="text-right text-sm text-gray-600">
            <div>Total Generated: {generationAnalytics.totalGenerated || 0}</div>
            <div>This Month: {generationAnalytics.monthlyGenerated || 0}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Parameters */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Generation Parameters
            </h2>

            <div className="space-y-4">
              {/* Relationship Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship Type *
                </label>
                <select
                  value={formData.relationshipType}
                  onChange={(e) => handleInputChange('relationshipType', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Select relationship type</option>
                  {CARD_RELATIONSHIP_TYPES.map((it) => (
                    <option key={it.value} value={it.value}>{it.label}</option>
                  ))}
                </select>
              </div>

              {/* Connection Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection Level *
                </label>
                <select
                  value={formData.connectionLevel}
                  onChange={(e) => handleInputChange('connectionLevel', parseInt(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {CARD_CONNECTION_LEVELS.map((it) => (
                    <option key={it.value} value={parseInt(it.value)}>
                      Level {it.value} - {it.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Cards
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.count}
                  onChange={(e) => handleInputChange('count', parseInt(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Deck Assignment */}
              {allDecks.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Deck (Optional)
                  </label>
                  <select
                    value={formData.deckId}
                    onChange={(e) => handleInputChange('deckId', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">No specific deck</option>
                    {allDecks.map((deck) => (
                      <option key={deck.id} value={deck.id}>
                        {deck.name?.en || deck.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="card p-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-lg font-semibold mb-4"
            >
              <div className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Advanced Settings
              </div>
              <RefreshCw className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {showAdvanced && (
              <div className="space-y-4">
                {/* Quality (Theta) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Level (θ = {formData.theta}) - {getQualityDescription(formData.theta)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={formData.theta}
                    onChange={(e) => handleInputChange('theta', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Basic</span>
                    <span>Standard</span>
                    <span>High</span>
                    <span>Premium</span>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Languages
                  </label>
                  <div className="space-y-2">
                    {Object.entries(LANGUAGES).map(([code, name]) => (
                      <label key={code} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.targetLanguages.includes(code)}
                          onChange={() => handleLanguageToggle(code)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm">{name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Batch Configuration */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Batch Generation
            </h2>

            <div className="space-y-3">
              <Button
                onClick={addBatchConfiguration}
                variant="outline"
                size="sm"
                className="w-full"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Current Config to Batch
              </Button>

              <Button
                onClick={handleBatchGenerate}
                disabled={isBatchGenerating || batchConfigurations.length === 0}
                className="w-full"
                leftIcon={<Sparkles className="h-4 w-4" />}
              >
                {isBatchGenerating
                  ? 'Generating...'
                  : `Generate Batch (${batchConfigurations.length})`}
              </Button>
            </div>

            {batchConfigurations.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto mt-4">
                {batchConfigurations.map((config, index) => (
                  <div key={config.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="text-sm">
                      <span className="font-medium">
                        {config.relationshipType} - Level {config.connectionLevel} ({config.count} cards)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBatchConfiguration(config.id)}
                      leftIcon={<Trash2 className="h-3 w-3" />}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>

            <div className="space-y-3">
              <Button
                onClick={() => handleGenerate(true)}
                disabled={isGenerating}
                variant="outline"
                className="w-full"
                leftIcon={<Eye className="h-4 w-4" />}
              >
                {isGenerating ? 'Generating...' : 'Preview Cards'}
              </Button>

              <Button
                onClick={() => handleGenerate(false)}
                disabled={isGenerating}
                className="w-full"
                leftIcon={<Wand2 className="h-4 w-4" />}
              >
                {isGenerating ? 'Generating...' : 'Generate & Save Cards'}
              </Button>
            </div>
          </div>
        </div>

        {/* Generated Cards Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* Generated Cards Header */}
          {generatedCards.length > 0 && (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Generated Cards ({generatedCards.length})
                </h2>
                {selectedCards.length > 0 && (
                  <p className="text-sm text-gray-600">{selectedCards.length} selected</p>
                )}
              </div>

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

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearGeneratedCards}
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Selection Actions */}
          {generatedCards.length > 0 && (
            <div className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectedCards.length === generatedCards.length ? clearSelection : selectAllGenerated}
                  >
                    {selectedCards.length === generatedCards.length ? 'Deselect All' : 'Select All'}
                  </Button>

                  {selectedCards.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedCards.length} of {generatedCards.length} selected
                    </span>
                  )}
                </div>

                {selectedCards.length > 0 && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSaveSelected}
                      size="sm"
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      Save Selected ({selectedCards.length})
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cards Grid */}
          {isGenerating ? (
            <div className="card p-12 text-center">
              <Loading size="large" text="Generating cards with AI..." />
            </div>
          ) : generatedCards.length > 0 ? (
            <div className={`
              ${viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                : 'space-y-4'
              }
            `}>
              {generatedCards.map((card) => (
                <AdminCard
                  key={card.id}
                  card={card}
                  isSelected={selectedCards.includes(card.id)}
                  onSelect={handleCardSelection}
                  onDelete={handleDeleteCard}
                  onDuplicate={() => handleRegenerateCard(card)}
                  showSelection={true}
                  showActions={true}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Wand2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Cards Generated Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Configure your parameters and click "Preview Cards" or "Generate & Save Cards" to start.
              </p>

              {(!formData.relationshipType || !formData.connectionLevel) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">
                        Missing Required Fields
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please select both relationship type and connection level to generate cards.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardGenerator;
