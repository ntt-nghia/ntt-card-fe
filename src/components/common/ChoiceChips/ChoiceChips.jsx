// src/components/common/ChoiceChips/ChoiceChips.jsx
import React from 'react';
import clsx from 'clsx';

const ChoiceChips = ({
  label,
  options = [],
  value,
  onChange,
  multiple = false,
  required = false,
  disabled = false,
  error,
  placeholder = "Select an option",
  allowDeselect = true,
  emptyValue = '',
  showEmptyOption = false,
  emptyOptionLabel = null,
  size = 'md',
  variant = 'default',
  className = '',
  chipClassName = '',
  labelClassName = '',
  helperText,
  ...props
}) => {
  // Handle single or multiple selection
  const handleChipClick = (optionValue) => {
    if (disabled) return;

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues)
    } else {
      // For single selection, allow deselection unless required
      const shouldDeselect = value === optionValue && allowDeselect && !required;
      onChange(shouldDeselect ? emptyValue : optionValue);
    }
  };

  // Check if option is selected
  const isSelected = (optionValue) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  // Check if nothing is selected (empty state)
  const hasSelection = multiple
    ? (Array.isArray(value) && value.length > 0)
    : (value !== emptyValue && value !== null && value !== undefined);

  // Prepare options with empty option if needed
  const processedOptions = React.useMemo(() => {
    let opts = [...options];

    // Add empty option if specified or if we detect it should be there
    if (showEmptyOption) {
      const emptyOption = {
        value: emptyValue,
        label: emptyOptionLabel || placeholder,
        isEmpty: true
      };
      opts.unshift(emptyOption);
    }

    return opts;
  }, [options, showEmptyOption, emptyValue, emptyOptionLabel, placeholder, multiple, required]);
  console.log(processedOptions);
  // Size variants
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  // Base chip styles
  const getChipClasses = (optionValue, isDisabled = false, isEmpty = false) => {
    const selected = isSelected(optionValue);
    const baseClasses = clsx(
      'inline-flex items-center justify-center',
      'rounded-full border-2 font-medium',
      'transition-all duration-200 cursor-pointer',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'touch-manipulation min-h-[44px] sm:min-h-auto', // Mobile touch target
      sizeClasses[size]
    );

    if (isDisabled) {
      return clsx(baseClasses,
        'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
      );
    }

    // Special styling for empty/placeholder options
    if (isEmpty) {
      return clsx(baseClasses, {
        // Selected empty state
        'border-gray-400 bg-gray-100 text-gray-700 focus:ring-gray-400': selected,
        // Unselected empty state
        'border-gray-300 bg-white text-gray-500 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-400': !selected,
      });
    }

    if (variant === 'outline') {
      return clsx(baseClasses, {
        // Selected state
        'border-primary-600 bg-primary-600 text-white focus:ring-primary-500': selected,
        // Unselected state
        'border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50 focus:ring-primary-500': !selected,
      });
    }

    // Default variant
    return clsx(baseClasses, {
      // Selected state
      'border-primary-600 bg-primary-600 text-white focus:ring-primary-500': selected,
      // Unselected state
      'border-gray-200 bg-gray-50 text-gray-600 hover:border-primary-200 hover:bg-primary-50 focus:ring-primary-500': !selected,
    });
  };

  // Format option display
  const getOptionDisplay = (option) => {
    if (typeof option === 'string') return option;
    return option.label || option.value || '';
  };

  // Get option value
  const getOptionValue = (option) => {
    if (typeof option === 'string') return option;
    return option.value;
  };

  return (
    <div className={clsx('w-full', className)} {...props}>
      {/* Label */}
      {label && (
        <label className={clsx(
          'block text-sm font-medium text-gray-700 mb-2',
          labelClassName
        )}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      {/* Chips Container */}
      <div className="flex flex-wrap gap-2">
        {processedOptions.length === 0 ? (
          <div className="text-sm text-gray-500 italic py-2">
            {placeholder}
          </div>
        ) : (
          processedOptions.map((option, index) => {
            const optionValue = getOptionValue(option);
            const optionDisplay = getOptionDisplay(option);
            const isOptionDisabled = disabled || option.disabled;
            const isEmptyOption = option.isEmpty;

            return (
              <button
                key={optionValue !== undefined ? optionValue : `empty-${index}`}
                type="button"
                onClick={() => handleChipClick(optionValue)}
                disabled={isOptionDisabled}
                className={clsx(
                  getChipClasses(optionValue, isOptionDisabled, isEmptyOption),
                  chipClassName,
                  // Add subtle styling for empty option
                  isEmptyOption && 'italic'
                )}
                aria-pressed={isSelected(optionValue)}
                role={multiple ? "checkbox" : "radio"}
                title={isEmptyOption ? "Clear selection" : undefined}
              >
                {optionDisplay}
              </button>
            );
          })
        )}
      </div>

      {/* Helper text or error */}
      {(helperText || error) && (
        <div className={clsx(
          'mt-1 text-xs',
          error ? 'text-error-500' : 'text-gray-500'
        )}>
          {error || helperText}
        </div>
      )}

      {/* Selection status */}
      {multiple && Array.isArray(value) && value.length > 0 ? (
        <div className="mt-2 text-xs text-gray-600">
          Selected: {value.length} item{value.length !== 1 ? 's' : ''}
        </div>
      ) : (
        !multiple && !hasSelection && !required && (
          <div className="mt-2 text-xs text-gray-500">
            No selection {allowDeselect ? '(click to deselect)' : ''}
          </div>
        )
      )}
    </div>
  );
};

export default ChoiceChips;
