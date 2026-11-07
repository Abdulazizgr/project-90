import React from 'react';
import { X, CheckCircle2, Clock, Star, BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getScoreLevel, formatDurationHuman, getCategoryMeta, getRoutinesForDay } from '../../utils/calculations';

export const DayDetailModal = () => {
  const { data, activeModal, setActiveModal, modalData, todayStr } = useApp();

  if (activeModal !== 'day_detail' || !modalData) return null;

  const { dayNumber, dateStr } = modalData;
  const categories = data.categories || [];
  const routines = data.routines || [];
  const dayScheduledRoutines = getRoutinesForDay(routines, dateStr);
  const dayCategoryScores = data.dailyLogsHistory?.[dateStr]?.categoryScores || {};
  const dayHabitLogs = data.habitLogsHistory?.[dateStr] || {};
  const dayScore = data.dayScores?.[dateStr] || (dateStr === todayStr ? (data.dailyScore || 0) : 0);
  const scoreMeta = getScoreLevel(dayScore);

  const dayTimeEntries = (data.timeEntries || []).filter((e) => e.date === dateStr);
  const totalDayMinutes = dayTimeEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const journal = data.journalEntries?.[dateStr];

  const isToday = dateStr === todayStr;
  const isFuture = new Date(dateStr) > new Date(todayStr);

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.1rem',
              color: '#fff'
            }}>
              D{dayNumber}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Day {dayNumber} Inspector
                </h3>
                {isToday && (
                  <span className="badge badge-excellent" style={{ fontSize: '0.7rem' }}>
                    TODAY
                  </span>
                )}
                {isFuture && (
                  <span className="badge" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    UPCOMING
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{dateStr}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        {/* Top Summary Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <div className="card" style={{ padding: '1rem', borderLeft: `4px solid ${scoreMeta.color}` }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Daily Score (5-Pillar Avg)
            </span>
            <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: scoreMeta.color, marginTop: '0.2rem' }}>
              {isFuture ? '—' : `${dayScore} / 100`}
            </div>
            <span className={`badge ${scoreMeta.badgeClass}`} style={{ fontSize: '0.68rem', marginTop: '0.2rem' }}>
              {isFuture ? '⚪ Future' : `${scoreMeta.icon} ${scoreMeta.label}`}
            </span>
          </div>

          <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--primary-light)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Time Tracked
            </span>
            <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {formatDurationHuman(totalDayMinutes)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {dayTimeEntries.length} logged sessions
            </span>
          </div>

          <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #10b981' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Routines Executed
            </span>
            <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
              {dayScheduledRoutines.filter((r) => {
                const log = data.routineLogsHistory?.[dateStr]?.[r.id];
                return log && (log.completed || log.status === 'done' || log.status === 'completed');
              }).length} / {dayScheduledRoutines.length}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              scheduled routines
            </span>
          </div>
        </div>

        {/* 5-Category Pillar Scores Breakdown */}
        {dayCategoryScores && Object.keys(dayCategoryScores).length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={16} color="#f59e0b" />
              <span>Evening 5-Pillar Evaluation Breakdown</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
              {categories.map((cat) => {
                const score = dayCategoryScores[cat.id] ?? '—';
                return (
                  <div key={cat.id} className="card" style={{ padding: '0.6rem 0.75rem', textAlign: 'center', borderTop: `3px solid ${cat.color || 'var(--primary)'}` }}>
                    <div style={{ fontSize: '1.1rem' }}>{cat.icon}</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.2rem' }}>{cat.name}</div>
                    <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: typeof score === 'number' ? (score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : '#eab308') : 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {score}{typeof score === 'number' ? ' pts' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scheduled Routines Checklist for that day */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} color="var(--cat-spiritual)" />
            <span>Scheduled Routines & Tasks on Day {dayNumber}</span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {dayScheduledRoutines.map((routine) => {
              const execLog = data.routineLogsHistory?.[dateStr]?.[routine.id];
              const isDone = execLog?.completed || execLog?.status === 'done' || execLog?.status === 'completed';
              const isPartial = execLog?.status === 'partial';
              const isMissed = execLog?.status === 'missed';
              const meta = getCategoryMeta(routine.categoryId, categories);

              return (
                <div
                  key={routine.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                    border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                    gap: '0.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <span>{routine.icon || meta.icon}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {routine.name || routine.title}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: isDone ? '#10b981' : isPartial ? '#3b82f6' : isMissed ? '#ef4444' : 'var(--text-muted)'
                    }}>
                      {isDone ? (execLog?.timing === 'ontime' ? '✅ On-Time' : '⏰ Late') : isPartial ? '⚡ Partial' : isMissed ? '❌ Missed' : isFuture ? '⚪ Future' : '⏳ Pending'}
                    </span>
                  </div>

                  {/* Location or reason metadata if logged */}
                  {execLog && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {execLog.location && <span>📍 {execLog.location === 'mosque' ? 'Mosque' : 'Home/Work'}</span>}
                      {execLog.reason && <span style={{ fontStyle: 'italic' }}>Reason: "{execLog.reason}"</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Entries for that day */}
        {dayTimeEntries.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} color="var(--primary-light)" />
              <span>Tracked Time Entries ({dayTimeEntries.length})</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {dayTimeEntries.map((entry) => {
                const meta = getCategoryMeta(entry.categoryId, categories);
                return (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span>{meta.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{entry.activityName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{entry.startTime} – {entry.endTime}</div>
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatDurationHuman(entry.durationMinutes)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Daily Reflection Journal Entry */}
        {journal ? (
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={16} color="var(--primary-light)" />
                <span>Evening Journal Reflection</span>
              </h4>
              <span className="badge badge-excellent">
                Mood: {journal.mood?.toUpperCase() || 'GOOD'}
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>1. What went well:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{journal.q1}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>2. What failed:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{journal.q2}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>3. Distractions:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{journal.q3}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>4. Tomorrow's Improvement:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{journal.q4}</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            No journal reflection recorded for this day yet.
          </div>
        )}
      </div>
    </div>
  );
};
