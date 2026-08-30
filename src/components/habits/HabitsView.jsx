import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Star, 
  Award, 
  HelpCircle,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getScoreLevel, getCategoryMeta } from '../../utils/calculations';

export const HabitsView = () => {
  const { 
    data, 
    todayStr, 
    setHabitStatus, 
    deleteHabit, 
    setActiveModal, 
    setModalData 
  } = useApp();

  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
  const categories = data.categories || [];
  const habits = data.habits || [];
  const todayLogs = data.habitLogsHistory?.[todayStr] || {};
  const todayScore = data.dayScores?.[todayStr] || 0;
  const scoreMeta = getScoreLevel(todayScore);

  const filteredHabits = habits.filter((h) => {
    if (selectedCategoryTab === 'all') return true;
    return h.categoryId === selectedCategoryTab;
  });

  const handleEdit = (habit) => {
    setModalData(habit);
    setActiveModal('edit_habit');
  };

  const handleAddHabit = () => {
    setModalData(null);
    setActiveModal('add_habit');
  };

  return (
    <div className="page-container">
      {/* Top Banner: Score Progress & Levels */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(18, 25, 43, 0.9), rgba(26, 35, 60, 0.8))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '1.4rem' }}>⭐</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Daily 100-Point Scorecard</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '540px' }}>
              Each habit carries weighted points. Achieve 90+ points for an 🟢 <strong>Excellent</strong> rating today.
            </p>
          </div>

          {/* Large Score Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            background: 'var(--bg-card)',
            padding: '0.85rem 1.4rem',
            borderRadius: 'var(--radius-lg)',
            border: `1px solid ${scoreMeta.color}`
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Current Score
              </div>
              <div className="mono" style={{ fontSize: '2.2rem', fontWeight: 900, color: scoreMeta.color, lineHeight: 1 }}>
                {todayScore} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${scoreMeta.badgeClass}`} style={{ fontSize: '0.82rem', padding: '0.3rem 0.75rem' }}>
                {scoreMeta.icon} {scoreMeta.label}
              </span>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {todayScore >= 90 ? 'Streak Bonus Unlocked!' : `${90 - todayScore} pts to Excellent`}
              </div>
            </div>
          </div>
        </div>

        {/* Score Tiers Table Breakdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--score-excellent)' }}>🟢 90–100 Points</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Excellent (Peak Discipline)</div>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--score-good)' }}>🔵 70–89 Points</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Good (Solid Momentum)</div>
          </div>
          <div style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.25)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--score-average)' }}>🟡 50–69 Points</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Average (Needs Push)</div>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--score-poor)' }}>🔴 Below 50 Points</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Needs Immediate Fix</div>
          </div>
        </div>
      </div>

      {/* Habits Header & Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${selectedCategoryTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategoryTab('all')}
          >
            All Categories ({habits.length})
          </button>
          {categories.map((c) => {
            const count = habits.filter((h) => h.categoryId === c.id).length;
            const isSelected = selectedCategoryTab === c.id;
            return (
              <button
                key={c.id}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCategoryTab(c.id)}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Add Habit Button */}
        <button
          className="btn btn-primary btn-sm"
          onClick={handleAddHabit}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Plus size={15} />
          <span>New Habit</span>
        </button>
      </div>

      {/* Habits Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredHabits.map((habit) => {
          const status = todayLogs[habit.id] || 'pending';
          const meta = getCategoryMeta(habit.categoryId, categories);
          const isDone = status === 'completed';
          const isInProgress = status === 'in_progress';
          const isSkipped = status === 'skipped';

          return (
            <div
              key={habit.id}
              className="card"
              style={{
                padding: '1.15rem 1.4rem',
                borderLeft: `4px solid ${isDone ? 'var(--cat-spiritual)' : meta.color || 'var(--border-color)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                background: isDone ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)'
              }}
            >
              {/* Left: Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '260px' }}>
                <span style={{ fontSize: '1.75rem' }}>{habit.icon || '🎯'}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <h4 style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      textDecoration: isDone ? 'line-through' : 'none',
                      opacity: isDone ? 0.85 : 1
                    }}>
                      {habit.name}
                    </h4>
                    <span className={`badge ${meta.badgeClass}`} style={{ fontSize: '0.7rem' }}>
                      {meta.name}
                    </span>
                    <span className="badge" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                      {habit.frequency || 'Daily'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Target: <strong>{habit.target || 'Daily'}</strong></span>
                    <span>•</span>
                    <span style={{ color: isDone ? '#10b981' : 'var(--primary-light)', fontWeight: 700 }}>
                      +{habit.points || 10} Points
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions & State Toggles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* 3 State Toggle Buttons */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-surface)',
                  padding: '0.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  gap: '0.25rem'
                }}>
                  {/* Complete */}
                  <button
                    className={`btn btn-sm ${isDone ? 'btn-success' : 'btn-ghost'}`}
                    style={{ padding: '0.4rem 0.75rem', gap: '0.35rem', fontSize: '0.8rem' }}
                    onClick={() => setHabitStatus(habit.id, isDone ? 'pending' : 'completed')}
                  >
                    <Check size={14} />
                    <span>Done</span>
                  </button>

                  {/* In Progress */}
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{
                      padding: '0.4rem 0.75rem',
                      gap: '0.35rem',
                      fontSize: '0.8rem',
                      color: isInProgress ? '#eab308' : 'var(--text-muted)',
                      backgroundColor: isInProgress ? 'rgba(234, 179, 8, 0.2)' : 'transparent'
                    }}
                    onClick={() => setHabitStatus(habit.id, isInProgress ? 'pending' : 'in_progress')}
                  >
                    <Clock size={14} />
                    <span>In Progress</span>
                  </button>

                  {/* Skip */}
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{
                      padding: '0.4rem 0.75rem',
                      gap: '0.35rem',
                      fontSize: '0.8rem',
                      color: isSkipped ? '#ef4444' : 'var(--text-muted)',
                      backgroundColor: isSkipped ? 'rgba(239, 68, 68, 0.2)' : 'transparent'
                    }}
                    onClick={() => setHabitStatus(habit.id, isSkipped ? 'pending' : 'skipped')}
                  >
                    <X size={14} />
                    <span>Skip</span>
                  </button>
                </div>

                {/* Edit & Delete */}
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => handleEdit(habit)}
                  title="Edit Habit"
                >
                  <Edit3 size={15} />
                </button>

                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => deleteHabit(habit.id)}
                  title="Delete Habit"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
