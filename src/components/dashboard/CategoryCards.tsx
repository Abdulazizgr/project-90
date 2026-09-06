import React from 'react';
import { Play, ChevronRight, CheckCircle2, Clock, Plus, Layers, SunMedium } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getRoutinesForDay, formatDurationHuman, getCategoryMeta } from '@/utils/calculations';

export const CategoryCards = ({ onOpenCategoryManager }) => {
  const { data, todayStr, setActiveTab, startTimer } = useApp();
  const categories = data.categories || [];
  const routines = data.routines || [];
  const dayRoutines = getRoutinesForDay(routines, todayStr);
  const todayRoutineLogs = data.routineLogsHistory?.[todayStr] || {};
  const todayCategoryScores = data.dailyLogsHistory?.[todayStr]?.categoryScores || {};
  const timeEntries = (data.timeEntries || []).filter((e) => (e.date || todayStr) === todayStr);

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Life Pillars & Focus Areas</h3>
            <span className="badge" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              {categories.length} Active Pillars
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Dynamic life dimensions, recurring routines, and 5-pillar evening self-evaluation
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenCategoryManager}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
          >
            <Layers size={14} />
            <span>Manage Pillars & Projects</span>
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setActiveTab('routines')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}
          >
            <SunMedium size={14} />
            <span>Actionable Routines</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Grid dynamically adapts to number of categories */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1rem'
      }}>
        {categories.map((cat) => {
          const catRoutines = dayRoutines.filter((r) => r.categoryId === cat.id);
          const completedRoutines = catRoutines.filter((r) => todayRoutineLogs[r.id]?.status === 'completed').length;
          const catEntries = timeEntries.filter((e) => e.categoryId === cat.id);
          const timeSpentMinutes = catEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
          const catScore = todayCategoryScores[cat.id];
          const completionPercentage = catRoutines.length > 0 
            ? Math.round((completedRoutines / catRoutines.length) * 100) 
            : 100;

          return (
            <div
              key={cat.id}
              className="card"
              style={{
                padding: '1.25rem',
                borderTop: `3px solid ${cat.color || 'var(--primary)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.9rem'
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                  {typeof catScore === 'number' ? (
                    <span className="badge" style={{ background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40`, fontSize: '0.75rem', fontWeight: 800 }}>
                      {catScore}%
                    </span>
                  ) : (
                    <span className="badge" style={{ background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40`, fontSize: '0.7rem' }}>
                      {catRoutines.length > 0 ? `${completedRoutines}/${catRoutines.length} done` : 'Active'}
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.2rem' }}>{cat.name}</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3, minHeight: '32px' }}>
                  {cat.description || `${(cat.projects || []).length} projects configured`}
                </p>
              </div>

              {/* Progress & Stats */}
              <div>
                {/* Progress bar */}
                <div className="progress-bar-container" style={{ height: '6px', marginBottom: '0.6rem' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${typeof catScore === 'number' ? catScore : completionPercentage}%`,
                      backgroundColor: cat.color || 'var(--primary)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={12} color={cat.color} />
                    {completedRoutines} / {catRoutines.length} routines today
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                    <Clock size={12} />
                    {formatDurationHuman(timeSpentMinutes)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => setActiveTab('routines')}
                >
                  Routines
                </button>
                <button
                  className="btn btn-primary btn-sm btn-icon"
                  style={{ padding: '0.35rem 0.55rem' }}
                  title={`Start timer for ${cat.name}`}
                  onClick={() => startTimer({ activityName: `${cat.name} Session`, categoryId: cat.id })}
                >
                  <Play size={12} fill="currentColor" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

