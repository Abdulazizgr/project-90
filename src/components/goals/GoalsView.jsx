import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Award, 
  TrendingUp, 
  Calendar,
  Sparkles,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getCategoryMeta } from '../../utils/calculations';

export const GoalsView = () => {
  const { data, updateGoalProgress, addGoal, deleteGoal } = useApp();

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('career');
  const [newTarget, setNewTarget] = useState(40);
  const [newUnit, setNewUnit] = useState('Hours / Week');
  const [newFrequency, setNewFrequency] = useState('weekly');

  const categories = data.categories || [];
  const goals = data.goals || [];

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addGoal({
      title: newTitle.trim(),
      categoryId: newCategory,
      target: Number(newTarget) || 10,
      current: 0,
      unit: newUnit.trim(),
      frequency: newFrequency
    });

    setNewTitle('');
    setIsAddingGoal(false);
  };

  return (
    <div className="page-container">
      {/* Top Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.9), rgba(15, 23, 42, 0.9))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🎯</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Goals & Sprint Milestones</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '580px' }}>
              Set measurable targets for weekly consistency and long-term 90-day transformation milestones.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setIsAddingGoal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            <span>Create New Goal</span>
          </button>
        </div>
      </div>

      {/* Add Goal Form (Inline Drawer) */}
      {isAddingGoal && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary-light)', animation: 'scaleUp 0.2s ease' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Set New Goal Target</h4>
          <form onSubmit={handleCreateGoal}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Goal Title *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Master NestJS Backend Microservices"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Target Number</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit Label</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hours / Week or Pages"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Frequency / Scope</label>
                <select
                  className="form-select"
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                >
                  <option value="weekly">Weekly Target</option>
                  <option value="challenge">90-Day Challenge Target</option>
                  <option value="monthly">Monthly Target</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddingGoal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {goals.map((goal) => {
          const meta = getCategoryMeta(goal.categoryId, categories);
          const pct = Math.min(100, Math.round(((goal.current || 0) / Math.max(1, goal.target)) * 100));
          const isComplete = pct >= 100;

          return (
            <div
              key={goal.id}
              className="card"
              style={{
                borderLeft: `5px solid ${isComplete ? '#10b981' : meta.color || 'var(--primary)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{meta.icon}</span>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{goal.title}</h4>
                      <span className={`badge ${meta.badgeClass}`} style={{ fontSize: '0.68rem' }}>
                        {meta.name} • {goal.frequency?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => deleteGoal(goal.id)}
                    title="Delete Goal"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Numbers */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.75rem', marginBottom: '0.4rem' }}>
                  <span className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: isComplete ? '#10b981' : 'var(--text-primary)' }}>
                    {goal.current} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {goal.target} {goal.unit}</span>
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isComplete ? '#10b981' : 'var(--primary-light)' }}>
                    {pct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="progress-bar-container" style={{ height: '10px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isComplete ? '#10b981' : meta.color || 'var(--primary)'
                    }}
                  />
                </div>
              </div>

              {/* Progress Adjuster Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Adjust Progress:</span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => updateGoalProgress(goal.id, Math.max(0, (goal.current || 0) - 1))}
                  >
                    -1
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => updateGoalProgress(goal.id, (goal.current || 0) + 1)}
                  >
                    +1
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => updateGoalProgress(goal.id, Math.min(goal.target, (goal.current || 0) + 5))}
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Review Summary Card (SRS Section 20) */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(26, 35, 60, 0.9), rgba(18, 25, 43, 0.9))',
        border: '1px solid rgba(99, 102, 241, 0.3)'
      }}>
        <div className="card-header">
          <div>
            <h4 className="card-title">
              <span>📋</span>
              <span>Weekly Sprint Review</span>
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Holistic performance summary for the current week
            </p>
          </div>
          <span className="badge badge-excellent" style={{ fontSize: '0.75rem' }}>
            WEEK 2 REVIEW
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>CHALLENGE PROGRESS</div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '0.2rem' }}>13%</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVERAGE SCORE</div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--score-excellent)', marginTop: '0.2rem' }}>88%</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL TIME</div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>42h 30m</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>BEST CATEGORY</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--cat-career)', marginTop: '0.2rem' }}>💻 Career</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>FOCUS AREA</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--cat-digital)', marginTop: '0.2rem' }}>📱 Digital</div>
          </div>
        </div>
      </div>
    </div>
  );
};
