import React from 'react';
import { Check, Clock, X, Plus, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getCategoryMeta, isRoutineScheduledForDay, getDayKeyFromDateStr } from '@/utils/calculations';

export const TodayHabitsQuickList = () => {
  const { data, todayStr, logRoutineTaskExecution, setActiveTab } = useApp();
  const routines = data.routines || [];
  const todayLogs = data.routineLogsHistory?.[todayStr] || {};
  const categories = data.categories || [];
  const todayDayKey = getDayKeyFromDateStr(todayStr);

  const todayRoutines = routines.filter((r: any) => isRoutineScheduledForDay(r, todayDayKey));

  const handleToggle = (routine: any) => {
    const currentLog = todayLogs[routine.id];
    const isDone = currentLog?.status === 'done' || currentLog?.completed;
    if (isDone) {
      logRoutineTaskExecution(routine.id, 'missed', { reason: 'Reset status' });
    } else {
      logRoutineTaskExecution(routine.id, 'done', {
        onTime: true,
        location: routine.type === 'prayer' ? 'mosque' : 'home'
      });
    }
  };

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <span>☀️</span>
            <span>Today's Scheduled Routines ({todayRoutines.length})</span>
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Recurring actionable tasks scheduled for today
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setActiveTab('routines')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}
        >
          <span>All Routines</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {todayRoutines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            No routines scheduled for today. Check your Weekly Schedule!
          </div>
        ) : (
          todayRoutines.map((routine: any) => {
            const log = todayLogs[routine.id] || {};
            const meta = getCategoryMeta(routine.categoryId, categories);
            const isDone = log.status === 'done' || log.completed;
            const isLate = log.status === 'late';
            const isPartial = log.status === 'partial';
            const isMissed = log.status === 'missed';

            return (
              <div
                key={routine.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isDone
                    ? 'rgba(16, 185, 129, 0.08)'
                    : isLate
                    ? 'rgba(245, 158, 11, 0.08)'
                    : isPartial
                    ? 'rgba(6, 182, 212, 0.08)'
                    : isMissed
                    ? 'rgba(239, 68, 68, 0.05)'
                    : 'var(--bg-surface)',
                  border: isDone
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : isLate
                    ? '1px solid rgba(245, 158, 11, 0.3)'
                    : '1px solid var(--border-color)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {/* Left info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '1.25rem' }}>{routine.icon || meta.icon || '☀️'}</span>
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
                      {routine.title || routine.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span className={`badge ${meta.badgeClass}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                        {meta.name}
                      </span>
                      <span>•</span>
                      <span>{routine.timeSlot || 'All Day'}</span>
                      {log.location === 'mosque' && <span style={{ color: '#10b981', fontWeight: 700 }}>🕌 Mosque</span>}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Check Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    className={`btn btn-sm ${isDone ? 'btn-success' : 'btn-ghost'}`}
                    style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%' }}
                    onClick={() => handleToggle(routine)}
                    title={isDone ? 'Completed (Click to reset)' : 'Mark Done'}
                  >
                    <Check size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
