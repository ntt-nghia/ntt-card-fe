// Deck Management Component
import React, { useEffect, useState } from 'react';
import Loading from '@components/common/Loading/index.js';
import Button from '@components/common/Button/index.js';
import { Edit, Eye, Filter, Plus, Search, Trash2 } from 'lucide-react';

export const DeckManagement = () => {
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate loading decks - replace with actual API call
    setTimeout(() => {
      setDecks([
        {
          id: 1,
          name: { en: 'Friends Starter Pack' },
          type: 'FREE',
          cardCount: { total: 25 },
          status: 'active',
        },
        {
          id: 2,
          name: { en: 'Deep Conversations' },
          type: 'PREMIUM',
          cardCount: { total: 30 },
          status: 'active',
        },
        {
          id: 3,
          name: { en: 'Workplace Connections' },
          type: 'FREE',
          cardCount: { total: 20 },
          status: 'draft',
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <Loading size="large" text="Loading decks..." />;
  }

  const filteredDecks = decks.filter((deck) =>
    deck.name.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Deck Management</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />}>Create New Deck</Button>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search decks..."
              className="input-field pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
            Filters
          </Button>
        </div>
      </div>

      {/* Decks Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Deck Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cards
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredDecks.map((deck) => (
                <tr key={deck.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{deck.name.en}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        deck.type === 'FREE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {deck.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {deck.cardCount.total}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        deck.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {deck.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3 w-3" />}>
                        View
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<Edit className="h-3 w-3" />}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-3 w-3" />}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
