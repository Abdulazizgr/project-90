import React, { useMemo } from 'react';
import { Star, Flame, Clock, CheckCircle2, Trophy, ArrowUpRight, SunMedium, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  getScoreLevel, 
  formatDurationHuman, 
  getDayKeyFromDateStr, 
  isRoutineScheduledForDay, 
  calculateCategoryDayScore 
} from '../../utils/calculations';

export const MetricsOverview = () => {
  const { data, todayStr, setActiveTab } = useApp();

  const existingCategoryScores = data.categoryScores?.[todayStr];
  const hasEvaluatedToday = existingCategoryScores !== undefined;
  const todayScore = hasEvaluatedToday 
    ? calculateCategoryDayScore(existingCategoryScores) 
    : (data.dayScores?.[todayStr] || 0);
  const scoreMeta = getScoreLevel(todayScore);

  const routines = data.routines || [];
  const todayDayKey = getDayKeyFromDateStr(todayStr);
  const todayRoutines = routines.filter((r: any) => isRoutineScheduledForDay(r, todayDayKey));
  const todayLogs = data.routineLogsHistory?.[todayStr] || {};
  const completedRoutines = todayRoutines.filter((r: any) => {
    const log = todayLogs[r.id] || {};
    return log.status === 'done' || log.completed;
  }).length;

  const todayEntries = (data.timeEntries || []).filter((e: any) => e.date === todayStr);
  const totalMinutesToday = todayEntries.reduce((acc: number, curr: any) => acc + (curr.durationMinutes || 0), 0);

  const currentDay = data.challenge?.currentDay || 1;
  const scoreKeys = Object.keys(data.dayScores || {});
  const streakDays = scoreKeys.filter(k => (data.dayScores[k] || 0) >= 70).length || (hasEvaluatedToday && todayScore >= 70 ? 1 : 0);

  return (
    <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
      {/* 1. Today's Score */}
      <div 
        className="card" 
        onClick={() => setActiveTab('journal')}
        style={{ cursor: 'pointer', borderLeft: `4px solid ${hasEvaluatedToday ? scoreMeta.color : 'var(--primary-light)'}` }}
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
            {hasEvaluatedToday ? `${todayScore}%` : 'Pending'}
          </span>
          {hasEvaluatedToday && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
              ({scoreMeta.label})
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
          {hasEvaluatedToday ? (
            <span className={`badge ${scoreMeta.badgeClass}`}>
              {scoreMeta.icon} Evaluated
            </span>
          ) : (
            <span className="badge badge-warning">
              📝 Evening Review
            </span>
          )}
          <span style={{ color: 'var(--text-muted)' }}>Target: 90%+</span>
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
            {streakDays}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 700 }}>DAYS</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Day {currentDay} of 90</span>
          <span style={{ color: 'var(--cat-spiritual)', fontWeight: 600 }}>🟢 Active</span>
        </div>
      </div>

      {/* 3. Productive Focus Time Today */}
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

      {/* 4. Daily Routines Done */}
      <div 
        className="card"
        onClick={() => setActiveTab('routines')}
        style={{ cursor: 'pointer', borderLeft: '4px solid #10b981' }}
      >
        <div className="card-header" style={{ marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Routines Completed
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
            {completedRoutines}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>/ {todayRoutines.length}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Scheduled Today</span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>
            {todayRoutines.length > 0 ? Math.round((completedRoutines / todayRoutines.length) * 100) : 100}%
          </span>
        </div>
      </div>
    </div>
  );
};
