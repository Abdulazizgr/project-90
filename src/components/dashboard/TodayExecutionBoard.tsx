'use client';

import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Play, 
  Plus, 
  Sparkles, 
  Check, 
  X, 
  SunMedium, 
  Moon, 
  Sunrise, 
  ChevronRight,
  FolderKanban,
  Zap,
  ListPlus,
  Flame,
  CheckSquare,
  ClipboardCheck,
  Calendar,
  Layers,
  SlidersHorizontal,
  FileEdit
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { 
  getScoreLevel, 
  formatDurationHuman, 
  getDayKeyFromDateStr,
  isRoutineScheduledForDay,
  calculateCategoryDayScore
} from '@/utils/calculations';
import { RoutineExecutionModal } from '@/components/routines/RoutineExecutionModal';

export const TodayExecutionBoard = () => {
  const { 
    data, 
    todayStr, 
    setActiveTab, 
    startTimer, 
    toggleTask, 
    updateTask, 
    toggleTaskToday,
    setWeeklyEventStatus,
    toggleWeeklyEventToday,
    logRoutineTaskExecution,
    triggerSound 
  } = useApp();

  const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(false);
  const [selectedProjectIdForPicker, setSelectedProjectIdForPicker] = useState('all');
  const [selectedRoutineForModal, setSelectedRoutineForModal] = useState<any>(null);

  const routines = data.routines || [];
  const categories = data.categories || [];
  const routineLogs = data.routineLogsHistory?.[todayStr] || {};
  const recurringEvents = data.recurringWeeklySchedule || [];
  const weeklyEventLogs = data.weeklyEventLogsHistory?.[todayStr] || {};
  const todayDayKey = getDayKeyFromDateStr(todayStr);

  // Filter routines scheduled for today
  const todayRoutines = useMemo(() => {
    return routines.filter((r: any) => isRoutineScheduledForDay(r, todayDayKey));
  }, [routines, todayDayKey]);

  // Routines completion stats
  const completedRoutinesCount = useMemo(() => {
    return todayRoutines.filter((r: any) => {
      const log = routineLogs[r.id] || {};
      return log.status === 'done' || log.completed;
    }).length;
  }, [todayRoutines, routineLogs]);

  const routinesPercentage = todayRoutines.length > 0 
    ? Math.round((completedRoutinesCount / todayRoutines.length) * 100) 
    : 0;

  // Extract recurring events scheduled for today (e.g. Gym on Tue/Thu/Sat)
  const todayRecurringEvents = useMemo(() => {
    return recurringEvents
      .filter((e) => e.days && Array.isArray(e.days) && e.days.includes(todayDayKey))
      .map((event) => {
        const cat = categories.find((c) => c.id === event.categoryId) || {
          name: 'Health',
          icon: '💪',
          color: '#10b981'
        };
        const log = weeklyEventLogs[event.id] || {};
        const isDone = log.status === 'done' || log.completed;

        return {
          ...event,
          categoryName: cat.name,
          categoryColor: cat.color,
          categoryIcon: cat.icon,
          isDone,
          status: log.status || (isDone ? 'done' : 'todo')
        };
      });
  }, [recurringEvents, todayDayKey, weeklyEventLogs, categories]);

  // Extract all tasks marked isToday across all projects
  const todayTasks = useMemo(() => {
    const list: any[] = [];
    categories.forEach((cat) => {
      (cat.projects || []).forEach((proj) => {
        (proj.tasks || []).forEach((task) => {
          if (task.isToday || task.scheduledDate === todayStr) {
            const isDone = task.status === 'done' || task.completed;

            list.push({
              ...task,
              categoryId: cat.id,
              categoryName: cat.name,
              categoryColor: cat.color,
              categoryIcon: cat.icon,
              projectId: proj.id,
              projectName: proj.name,
              isDone
            });
          }
        });
      });
    });
    return list;
  }, [categories, todayStr]);

  const completedTasksCount = useMemo(() => {
    return todayTasks.filter(t => t.isDone).length;
  }, [todayTasks]);

  // Extract all non-today tasks for the picker modal
  const allAvailableProjectTasks = useMemo(() => {
    const list: any[] = [];
    categories.forEach((cat) => {
      (cat.projects || []).forEach((proj) => {
        (proj.tasks || []).forEach((task) => {
          if (!task.isToday && task.scheduledDate !== todayStr) {
            list.push({
              ...task,
              categoryId: cat.id,
              categoryName: cat.name,
              categoryColor: cat.color,
              categoryIcon: cat.icon,
              projectId: proj.id,
              projectName: proj.name
            });
          }
        });
      });
    });
    return list;
  }, [categories, todayStr]);

  // Time tracked today (Focus Sessions)
  const todayTimeEntries = useMemo(() => {
    return (data.timeEntries || []).filter((e: any) => e.date === todayStr);
  }, [data.timeEntries, todayStr]);

  const totalFocusMinutesToday = useMemo(() => {
    return todayTimeEntries.reduce((acc: number, curr: any) => acc + (curr.durationMinutes || 0), 0);
  }, [todayTimeEntries]);

  // Evening evaluation status
  const existingCategoryScores = data.categoryScores?.[todayStr];
  const hasEvaluatedToday = existingCategoryScores !== undefined;
  const todayEvaluatedScore = hasEvaluatedToday 
    ? calculateCategoryDayScore(existingCategoryScores) 
    : (data.dayScores?.[todayStr] || 0);
  const scoreMeta = getScoreLevel(todayEvaluatedScore);

  const handleStartTaskTimer = (task: any) => {
    startTimer({
      activityName: `${task.projectName}: ${task.title}`,
      categoryId: task.categoryId,
      projectId: task.projectId,
      taskId: task.id,
      taskTitle: task.title,
      description: `Task: ${task.title}`
    });
    triggerSound('start-focus');
  };

  const handleStartRecurringEventTimer = (event: any) => {
    startTimer({
      activityName: `Commitment: ${event.title}`,
      categoryId: event.categoryId,
      description: event.description || `Weekly commitment: ${event.title}`
    });
    triggerSound('start-focus');
  };

  const handleQuickToggleRoutine = (routine: any) => {
    const log = routineLogs[routine.id] || {};
    const isDone = log.status === 'done' || log.completed;
    if (isDone) {
      logRoutineTaskExecution(routine.id, 'missed', { reason: 'Reset to pending' });
    } else {
      logRoutineTaskExecution(routine.id, 'done', {
        onTime: true,
        location: routine.type === 'prayer' || routine.categoryId === 'spiritual' ? 'mosque' : 'home'
      });
      triggerSound('habit-complete');
    }
  };

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {/* ========================================================================= */}
      {/* 1. TOP FOCUS & EXECUTION OVERVIEW BANNER */}
      {/* ========================================================================= */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
      }}>
        {/* Ambient Glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.2)',
                color: 'var(--primary-light)',
                border: '1px solid rgba(99, 102, 241, 0.4)'
              }}>
                🎯 Daily Execution & Focus Hub
              </span>
            </div>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
              Today's Commitment & Actions
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.25rem 0 0', maxWidth: '600px' }}>
              Execute your daily non-negotiable routines and high-priority project tasks. Score each life pillar during evening reflection.
            </p>
          </div>

          {/* Key Today Snapshot Stats */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1.25rem',
            flexWrap: 'wrap'
          }}>
            {/* Routines Done */}
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Routines Done
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginTop: '0.1rem' }}>
                <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>
                  {completedRoutinesCount}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  / {todayRoutines.length}
                </span>
              </div>
            </div>

            <div style={{ width: '1px', height: '36px', background: 'var(--border-color)' }} />

            {/* Tasks Done */}
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Project Tasks
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginTop: '0.1rem' }}>
                <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-light)' }}>
                  {completedTasksCount}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  / {todayTasks.length}
                </span>
              </div>
            </div>

            <div style={{ width: '1px', height: '36px', background: 'var(--border-color)' }} />

            {/* Focus Time */}
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Deep Work
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {formatDurationHuman(totalFocusMinutesToday)}
              </div>
            </div>

            <div style={{ width: '1px', height: '36px', background: 'var(--border-color)' }} />

            {/* Evening Evaluation State */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Evening Score
              </div>
              {hasEvaluatedToday ? (
                <span className={`badge ${scoreMeta.badgeClass}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}>
                  {scoreMeta.icon} {todayEvaluatedScore}% ({scoreMeta.label})
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('journal')}
                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', gap: '0.3rem', color: 'var(--cat-spiritual)' }}
                >
                  <SlidersHorizontal size={12} />
                  <span>Evaluate Day</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Tracker Bar */}
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span>Routines Completion: {routinesPercentage}%</span>
            <span>{completedRoutinesCount} of {todayRoutines.length} Daily Actions Completed</span>
          </div>
          <div className="progress-bar-container" style={{ height: '8px' }}>
            <div 
              className="progress-bar-fill"
              style={{
                width: `${routinesPercentage}%`,
                background: routinesPercentage >= 90 
                  ? 'linear-gradient(90deg, #10b981, #059669)' 
                  : routinesPercentage >= 60 
                    ? 'linear-gradient(90deg, #6366f1, #3b82f6)' 
                    : 'linear-gradient(90deg, #f59e0b, #eab308)',
                boxShadow: routinesPercentage >= 80 ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TWO-COLUMN SPLIT: (LEFT: DAILY ROUTINES) + (RIGHT: TODAY'S TASKS) */}
      {/* ========================================================================= */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        
        {/* LEFT COLUMN: DAILY ROUTINES (CHECKLIST & DETAILS) */}
        <div className="card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🌅</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                  Daily Routines Baseline ({todayRoutines.length})
                </h3>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                Recurring non-negotiables. Click check to complete or edit icon to log details.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setActiveTab('routines')}
              style={{ fontSize: '0.75rem', color: 'var(--primary-light)', padding: '0.2rem 0.5rem' }}
            >
              Manage Routines
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {todayRoutines.map((routine: any) => {
              const log = routineLogs[routine.id] || {};
              const isDone = log.status === 'done' || log.completed;
              const isLate = log.status === 'late';
              const isPartial = log.status === 'partial';
              const isMissed = log.status === 'missed';
              const isPrayer = routine.type === 'prayer' || routine.categoryId === 'spiritual' || routine.name?.toLowerCase().includes('prayer') || routine.title?.toLowerCase().includes('prayer');

              return (
                <div
                  key={routine.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: isDone 
                      ? 'rgba(16, 185, 129, 0.06)' 
                      : isLate
                      ? 'rgba(245, 158, 11, 0.06)'
                      : isMissed
                      ? 'rgba(239, 68, 68, 0.05)'
                      : 'var(--bg-surface)',
                    border: isDone 
                      ? '1px solid rgba(16, 185, 129, 0.3)' 
                      : isLate
                      ? '1px solid rgba(245, 158, 11, 0.3)'
                      : isMissed
                      ? '1px solid rgba(239, 68, 68, 0.3)'
                      : '1px solid var(--border-color)',
                    transition: 'all var(--transition-fast)',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    {/* Checkbox */}
                    <div
                      onClick={() => handleQuickToggleRoutine(routine)}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '7px',
                        background: isDone ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                        border: isDone ? '1px solid #10b981' : '1px solid var(--border-color)',
                        transition: 'all var(--transition-fast)',
                        flexShrink: 0
                      }}
                      title={isDone ? 'Mark Incomplete' : 'Mark Complete'}
                    >
                      {isDone && <Check size={15} color="#ffffff" strokeWidth={3} />}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        flexWrap: 'wrap'
                      }}>
                        <span>{routine.icon}</span>
                        <span>{routine.name || routine.title}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                        <span>⏰ {routine.timeSlot || 'Anytime'}</span>
                        {log.location === 'mosque' && (
                          <span style={{ color: '#10b981', fontWeight: 700 }}>🕌 Mosque</span>
                        )}
                        {log.location === 'home' && isPrayer && (
                          <span style={{ color: 'var(--text-muted)' }}>🏠 Home</span>
                        )}
                        {isLate && (
                          <span style={{ color: '#f59e0b', fontWeight: 700 }}>⏱️ Late {log.reason ? `(${log.reason})` : ''}</span>
                        )}
                        {isMissed && (
                          <span style={{ color: '#ef4444', fontWeight: 700 }}>❌ Missed {log.reason ? `(${log.reason})` : ''}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Detail Logger */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {/* Status Pill */}
                    <button
                      type="button"
                      onClick={() => setSelectedRoutineForModal(routine)}
                      className="btn btn-ghost btn-sm"
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        background: isDone 
                          ? 'rgba(16, 185, 129, 0.15)' 
                          : isLate 
                          ? 'rgba(245, 158, 11, 0.15)'
                          : isMissed
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: isDone ? '#10b981' : isLate ? '#f59e0b' : isMissed ? '#ef4444' : 'var(--text-muted)',
                        border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                      title="Log details (Mosque/Home, On-Time/Late, Reasons)"
                    >
                      <FileEdit size={12} />
                      <span>{isDone ? 'Done' : isLate ? 'Late' : isMissed ? 'Missed' : 'Log Status'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TODAY'S RECURRING COMMITMENTS (FROM WEEKLY SCHEDULE) */}
          {todayRecurringEvents.length > 0 && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🗓️</span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>
                    Today's Recurring Commitments ({todayRecurringEvents.length})
                  </h4>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActiveTab('weekly')}
                  style={{ fontSize: '0.72rem', color: 'var(--primary-light)', padding: '0.15rem 0.45rem' }}
                >
                  Weekly Schedule
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {todayRecurringEvents.map((evt: any) => (
                  <div
                    key={evt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      background: evt.isDone ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-surface)',
                      border: evt.isDone ? '1px solid rgba(16, 185, 129, 0.3)' : `1px solid ${evt.categoryColor}33`,
                      borderLeft: `4px solid ${evt.categoryColor}`,
                      gap: '0.65rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: '1 1 180px' }}>
                      <div
                        onClick={() => toggleWeeklyEventToday(evt.id)}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          background: evt.isDone ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                          border: evt.isDone ? '1px solid #10b981' : '1px solid var(--border-color)',
                          flexShrink: 0
                        }}
                        title={evt.isDone ? 'Mark Incomplete' : 'Mark Complete'}
                      >
                        {evt.isDone && <Check size={14} color="#ffffff" strokeWidth={3} />}
                      </div>

                      <div>
                        <div style={{
                          fontSize: '0.88rem',
                          fontWeight: evt.isDone ? 500 : 700,
                          color: evt.isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: evt.isDone ? 'line-through' : 'none'
                        }}>
                          {evt.title}
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          ⏰ {evt.timeSlot} • {evt.categoryIcon} {evt.categoryName}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                      <select
                        value={evt.status}
                        onChange={(e) => setWeeklyEventStatus(evt.id, e.target.value)}
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          border: evt.isDone ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                          background: evt.isDone ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.18)',
                          color: evt.isDone ? '#10b981' : '#f59e0b',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="todo">⚪ To Do</option>
                        <option value="in_progress">🟡 In Progress</option>
                        <option value="done">🟢 Done</option>
                      </select>

                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => handleStartRecurringEventTimer(evt)}
                        title="Start Focus Timer on this Commitment"
                        style={{ color: '#06b6d4' }}
                      >
                        <Play size={13} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: TODAY'S DYNAMIC PROJECT TASKS */}
        <div className="card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🎯</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                  Today's Project Tasks ({todayTasks.length})
                </h3>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                High-leverage tasks from client projects, learning, or deliverables.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsTaskPickerOpen(true)}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', gap: '0.3rem' }}
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-color)'
            }}>
              <Zap size={32} color="var(--primary-light)" style={{ margin: '0 auto 0.5rem', opacity: 0.7 }} />
              <p style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0 0 0.35rem' }}>No Tasks in Today's Queue</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '0 0 1rem', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
                Pick high-impact tasks from your active projects to focus on today.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsTaskPickerOpen(true)}
                style={{ gap: '0.35rem' }}
              >
                <Plus size={14} />
                <span>Pick Tasks for Today</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {todayTasks.map((task) => {
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.95rem',
                      borderRadius: 'var(--radius-md)',
                      background: task.isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface)',
                      border: task.isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                      transition: 'all var(--transition-fast)',
                      gap: '0.65rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    {/* Checkbox & Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: '1 1 200px', minWidth: '180px' }}>
                      <div
                        onClick={() => toggleTask(task.categoryId, task.projectId, task.id)}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          background: task.isDone ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                          border: task.isDone ? '1px solid #10b981' : '1px solid var(--border-color)',
                          transition: 'all var(--transition-fast)',
                          flexShrink: 0
                        }}
                        title={task.isDone ? 'Mark Incomplete' : 'Mark Complete'}
                      >
                        {task.isDone && <Check size={14} color="#ffffff" strokeWidth={3} />}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.88rem',
                          fontWeight: task.isDone ? 500 : 700,
                          color: task.isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: task.isDone ? 'line-through' : 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {task.title}
                        </div>
                        <span style={{ fontSize: '0.68rem', color: task.categoryColor || 'var(--text-muted)', fontWeight: 600 }}>
                          📁 {task.projectName}
                        </span>
                      </div>
                    </div>

                    {/* Status & Focus Timer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0, flexWrap: 'wrap' }}>
                      {/* Status Selector */}
                      <select
                        value={task.status || (task.isDone ? 'done' : 'todo')}
                        onChange={(e) => updateTask(task.categoryId, task.projectId, task.id, {
                          status: e.target.value,
                          completed: e.target.value === 'done'
                        })}
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          border: task.isDone ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                          background: task.isDone ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.18)',
                          color: task.isDone ? '#10b981' : '#f59e0b',
                          cursor: 'pointer',
                          minWidth: '100px'
                        }}
                      >
                        <option value="todo">⚪ To Do</option>
                        <option value="in_progress">🟡 In Progress</option>
                        <option value="done">🟢 Done</option>
                      </select>

                      {/* Start Focus Timer */}
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => handleStartTaskTimer(task)}
                        title="Start Focus Timer on this Task"
                        style={{ color: '#06b6d4' }}
                      >
                        <Play size={13} fill="currentColor" />
                      </button>

                      {/* Remove from Today */}
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => toggleTaskToday(task.categoryId, task.projectId, task.id)}
                        title="Remove from Today's Queue"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: PICK PROJECT TASKS FOR TODAY'S QUEUE */}
      {/* ========================================================================= */}
      {isTaskPickerOpen && (
        <div className="modal-backdrop" onClick={() => setIsTaskPickerOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-light)'
                }}>
                  <ListPlus size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Add Tasks to Today's Plan</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Select high-priority project tasks to execute today.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setIsTaskPickerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Category / Project Filter */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.3rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${selectedProjectIdForPicker === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedProjectIdForPicker('all')}
                  style={{ fontSize: '0.78rem' }}
                >
                  All Projects ({allAvailableProjectTasks.length})
                </button>
                {categories.map((cat) => (
                  (cat.projects || []).map((proj: any) => {
                    const count = allAvailableProjectTasks.filter(t => t.projectId === proj.id).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={proj.id}
                        type="button"
                        className={`btn btn-sm ${selectedProjectIdForPicker === proj.id ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setSelectedProjectIdForPicker(proj.id)}
                        style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                      >
                        <span>{proj.name}</span>
                        <span style={{ opacity: 0.7 }}>({count})</span>
                      </button>
                    );
                  })
                ))}
              </div>

              {/* Tasks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', maxHeight: '320px', overflowY: 'auto' }}>
                {allAvailableProjectTasks
                  .filter(t => selectedProjectIdForPicker === 'all' || t.projectId === selectedProjectIdForPicker)
                  .map((task) => (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{task.title}</div>
                        <span style={{ fontSize: '0.72rem', color: task.categoryColor || 'var(--primary-light)' }}>
                          📁 {task.projectName}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          toggleTaskToday(task.categoryId, task.projectId, task.id);
                        }}
                        style={{ gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        <Plus size={13} />
                        <span>Add to Today</span>
                      </button>
                    </div>
                  ))}

                {allAvailableProjectTasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    All existing project tasks are already added to Today's queue, or no tasks exist!
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsTaskPickerOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setIsTaskPickerOpen(false);
                  setActiveTab('projects');
                }}
                style={{ gap: '0.4rem' }}
              >
                <FolderKanban size={15} />
                <span>Go to Projects View</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routine Execution Modal for Mosque/Location, On-Time/Late, and Reason Logging */}
      <RoutineExecutionModal
        routine={selectedRoutineForModal}
        isOpen={Boolean(selectedRoutineForModal)}
        onClose={() => setSelectedRoutineForModal(null)}
      />
    </div>
  );
};
