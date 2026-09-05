import React from 'react';
import { Check, Clock, X, RotateCcw, Plus, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getCategoryMeta } from '../../utils/calculations';

export const TodayHabitsQuickList = () => {
  const { data, todayStr, setHabitStatus, setActiveTab, setActiveModal } = useApp();
  const habits = data.habits || [];
  const activeHabits = habits.filter((h) => h.active !== false);
  const todayLogs = data.habitLogsHistory?.[todayStr] || {};
  const categories = data.categories || [];

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <span>⚡</span>
            <span>Today's Habit Scorecard</span>
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Complete habits to hit your 100-point daily target
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setActiveTab('habits')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <span>All Habits</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {activeHabits.map((habit) => {
          const status = todayLogs[habit.id] || 'pending';
          const meta = getCategoryMeta(habit.categoryId, categories);
          const isDone = status === 'completed';
          const isInProgress = status === 'in_progress';
          const isSkipped = status === 'skipped';

          return (
            <div
              key={habit.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isDone
                  ? 'rgba(16, 185, 129, 0.08)'
                  : isInProgress
                  ? 'rgba(234, 179, 8, 0.08)'
                  : isSkipped
                  ? 'rgba(239, 68, 68, 0.05)'
                  : 'var(--bg-surface)',
                border: isDone
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : isInProgress
                  ? '1px solid rgba(234, 179, 8, 0.3)'
                  : '1px solid var(--border-color)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {/* Left info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '1.25rem' }}>{habit.icon || '🎯'}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    textDecoration: isDone ? 'line-through' : 'none',
                    opacity: isDone ? 0.85 : 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {habit.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span className={`badge ${meta.badgeClass}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                      {meta.name}
                    </span>
                    <span>•</span>
                    <span>{habit.target}</span>
                  </div>
                </div>
              </div>

              {/* Right: Points badge and action toggles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isDone ? '#10b981' : 'var(--text-secondary)',
                    minWidth: '48px',
                    textAlign: 'right'
                  }}
                >
                  +{habit.points || 10} pts
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {/* Complete Button */}
                  <button
                    className={`btn btn-sm ${isDone ? 'btn-success' : 'btn-ghost'}`}
                    style={{ padding: '0.35rem 0.5rem' }}
                    onClick={() => setHabitStatus(habit.id, isDone ? 'pending' : 'completed')}
                    title="Mark Completed"
                  >
                    <Check size={14} />
                  </button>

                  {/* In Progress Button */}
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{
                      padding: '0.35rem 0.5rem',
                      color: isInProgress ? '#eab308' : 'var(--text-muted)',
                      backgroundColor: isInProgress ? 'rgba(234, 179, 8, 0.2)' : 'transparent'
                    }}
                    onClick={() => setHabitStatus(habit.id, isInProgress ? 'pending' : 'in_progress')}
                    title="Mark In Progress"
                  >
                    <Clock size={14} />
                  </button>

                  {/* Skip Button */}
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{
                      padding: '0.35rem 0.5rem',
                      color: isSkipped ? '#ef4444' : 'var(--text-muted)',
                      backgroundColor: isSkipped ? 'rgba(239, 68, 68, 0.2)' : 'transparent'
                    }}
                    onClick={() => setHabitStatus(habit.id, isSkipped ? 'pending' : 'skipped')}
                    title="Skip"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
