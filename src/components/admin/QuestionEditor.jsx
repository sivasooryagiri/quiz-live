import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addQuestion, updateQuestion, deleteQuestion } from '../../firebase/db';

const BLANK = {
  text:          '',
  options:       ['', '', '', ''],
  correctAnswer: 0,
  timer:         30,
};

function QuestionForm({ initial = BLANK, onSave, onCancel, saving }) {
  const [q, setQ] = useState(initial);

  const setOption = (i, val) => {
    const opts = [...q.options];
    opts[i] = val;
    setQ({ ...q, options: opts });
  };

  const valid =
    q.text.trim() &&
    q.options.every((o) => o.trim()) &&
    q.timer >= 5 &&
    q.timer <= 120;

  return (
    <div className="glass-strong rounded-2xl p-5 space-y-4">
      <div>
        <label className="label">Question Text</label>
        <textarea
          value={q.text}
          onChange={(e) => setQ({ ...q, text: e.target.value })}
          rows={2}
          placeholder="What is the capital of France?"
          className="input resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt, i) => (
          <div key={i}>
            <label className="label">
              Option {String.fromCharCode(65 + i)}
              {i === q.correctAnswer && (
                <span className="ml-2 text-green-400 text-xs font-bold">✓ Correct</span>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="input flex-1"
              />
              <button
                type="button"
                onClick={() => setQ({ ...q, correctAnswer: i })}
                className={`px-3 rounded-xl border transition-all font-bold text-sm
                  ${i === q.correctAnswer
                    ? 'bg-green-500/30 border-green-500 text-green-300'
                    : 'bg-white/5 border-white/20 text-white/40 hover:border-green-500/50'
                  }`}
              >
                ✓
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="label">Timer (seconds)</label>
          <input
            type="number"
            min={5}
            max={120}
            value={q.timer}
            onChange={(e) => setQ({ ...q, timer: Number(e.target.value) })}
            className="input w-24"
          />
        </div>
        <div className="flex gap-2 pt-5">
          <button
            onClick={() => onSave(q)}
            disabled={!valid || saving}
            className="btn-primary"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={onCancel} className="btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function QuestionEditor({ questions }) {
  const [editing,  setEditing]  = useState(null);   // 'new' | question.id
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  const handleSave = async (q) => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await addQuestion(q);
      } else {
        await updateQuestion(editing, q);
      }
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    setDeleting(id);
    try {
      await deleteQuestion(id);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add button */}
      {editing !== 'new' && (
        <button
          onClick={() => setEditing('new')}
          className="w-full py-3 rounded-xl border-2 border-dashed border-brand-600/50
                     text-brand-400 font-semibold hover:border-brand-400 hover:text-brand-300
                     transition-all flex items-center justify-center gap-2"
        >
          + Add Question
        </button>
      )}

      {/* New question form */}
      <AnimatePresence>
        {editing === 'new' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <QuestionForm
              onSave={handleSave}
              onCancel={() => setEditing(null)}
              saving={saving}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question list */}
      {questions.length === 0 && (
        <p className="text-center text-white/30 py-8">No questions yet. Add one above.</p>
      )}

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <motion.div key={q.id} layout className="glass rounded-2xl p-4">
            {editing === q.id ? (
              <QuestionForm
                initial={q}
                onSave={handleSave}
                onCancel={() => setEditing(null)}
                saving={saving}
              />
            ) : (
              <div className="flex items-start gap-3">
                <span className="glass rounded-lg w-8 h-8 flex items-center justify-center text-sm font-black text-brand-300 shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold">{q.text}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {q.options.map((opt, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-1 rounded-lg font-medium
                          ${i === q.correctAnswer
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-white/10 text-white/50'
                          }`}
                      >
                        {String.fromCharCode(65 + i)}: {opt}
                      </span>
                    ))}
                  </div>
                  <p className="text-white/30 text-xs mt-1">⏱ {q.timer}s</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setEditing(q.id)}
                    className="text-xs btn-ghost py-1 px-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    disabled={deleting === q.id}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors py-1 px-3
                               glass rounded-xl border border-red-500/20 hover:border-red-400/40"
                  >
                    {deleting === q.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
