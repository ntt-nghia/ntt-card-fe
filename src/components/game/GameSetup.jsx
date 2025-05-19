import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createGameSession } from '@/redux/slices/gameSlice';
import { CONSEQUENCE_MODES } from '@/utils/categories';
import styled from 'styled-components';

const SetupForm = styled.form`
  max-width: 600px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const PlayerList = styled.div`
  margin-top: 1rem;
`;

const PlayerEntry = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  
  input {
    flex: 1;
    margin-right: 0.5rem;
  }
`;

const RemoveButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  
  input {
    margin-right: 0.5rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const CustomConsequences = styled.div`
  margin-top: 1rem;
  
  textarea {
    width: 100%;
    min-height: 100px;
    margin-top: 0.5rem;
  }
`;

const GameSetup = ({ category }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [players, setPlayers] = useState(['', '']);
  const [maxRounds, setMaxRounds] = useState(10);
  const [allowSkips, setAllowSkips] = useState(true);
  const [consequenceMode, setConsequenceMode] = useState('NONE');
  const [customConsequences, setCustomConsequences] = useState('');

  const addPlayer = () => {
    setPlayers([...players, '']);
  };

  const removePlayer = (index) => {
    if (players.length > 2) {
      const newPlayers = [...players];
      newPlayers.splice(index, 1);
      setPlayers(newPlayers);
    }
  };

  const handlePlayerNameChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out empty player names
    const validPlayers = players.filter(name => name.trim() !== '');

    if (validPlayers.length < 2) {
      alert('You need at least 2 players to start a game');
      return;
    }

    const gameData = {
      category,
      players: validPlayers,
      maxRounds,
      settings: {
        allowSkips,
        consequenceMode,
        customConsequences: consequenceMode === 'CUSTOM' ?
          customConsequences.split('\n').filter(line => line.trim() !== '') :
          undefined
      }
    };

    try {
      const resultAction = await dispatch(createGameSession(gameData));
      if (createGameSession.fulfilled.match(resultAction)) {
        navigate(`/play/${resultAction.payload.id}`);
      }
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

  return (
    <SetupForm onSubmit={handleSubmit}>
      <FormGroup>
        <Label>Players</Label>
        <PlayerList>
          {players.map((player, index) => (
            <PlayerEntry key={index}>
              <input
                type="text"
                placeholder={`Player ${index + 1}`}
                value={player}
                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                required
              />
              {players.length > 2 && (
                <RemoveButton type="button" onClick={() => removePlayer(index)}>
                  ×
                </RemoveButton>
              )}
            </PlayerEntry>
          ))}
        </PlayerList>
        <button type="button" onClick={addPlayer}>
          Add Player
        </button>
      </FormGroup>

      <FormGroup>
        <Label>Number of Rounds</Label>
        <input
          type="number"
          min="1"
          max="30"
          value={maxRounds}
          onChange={(e) => setMaxRounds(Number(e.target.value))}
        />
      </FormGroup>

      <FormGroup>
        <Label>Allow Skipping Questions</Label>
        <RadioGroup>
          <RadioOption>
            <input
              type="radio"
              name="allowSkips"
              checked={allowSkips}
              onChange={() => setAllowSkips(true)}
            />
            Yes
          </RadioOption>
          <RadioOption>
            <input
              type="radio"
              name="allowSkips"
              checked={!allowSkips}
              onChange={() => setAllowSkips(false)}
            />
            No
          </RadioOption>
        </RadioGroup>
      </FormGroup>

      <FormGroup>
        <Label>Consequence Mode</Label>
        <RadioGroup>
          {CONSEQUENCE_MODES.map((mode) => (
            <RadioOption key={mode.value}>
              <input
                type="radio"
                name="consequenceMode"
                value={mode.value}
                checked={consequenceMode === mode.value}
                onChange={() => setConsequenceMode(mode.value)}
              />
              {mode.label}
            </RadioOption>
          ))}
        </RadioGroup>

        {consequenceMode === 'CUSTOM' && (
          <CustomConsequences>
            <Label>Custom Consequences</Label>
            <p>Enter one consequence per line</p>
            <textarea
              value={customConsequences}
              onChange={(e) => setCustomConsequences(e.target.value)}
              placeholder="Consequence 1&#10;Consequence 2&#10;Consequence 3"
            />
          </CustomConsequences>
        )}
      </FormGroup>

      <ActionButtons>
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>
        <button type="submit">
          Start Game
        </button>
      </ActionButtons>
    </SetupForm>
  );
};

export default GameSetup;