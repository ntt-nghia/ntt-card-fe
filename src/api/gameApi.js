import apiClient from './axiosConfig';

export const gameApi = {
  createGame: (gameData) => apiClient.post('/games', gameData),

  getGame: (gameId) => apiClient.get(`/games/${gameId}`),

  getNextQuestion: (gameId) => apiClient.get(`/games/${gameId}/next-question`),

  processAction: (gameId, actionData) => apiClient.post(`/games/${gameId}/actions`, actionData),

  updateGame: (gameId, updateData) => apiClient.patch(`/games/${gameId}`, updateData),
};