import { useState, useEffect } from 'react';
import { joinGame, getPlayer } from '../firebase/db';

const PLAYER_ID_KEY   = 'ql_player_id';
const PLAYER_NAME_KEY = 'ql_player_name';

// localStorage may be unavailable in some browsing modes (Safari ITP private,
// strict 3rd-party cookie blockers). Wrap it so failures don't crash the app —
// the player can still join, just without rejoin-after-refresh.
const safeStorage = {
  get(k)  { try { return localStorage.getItem(k); } catch { return null; } },
  set(k,v){ try { localStorage.setItem(k, v); }   catch { /* noop */ } },
  remove(k){ try { localStorage.removeItem(k); }  catch { /* noop */ } },
};

export default function usePlayer() {
  const [playerId,   setPlayerId]   = useState(() => safeStorage.get(PLAYER_ID_KEY)   || '');
  const [playerName, setPlayerName] = useState(() => safeStorage.get(PLAYER_NAME_KEY) || '');
  const [joining,    setJoining]    = useState(false);
  const [error,      setError]      = useState('');
  const [suggested,  setSuggested]  = useState('');
  const [verified,   setVerified]   = useState(false); // true once Firestore check done

  // On load: verify stored playerId still exists in Firestore.
  // If game was reset, the doc is deleted — clear localStorage and re-show JoinScreen.
  useEffect(() => {
    const storedId = safeStorage.get(PLAYER_ID_KEY);
    if (!storedId) {
      setVerified(true);
      return;
    }
    getPlayer(storedId).then((player) => {
      if (!player) {
        // Doc deleted (game was reset) — force re-join
        safeStorage.remove(PLAYER_ID_KEY);
        safeStorage.remove(PLAYER_NAME_KEY);
        setPlayerId('');
        setPlayerName('');
      }
      setVerified(true);
    }).catch(() => setVerified(true));
  }, []);

  const join = async (name) => {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      setError('Name must be 2–20 characters.');
      return;
    }
    setJoining(true);
    setError('');
    setSuggested('');
    try {
      const id = await joinGame(trimmed);
      safeStorage.set(PLAYER_ID_KEY,   id);
      safeStorage.set(PLAYER_NAME_KEY, trimmed);
      setPlayerId(id);
      setPlayerName(trimmed);
    } catch (e) {
      if (e.message === 'NAME_TAKEN') {
        setSuggested(e.suggested);
        setError('name_taken');
      } else if (e.message === 'INVALID_NAME') {
        setError('Name must be 2–20 characters.');
      } else {
        setError('Could not join. Try again.');
      }
    } finally {
      setJoining(false);
    }
  };

  const leave = () => {
    safeStorage.remove(PLAYER_ID_KEY);
    safeStorage.remove(PLAYER_NAME_KEY);
    setPlayerId('');
    setPlayerName('');
  };

  return {
    playerId,
    playerName,
    join,
    leave,
    joining,
    error,
    suggested,
    setSuggested,
    setError,
    verified,
  };
}
