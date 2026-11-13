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
  SunMedium, 
  CheckSquare,
  AlertCircle,
  ChevronRight,
  ListTodo
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { 
  getDayKeyFromDateStr,
  isRoutineScheduledForDay,
  formatDurationHuman
} from '@/utils/calculations';
import { Routine, Task } from '@/utils/seedData';

interface TodayExecutionBoardProps {
  onOpenRoutineModal?: () => void;
  onOpenTaskModal?: () => void;
}

export const TodayExecutionBoard: React.FC<TodayExecutionBoardProps> = ({
  onOpenRoutineModal,
  onOpenTaskModal
}) => {
  const { 
    data, 
    todayStr, 
    setActiveTab, 
    setActiveModal,
    setModalData,
    logRoutineTaskExecution,
    toggleTaskStatus,
    addTask
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'routines' | 'tasks'>('all');
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskCategory, setQuickTaskCategory] = useState('career');

  const routines = data.routines || [];
  const categories = data.categories || [];
  const routineLogs = data.routineLogsHistory?.[todayStr] || {};
  const todayDayKey = getDayKeyFromDateStr(todayStr);

  // Scheduled routines for today
  const scheduledTodayRoutines = useMemo(() => {
    return routines.filter((r: Routine) => isRoutineScheduledForDay(r, todayDayKey));
  }, [routines, todayDayKey]);

  // Tasks planned for today
  const todayTasks: Task[] = useMemo(() => {
    return (data.tasks || []).filter((t: Task) => t.plannedDate === todayStr && t.status !== 'cancelled');
  }, [data.tasks, todayStr]);

  const completedRoutinesCount = scheduledTodayRoutines.filter((r: Routine) => {
    const log = routineLogs[r.id];
    return log && (log.completed || log.status === 'done' || log.status === 'completed');
  }).length;

  const completedTasksCount = todayTasks.filter((t: Task) => t.status === 'completed').length;

  const handleLaunchRunner = (routine: Routine) => {
    setModalData(routine);
    setActiveModal('routine_runner');
  };

  const handleToggleRoutine = (routineId: string) => {
    const isDone = routineLogs[routineId]?.completed || routineLogs[routineId]?.status === 'done';
    logRoutineTaskExecution(routineId, isDone ? 'missed' : 'done');
  };

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    addTask({
      title: quickTaskTitle.trim(),
      categoryId: quickTaskCategory,
      priority: 'medium',
      plannedDate: todayStr,
      status: 'not_started'
    });
    setQuickTaskTitle('');
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Header and Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Today's Execution Board</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Repeated routines and prioritized tasks for today
          </p>
        </div>

        {/* Sub-tab pills */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-input)', padding: '0.2rem', borderRadius: 'var(--radius-full)', overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeSubTab === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveSubTab('all')}
            style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
          >
            All Items ({scheduledTodayRoutines.length + todayTasks.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeSubTab === 'routines' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveSubTab('routines')}
            style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
          >
            Routines ({completedRoutinesCount}/{scheduledTodayRoutines.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeSubTab === 'tasks' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveSubTab('tasks')}
            style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
          >
            Tasks ({completedTasksCount}/{todayTasks.length})
          </button>
        </div>
      </div>

      {/* Quick Add Task Mini Bar */}
      <form 
        onSubmit={handleQuickAddTask}
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.25rem',
          background: 'var(--bg-card)',
          padding: '0.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <input
          type="text"
          placeholder="+ Add a quick task for today..."
          value={quickTaskTitle}
          onChange={(e) => setQuickTaskTitle(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            padding: '0.25rem 0.5rem'
          }}
        />

        <select
          value={quickTaskCategory}
          onChange={(e) => setQuickTaskCategory(e.target.value)}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            padding: '0.35rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            outline: 'none'
          }}
        >
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>

        <button
          type="submit"
          className="btn btn-primary btn-sm"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 700 }}
        >
          <Plus size={14} />
          <span>Add</span>
        </button>
      </form>

      {/* 1. ROUTINES SECTION */}
      {(activeSubTab === 'all' || activeSubTab === 'routines') && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <SunMedium size={18} color="#f59e0b" />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800 }}>Today's Scheduled Routines</h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                ({completedRoutinesCount}/{scheduledTodayRoutines.length} Completed)
              </span>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setActiveTab('routines')}
              style={{ fontSize: '0.75rem', gap: '0.25rem' }}
            >
              <span>Manage Templates</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {scheduledTodayRoutines.map((routine: Routine) => {
              const log = routineLogs[routine.id] || {};
              const isDone = log.completed || log.status === 'done' || log.status === 'completed';
              const cat = categories.find((c: any) => c.id === routine.categoryId);
              const catColor = cat?.color || '#6366f1';
              const catIcon = cat?.icon || '⚡';

              return (
                <div
                  key={routine.id}
                  className="card"
                  style={{
                    padding: '0.85rem 1rem',
                    borderLeft: `4px solid ${catColor}`,
                    background: isDone ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
                    borderColor: isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleRoutine(routine.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: isDone ? '#10b981' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0
                      }}
                      title={isDone ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          background: `${catColor}20`,
                          color: catColor
                        }}>
                          {catIcon} {cat?.name}
                        </span>

                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Clock size={11} />
                          <span>{routine.startTime} - {routine.endTime} ({formatDurationHuman(routine.durationMinutes)})</span>
                        </span>
                      </div>

                      <h4 style={{
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        marginTop: '0.15rem',
                        color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                      }}>
                        {routine.name || routine.title}
                      </h4>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleLaunchRunner(routine)}
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.74rem', gap: '0.3rem', fontWeight: 700 }}
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Run</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TASKS SECTION */}
      {(activeSubTab === 'all' || activeSubTab === 'tasks') && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CheckSquare size={18} color="#3b82f6" />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800 }}>Today's Tasks</h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                ({completedTasksCount}/{todayTasks.length} Completed)
              </span>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setActiveTab('tasks')}
              style={{ fontSize: '0.75rem', gap: '0.25rem' }}
            >
              <span>Task Planner</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem', border: '1px dashed var(--border-color)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                No tasks planned for today. Add one above!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {todayTasks.map((task: Task) => {
                const isCompleted = task.status === 'completed';
                const cat = categories.find((c: any) => c.id === task.categoryId);
                const priorityColor = task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#3b82f6';

                return (
                  <div
                    key={task.id}
                    className="card"
                    style={{
                      padding: '0.85rem 1rem',
                      background: isCompleted ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
                      borderColor: isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.65rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => toggleTaskStatus(task.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: isCompleted ? '#10b981' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          flexShrink: 0
                        }}
                      >
                        {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.45rem',
                            borderRadius: 'var(--radius-full)',
                            background: `${cat?.color || '#6366f1'}20`,
                            color: cat?.color || '#6366f1'
                          }}>
                            {cat?.icon} {cat?.name}
                          </span>

                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            background: `${priorityColor}20`,
                            color: priorityColor,
                            textTransform: 'uppercase'
                          }}>
                            {task.priority}
                          </span>

                          {task.deadline && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Due: {task.deadline}
                            </span>
                          )}
                        </div>

                        <h4 style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          marginTop: '0.15rem',
                          color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere'
                        }}>
                          {task.title}
                        </h4>
                      </div>
                    </div>

                    <button
                      className={`btn btn-sm ${isCompleted ? 'btn-success' : 'btn-ghost'}`}
                      onClick={() => toggleTaskStatus(task.id)}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', fontWeight: 700 }}
                    >
                      {isCompleted ? 'Finished ✓' : 'Complete'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
