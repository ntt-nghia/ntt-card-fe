import apiClient from './axiosConfig';

export const questionApi = {
  getQuestions: (params = {}) => apiClient.get('/questions', { params }),

  getQuestionById: (id) => apiClient.get(`/questions/${id}`),

  createQuestion: (questionData) => apiClient.post('/questions', questionData),

  generateQuestions: (generationData) => apiClient.post('/questions/generate', generationData),
};