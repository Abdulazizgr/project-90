'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Smile, 
  Save, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  HelpCircle,
  Clock,
  Flame,
  Info
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DailyReflection } from '@/utils/seedData';
import { formatDurationHuman } from '@/utils/calculations';

export const DailyReflectionView: React.FC = () => {
  const { data, todayStr, saveDailyReflection, triggerSound } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const existingReflection = data.journalEntries?.[selectedDate] || {};

  const [mood, setMood] = useState<'great' | 'good' | 'normal' | 'bad'>(existingReflection.mood || 'good');
  const [q1, setQ1] = useState(existingReflection.q1_well || existingReflection.q1 || '');
  const [q2, setQ2] = useState(existingReflection.q2_failed || existingReflection.q2 || '');
  const [q3, setQ3] = useState(existingReflection.q3_learned || existingReflection.q3 || '');
  const [q4, setQ4] = useState(existingReflection.q4_improve || existingReflection.q4 || '');
  const [q5, setQ5] = useState(existingReflection.q5_priority || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const entry = data.journalEntries?.[selectedDate] || {};
    setMood(entry.mood || 'good');
    setQ1(entry.q1_well || entry.q1 || '');
    setQ2(entry.q2_failed || entry.q2 || '');
    setQ3(entry.q3_learned || entry.q3 || '');
    setQ4(entry.q4_improve || entry.q4 || '');
    setQ5(entry.q5_priority || '');
    setSavedSuccess(false);
  }, [selectedDate, data.journalEntries]);

  // Date Navigation
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyReflection(selectedDate, {
      mood,
      q1_well: q1.trim(),
      q2_failed: q2.trim(),
      q3_learned: q3.trim(),
      q4_improve: q4.trim(),
      q5_priority: q5.trim()
    });

    setSavedSuccess(true);
    triggerSound('level-up');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const moods = [
    { id: 'great', label: 'Great', emoji: '😊', color: '#10b981' },
    { id: 'good', label: 'Good', emoji: '🙂', color: '#3b82f6' },
    { id: 'normal', label: 'Normal', emoji: '😐', color: '#eab308' },
    { id: 'bad', label: 'Tough', emoji: '😞', color: '#ef4444' }
  ];

  const isToday = selectedDate === todayStr;

  return (
    <div className="page-container" style={{ paddingBottom: '5rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.25rem',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <BookOpen size={22} color="var(--primary-light)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Daily 5-Question Reflection</h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Spend 3 minutes at night reviewing how you used your time and aligning tomorrow.
            </p>
          </div>

          {/* Date Picker Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={handlePrevDay}
              title="Previous Day"
            >
              <ChevronLeft size={16} />
            </button>
            <div style={{
              background: 'var(--bg-input)',
              padding: '0.35rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              minWidth: '130px',
              textAlign: 'center'
            }}>
              {selectedDate} {isToday && <span style={{ color: 'var(--primary-light)', fontSize: '0.72rem' }}>(Today)</span>}
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={handleNextDay}
              title="Next Day"
            >
              <ChevronRight size={16} />
            </button>
            {!isToday && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedDate(todayStr)}
                style={{ fontSize: '0.75rem' }}
              >
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1.25rem'
        }}>
          <CheckCircle2 size={18} />
          <span>Daily reflection recorded successfully! Your consistency score has been updated.</span>
        </div>
      )}

      {/* Reflection Form */}
      <form onSubmit={handleSave} className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
        {/* Mood Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.65rem' }}>
            Overall Day Energy & Mood
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
            {moods.map((m) => {
              const isSelected = mood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id as any)}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? `2px solid ${m.color}` : '1px solid var(--border-color)',
                    background: isSelected ? `${m.color}20` : 'var(--bg-input)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1.6rem' }}>{m.emoji}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isSelected ? m.color : 'var(--text-secondary)' }}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5 Core Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Q1 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              <span className="mono" style={{ color: '#10b981' }}>1.</span>
              <span>What went well today?</span>
            </label>
            <textarea
              className="input"
              rows={3}
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              placeholder="Completed deep work block, stayed disciplined with prayers, focused workout..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Q2 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              <span className="mono" style={{ color: '#ef4444' }}>2.</span>
              <span>What did not go as planned?</span>
            </label>
            <textarea
              className="input"
              rows={3}
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              placeholder="Started learning session late, got distracted by social media, missed hydration target..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Q3 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              <span className="mono" style={{ color: '#3b82f6' }}>3.</span>
              <span>What did I learn?</span>
            </label>
            <textarea
              className="input"
              rows={3}
              value={q3}
              onChange={(e) => setQ3(e.target.value)}
              placeholder="Key technical takeaway from coding, self-management insight, or Quranic reminder..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Q4 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              <span className="mono" style={{ color: '#f59e0b' }}>4.</span>
              <span>What should I improve tomorrow?</span>
            </label>
            <textarea
              className="input"
              rows={3}
              value={q4}
              onChange={(e) => setQ4(e.target.value)}
              placeholder="Prepare desk environment tonight, shut off screens by 22:30, start coding promptly at 08:30..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Q5 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              <span className="mono" style={{ color: '#8b5cf6' }}>5.</span>
              <span>What is tomorrow's most important priority?</span>
            </label>
            <textarea
              className="input"
              rows={2}
              value={q5}
              onChange={(e) => setQ5(e.target.value)}
              placeholder="Deliver RHIZAN core API module before noon..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.4rem' }}
          >
            <Save size={16} />
            <span>Save Reflection</span>
          </button>
        </div>
      </form>
    </div>
  );
};
