import { useState, useEffect } from 'react';
import { initGameState, subscribeToGameState } from '../firebase/db';

export default function useGameState() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    initGameState().catch((e) => setError(e.message));

    const unsub = subscribeToGameState((state) => {
      setGameState(state);
      setLoading(false);
    });

    return unsub;
  }, []);

  return { gameState, loading, error };
}
