import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Check, 
  AlertCircle, 
  Filter, 
  MapPin, 
  Moon, 
  Flame, 
  SlidersHorizontal 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getCategoryMeta, isRoutineScheduledForDay, getDayKeyFromDateStr } from '@/utils/calculations';
import { RoutineExecutionModal } from './RoutineExecutionModal';

export const RoutinesView = () => {
  const { 
    data, 
    todayStr, 
    deleteRoutine, 
    setActiveModal, 
    setModalData, 
    setActiveTab, 
    logRoutineTaskExecution 
  } = useApp();

  const routines = data.routines || [];
  const categories = data.categories || [];
  const todayLogs = data.routineLogsHistory?.[todayStr] || {};
  const todayDayKey = getDayKeyFromDateStr(todayStr);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDay, setFilterDay] = useState<string>('today'); // 'today' | 'all' | 'daily' | 'selected'
  const [activeRoutineForModal, setActiveRoutineForModal] = useState<any>(null);

  const handleEdit = (routine: any) => {
    setModalData(routine);
    setActiveModal('edit_routine');
  };

  const handleAdd = () => {
    setModalData(null);
    setActiveModal('add_routine');
  };

  const handleOpenExecution = (routine: any) => {
    setActiveRoutineForModal(routine);
  };

  const handleQuickDone = (routine: any, e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Filter routines
  const filteredRoutines = routines.filter((r: any) => {
    // 1. Category Filter
    if (filterCategory !== 'all' && r.categoryId !== filterCategory) return false;

    // 2. Day Filter
    if (filterDay === 'today') {
      return isRoutineScheduledForDay(r, todayDayKey);
    }
    if (filterDay === 'daily') {
      return !r.days || r.days.includes('daily');
    }
    if (filterDay === 'selected') {
      return r.days && !r.days.includes('daily');
    }
    return true;
  });

  // Calculate today's completion stats
  const todayScheduledRoutines = routines.filter((r: any) => isRoutineScheduledForDay(r, todayDayKey));
  const todayCompletedCount = todayScheduledRoutines.filter((r: any) => {
    const log = todayLogs[r.id];
    return log?.status === 'done' || log?.status === 'late' || log?.completed;
  }).length;
  const todayPct = todayScheduledRoutines.length > 0 
    ? Math.round((todayCompletedCount / todayScheduledRoutines.length) * 100) 
    : 0;

  return (
    <div className="page-container">
      {/* Header Deck */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.9), rgba(15, 23, 42, 0.9))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>☀️</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Daily Routines & Actionable Tasks
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '620px' }}>
              Your recurring non-negotiable tasks (daily or 3x/5x per week). Log execution with on-time / mosque precision and honest reason tracking.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('weekly')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Calendar size={15} />
              <span>Weekly Schedule</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAdd}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} />
              <span>Add Routine Task</span>
            </button>
          </div>
        </div>

        {/* Today's Execution Progress Bar */}
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-primary)'
            }}>
              Today's Scheduled Execution: <strong style={{ color: 'var(--primary-light)' }}>{todayCompletedCount} / {todayScheduledRoutines.length}</strong> ({todayPct}%)
            </div>
            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
              {todayDayKey.toUpperCase()}
            </span>
          </div>

          <div style={{ width: '220px' }}>
            <div className="progress-bar-container" style={{ height: '8px' }}>
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${todayPct}%`, 
                  background: 'linear-gradient(90deg, #10b981, #06b6d4)' 
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Day View Filter */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${filterDay === 'today' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterDay('today')}
              style={{ fontSize: '0.78rem' }}
            >
              ☀️ Scheduled for Today ({todayScheduledRoutines.length})
            </button>
            <button
              className={`btn btn-sm ${filterDay === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setFilterDay('all')}
              style={{ fontSize: '0.78rem' }}
            >
              All Routines ({routines.length})
            </button>
            <button
              className={`btn btn-sm ${filterDay === 'daily' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setFilterDay('daily')}
              style={{ fontSize: '0.78rem' }}
            >
              Daily (7/7)
            </button>
            <button
              className={`btn btn-sm ${filterDay === 'selected' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setFilterDay('selected')}
              style={{ fontSize: '0.78rem' }}
            >
              Selected Days (3x/5x)
            </button>
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${filterCategory === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterCategory('all')}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              All Categories
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                className={`btn btn-sm ${filterCategory === cat.id ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setFilterCategory(cat.id)}
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Routine Cards Grid Grouped by Category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {categories.map((cat: any) => {
          const catRoutines = filteredRoutines.filter((r: any) => r.categoryId === cat.id);
          if (catRoutines.length === 0) return null;

          return (
            <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Category Section Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: cat.color }}>
                  {cat.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({catRoutines.length} tasks)
                </span>
              </div>

              {/* Tasks in Category Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.85rem' }}>
                {catRoutines.map((routine: any) => {
                  const log = todayLogs[routine.id];
                  const isDone = log?.status === 'done' || log?.completed;
                  const isLate = log?.status === 'late';
                  const isPartial = log?.status === 'partial';
                  const isMissed = log?.status === 'missed';
                  const isScheduledToday = isRoutineScheduledForDay(routine, todayDayKey);

                  const isDaily = !routine.days || routine.days.includes('daily');
                  const daysFormatted = isDaily 
                    ? 'Daily' 
                    : routine.days.map((d: string) => d.toUpperCase()).join(', ');

                  return (
                    <div
                      key={routine.id}
                      className="card"
                      onClick={() => handleOpenExecution(routine)}
                      style={{
                        padding: '1.15rem',
                        cursor: 'pointer',
                        borderLeft: `4px solid ${cat.color}`,
                        border: isDone 
                          ? '1px solid rgba(16, 185, 129, 0.4)' 
                          : isLate 
                            ? '1px solid rgba(245, 158, 11, 0.4)' 
                            : '1px solid var(--border-color)',
                        background: isDone 
                          ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-card) 100%)' 
                          : 'var(--bg-card)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.85rem',
                        transition: 'transform 0.15s ease, border-color 0.15s ease'
                      }}
                    >
                      {/* Top Row: Icon, Title & Action */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                          <span style={{ fontSize: '1.4rem', marginTop: '0.1rem' }}>
                            {routine.icon || cat.icon}
                          </span>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.25 }}>
                              {routine.title || routine.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                              <span className="badge" style={{ background: 'var(--bg-surface)', fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                                <Clock size={11} /> {routine.timeSlot || 'All Day'}
                              </span>
                              <span className="badge" style={{ background: isDaily ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: isDaily ? 'var(--primary-light)' : '#f59e0b', fontSize: '0.68rem' }}>
                                {daysFormatted}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Action Checkbox */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <button
                            type="button"
                            onClick={(e) => handleQuickDone(routine, e)}
                            className={`btn btn-icon btn-sm ${isDone ? 'btn-success' : 'btn-ghost'}`}
                            title={isDone ? 'Marked as Done (Click to reset)' : 'Click to complete'}
                            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Middle: Target Standard & Description */}
                      {routine.description && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                          {routine.description}
                        </p>
                      )}

                      {/* Bottom Status & Actions Pill */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.65rem',
                        borderTop: '1px solid var(--border-color-subtle)',
                        fontSize: '0.75rem'
                      }}>
                        {/* Status badge */}
                        <div>
                          {isDone ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 700 }}>
                              <CheckCircle2 size={13} />
                              <span>Done {log?.location === 'mosque' ? '(In Mosque 🕌)' : ''}</span>
                            </div>
                          ) : isLate ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b', fontWeight: 700 }}>
                              <Clock size={13} />
                              <span>Late: {log?.reason || 'Specified reason'}</span>
                            </div>
                          ) : isPartial ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#06b6d4', fontWeight: 700 }}>
                              <span>⏳ Partial: {log?.reason || 'In progress'}</span>
                            </div>
                          ) : isMissed ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', fontWeight: 700 }}>
                              <AlertCircle size={13} />
                              <span>Missed: {log?.reason || 'Reason logged'}</span>
                            </div>
                          ) : (
                            <span style={{ color: isScheduledToday ? 'var(--text-muted)' : 'rgba(255,255,255,0.3)' }}>
                              {isScheduledToday ? '⏳ Pending Today' : '⚪ Not Scheduled Today'}
                            </span>
                          )}
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', gap: '0.2rem' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => handleEdit(routine)}
                            title="Edit Routine"
                            style={{ width: '26px', height: '26px' }}
                          >
                            <Edit3 size={13} color="var(--text-muted)" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => {
                              if (window.confirm(`Delete routine task "${routine.title || routine.name}"?`)) {
                                deleteRoutine(routine.id);
                              }
                            }}
                            title="Delete Routine"
                            style={{ width: '26px', height: '26px' }}
                          >
                            <Trash2 size={13} color="var(--danger)" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Routine Detailed Execution Modal */}
      {activeRoutineForModal && (
        <RoutineExecutionModal
          routine={activeRoutineForModal}
          isOpen={!!activeRoutineForModal}
          onClose={() => setActiveRoutineForModal(null)}
        />
      )}
    </div>
  );
};
