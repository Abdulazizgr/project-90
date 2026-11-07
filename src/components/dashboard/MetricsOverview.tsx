'use client';

import React from 'react';
import { Star, Flame, SunMedium, Trophy, Layers } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getScoreLevel, calculateRoutineProgressToday, calculateCurrentStreak } from '@/utils/calculations';

export const MetricsOverview = () => {
  const { data, todayStr, setActiveTab } = useApp();

  const routines = data.routines || [];
  const routineLogs = data.routineLogsHistory?.[todayStr] || {};
  const progress = calculateRoutineProgressToday(routines, routineLogs, todayStr);
  const currentStreak = calculateCurrentStreak(data.dayScores || {}, todayStr);
  const todayScore = data.dayScores?.[todayStr] || progress.percentage;
  const scoreMeta = getScoreLevel(todayScore);

  const pillarsCount = (data.categories || []).length;
  const unlockedBadges = (data.achievements || []).filter((a: any) => a.unlocked).length;
  const totalBadges = (data.achievements || []).length || 9;

  return (
    <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
      {/* 1. Today's Routine Score */}
      <div 
        className="card" 
        onClick={() => setActiveTab('journal')}
        style={{ cursor: 'pointer', borderLeft: `4px solid ${scoreMeta.color}` }}
      >
        <div className="card-header" style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Daily Routine Score
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Star size={18} color="var(--primary-light)" fill="var(--primary-light)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1 }}>{todayScore}</span>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>/ 100</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span className={`badge ${scoreMeta.badgeClass}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
            {scoreMeta.icon} {scoreMeta.label}
          </span>
        </div>
      </div>

      {/* 2. Today's Routines Completed */}
      <div 
        className="card" 
        onClick={() => setActiveTab('routines')}
        style={{ cursor: 'pointer', borderLeft: `4px solid #10b981` }}
      >
        <div className="card-header" style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Today's Execution
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <SunMedium size={18} color="#10b981" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1 }}>{progress.completedCount}</span>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>/ {progress.scheduledCount}</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: progress.isAllDone ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
          {progress.isAllDone ? '✓ All scheduled routines done!' : `${progress.percentage}% completed today`}
        </p>
      </div>

      {/* 3. Consistency Streak */}
      <div className="card" style={{ borderLeft: `4px solid #f59e0b` }}>
        <div className="card-header" style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Discipline Streak
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Flame size={18} color="#f59e0b" fill="#f59e0b" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1 }}>{currentStreak}</span>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Days</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Keep momentum & build the habit
        </p>
      </div>

      {/* 4. Dynamic Pillars & Badges */}
      <div 
        className="card" 
        onClick={() => setActiveTab('achievements')}
        style={{ cursor: 'pointer', borderLeft: `4px solid #a855f7` }}
      >
        <div className="card-header" style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Focus Pillars & Badges
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(168, 85, 247, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Trophy size={18} color="#a855f7" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1 }}>{pillarsCount}</span>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Pillars</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--primary-light)', fontWeight: 600 }}>
          🏆 {unlockedBadges} / {totalBadges} Badges Unlocked
        </p>
      </div>
    </div>
  );
};
