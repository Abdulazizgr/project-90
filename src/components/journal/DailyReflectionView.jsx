import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Smile, 
  Save, 
  Calendar, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Flame, 
  History,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DailyReflectionView = () => {
  const { data, todayStr, saveJournalEntry } = useApp();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const existingEntry = data.journalEntries?.[selectedDate] || {};

  const [mood, setMood] = useState(existingEntry.mood || 'great');
  const [q1, setQ1] = useState(existingEntry.q1 || '');
  const [q2, setQ2] = useState(existingEntry.q2 || '');
  const [q3, setQ3] = useState(existingEntry.q3 || '');
  const [q4, setQ4] = useState(existingEntry.q4 || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const entry = data.journalEntries?.[selectedDate] || {};
    setMood(entry.mood || 'great');
    setQ1(entry.q1 || '');
    setQ2(entry.q2 || '');
    setQ3(entry.q3 || '');
    setQ4(entry.q4 || '');
  }, [selectedDate, data.journalEntries]);

  const moods = [
    { id: 'great', label: 'Great', emoji: '😊', color: '#10b981' },
    { id: 'good', label: 'Good', emoji: '🙂', color: '#3b82f6' },
    { id: 'normal', label: 'Normal', emoji: '😐', color: '#eab308' },
    { id: 'bad', label: 'Bad', emoji: '😞', color: '#ef4444' }
  ];

  const handleSave = (e) => {
    e.preventDefault();
    saveJournalEntry(selectedDate, {
      mood,
      q1: q1.trim(),
      q2: q2.trim(),
      q3: q3.trim(),
      q4: q4.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Past reflections list
  const pastEntries = Object.entries(data.journalEntries || {}).sort((a, b) => new Date(b[0]) - new Date(a[0]));

  return (
    <div className="page-container">
      {/* Header Deck */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.9), rgba(15, 23, 42, 0.9))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>📝</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Daily Reflection & Evening Review</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '580px' }}>
              Close each day with relentless honesty. Answer the 4 core questions to compound 1% improvements every single day.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ maxWidth: '160px', fontSize: '0.85rem' }}
            />
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedDate(todayStr)}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Reflection Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <h4 className="card-title">
                <span>✨</span>
                <span>Evening 4-Question Protocol</span>
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Logging reflection awards +10 points to your Daily Habit Score
              </p>
            </div>
            {savedSuccess && (
              <span className="badge badge-excellent" style={{ animation: 'fadeIn 0.2s ease' }}>
                <CheckCircle2 size={12} />
                <span>Saved & Points Awarded!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSave}>
            {/* Mood Selector */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">How was your overall discipline & mood today?</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                {moods.map((m) => {
                  const isSelected = mood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className="btn"
                      onClick={() => setMood(m.id)}
                      style={{
                        background: isSelected ? `${m.color}25` : 'var(--bg-surface)',
                        border: isSelected ? `2px solid ${m.color}` : '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                        padding: '0.65rem 0.5rem',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <span style={{ fontSize: '1.4rem' }}>{m.emoji}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : 500 }}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 1 */}
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--cat-spiritual)', fontWeight: 700 }}>
                1. What did I do well today? (Wins & Discipline) *
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                required
                placeholder="e.g. Wrote complete authentication system for RHIZAN, prayed Fajr in mosque, drank 3L water."
                value={q1}
                onChange={(e) => setQ1(e.target.value)}
              />
            </div>

            {/* Question 2 */}
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--cat-career)', fontWeight: 700 }}>
                2. What did I fail to do? (Missed Targets) *
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                required
                placeholder="e.g. Delayed reading session by 30 mins, skipped stretching after workout."
                value={q2}
                onChange={(e) => setQ2(e.target.value)}
              />
            </div>

            {/* Question 3 */}
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--cat-health)', fontWeight: 700 }}>
                3. What distracted me? (Root Causes) *
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                required
                placeholder="e.g. YouTube recommendations, checking phone right after lunch."
                value={q3}
                onChange={(e) => setQ3(e.target.value)}
              />
            </div>

            {/* Question 4 */}
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--cat-digital)', fontWeight: 700 }}>
                4. What will I improve tomorrow? (Action Protocol) *
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                required
                placeholder="e.g. Turn phone off before 10:00 PM, place 3L water jug on desk first thing at 5:00 AM."
                value={q4}
                onChange={(e) => setQ4(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', gap: '0.5rem' }}
              >
                <Save size={18} />
                <span>Save Reflection & Score (+10 pts)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Past Reflections Archive */}
        <div className="card">
          <div className="card-header">
            <div>
              <h4 className="card-title">
                <span>📚</span>
                <span>Past Reflections Archive</span>
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {pastEntries.length} saved daily reviews
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', maxHeight: '700px', overflowY: 'auto' }}>
            {pastEntries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                No past reflections found yet. Complete your first review on the left!
              </div>
            ) : (
              pastEntries.map(([date, entry]) => {
                const moodObj = moods.find((m) => m.id === entry.mood) || moods[0];
                return (
                  <div
                    key={date}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem' }}>
                        <Calendar size={14} color="var(--primary-light)" />
                        <span>{date}</span>
                      </div>
                      <span className="badge" style={{ background: `${moodObj.color}20`, color: moodObj.color, border: `1px solid ${moodObj.color}40` }}>
                        {moodObj.emoji} {moodObj.label}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div>
                        <strong style={{ color: 'var(--cat-spiritual)' }}>Wins:</strong>{' '}
                        <span style={{ color: 'var(--text-secondary)' }}>{entry.q1}</span>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--cat-career)' }}>Missed:</strong>{' '}
                        <span style={{ color: 'var(--text-secondary)' }}>{entry.q2}</span>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--cat-digital)' }}>Improve Tomorrow:</strong>{' '}
                        <span style={{ color: 'var(--text-secondary)' }}>{entry.q4}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
