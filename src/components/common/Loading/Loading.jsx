import React from 'react';
import clsx from 'clsx';

const Loading = ({ size = 'md', className, color = 'primary', text }) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center', className)}>
      <div className={clsx('loading-spinner', sizeClasses[size], colorClasses[color])} />
      {text && <p className="mt-2 animate-pulse text-sm text-gray-600">{text}</p>}
    </div>
  );
};

export default Loading;
