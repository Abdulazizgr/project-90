import React from 'react';
import { Star, Flame, Clock, CheckCircle2, Trophy, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getScoreLevel, formatDurationHuman } from '../../utils/calculations';

export const MetricsOverview = () => {
  const { data, todayStr, setActiveTab } = useApp();

  const todayScore = data.dayScores?.[todayStr] || 0;
  const scoreMeta = getScoreLevel(todayScore);

  const habits = data.habits || [];
  const activeHabits = habits.filter((h) => h.active !== false);
  const todayLogs = data.habitLogsHistory?.[todayStr] || {};
  const completedHabits = activeHabits.filter((h) => todayLogs[h.id] === 'completed').length;
  const inProgressHabits = activeHabits.filter((h) => todayLogs[h.id] === 'in_progress').length;

  const todayEntries = (data.timeEntries || []).filter((e) => e.date === todayStr);
  const totalMinutesToday = todayEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  return (
    <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
      {/* 1. Today's Score */}
      <div 
        className="card" 
        onClick={() => setActiveTab('habits')}
        style={{ cursor: 'pointer', borderLeft: `4px solid ${scoreMeta.color}` }}
      >
        <div className="card-header" style={{ marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Today's Score
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(234, 179, 8, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Star size={18} color="#eab308" fill="#eab308" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="mono" style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            {todayScore}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>/ 100</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
          <span className={`badge ${scoreMeta.badgeClass}`}>
            {scoreMeta.icon} {scoreMeta.label}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>Target: 90+ pts</span>
        </div>
      </div>

      {/* 2. Current Streak */}
      <div 
        className="card"
        onClick={() => setActiveTab('calendar')}
        style={{ cursor: 'pointer', borderLeft: '4px solid #f97316' }}
      >
        <div className="card-header" style={{ marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Streak
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(249, 115, 22, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Flame size={18} color="#f97316" fill="#f97316" className="flame-icon" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="mono" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f97316' }}>
            12
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 700 }}>DAYS</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>🏆 Best Streak: 24 Days</span>
          <span style={{ color: 'var(--cat-spiritual)', fontWeight: 600 }}>100% On Track</span>
        </div>
      </div>

      {/* 3. Productive Time Today */}
      <div 
        className="card"
        onClick={() => setActiveTab('timer')}
        style={{ cursor: 'pointer', borderLeft: '4px solid var(--primary-light)' }}
      >
        <div className="card-header" style={{ marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Time Tracked Today
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
            <Clock size={18} color="var(--primary-light)" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="mono" style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatDurationHuman(totalMinutesToday)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>{todayEntries.length} Sessions Logged</span>
          <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Deep Work 🔥</span>
        </div>
      </div>

      {/* 4. Habits Done */}
      <div 
        className="card"
        onClick={() => setActiveTab('habits')}
        style={{ cursor: 'pointer', borderLeft: '4px solid #10b981' }}
      >
        <div className="card-header" style={{ marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Habits Progress
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
            <CheckCircle2 size={18} color="#10b981" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="mono" style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            {completedHabits}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>/ {activeHabits.length}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>{inProgressHabits > 0 ? `${inProgressHabits} in progress` : 'Daily Target'}</span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>
            {Math.round((completedHabits / Math.max(1, activeHabits.length)) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
