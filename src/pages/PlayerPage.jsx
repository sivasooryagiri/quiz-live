import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useGameState from '../hooks/useGameState';
import usePlayer    from '../hooks/usePlayer';
import { subscribeToQuestions } from '../firebase/db';
import JoinScreen        from '../components/player/JoinScreen';
import LobbyScreen       from '../components/player/LobbyScreen';
import QuestionScreen    from '../components/player/QuestionScreen';
import AnswerResult      from '../components/player/AnswerResult';
import PlayerLeaderboard from '../components/player/PlayerLeaderboard';
import EndedScreen       from '../components/player/EndedScreen';
import LoadingSpinner    from '../components/shared/LoadingSpinner';

const fade = {
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -16 },
  transition: { duration: 0.3 },
};

export default function PlayerPage() {
  const { gameState, loading }                         = useGameState();
  const { playerId, playerName, join, joining, error, suggested, setSuggested, setError, verified } = usePlayer();
  const [questions, setQuestions]                      = useState([]);

  useEffect(() => {
    const unsub = subscribeToQuestions(setQuestions);
    return unsub;
  }, []);

  if (loading || !verified) return <LoadingSpinner />;

  if (!playerId) {
    return (
      <JoinScreen
        onJoin={join}
        joining={joining}
        error={error}
        suggested={suggested}
        onClearSuggested={() => { setSuggested(''); setError(''); }}
        gameTitle={gameState?.title}
      />
    );
  }

  const phase    = gameState?.phase ?? 'waiting';
  const currentQ = questions[gameState?.currentQuestionIndex ?? 0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      <AnimatePresence mode="wait">

        {phase === 'waiting' && (
          <motion.div key="lobby" {...fade}>
            <LobbyScreen playerName={playerName} gameTitle={gameState?.title} />
          </motion.div>
        )}

        {/* QuestionScreen manages its own answered/expired state */}
        {phase === 'question' && currentQ && (
          <motion.div key={`q-${gameState.currentQuestionIndex}`} {...fade}>
            <QuestionScreen
              question={currentQ}
              playerId={playerId}
              questionStartTime={gameState.questionStartTime}
              questionIndex={gameState.currentQuestionIndex}
              totalQuestions={questions.length}
            />
          </motion.div>
        )}

        {phase === 'results' && currentQ && (
          <motion.div key={`ar-${gameState.currentQuestionIndex}`} {...fade}>
            <AnswerResult question={currentQ} playerId={playerId} />
          </motion.div>
        )}

        {phase === 'leaderboard' && (
          <motion.div key="leaderboard" {...fade}>
            <PlayerLeaderboard playerId={playerId} playerName={playerName} />
          </motion.div>
        )}

        {phase === 'ended' && (
          <motion.div key="ended" {...fade}>
            <EndedScreen playerId={playerId} playerName={playerName} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
