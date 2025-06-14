// src/components/admin/AdminCard/AdminCard.jsx
import React, { useState } from 'react';
import {
  Archive,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Edit,
  Eye,
  Globe,
  MoreVertical,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import Button from '@components/common/Button/index.js';

const AdminCard = ({
                     card,
                     isSelected = false,
                     onSelect = null,
                     onEdit = null,
                     onDelete = null,
                     onView = null,
                     onDuplicate = null,
                     onArchive = null,
                     showActions = true,
                     showSelection = false,
                     variant = 'default', // 'default', 'compact'
                     className = '',
                   }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const isVariantDefault = variant === 'default';
  // Format card content based on type
  const formatCardContent = (content) => {
    if (typeof content === 'string') return content;
    if (content?.en) return content.en;
    if (content && typeof content === 'object') {
      const firstKey = Object.keys(content)[0];
      return content[firstKey];
    }
    return 'No content available';
  };

  // Get status badge styling
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      archived: 'bg-gray-100 text-gray-800 border-gray-200',
      draft: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[status] || colors.active;
  };

  // Get tier badge styling
  const getTierColor = (tier) => {
    const colors = {
      FREE: 'bg-green-100 text-green-800 border-green-200',
      PREMIUM: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[tier] || colors.FREE;
  };

  // Get connection level color
  const getLevelColor = (level) => {
    const colors = {
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-red-100 text-red-800',
    };
    return colors[level] || colors[1];
  };

  // Get relationship type background color
  const getRelationshipTypeColor = (type) => {
    const colors = {
      'friends': 'bg-indigo-50',
      'colleagues': 'bg-emerald-50',
      'new_couples': 'bg-pink-50',
      'established_couples': 'bg-purple-50',
      'family': 'bg-amber-50',
    };
    return colors[type] || 'bg-white';
  };

  const cardContent = formatCardContent(card.content);
  const CUTTING_LENGTH = 240;
  const isLongContent = isVariantDefault && cardContent.length > CUTTING_LENGTH;
  const displayContent = isExpanded || !isVariantDefault ? cardContent : cardContent.substring(0, CUTTING_LENGTH);

  // Action buttons for dropdown
  const actionButtons = [
    { icon: Eye, label: 'View Details', onClick: onView, show: !!onView },
    { icon: Edit, label: 'Edit Card', onClick: onEdit, show: !!onEdit },
    { icon: Copy, label: 'Duplicate', onClick: onDuplicate, show: !!onDuplicate },
    { icon: Archive, label: 'Archive', onClick: onArchive, show: !!onArchive },
    { icon: Trash2, label: 'Delete', onClick: onDelete, show: !!onDelete, danger: true },
  ].filter(action => action.show);

  // Get background color based on relationship type
  const bgColor = card.relationshipTypes && card.relationshipTypes.length > 0
    ? getRelationshipTypeColor(card.relationshipTypes[0])
    : 'bg-white';

  return (
    <div className={`
      relative ${bgColor} rounded-lg border-2 transition-all duration-200 group
      ${isSelected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'}
      ${variant === 'compact' ? 'h-[12rem] w-full' : 'h-[20rem] max-w-sm mx-auto'}
      ${className}
    `}>

      {/* Actions Dropdown */}
      {showActions && actionButtons.length > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDropdown(!showDropdown)}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showDropdown && (
              <div
                className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                {actionButtons.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick?.(card);
                      setShowDropdown(false);
                    }}
                    className={`
                      w-full px-4 py-2 text-left text-sm flex items-center space-x-2 
                      hover:bg-gray-50 transition-colors
                      ${action.danger ? 'text-red-600 hover:text-red-700' : 'text-gray-700'}
                    `}
                  >
                    <action.icon className="h-4 w-4" />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-4 h-full flex flex-col">
        {/* Header Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          <span className={`
            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
            ${getStatusColor(card.status)}
          `}>
            {card.status || 'active'}
          </span>
          <span className={`
            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
            ${getTierColor(card.tier)}
          `}>
            {card.tier || 'FREE'}
          </span>
          {card.connectionLevel && (
            <span className={`
              inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
              ${getLevelColor(card.connectionLevel)}
            `}>
              Level {card.connectionLevel}
            </span>
          )}
        </div>

        {/* Card Type */}
        <div className="flex items-center mb-2">
          <Tag className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm font-medium text-gray-600 capitalize">
            {card.type || 'Question'} Card
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 mb-3 overflow-hidden">
          <div className="text-sm text-gray-900 leading-relaxed">
            {displayContent}
            {isLongContent && !isExpanded && '...'}
          </div>

          {/* Expand/Collapse for long content */}
          {isLongContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show More
                </>
              )}
            </button>
          )}
        </div>

        {/* Footer Metadata */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {card.relationshipTypes && card.relationshipTypes.length > 0 && (
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  <span className="capitalize">
                    {card.relationshipTypes[0]?.replace('_', ' ')}
                  </span>
                </div>
              )}
              {card.language && (
                <div className="flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  <span className="uppercase">{card.language}</span>
                </div>
              )}
            </div>

            {card.createdAt && card.createdAt._seconds && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {new Date(card.createdAt._seconds * 1000).toLocaleDateString('vn-VI', {
                    day: '2-digit',
                    year: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click overlay for selection */}
      {showSelection && (
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={() => onSelect?.(card.id, !isSelected)}
        />
      )}
    </div>
  );
};

export default AdminCard;
