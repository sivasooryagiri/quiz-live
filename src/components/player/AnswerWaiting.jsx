import { motion } from 'framer-motion';

export default function AnswerWaiting() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6
                    bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center glass rounded-2xl p-8 max-w-xs w-full"
      >
        <div className="text-4xl mb-4">📊</div>
        <h2 className="text-xl font-black text-white mb-2">Results incoming!</h2>
        <p className="text-brand-300 text-sm">Check the big screen…</p>

        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="w-2.5 h-2.5 rounded-full bg-brand-400"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
