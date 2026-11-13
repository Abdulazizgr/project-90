'use client';

import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Sparkles,
  ChevronRight,
  Flame,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Task, Category } from '@/utils/seedData';

export const TasksView: React.FC = () => {
  const { 
    data, 
    todayStr, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskStatus, 
    triggerSound 
  } = useApp();

  const categories = data.categories || [];
  const tasks: Task[] = data.tasks || [];

  // Filter states
  const [dateFilter, setDateFilter] = useState<'today' | 'upcoming' | 'completed' | 'all'>('today');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modal / Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('career');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [plannedDate, setPlannedDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<Task['status']>('not_started');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filter logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Date filter
      if (dateFilter === 'today') {
        if (t.plannedDate !== todayStr) return false;
      } else if (dateFilter === 'upcoming') {
        if (t.plannedDate <= todayStr || t.status === 'completed') return false;
      } else if (dateFilter === 'completed') {
        if (t.status !== 'completed') return false;
      }

      // Category filter
      if (selectedCatFilter !== 'all' && t.categoryId !== selectedCatFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort: not completed first, then by priority (high > med > low), then date
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      const prioOrder = { high: 0, medium: 1, low: 2 };
      return (prioOrder[a.priority] || 1) - (prioOrder[b.priority] || 1);
    });
  }, [tasks, dateFilter, selectedCatFilter, priorityFilter, todayStr]);

  // Task metrics
  const todayTasks = tasks.filter(t => t.plannedDate === todayStr && t.status !== 'cancelled');
  const completedTodayCount = todayTasks.filter(t => t.status === 'completed').length;
  const totalTodayCount = todayTasks.length;

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategoryId(categories[0]?.id || 'career');
    setPriority('medium');
    setPlannedDate(todayStr);
    setStartTime('');
    setDeadline('');
    setStatus('not_started');
    setNotes('');
    setFormError(null);
    setEditingTaskId(null);
    setIsModalOpen(false);
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setCategoryId(task.categoryId);
    setPriority(task.priority || 'medium');
    setPlannedDate(task.plannedDate || todayStr);
    setStartTime(task.startTime || '');
    setDeadline(task.deadline || '');
    setStatus(task.status || 'not_started');
    setNotes(task.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter a task title');
      return;
    }

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        priority,
        plannedDate,
        startTime,
        deadline,
        status,
        notes: notes.trim()
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        priority,
        plannedDate,
        startTime,
        deadline,
        status,
        notes: notes.trim()
      });
    }

    resetForm();
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'high':
        return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.68rem', fontWeight: 700 }}>High Priority</span>;
      case 'medium':
        return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.68rem', fontWeight: 700 }}>Medium</span>;
      case 'low':
      default:
        return <span className="badge" style={{ background: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', border: '1px solid rgba(100, 116, 139, 0.3)', fontSize: '0.68rem', fontWeight: 700 }}>Low</span>;
    }
  };

  return (
    <div className="page-container" style={{ paddingBottom: '5rem' }}>
      {/* Top Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.25rem',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <CheckSquare size={22} color="var(--primary-light)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Daily Tasks Management</h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Actionable deliverables separate from repeated routines. Plan, prioritize, and execute.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
          >
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>

        {/* Quick Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ background: 'var(--bg-input)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Today Planned</span>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              {totalTodayCount} Tasks
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Today Done</span>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '0.1rem' }}>
              {completedTodayCount} / {totalTodayCount}
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Today Rate</span>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '0.1rem' }}>
              {totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Category Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {/* Date Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          {[
            { id: 'today', label: `Today (${todayTasks.length})` },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'all', label: `All Tasks (${tasks.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`btn btn-sm ${dateFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDateFilter(tab.id as any)}
              style={{ fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category & Priority Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="input"
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', width: 'auto' }}
          >
            <option value="all">All Categories</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', width: 'auto' }}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="card" style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
          border: '1px dashed var(--border-color)',
          background: 'transparent'
        }}>
          <CheckSquare size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>No tasks found for this view</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '340px', margin: '0 auto 1.25rem' }}>
            Add specific tasks with deadlines and priorities to ensure your day's work is finished on schedule.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            Add New Task
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            const cat = categories.find((c: any) => c.id === task.categoryId);

            return (
              <div
                key={task.id}
                className="card"
                style={{
                  padding: '0.85rem 1rem',
                  background: isDone ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
                  border: isDone ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-color)',
                  borderLeft: `4px solid ${cat?.color || 'var(--primary)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* One-tap Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleTaskStatus(task.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDone ? '#10b981' : 'var(--text-muted)'
                  }}
                  aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {isDone ? (
                    <CheckCircle2 size={22} fill="#10b981" color="#ffffff" />
                  ) : (
                    <Circle size={22} />
                  )}
                </button>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    <h4 style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      margin: 0,
                      textDecoration: isDone ? 'line-through' : 'none',
                      color: isDone ? 'var(--text-muted)' : 'var(--text-primary)'
                    }}>
                      {task.title}
                    </h4>
                    {getPriorityBadge(task.priority)}
                    <span style={{ fontSize: '0.7rem', color: cat?.color || 'var(--text-muted)', fontWeight: 600 }}>
                      {cat?.icon} {cat?.name}
                    </span>
                  </div>

                  {task.description && (
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      margin: '0 0 0.3rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {task.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} /> {task.plannedDate}
                    </span>
                    {(task.startTime || task.deadline) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="mono">
                        <Clock size={12} /> {task.startTime ? task.startTime : ''}{task.startTime && task.deadline ? ' – ' : ''}{task.deadline ? `Due ${task.deadline}` : ''}
                      </span>
                    )}
                    {task.notes && (
                      <span style={{ fontStyle: 'italic' }}>
                        "{task.notes}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <select
                    className="input"
                    value={task.status}
                    onChange={(e) => updateTask(task.id, { status: e.target.value as any })}
                    style={{ fontSize: '0.7rem', padding: '0.25rem 0.45rem', width: 'auto' }}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => handleStartEdit(task)}
                    title="Edit Task"
                  >
                    <Edit3 size={14} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => {
                      if (confirm(`Delete task "${task.title}"?`)) {
                        deleteTask(task.id);
                      }
                    }}
                    title="Delete Task"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {editingTaskId ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button type="button" className="btn btn-ghost btn-icon" onClick={resetForm}>
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '1rem'
              }}>
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTask}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement webhook authentication endpoint"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Description (Optional)
                </label>
                <textarea
                  className="input"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specific requirements, test cases, or context"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Category
                  </label>
                  <select
                    className="input"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Priority
                  </label>
                  <select
                    className="input"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">⚪ Low Priority</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Planned Date
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={plannedDate}
                    onChange={(e) => setPlannedDate(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Status
                  </label>
                  <select
                    className="input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Start Time (Optional)
                  </label>
                  <input
                    type="time"
                    className="input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Deadline (Optional)
                  </label>
                  <input
                    type="time"
                    className="input"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  className="input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context or outcome notes"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                  {editingTaskId ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

