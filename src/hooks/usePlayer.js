import { useState } from 'react';
import { joinGame } from '../firebase/db';

const PLAYER_ID_KEY   = 'ql_player_id';
const PLAYER_NAME_KEY = 'ql_player_name';

export default function usePlayer() {
  const [playerId,   setPlayerId]   = useState(() => localStorage.getItem(PLAYER_ID_KEY)   || '');
  const [playerName, setPlayerName] = useState(() => localStorage.getItem(PLAYER_NAME_KEY) || '');
  const [joining,    setJoining]    = useState(false);
  const [error,      setError]      = useState('');

  const join = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setJoining(true);
    setError('');
    try {
      const id = await joinGame(trimmed);
      localStorage.setItem(PLAYER_ID_KEY,   id);
      localStorage.setItem(PLAYER_NAME_KEY, trimmed);
      setPlayerId(id);
      setPlayerName(trimmed);
    } catch (e) {
      setError('Could not join. Check your connection and try again.');
    } finally {
      setJoining(false);
    }
  };

  const leave = () => {
    localStorage.removeItem(PLAYER_ID_KEY);
    localStorage.removeItem(PLAYER_NAME_KEY);
    setPlayerId('');
    setPlayerName('');
  };

  return { playerId, playerName, join, leave, joining, error };
}
