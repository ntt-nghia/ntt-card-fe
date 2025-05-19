import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { questionApi } from '@/api/questionApi';

export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await questionApi.getQuestions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchQuestionById = createAsyncThunk(
  'questions/fetchQuestionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await questionApi.getQuestionById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createQuestion = createAsyncThunk(
  'questions/createQuestion',
  async (questionData, { rejectWithValue }) => {
    try {
      const response = await questionApi.createQuestion(questionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  questions: [],
  currentQuestion: null,
  total: 0,
  loading: false,
  error: null,
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    resetQuestions: (state) => {
      state.questions = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch questions
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload.questions || action.payload;
        state.total = action.payload.total || action.payload.length;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch question by ID
      .addCase(fetchQuestionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestion = action.payload;
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create question
      .addCase(createQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.questions.push(action.payload);
        state.total += 1;
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetQuestions } = questionsSlice.actions;
export default questionsSlice.reducer;