import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  Trophy, 
  Sparkles, 
  AlertTriangle, 
  Target, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  Scale, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDurationHuman } from '@/utils/calculations';

interface SundayPlannerModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const SundayPlannerModal: React.FC<SundayPlannerModalProps> = ({ isOpen, onClose }) => {
  const { data, saveWeeklyPlan, todayStr } = useApp();

  const [step, setStep] = useState(1); // 1: Retrospective, 2: Diagnosis, 3: Plan Next Week
  const [priority1, setPriority1] = useState('Deliver RHIZAN ERP multi-tenant auth module');
  const [priority2, setPriority2] = useState('Complete 4 structured workout sessions + 3L daily water');
  const [priority3, setPriority3] = useState('Maintain 100% 5 daily Salah on time in mosque');
  const [weeklyHourCap, setWeeklyHourCap] = useState(38);
  const [focusArea, setFocusArea] = useState('health');
  const [reflectionNote, setReflectionNote] = useState('Pacing myself with 50-minute Pomodoros to prevent the 2-day burnout crash.');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const categories = data.categories || [];
  const timeEntries = data.timeEntries || [];
  const dayScores: Record<string, number> = data.dayScores || {};

  // Compute 7-day stats
  const totalTrackedMin = timeEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const scoreValues = Object.values(dayScores);
  const avgScore = scoreValues.length > 0 
    ? Math.round(scoreValues.reduce((a: number, b: number) => a + Number(b), 0) / scoreValues.length) 
    : 85;

  // Category breakdown
  const catBreakdown = categories.map((cat) => {
    const min = timeEntries.filter((e) => e.categoryId === cat.id).reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const pct = totalTrackedMin > 0 ? Math.round((min / totalTrackedMin) * 100) : 0;
    return { ...cat, min, pct };
  }).sort((a, b) => b.min - a.min);

  const topCat = catBreakdown[0] || { name: 'Career', pct: 60 };
  const bottomCat = catBreakdown[catBreakdown.length - 1] || { name: 'Health', pct: 5 };

  const handleSavePlan = (e) => {
    e.preventDefault();
    saveWeeklyPlan({
      weekDate: todayStr,
      avgScore,
      totalHours: (totalTrackedMin / 60).toFixed(1),
      topPriority1: priority1.trim(),
      topPriority2: priority2.trim(),
      topPriority3: priority3.trim(),
      weeklyHourCap: Number(weeklyHourCap) || 40,
      focusArea,
      reflectionNote: reflectionNote.trim()
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setStep(1);
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', maxHeight: '90vh', padding: '2.25rem' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.2rem'
            }}>
              🗓️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Sunday Retrospective & Next-Week Planner</h3>
                <span className="badge badge-excellent" style={{ fontSize: '0.7rem' }}>
                  STEP {step} OF 3
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Automated weekly intelligence to prevent burnout and calibrate targets
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Retrospective Analysis */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                1. Last 7 Days Performance Breakdown
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Here is your objective reality across the past sprint:
              </p>
            </div>

            {/* Metrics cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div className="card" style={{ padding: '1rem', textAlign: 'center', borderLeft: '4px solid var(--score-excellent)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVERAGE SCORE</div>
                <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--score-excellent)', marginTop: '0.2rem' }}>
                  {avgScore}%
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Consistent Output</span>
              </div>

              <div className="card" style={{ padding: '1rem', textAlign: 'center', borderLeft: '4px solid var(--primary-light)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL TIME TRACKED</div>
                <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '0.2rem' }}>
                  {formatDurationHuman(totalTrackedMin)}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Across all pillars</span>
              </div>

              <div className="card" style={{ padding: '1rem', textAlign: 'center', borderLeft: '4px solid #f97316' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>STREAK CONTINUITY</div>
                <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f97316', marginTop: '0.2rem' }}>
                  🔥 12 Days
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Unbroken chain</span>
              </div>
            </div>

            {/* Category Share */}
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Pillar Distribution
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {catBreakdown.map((cat) => (
                  <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span>{cat.icon} {cat.name}</span>
                    <span className="mono" style={{ fontWeight: 700 }}>{formatDurationHuman(cat.min)} ({cat.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setStep(2)} style={{ gap: '0.4rem' }}>
                <span>Review Diagnosis & Anti-Burnout Prescription</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Prescriptive Diagnosis */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                2. Algorithmic Diagnosis & Imbalance Analysis
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Identified patterns that cause the 2-day hyper-focus and burnout cycle:
              </p>
            </div>

            {/* Diagnosis Banner */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={18} />
                <span>Pattern Detected: Heavy Asymmetric Focus on {topCat.name}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                You allocated <strong>{topCat.pct}%</strong> of your weekly bandwidth to <strong>{topCat.name}</strong>, while <strong>{bottomCat.name}</strong> only received <strong>{bottomCat.pct}%</strong>. This exact imbalance leads to cognitive fatigue, neglected physical vitality, and subsequent burnout.
              </p>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                💡 Prescribed Strategy for Next Week:
              </div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li>Cap focused career engineering at <strong>38 hours max</strong>.</li>
                <li>Lock in <strong>3 non-negotiable physical workouts</strong> before starting afternoon work.</li>
                <li>Dock phone in another room by <strong>09:45 PM</strong> to protect sleep quality.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ gap: '0.4rem' }}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button className="btn btn-primary" onClick={() => setStep(3)} style={{ gap: '0.4rem' }}>
                <span>Build Next Week's Organized Plan</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Build Next Week's Plan */}
        {step === 3 && (
          <form onSubmit={handleSavePlan}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                3. Next Week Strategic Plan Builder
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Set realistic limits and 3 non-negotiable priorities so you stay organized without overcommitting.
              </p>
            </div>

            {/* Top 3 Priorities */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                Top 3 Non-Negotiable Objectives for Next Week *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Priority 1: Key Career / RHIZAN Deliverable"
                  value={priority1}
                  onChange={(e) => setPriority1(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Priority 2: Health / Physical Non-Negotiable"
                  value={priority2}
                  onChange={(e) => setPriority2(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Priority 3: Spiritual / Personal Growth Target"
                  value={priority3}
                  onChange={(e) => setPriority3(e.target.value)}
                />
              </div>
            </div>

            {/* Work Cap & Focus Area */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Weekly Deep Work Hour Limit (Anti-Burnout Cap)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="20"
                    max="60"
                    className="form-input"
                    value={weeklyHourCap}
                    onChange={(e) => setWeeklyHourCap(Number(e.target.value) || 0)}
                    style={{ maxWidth: '100px' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hours / Week (Prevents over-exhaustion)</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Re-balancing Pillar</label>
                <select
                  className="form-select"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Commitment Mantra & Pacing Note</label>
              <input
                type="text"
                className="form-input"
                value={reflectionNote}
                onChange={(e) => setReflectionNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button type="submit" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
                <Save size={18} />
                <span>{isSaved ? 'Plan Saved to MongoDB Atlas!' : 'Lock in Next Week Plan'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
