'use client';

import React from 'react';
import { Calendar, Flame, Clock, CheckCircle2, ArrowRight, SunMedium, BookOpen } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { calculateDailyProgress, calculateCurrentStreak, formatDurationHuman, getLocalDateString } from '@/utils/calculations';

export const ChallengeHero = () => {
  const { data, setActiveTab, todayStr } = useApp();
  const challenge = data.challenge || {};
  const currentDay = challenge.currentDay || 1;
  const totalDays = challenge.totalDurationDays || 19;
  const challengeName = challenge.name || 'Project 19: Personal Management Sprint';
  const pctComplete = Math.min(100, Math.round((currentDay / totalDays) * 100));

  const routines = data.routines || [];
  const routineLogs = data.routineLogsHistory?.[todayStr] || {};
  const tasks = data.tasks || [];
  const progress = calculateDailyProgress(routines, routineLogs, tasks, todayStr);
  const currentStreak = calculateCurrentStreak(data.dayScores || {}, todayStr);

  const timeEntries = data.timeEntriesHistory?.[todayStr] || [];
  const totalTrackedMins = timeEntries.reduce((a: number, b: any) => a + (b.durationMinutes || 0), 0);

  const formattedToday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).format(new Date(todayStr));

  return (
    <div 
      className="card" 
      style={{
        background: 'linear-gradient(135deg, rgba(20, 27, 45, 0.95), rgba(15, 23, 42, 0.98))',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '1.5rem',
        padding: '1.25rem 1.4rem',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1rem' }}>
        {/* Left: Challenge Title & Day */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.74rem', fontWeight: 800, padding: '0.2rem 0.6rem' }}>
              DAY {currentDay} OF {totalDays}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              • {formattedToday}
            </span>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff', margin: 0 }}>
            {challengeName}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
            Personal Management OS
          </p>
        </div>

        {/* Right: Streak & Quick Daily Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#f59e0b',
              fontWeight: 800,
              fontSize: '0.82rem'
            }}
          >
            <Flame size={16} fill="#f59e0b" color="#f59e0b" />
            <span>{currentStreak} Day Streak</span>
          </div>

          <button
            className="btn btn-secondary btn-sm hide-mobile"
            onClick={() => setActiveTab('my_day')}
            style={{ gap: '0.35rem', fontSize: '0.78rem' }}
          >
            <Clock size={14} />
            <span>Record Time</span>
          </button>
        </div>
      </div>

      {/* Challenge Progress Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
          <span>Sprint Progress ({pctComplete}%)</span>
          <span>{totalDays - currentDay} days remaining</span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${pctComplete}%`,
            background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Quick Daily Snapshot Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.65rem',
        padding: '0.75rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color-subtle)'
      }}>
        {/* Today's Completion */}
        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Today's Progress
          </span>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: progress.percentage >= 80 ? '#10b981' : 'var(--text-primary)', marginTop: '0.1rem' }}>
            {progress.percentage}%
          </div>
        </div>

        {/* Routines Completed */}
        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Routines Done
          </span>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '0.1rem' }}>
            {progress.completedRoutinesCount} / {progress.scheduledRoutinesCount}
          </div>
        </div>

        {/* Tasks Completed */}
        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Tasks Finished
          </span>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.1rem' }}>
            {progress.completedTasksCount} / {progress.plannedTasksCount}
          </div>
        </div>

        {/* Time Tracked */}
        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Time Logged
          </span>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.1rem' }}>
            {formatDurationHuman(totalTrackedMins)}
          </div>
        </div>
      </div>
    </div>
  );
};
