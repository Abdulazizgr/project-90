import React, { useState } from 'react';
import { X, CheckCircle2, Trophy, Sparkles, BookOpen, Star, Clock, Flame, Save } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import { formatDurationHuman } from '@/utils/calculations';

export const WeeklyReviewModal = ({ isOpen, onClose }) => {
  const { data, triggerSound, todayStr } = useApp();

  const [qWell, setQWell] = useState('Achieved 100% Salah consistency, built full authentication and MongoDB persistence for RHIZAN.');
  const [qWrong, setQWrong] = useState('Stayed up past 11 PM on two evenings due to unstructured YouTube watching.');
  const [qChange, setQChange] = useState('Institute strict phone-docking rule in the living room at 09:45 PM every night.');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    triggerSound('fanfare');
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.6rem' }}>📋</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Weekly Sprint Retrospective</h3>
                <span className="badge badge-excellent" style={{ fontSize: '0.7rem' }}>
                  WEEK 2 CONQUERED
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Analyze 7-day performance, identify bottlenecks, and plan next sprint
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* 7-Day Performance Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.65rem',
          marginBottom: '1.5rem'
        }}>
          <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVG SCORE</div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--score-excellent)', marginTop: '0.2rem' }}>88%</div>
          </div>
          <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL TIME</div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '0.2rem' }}>42h 30m</div>
          </div>
          <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>BEST CATEGORY</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--cat-career)', marginTop: '0.35rem' }}>💻 Career</div>
          </div>
          <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>WEAKEST</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--cat-digital)', marginTop: '0.35rem' }}>📱 Digital</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--cat-spiritual)', fontWeight: 700 }}>
              1. What went exceptionally well this week? *
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              required
              value={qWell}
              onChange={(e) => setQWell(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--cat-career)', fontWeight: 700 }}>
              2. What went wrong or drained your energy? *
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              required
              value={qWrong}
              onChange={(e) => setQWrong(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--cat-digital)', fontWeight: 700 }}>
              3. What is the single biggest change for next week? *
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              required
              value={qChange}
              onChange={(e) => setQChange(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
              <Save size={18} />
              <span>{isSaved ? 'Saved to MongoDB!' : 'Complete Weekly Review (+25 pts)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
