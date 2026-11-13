'use client';

import React from 'react';
import { X, CheckCircle2, Clock, Star, BookOpen, Calendar, CheckSquare, Layers } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { 
  getScoreLevel, 
  formatDurationHuman, 
  getCategoryMeta, 
  getRoutinesForDay,
  calculate24HourAllocation,
  getDayKeyFromDateStr,
  isRoutineScheduledForDay
} from '@/utils/calculations';

export const DayDetailModal = () => {
  const { data, activeModal, setActiveModal, modalData, todayStr } = useApp();

  if (activeModal !== 'day_detail' || !modalData) return null;

  const { dayNumber, dateStr } = modalData;
  const categories = data.categories || [];
  const routines = data.routines || [];
  const tasks = data.tasks || [];
  const dayKey = getDayKeyFromDateStr(dateStr);

  const dayScheduledRoutines = routines.filter((r: any) => isRoutineScheduledForDay(r, dayKey));
  const dayLogs = data.routineLogsHistory?.[dateStr] || {};
  const dayTasks = tasks.filter((t: any) => t.plannedDate === dateStr && t.status !== 'cancelled');

  const dayScore = data.dayScores?.[dateStr] || (dateStr === todayStr ? (data.dailyScore || 0) : 0);
  const scoreMeta = getScoreLevel(dayScore);

  const dayTimeEntries = (data.timeEntriesHistory?.[dateStr] || (data.timeEntries || []).filter((e: any) => e.date === dateStr));
  const totalDayMinutes = dayTimeEntries.reduce((acc: number, curr: any) => acc + (curr.durationMinutes || 0), 0);
  const journal = data.journalEntries?.[dateStr];

  // 24h Allocation
  const { allocations } = calculate24HourAllocation(categories, dayTimeEntries, dayScheduledRoutines, dayTasks);

  const isToday = dateStr === todayStr;
  const isFuture = dateStr > todayStr;

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          <div className="card" style={{ padding: '0.85rem', borderLeft: `4px solid ${scoreMeta.color}` }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Daily Score
            </span>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: scoreMeta.color, marginTop: '0.1rem' }}>
              {isFuture ? '—' : `${dayScore}%`}
            </div>
            <span className={`badge ${scoreMeta.badgeClass}`} style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>
              {isFuture ? '⚪ Future' : `${scoreMeta.icon} ${scoreMeta.label}`}
            </span>
          </div>

          <div className="card" style={{ padding: '0.85rem', borderLeft: '4px solid var(--primary-light)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Tracked Time
            </span>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              {formatDurationHuman(totalDayMinutes)}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {dayTimeEntries.length} logged entries
            </span>
          </div>

          <div className="card" style={{ padding: '0.85rem', borderLeft: '4px solid #10b981' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Routines Done
            </span>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '0.1rem' }}>
              {dayScheduledRoutines.filter((r: any) => {
                const log = dayLogs[r.id];
                return log && (log.completed || log.status === 'done' || log.status === 'completed');
              }).length} / {dayScheduledRoutines.length}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              routines completed
            </span>
          </div>

          <div className="card" style={{ padding: '0.85rem', borderLeft: '4px solid #06b6d4' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Tasks Done
            </span>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#06b6d4', marginTop: '0.1rem' }}>
              {dayTasks.filter((t: any) => t.status === 'completed').length} / {dayTasks.length}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              tasks completed
            </span>
          </div>
        </div>

        {/* 24-Hour Category Allocation */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={16} color="var(--primary-light)" />
            <span>24-Hour Time Breakdown (1,440 min total)</span>
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
            {allocations.map((cat) => (
              <div key={cat.categoryId} className="card" style={{ padding: '0.6rem 0.75rem', textAlign: 'center', borderTop: `3px solid ${cat.color}` }}>
                <div style={{ fontSize: '1.1rem' }}>{cat.icon}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.15rem' }}>{cat.categoryName}</div>
                <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: cat.color, marginTop: '0.1rem' }}>
                  {cat.formattedActual}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{cat.actualPercentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Routines */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} color="var(--primary-light)" />
            <span>Scheduled Routines ({dayScheduledRoutines.length})</span>
          </h4>

          {dayScheduledRoutines.length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No routines scheduled for this day.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.5rem' }}>
              {dayScheduledRoutines.map((routine: any) => {
                const execLog = dayLogs[routine.id];
                const isDone = execLog && (execLog.completed || execLog.status === 'done' || execLog.status === 'completed');
                const meta = getCategoryMeta(routine.categoryId, categories);

                return (
                  <div
                    key={routine.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-input)',
                      border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                      <span>{routine.icon || meta.icon}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {routine.name || routine.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isDone ? '#10b981' : isFuture ? 'var(--text-muted)' : '#ef4444' }}>
                      {isDone ? '✅ Done' : isFuture ? '⚪ Pending' : '❌ Missed'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks Planned for this Date */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckSquare size={16} color="var(--primary-light)" />
            <span>Tasks Planned ({dayTasks.length})</span>
          </h4>

          {dayTasks.length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No tasks planned for this date.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.5rem' }}>
              {dayTasks.map((t: any) => {
                const isDone = t.status === 'completed';
                return (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-input)',
                      border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {t.title}
                    </span>
                    <span className="badge" style={{ fontSize: '0.65rem' }}>
                      {t.status?.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Daily Reflection Journal Entry */}
        {journal ? (
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={16} color="var(--primary-light)" />
                <span>Evening 5-Question Reflection</span>
              </h4>
              <span className="badge badge-excellent" style={{ fontSize: '0.68rem' }}>
                Mood: {journal.mood?.toUpperCase() || 'GOOD'}
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>1. What went well:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{journal.q1_well || journal.q1 || '—'}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>2. What did not go as planned:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{journal.q2_failed || journal.q2 || '—'}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>3. What did I learn:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{journal.q3_learned || journal.q3 || '—'}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>4. What should I improve tomorrow:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{journal.q4_improve || journal.q4 || '—'}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>5. Tomorrow's Top Priority:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{journal.q5_priority || '—'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            No reflection recorded for this day yet.
          </div>
        )}
      </div>
    </div>
  );
};
