import React from 'react';

const SessionProgress = ({
  currentLevel = 1,
  cardsRemaining = 0,
  sessionProgress = { progress: 0, completed: 0 },
  statistics = {},
}) => {
  const { progress = 0, completed = 0 } = sessionProgress;
  const skippedCount = statistics?.skippedCards?.length || 0;

  return (
    <div className="space-y-6">
      {/* Progress Bar and Info */}
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-2 flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-primary-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
          <span>
            Connection Level {currentLevel} • {cardsRemaining} cards remaining
          </span>
        </div>
      </div>

      {/* Connection Level Indicator */}
      <div className="text-center">
        <p className="mb-2 text-sm text-gray-600">Connection Level {currentLevel} of 4</p>
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-3 w-3 rounded-full transition-colors duration-200 ${
                level <= currentLevel ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Session Statistics */}
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 px-4 md:grid-cols-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">{completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">{skippedCount}</div>
          <div className="text-sm text-gray-600">Skipped</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success-600">{currentLevel}</div>
          <div className="text-sm text-gray-600">Level</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-warning-600">{cardsRemaining}</div>
          <div className="text-sm text-gray-600">Remaining</div>
        </div>
      </div>

      {/* Warnings for Low Cards */}
      {cardsRemaining <= 5 && cardsRemaining > 0 && (
        <div className="mx-auto max-w-2xl px-4">
          <div className="rounded-md border border-warning-200 bg-warning-50 p-4 text-center">
            <p className="text-sm text-warning-600">
              Only {cardsRemaining} cards remaining in this session
            </p>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {cardsRemaining === 0 && (
        <div className="mx-auto max-w-2xl px-4">
          <div className="rounded-md border border-success-200 bg-success-50 p-4 text-center">
            <p className="font-medium text-success-700">
              🎉 Congratulations! You've completed all available cards.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionProgress;
