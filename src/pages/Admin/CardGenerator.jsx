import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  Eye,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Sparkles,
  Target,
  Trash2,
  Wand2,
} from 'lucide-react';
import adminService from '@services/admin.js';
import Button from '@components/common/Button/index.js';
import { CARD_CONNECTION_LEVELS, LANGUAGES, RELATIONSHIP_TYPES } from '@utils/constants.js';

const toast = {
  success: (message) => console.log('SUCCESS:', message),
  error: (message) => console.log('ERROR:', message),
};

const CardGenerator = () => {

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [availableDecks, setAvailableDecks] = useState([]);
  const [batchConfigurations, setBatchConfigurations] = useState([]);
  const [generationAnalytics, setGenerationAnalytics] = useState(null);

  // Load available decks on component mount
  useEffect(() => {
    loadAvailableDecks();
    loadGenerationAnalytics();
  }, []);

  const loadAvailableDecks = async () => {
    try {
      const response = await adminService.getAllDecks();
      setAvailableDecks(response.data.data.decks || []);
    } catch (error) {
      console.error('Failed to load decks:', error);
      toast.error('Failed to load available decks');
    }
  };

  const loadGenerationAnalytics = async () => {
    try {
      const response = await adminService.getGenerationAnalytics();
      setGenerationAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

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

  const validateForm = () => {
    const validation = adminService.validateGenerationParams(formData);

    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return false;
    }

    return true;
  };

  const handleGenerate = async (preview = false) => {
    if (!validateForm()) return;

    setIsGenerating(true);

    try {
      const payload = {
        ...formData,
        preview,
      };

      const response = await adminService.generateCards(payload);
      console.log(response.data.success);
      if (response.data.success === true || response.data.success === 'true') {
        setGeneratedCards(response.data.data.cards || []);
        setSelectedCards([]); // Reset selection

        toast.success(
          preview
            ? `Generated ${response.data.data.cards?.length || 0} preview cards`
            : `Successfully generated ${response.data.data.cards?.length || 0} cards`,
        );
      }
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate cards';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchGenerate = async () => {
    if (batchConfigurations.length === 0) {
      toast.error('Please add at least one batch configuration');
      return;
    }

    setIsBatchGenerating(true);

    try {
      const response = await adminService.batchGenerateCards(batchConfigurations, formData.theta);

      if (response.data.status === 'success') {
        const totalGenerated = response.data.data.results.reduce(
          (sum, result) => sum + (result.generatedCount || 0), 0,
        );

        toast.success(`Successfully completed batch generation: ${totalGenerated} total cards`);

        // Reload the single form if it matches any batch config
        if (response.data.data.results.length > 0) {
          setGeneratedCards(response.data.data.results[0].cards || []);
        }
      }
    } catch (error) {
      console.error('Batch generation failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to complete batch generation';
      toast.error(errorMessage);
    } finally {
      setIsBatchGenerating(false);
    }
  };

  const addBatchConfiguration = () => {
    const validation = adminService.validateGenerationParams(formData);

    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
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

  const handleCardSelection = (cardId) => {
    setSelectedCards(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId],
    );
  };

  const handleSelectAll = () => {
    if (selectedCards.length === generatedCards.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(generatedCards.map(card => card.id));
    }
  };

  const handleSaveSelected = async () => {
    if (selectedCards.length === 0) {
      toast.error('Please select cards to save');
      return;
    }

    try {
      const cardsToSave = generatedCards.filter(card => selectedCards.includes(card.id));

      const response = await adminService.bulkCreateCards(cardsToSave);

      if (response.data.status === 'success') {
        toast.success(`Successfully saved ${selectedCards.length} cards`);
        setSelectedCards([]);

        // Optionally remove saved cards from the generated list
        setGeneratedCards(prev => prev.filter(card => !selectedCards.includes(card.id)));
      }
    } catch (error) {
      console.error('Failed to save cards:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save selected cards';
      toast.error(errorMessage);
    }
  };

  const quality = adminService.getQualityDescription(formData.theta);

  // Map color names to Tailwind classes
  const getColorClass = (color) => {
    const colorMap = {
      gray: 'text-gray-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      gold: 'text-yellow-600',
    };
    return colorMap[color] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900 flex items-center">
            <Wand2 className="h-6 w-6 mr-2 text-purple-600" />
            AI Card Generator
          </h1>
          <p className="text-gray-600 mt-1">Generate high-quality connection cards using AI</p>
        </div>

        {generationAnalytics && (
          <div className="text-right">
            <div className="text-sm text-gray-500">Today's generations</div>
            <div className="font-semibold text-lg">{generationAnalytics.dailyGenerations || 0}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Configuration */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Basic Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Relationship Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship Type *
                </label>
                <select
                  value={formData.relationshipType}
                  onChange={(e) => handleInputChange('relationshipType', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select relationship type</option>
                  {Object.entries(RELATIONSHIP_TYPES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {CARD_CONNECTION_LEVELS.map(item => (
                    <option key={item.label} value={item.value}>
                      Level {item.value} - {item.label.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* Card Count */}
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Target Deck */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Deck (Optional)
                </label>
                <select
                  value={formData.deckId}
                  onChange={(e) => handleInputChange('deckId', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">No specific deck</option>
                  {availableDecks.map(deck => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name.en} ({deck.tier})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Languages */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Languages *
              </label>
              <div className="flex space-x-4">
                {Object.entries(LANGUAGES).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetLanguages.includes(value)}
                      onChange={() => handleLanguageToggle(value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">
                      {key === 'EN' ? 'English' : 'Vietnamese'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Configuration */}
          <div className="card p-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-lg font-semibold mb-4 w-full text-left"
            >
              <Target className="h-5 w-5 mr-2" />
              Advanced Configuration
              <RefreshCw className={`h-4 w-4 ml-auto transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {showAdvanced && (
              <div className="space-y-4">
                {/* Quality Theta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Level (Theta): {formData.theta.toFixed(1)} -
                    <span className={`ml-1 font-semibold ${getColorClass(quality.color)}`}>
                      {quality.text}
                    </span>
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
                    <span>Basic (0.1)</span>
                    <span>Standard (0.5)</span>
                    <span>Elite (1.0)</span>
                  </div>
                </div>

                {/* Preview Mode */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="preview-mode"
                    checked={formData.preview}
                    onChange={(e) => handleInputChange('preview', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="preview-mode" className="ml-2 text-sm">
                    Preview Mode (don't save to database)
                  </label>
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

            <div className="space-y-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={addBatchConfiguration}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add Current Config
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBatchGenerate}
                  disabled={isBatchGenerating || batchConfigurations.length === 0}
                  leftIcon={<Sparkles className="h-4 w-4" />}
                >
                  {isBatchGenerating ? 'Generating...' : `Generate Batch (${batchConfigurations.length})`}
                </Button>
              </div>

              {batchConfigurations.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {batchConfigurations.map((config, index) => (
                    <div key={config.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="text-sm">
                        <span className="font-medium">
                          {adminService.formatGenerationConfig(config)}
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
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          {/* Generation Actions */}
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
                {isGenerating ? 'Generating...' : 'Generate & Save'}
              </Button>
            </div>
          </div>

          {/* Generation Stats */}
          {generationAnalytics && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Generation Stats</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Today:</span>
                  <span className="font-semibold">{generationAnalytics.dailyGenerations || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Month:</span>
                  <span className="font-semibold">{generationAnalytics.monthlyGenerations || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Success Rate:</span>
                  <span className="font-semibold">{generationAnalytics.successRate || 0}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generated Cards */}
      {generatedCards.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Generated Cards ({generatedCards.length})</h2>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                leftIcon={<CheckCircle className="h-4 w-4" />}
              >
                {selectedCards.length === generatedCards.length ? 'Deselect All' : 'Select All'}
              </Button>

              {selectedCards.length > 0 && (
                <Button
                  size="sm"
                  onClick={handleSaveSelected}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Selected ({selectedCards.length})
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedCards.map((card) => (
              <div
                key={card.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCards.includes(card.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleCardSelection(card.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    card.tier === 'PREMIUM'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {card.tier}
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedCards.includes(card.id)}
                    onChange={() => handleCardSelection(card.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="text-sm font-medium text-gray-900 mb-2">
                  {card.type?.toUpperCase()}
                </div>

                <div className="text-sm text-gray-700">
                  {card.content?.en || card.content}
                </div>

                {card.content?.vn && (
                  <div className="text-sm text-gray-600 mt-2 italic">
                    {card.content.vn}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>Level {card.connectionLevel}</span>
                  {card.theta && (
                    <span>θ={card.theta.toFixed(1)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardGenerator;
