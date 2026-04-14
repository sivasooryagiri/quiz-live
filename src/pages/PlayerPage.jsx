import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useGameState from '../hooks/useGameState';
import usePlayer    from '../hooks/usePlayer';
import { subscribeToQuestions, getPlayerAnswer } from '../firebase/db';
import JoinScreen        from '../components/player/JoinScreen';
import LobbyScreen       from '../components/player/LobbyScreen';
import QuestionScreen    from '../components/player/QuestionScreen';
import AnswerWaiting     from '../components/player/AnswerWaiting';
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
  const { gameState, loading }                      = useGameState();
  const { playerId, playerName, join, joining, error } = usePlayer();
  const [questions, setQuestions]                   = useState([]);
  const [hasAnswered, setHasAnswered]               = useState(false);
  const [checkedQId, setCheckedQId]                 = useState(null);

  // Subscribe to questions
  useEffect(() => {
    const unsub = subscribeToQuestions(setQuestions);
    return unsub;
  }, []);

  // Reset answered flag when question index changes
  useEffect(() => {
    setHasAnswered(false);
    setCheckedQId(null);
  }, [gameState?.currentQuestionIndex]);

  // On rejoin: check if player already answered current question
  useEffect(() => {
    if (!playerId || !gameState || gameState.phase !== 'question' || !questions.length) return;
    const currentQ = questions[gameState.currentQuestionIndex];
    if (!currentQ || checkedQId === currentQ.id) return;

    setCheckedQId(currentQ.id);
    getPlayerAnswer(currentQ.id, playerId).then((ans) => {
      if (ans) setHasAnswered(true);
    });
  }, [playerId, gameState?.phase, gameState?.currentQuestionIndex, questions, checkedQId]);

  if (loading) return <LoadingSpinner />;

  if (!playerId) {
    return (
      <JoinScreen
        onJoin={join}
        joining={joining}
        error={error}
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

        {phase === 'question' && currentQ && !hasAnswered && (
          <motion.div key={`q-${gameState.currentQuestionIndex}`} {...fade}>
            <QuestionScreen
              question={currentQ}
              playerId={playerId}
              questionStartTime={gameState.questionStartTime}
              onAnswered={() => setHasAnswered(true)}
            />
          </motion.div>
        )}

        {((phase === 'question' && hasAnswered) || phase === 'results') && (
          <motion.div key="answer-wait" {...fade}>
            <AnswerWaiting phase={phase} />
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
