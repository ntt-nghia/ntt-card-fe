import React from 'react';

const SessionProgress = ({
  currentLevel = 1,
  cardsRemaining = 0,
  sessionProgress = { progress: 0, completed: 0 },
  statistics = {}
}) => {
  const { progress = 0, completed = 0 } = sessionProgress;
  const skippedCount = statistics?.skippedCards?.length || 0;

  return (
    <div className="space-y-6">
      {/* Progress Bar and Info */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
          <span>Connection Level {currentLevel} • {cardsRemaining} cards remaining</span>
        </div>
      </div>

      {/* Connection Level Indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Connection Level {currentLevel} of 4
        </p>
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                level <= currentLevel
                  ? 'bg-primary-600'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Session Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto px-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {completed}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {skippedCount}
          </div>
          <div className="text-sm text-gray-600">Skipped</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success-600">
            {currentLevel}
          </div>
          <div className="text-sm text-gray-600">Level</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-warning-600">
            {cardsRemaining}
          </div>
          <div className="text-sm text-gray-600">Remaining</div>
        </div>
      </div>

      {/* Warnings for Low Cards */}
      {cardsRemaining <= 5 && cardsRemaining > 0 && (
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center p-4 bg-warning-50 border border-warning-200 rounded-md">
            <p className="text-sm text-warning-600">
              Only {cardsRemaining} cards remaining in this session
            </p>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {cardsRemaining === 0 && (
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center p-4 bg-success-50 border border-success-200 rounded-md">
            <p className="text-success-700 font-medium">
              🎉 Congratulations! You've completed all available cards.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionProgress;
