import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { gameApi } from '../../api/gameApi';

export const createGameSession = createAsyncThunk(
  'game/createGameSession',
  async (gameData, { rejectWithValue }) => {
    try {
      const response = await gameApi.createGame(gameData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchGameSession = createAsyncThunk(
  'game/fetchGameSession',
  async (gameId, { rejectWithValue }) => {
    try {
      const response = await gameApi.getGame(gameId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchNextQuestion = createAsyncThunk(
  'game/fetchNextQuestion',
  async (gameId, { rejectWithValue }) => {
    try {
      const response = await gameApi.getNextQuestion(gameId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const processAction = createAsyncThunk(
  'game/processAction',
  async ({ gameId, action, questionId }, { rejectWithValue }) => {
    try {
      const response = await gameApi.processAction(gameId, { action, questionId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  gameSession: null,
  currentQuestion: null,
  currentPlayer: null,
  actionResult: null,
  loading: false,
  error: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    resetGame: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Create game session
      .addCase(createGameSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGameSession.fulfilled, (state, action) => {
        state.loading = false;
        state.gameSession = action.payload;
      })
      .addCase(createGameSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch game session
      .addCase(fetchGameSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameSession.fulfilled, (state, action) => {
        state.loading = false;
        state.gameSession = action.payload;
      })
      .addCase(fetchGameSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch next question
      .addCase(fetchNextQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNextQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestion = action.payload.question;
        state.currentPlayer = {
          name: action.payload.playerName,
          id: action.payload.playerId,
        };
      })
      .addCase(fetchNextQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Process action
      .addCase(processAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processAction.fulfilled, (state, action) => {
        state.loading = false;
        state.actionResult = action.payload;

        // Update game session with new player index
        if (state.gameSession) {
          state.gameSession = {
            ...state.gameSession,
            currentPlayerIndex: state.gameSession.players.findIndex(
              player => player.id === action.payload.nextPlayerId
            ),
            currentRound: action.payload.currentRound,
            status: action.payload.gameStatus,
          };
        }
      })
      .addCase(processAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetGame } = gameSlice.actions;
export default gameSlice.reducer;