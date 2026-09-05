'use client';

import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Play, 
  Plus, 
  Star, 
  Sparkles, 
  Check, 
  X, 
  SunMedium, 
  Moon, 
  Sunrise, 
  ChevronRight,
  FolderKanban,
  Zap,
  Award,
  ListPlus,
  Flame,
  CheckSquare
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getScoreLevel, formatDurationHuman, calculateExecutionScore, getDayKeyFromDateStr } from '@/utils/calculations';

export const TodayExecutionBoard = () => {
  const { 
    data, 
    todayStr, 
    setActiveTab, 
    setActiveModal, 
    setModalData, 
    startTimer, 
    toggleTask, 
    updateTask, 
    toggleTaskToday,
    awardTaskPoints,
    setRoutineStatus,
    setWeeklyEventStatus,
    toggleWeeklyEventToday,
    triggerSound 
  } = useApp();

  const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(false);
  const [selectedProjectIdForPicker, setSelectedProjectIdForPicker] = useState('all');

  const routines = data.routines || [];
  const categories = data.categories || [];
  const routineLogs = data.routineLogsHistory?.[todayStr] || {};
  const habits = data.habits || [];
  const habitLogs = data.habitLogsHistory?.[todayStr] || {};
  const recurringEvents = data.recurringWeeklySchedule || [];
  const weeklyEventLogs = data.weeklyEventLogsHistory?.[todayStr] || {};
  const todayDayKey = getDayKeyFromDateStr(todayStr);

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
        const eventPoints = Number(event.points) || 20;
        const log = weeklyEventLogs[event.id] || {};
        const isDone = log.status === 'done' || log.completed;
        const earned = log.earnedPoints !== undefined 
          ? Number(log.earnedPoints) 
          : (isDone ? eventPoints : (log.status === 'in_progress' ? Math.round(eventPoints * 0.5) : 0));

        return {
          ...event,
          categoryName: cat.name,
          categoryColor: cat.color,
          categoryIcon: cat.icon,
          points: eventPoints,
          earnedPoints: earned,
          isDone,
          status: log.status || (isDone ? 'done' : 'todo')
        };
      });
  }, [recurringEvents, todayDayKey, weeklyEventLogs, categories]);

  // Calculate dynamic score, planned points, and earned points
  const execScoreData = useMemo(() => {
    return calculateExecutionScore(
      routines, 
      routineLogs, 
      categories, 
      todayStr, 
      habits, 
      habitLogs,
      recurringEvents,
      weeklyEventLogs
    );
  }, [routines, routineLogs, categories, todayStr, habits, habitLogs, recurringEvents, weeklyEventLogs]);

  const score = typeof execScoreData === 'object' ? execScoreData.score : Number(execScoreData) || 0;
  const plannedPoints = typeof execScoreData === 'object' ? execScoreData.plannedPoints : 100;
  const earnedPoints = typeof execScoreData === 'object' ? execScoreData.earnedPoints : 0;
  const scoreMeta = getScoreLevel(score);

  // Extract all tasks marked isToday across all projects
  const todayTasks = useMemo(() => {
    const list = [];
    categories.forEach((cat) => {
      (cat.projects || []).forEach((proj) => {
        (proj.tasks || []).forEach((task) => {
          if (task.isToday || task.scheduledDate === todayStr) {
            const taskPoints = Number(task.points) || (task.priority === 'high' ? 30 : task.priority === 'medium' ? 20 : 10);
            const isDone = task.status === 'done' || task.completed;
            const earned = task.earnedPoints !== undefined 
              ? Number(task.earnedPoints) 
              : (isDone ? taskPoints : (task.status === 'in_progress' ? Math.round(taskPoints * 0.5) : 0));

            list.push({
              ...task,
              categoryId: cat.id,
              categoryName: cat.name,
              categoryColor: cat.color,
              categoryIcon: cat.icon,
              projectId: proj.id,
              projectName: proj.name,
              points: taskPoints,
              earnedPoints: earned,
              isDone
            });
          }
        });
      });
    });
    return list;
  }, [categories, todayStr]);

  // Extract all non-today tasks for the picker modal
  const allAvailableProjectTasks = useMemo(() => {
    const list = [];
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
              projectName: proj.name,
              points: Number(task.points) || (task.priority === 'high' ? 30 : task.priority === 'medium' ? 20 : 10)
            });
          }
        });
      });
    });
    return list;
  }, [categories, todayStr]);

  const handleStartTaskTimer = (task) => {
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

  const handleStartRecurringEventTimer = (event) => {
    startTimer({
      activityName: `Commitment: ${event.title}`,
      categoryId: event.categoryId,
      description: event.description || `Weekly commitment: ${event.title}`
    });
    triggerSound('start-focus');
  };

  const handleToggleRoutineComplete = (routine) => {
    const isCompleted = routineLogs[routine.id]?.completed;
    const nextStatus = isCompleted ? 'pending' : 'completed';
    setRoutineStatus(routine.id, nextStatus);
  };

  const startRoutineRunner = (routine) => {
    setModalData(routine);
    setActiveModal('routine_runner');
  };

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {/* ========================================================================= */}
      {/* 1. TOP SCORE & EXECUTION BANNER */}
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
        {/* Glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(245, 158, 11, 0.08) 50%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
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
                ⚡ Daily 100-Point Execution Engine
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
              Today's Commitment & Performance
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.25rem 0 0', maxWidth: '650px' }}>
              Your score is evaluated dynamically based on completing your <strong>Daily Routines</strong> (default base) + <strong>Today's Project Tasks</strong>.
            </p>
          </div>

          {/* Live Score Dial */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1.25rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                <span className="mono" style={{ fontSize: '2rem', fontWeight: 900, color: scoreMeta.color }}>
                  {score}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>/ 100 pts</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {earnedPoints} / {plannedPoints} pts earned
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
              <span className={`badge ${scoreMeta.badgeClass}`} style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}>
                {scoreMeta.icon} {scoreMeta.label}
              </span>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsTaskPickerOpen(true)}
                style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', gap: '0.3rem' }}
              >
                <Plus size={13} />
                <span>Add Task to Today</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div style={{ marginTop: '1.25rem' }}>
          <div className="progress-bar-container" style={{ height: '10px' }}>
            <div 
              className="progress-bar-fill"
              style={{
                width: `${score}%`,
                background: score >= 90 
                  ? 'linear-gradient(90deg, #10b981, #059669)' 
                  : score >= 70 
                    ? 'linear-gradient(90deg, #6366f1, #3b82f6)' 
                    : score >= 50 
                      ? 'linear-gradient(90deg, #f59e0b, #eab308)' 
                      : 'linear-gradient(90deg, #ef4444, #f97316)',
                boxShadow: `0 0 12px ${scoreMeta.color}66`
              }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TWO-COLUMN SPLIT: (LEFT: ROUTINES BASELINE) + (RIGHT: TODAY'S TASKS) */}
      {/* ========================================================================= */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        
        {/* LEFT COLUMN: DAILY ROUTINES (DEFAULT VALUES) */}
        <div className="card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🌅</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                  Daily Routines Baseline
                </h3>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                Core non-negotiables with smart default points
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
            {routines.map((routine) => {
              const defaultPts = Number(routine.points) || (routine.id === 'morning' ? 15 : routine.id === 'evening' ? 15 : 20);
              const log = routineLogs[routine.id] || {};
              const isDone = log.completed || log.status === 'completed';

              return (
                <div
                  key={routine.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: isDone ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-surface)',
                    border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                    transition: 'all var(--transition-fast)',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <div
                      onClick={() => handleToggleRoutineComplete(routine)}
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

                    <div>
                      <div style={{
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: isDone ? 'line-through' : 'none'
                      }}>
                        {routine.icon} {routine.name}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {routine.timeSlot || `${routine.activities?.length || 0} habits`}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: isDone ? '#10b981' : 'var(--primary-light)',
                      background: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                      border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      ⭐ {defaultPts} pts
                    </span>

                    <button
                      type="button"
                      className="btn btn-secondary btn-icon btn-sm"
                      onClick={() => startRoutineRunner(routine)}
                      title="Launch Step-by-Step Routine Runner"
                    >
                      <Play size={13} fill="currentColor" />
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
                {todayRecurringEvents.map((evt) => (
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

                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: evt.isDone ? '#10b981' : 'var(--primary-light)',
                        background: evt.isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        border: evt.isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        ⭐ {evt.earnedPoints || (evt.isDone ? evt.points : 0)}/{evt.points} pts
                      </span>

                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => handleStartRecurringEventTimer(evt)}
                        title="Start Timer on this Commitment"
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
                High-leverage tasks for client projects, gym, or learning
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
                Tag tasks from your active projects to earn points towards today's 100-point target!
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
                const priorityColor = task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#06b6d4';

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
                        title={task.isDone ? 'Mark Incomplete' : 'Mark Complete (Earn full points)'}
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

                    {/* Status, Points & Actions */}
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

                      {/* Points Badge */}
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: task.isDone ? '#10b981' : 'var(--primary-light)',
                        background: task.isDone ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                        border: task.isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        ⭐ {task.earnedPoints || (task.isDone ? task.points : 0)}/{task.points} pts
                      </span>

                      {/* Start Focus Timer */}
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => handleStartTaskTimer(task)}
                        title="Start Timer on this Task"
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
                    Select high-priority project tasks to execute today and earn points.
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
                  (cat.projects || []).map((proj) => {
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
                          📁 {task.projectName} • ⭐ {task.points} pts
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
    </div>
  );
};
