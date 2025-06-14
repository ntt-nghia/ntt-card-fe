import React from 'react';
import { Briefcase, Heart, HeartHandshake, Home, Layers, MessageCircle, Target, Users, Zap } from 'lucide-react';
import ChoiceChips from './ChoiceChips';

// Enhanced version with icon support
const ChoiceChipsWithIcons = ({
                                options = [],
                                ...props
                              }) => {
  const iconMap = {
    'friends': Users,
    'colleagues': Briefcase,
    'new_couples': Heart,
    'established_couples': HeartHandshake,
    'family': Home,
    'question': MessageCircle,
    'challenge': Zap,
    'scenario': Target,
    'connection': Layers,
  };

  const enhancedOptions = options.map(option => {
    if (typeof option === 'string') return option;

    const IconComponent = iconMap[option.icon] || iconMap[option.value];

    return {
      ...option,
      renderLabel: () => (
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="h-4 w-4" />}
          <span>{option.label}</span>
        </div>
      ),
    };
  });

  return (
    <ChoiceChips
      {...props}
      options={enhancedOptions}
    />
  );
};

export default ChoiceChipsWithIcons;

