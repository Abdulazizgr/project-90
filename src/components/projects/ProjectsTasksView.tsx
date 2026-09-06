'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Timer, 
  Search, 
  Trash2, 
  Play, 
  Check, 
  X, 
  Layers, 
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Clock3,
  ListPlus,
  Filter,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDurationHuman } from '@/utils/calculations';

export const ProjectsTasksView = () => {
  const { 
    data, 
    addProject, 
    updateProject, 
    deleteProject, 
    addTask, 
    updateTask, 
    toggleTask, 
    toggleTaskToday,
    awardTaskPoints,
    deleteTask, 
    startTimer, 
    triggerSound
  } = useApp();

  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'in_progress' | 'done'
  const [taskStatusFilter, setTaskStatusFilter] = useState('all'); // 'all' | 'todo' | 'in_progress' | 'done'
  const [mobileTab, setMobileTab] = useState('projects'); // 'projects' | 'workbench'

  // Modal States
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // New Project Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('career');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState('in_progress'); // 'in_progress' | 'done'
  const [initialTaskInputs, setInitialTaskInputs] = useState(['']);

  // Inline Quick Add Task for active project
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskPriority, setQuickTaskPriority] = useState('medium'); // 'high' | 'medium' | 'low'
  const [quickTaskStatus, setQuickTaskStatus] = useState('todo'); // 'todo' | 'in_progress' | 'done'
  const [quickTaskIsToday, setQuickTaskIsToday] = useState(true);

  const timeEntries = data.timeEntries || [];

  // Flatten all projects with dynamic tracked time & category metadata
  const allProjects = useMemo(() => {
    const list = [];
    (data.categories || []).forEach((cat) => {
      (cat.projects || []).forEach((proj) => {
        const tasks = proj.tasks || [];
        const completedTasksCount = tasks.filter((t) => t.completed || t.status === 'done').length;
        const totalTasksCount = tasks.length;
        const pct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

        // Calculate dynamic tracked minutes from time entries for this project
        const projectTimeEntries = timeEntries.filter((e) => e.projectId === proj.id);
        const totalTrackedMinutes = projectTimeEntries.reduce((acc, curr) => acc + (Number(curr.durationMinutes) || 0), 0);

        // Calculate tracked time per task
        const tasksWithTrackedTime = tasks.map((t) => {
          const taskMinutes = projectTimeEntries
            .filter((e) => e.taskId === t.id || (e.activityName && e.activityName.toLowerCase().includes(t.title.toLowerCase())))
            .reduce((acc, curr) => acc + (Number(curr.durationMinutes) || 0), 0);
          
          // Normalize status
          const taskStatus = t.status || (t.completed ? 'done' : 'todo');

          return {
            ...t,
            status: taskStatus,
            completed: taskStatus === 'done' || !!t.completed,
            trackedMinutes: taskMinutes
          };
        });

        list.push({
          ...proj,
          status: proj.status || 'in_progress', // 'in_progress' | 'done'
          categoryId: cat.id,
          categoryName: cat.name,
          categoryIcon: cat.icon,
          categoryColor: cat.color,
          completedTasksCount,
          totalTasksCount,
          pctComplete: pct,
          totalTrackedMinutes,
          tasks: tasksWithTrackedTime
        });
      });
    });
    return list;
  }, [data.categories, timeEntries]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      const matchesCat = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
      const matchesSearch = !searchQuery.trim() || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.tasks && p.tasks.some(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesStatus = statusFilter === 'all' 
        ? true 
        : p.status === statusFilter;

      return matchesCat && matchesSearch && matchesStatus;
    });
  }, [allProjects, selectedCategoryId, searchQuery, statusFilter]);

  // Currently Active Project in Workbench (always defaults to first project if available)
  const activeProject = useMemo(() => {
    if (selectedProjectId) {
      const found = allProjects.find((p) => p.id === selectedProjectId);
      if (found) return found;
    }
    return filteredProjects[0] || allProjects[0] || null;
  }, [allProjects, selectedProjectId, filteredProjects]);

  // Tasks of active project filtered by taskStatusFilter
  const activeProjectTasks = useMemo(() => {
    if (!activeProject || !activeProject.tasks) return [];
    if (taskStatusFilter === 'all') return activeProject.tasks;
    return activeProject.tasks.filter((t) => t.status === taskStatusFilter);
  }, [activeProject, taskStatusFilter]);

  // Status counts for active project tasks
  const taskCounts = useMemo(() => {
    const tasks = activeProject?.tasks || [];
    return {
      all: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      done: tasks.filter((t) => t.status === 'done' || t.completed).length
    };
  }, [activeProject]);

  // Global Task & Time Stats
  const globalStats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let totalMinutes = 0;
    allProjects.forEach((p) => {
      totalTasks += p.totalTasksCount;
      completedTasks += p.completedTasksCount;
      totalMinutes += p.totalTrackedMinutes;
    });
    const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return {
      totalProjects: allProjects.length,
      inProgressProjects: allProjects.filter(p => p.status === 'in_progress').length,
      doneProjects: allProjects.filter(p => p.status === 'done').length,
      totalTasks,
      completedTasks,
      pct,
      totalMinutes
    };
  }, [allProjects]);

  // Form Handlers
  const handleCreateProject = (e) => {
    e?.preventDefault();
    if (!newProjectName.trim()) return;

    const validInitialTasks = initialTaskInputs
      .filter((t) => t.trim().length > 0)
      .map((t) => ({ title: t.trim(), priority: 'medium', status: 'todo' }));

    addProject(newProjectCategory, {
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      status: newProjectStatus,
      initialTasks: validInitialTasks
    });

    setNewProjectName('');
    setNewProjectDesc('');
    setInitialTaskInputs(['']);
    setIsNewProjectModalOpen(false);
  };

  const handleToggleProjectStatus = (proj) => {
    const nextStatus = proj.status === 'done' ? 'in_progress' : 'done';
    updateProject(proj.categoryId, proj.id, { status: nextStatus });
    if (nextStatus === 'done') {
      triggerSound('fanfare');
    }
  };

  const handleQuickAddTask = (e) => {
    e?.preventDefault();
    if (!activeProject || !quickTaskTitle.trim()) return;

    addTask(activeProject.categoryId, activeProject.id, {
      title: quickTaskTitle.trim(),
      priority: quickTaskPriority,
      status: quickTaskStatus,
      isToday: quickTaskIsToday
    });

    setQuickTaskTitle('');
    setQuickTaskStatus('todo');
  };

  const handleUpdateTaskStatus = (task, newStatus) => {
    if (!activeProject) return;
    updateTask(activeProject.categoryId, activeProject.id, task.id, {
      status: newStatus,
      completed: newStatus === 'done'
    });
  };

  const handleStartTaskTimer = (task, project) => {
    startTimer({
      activityName: `${project.name}: ${task.title}`,
      categoryId: project.categoryId,
      projectId: project.id,
      taskId: task.id,
      taskTitle: task.title,
      description: `Task: ${task.title}`
    });
    triggerSound('start-focus');
  };

  const addInitialTaskField = () => {
    setInitialTaskInputs([...initialTaskInputs, '']);
  };

  const updateInitialTaskField = (index, value) => {
    const updated = [...initialTaskInputs];
    updated[index] = value;
    setInitialTaskInputs(updated);
  };

  const removeInitialTaskField = (index) => {
    if (initialTaskInputs.length > 1) {
      setInitialTaskInputs(initialTaskInputs.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0.25rem 0', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header & Global Stats Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75), rgba(15, 23, 42, 0.9))',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '20px',
        padding: '1.75rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Ambient Glow */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(6, 182, 212, 0.06) 60%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
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
                🎯 Execution Hub
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
              Projects & Tasks
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '680px', margin: 0 }}>
              Select a project on the left to view and manage its tasks on the right. Add new tasks, change statuses (<strong>To Do</strong>, <strong>In Progress</strong>, <strong>Done</strong>), and log focused time.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                triggerSound('click');
                setIsNewProjectModalOpen(true);
              }}
              style={{
                gap: '0.5rem',
                fontWeight: 800,
                padding: '0.75rem 1.35rem',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              }}
            >
              <Plus size={18} />
              <span>Create Project</span>
            </button>
          </div>
        </div>

        {/* Global Progress Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <FolderKanban size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1 }}>{globalStats.totalProjects}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {globalStats.inProgressProjects} Active • {globalStats.doneProjects} Done
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06b6d4'
            }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1 }}>
                {globalStats.completedTasks} / {globalStats.totalTasks}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tasks Done ({globalStats.pct}%)</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <Clock3 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1 }}>
                {formatDurationHuman(globalStats.totalMinutes)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Tracked Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        {/* Category Pills (horizontally scrollable on mobile) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          overflowX: 'auto', 
          paddingBottom: '0.2rem', 
          maxWidth: '100%',
          scrollbarWidth: 'none'
        }}>
          <button
            type="button"
            className={`btn btn-sm ${selectedCategoryId === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategoryId('all')}
            style={{ fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}
          >
            All ({allProjects.length})
          </button>

          {(data.categories || []).map((cat) => {
            const count = allProjects.filter((p) => p.categoryId === cat.id).length;
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCategoryId(cat.id)}
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  gap: '0.35rem',
                  flexShrink: 0,
                  border: isSelected ? `1px solid ${cat.color}` : '1px solid var(--border-color)',
                  background: isSelected ? `${cat.color}26` : undefined,
                  color: isSelected ? '#ffffff' : undefined
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.75 }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search & Project Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', minWidth: '180px', flex: '1 1 200px', maxWidth: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="input input-sm"
              placeholder="Search projects & tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.2rem', width: '100%' }}
            />
          </div>

          <select
            className="input input-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '135px', fontSize: '0.78rem' }}
          >
            <option value="all">All Projects</option>
            <option value="in_progress">🟡 In Progress</option>
            <option value="done">🟢 Done</option>
          </select>
        </div>
      </div>

      {/* Mobile Tab Switcher for Screens < 960px */}
      <div className="mobile-view-tabs">
        <button
          type="button"
          className={`mobile-view-tab ${mobileTab === 'projects' ? 'active' : ''}`}
          onClick={() => setMobileTab('projects')}
        >
          📁 Projects ({filteredProjects.length})
        </button>
        <button
          type="button"
          className={`mobile-view-tab ${mobileTab === 'workbench' ? 'active' : ''}`}
          onClick={() => setMobileTab('workbench')}
        >
          ⚡ Tasks ({activeProject?.name ? `${activeProject.name.slice(0, 14)}...` : 'Workbench'})
        </button>
      </div>

      {/* Main 2-Column Workspace: Projects List (Left) + Tasks Workbench (Right) */}
      <div className="projects-workspace-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* ========================================================================= */}
        {/* LEFT PANEL: PROJECTS LIST */}
        {/* ========================================================================= */}
        <div 
          className={`projects-list-column ${mobileTab === 'projects' ? 'active-tab' : ''}`} 
          style={{ flexDirection: 'column', gap: '0.85rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              Projects ({filteredProjects.length})
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsNewProjectModalOpen(true)}
              style={{ fontSize: '0.75rem', color: 'var(--primary-light)', padding: '0.2rem 0.5rem' }}
            >
              + New Project
            </button>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <FolderKanban size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>No Projects Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                {searchQuery ? 'No projects match your filter.' : 'Create a project to start organizing tasks!'}
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsNewProjectModalOpen(true)}
              >
                <Plus size={14} />
                <span>Create New Project</span>
              </button>
            </div>
          ) : (
            filteredProjects.map((proj) => {
              const isSelected = activeProject?.id === proj.id;
              const isDone = proj.status === 'done';

              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectId(proj.id);
                    setMobileTab('workbench'); // Auto switch to tasks tab on mobile
                    triggerSound('click');
                  }}
                  className="card"
                  style={{
                    padding: '1.15rem',
                    cursor: 'pointer',
                    border: isSelected ? `2px solid ${proj.categoryColor || '#6366f1'}` : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(30, 41, 59, 0.85)' : 'rgba(15, 23, 42, 0.55)',
                    transition: 'all var(--transition-fast)',
                    position: 'relative'
                  }}
                >
                  {/* Top Bar: Icon, Name & Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{proj.categoryIcon || '🎯'}</span>
                      <div>
                        <div style={{
                          fontWeight: 800,
                          fontSize: '0.98rem',
                          color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
                          textDecoration: isDone ? 'line-through' : 'none'
                        }}>
                          {proj.name}
                        </div>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: proj.categoryColor || 'var(--primary-light)'
                        }}>
                          {proj.categoryName}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge Toggle & Delete */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleProjectStatus(proj);
                        }}
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          border: isDone ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                          background: isDone ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.18)',
                          color: isDone ? '#10b981' : '#f59e0b',
                          cursor: 'pointer'
                        }}
                        title="Click to toggle Project Status"
                      >
                        {isDone ? '🟢 Done' : '🟡 In Progress'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete project "${proj.name}" and all its tasks?`)) {
                            deleteProject(proj.categoryId, proj.id);
                          }
                        }}
                        style={{ color: '#ef4444', opacity: 0.6 }}
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {proj.description && (
                    <p style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      margin: '0 0 0.75rem',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {proj.description}
                    </p>
                  )}

                  {/* Tracked Time & Task Progress */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.6rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#38bdf8', fontWeight: 700 }}>
                      <Clock size={12} />
                      {formatDurationHuman(proj.totalTrackedMinutes)} logged
                    </span>

                    <span>
                      {proj.completedTasksCount}/{proj.totalTasksCount} tasks ({proj.pctComplete}%)
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: TASKS WORKBENCH (AT TOP: ADD TASK FORM, THEN TASKS LIST) */}
        {/* ========================================================================= */}
        <div 
          className={`workbench-column ${mobileTab === 'workbench' ? 'active-tab' : ''}`}
        >
          {activeProject ? (
            <div className="card" style={{ padding: '1.5rem' }}>
              
              {/* Back to projects button (Mobile only) */}
              <div style={{ marginBottom: '1rem' }} className="mobile-only-back">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setMobileTab('projects')}
                  style={{ gap: '0.4rem', fontSize: '0.78rem' }}
                >
                  <ArrowLeft size={14} />
                  <span>Back to Projects List</span>
                </button>
              </div>

              {/* Project Header Banner */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingBottom: '1.25rem',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1.6rem' }}>{activeProject.categoryIcon || '🎯'}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: 0 }}>
                          {activeProject.name}
                        </h2>
                        <button
                          type="button"
                          onClick={() => handleToggleProjectStatus(activeProject)}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            border: activeProject.status === 'done' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                            background: activeProject.status === 'done' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.18)',
                            color: activeProject.status === 'done' ? '#10b981' : '#f59e0b',
                            cursor: 'pointer'
                          }}
                        >
                          {activeProject.status === 'done' ? '🟢 Done' : '🟡 In Progress'}
                        </button>
                      </div>

                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: activeProject.categoryColor || 'var(--primary-light)'
                      }}>
                        {activeProject.categoryName} Pillar • Total Time Logged: <strong>{formatDurationHuman(activeProject.totalTrackedMinutes)}</strong>
                      </span>
                    </div>
                  </div>
                  {activeProject.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.35rem 0 0', maxWidth: '600px' }}>
                      {activeProject.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      startTimer({
                        activityName: `${activeProject.name}`,
                        categoryId: activeProject.categoryId,
                        projectId: activeProject.id,
                        description: `Working on project ${activeProject.name}`
                      });
                      triggerSound('start-focus');
                    }}
                    style={{ gap: '0.4rem', fontSize: '0.82rem' }}
                  >
                    <Play size={14} fill="currentColor" />
                    <span>Track Time on Project</span>
                  </button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* TOP SECTION: ADD TASK TO THIS PROJECT FORM */}
              {/* ========================================================================= */}
              <form onSubmit={handleQuickAddTask} style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.65), rgba(15, 23, 42, 0.85))',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.15rem',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem' 
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: 'var(--primary-light)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}>
                    <ListPlus size={16} />
                    <span>Add Task to this Project</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Set title, status & priority
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Task Title Input */}
                  <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Design UI components, write tests, deploy..."
                      value={quickTaskTitle}
                      onChange={(e) => setQuickTaskTitle(e.target.value)}
                      style={{ 
                        fontSize: '0.88rem', 
                        padding: '0.65rem 1rem',
                        background: 'rgba(15, 23, 42, 0.85)' 
                      }}
                    />
                  </div>

                  {/* Task Status Dropdown */}
                  <div style={{ width: '130px', flexShrink: 0 }}>
                    <select
                      className="input"
                      value={quickTaskStatus}
                      onChange={(e) => setQuickTaskStatus(e.target.value)}
                      style={{ 
                        fontSize: '0.82rem',
                        padding: '0.65rem 0.85rem',
                        background: 'rgba(15, 23, 42, 0.85)'
                      }}
                      title="Initial Task Status"
                    >
                      <option value="todo">⚪ To Do</option>
                      <option value="in_progress">🟡 In Progress</option>
                      <option value="done">🟢 Done</option>
                    </select>
                  </div>

                  {/* Priority Dropdown */}
                  <div style={{ width: '120px', flexShrink: 0 }}>
                    <select
                      className="input"
                      value={quickTaskPriority}
                      onChange={(e) => setQuickTaskPriority(e.target.value)}
                      style={{ 
                        fontSize: '0.82rem',
                        padding: '0.65rem 0.8rem',
                        background: 'rgba(15, 23, 42, 0.85)'
                      }}
                      title="Task Priority"
                    >
                      <option value="high">🔴 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🔵 Low</option>
                    </select>
                  </div>

                  {/* Today Focus Toggle */}
                  <button
                    type="button"
                    className={`btn btn-sm ${quickTaskIsToday ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setQuickTaskIsToday(!quickTaskIsToday)}
                    style={{ fontSize: '0.78rem', padding: '0.65rem 0.75rem', gap: '0.3rem' }}
                    title="Schedule for Today's Focus Queue"
                  >
                    <span>📌</span>
                    <span>{quickTaskIsToday ? 'Today' : 'Later'}</span>
                  </button>

                  {/* Add Task Button */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!quickTaskTitle.trim()}
                    style={{ 
                      gap: '0.4rem', 
                      fontWeight: 800, 
                      padding: '0.65rem 1.25rem',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      boxShadow: '0 2px 12px rgba(99, 102, 241, 0.4)',
                      flexShrink: 0
                    }}
                  >
                    <Plus size={16} />
                    <span>Add Task</span>
                  </button>
                </div>
              </form>

              {/* ========================================================================= */}
              {/* TASKS LIST SECTION (WITH STATUS FILTERS & STATUS CHANGER) */}
              {/* ========================================================================= */}
              <div>
                {/* Header & Status Filter Pills */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                      Tasks ({taskCounts.all})
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      • {taskCounts.done} Completed ({taskCounts.all > 0 ? Math.round((taskCounts.done / taskCounts.all) * 100) : 0}%)
                    </span>
                  </div>

                  {/* Task Status Filters */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${taskStatusFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setTaskStatusFilter('all')}
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
                    >
                      All ({taskCounts.all})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${taskStatusFilter === 'todo' ? 'btn-secondary' : 'btn-ghost'}`}
                      onClick={() => setTaskStatusFilter('todo')}
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.2rem 0.55rem',
                        border: taskStatusFilter === 'todo' ? '1px solid #94a3b8' : undefined
                      }}
                    >
                      ⚪ To Do ({taskCounts.todo})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${taskStatusFilter === 'in_progress' ? 'btn-secondary' : 'btn-ghost'}`}
                      onClick={() => setTaskStatusFilter('in_progress')}
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.2rem 0.55rem',
                        border: taskStatusFilter === 'in_progress' ? '1px solid #f59e0b' : undefined,
                        color: taskStatusFilter === 'in_progress' ? '#f59e0b' : undefined
                      }}
                    >
                      🟡 In Progress ({taskCounts.in_progress})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${taskStatusFilter === 'done' ? 'btn-secondary' : 'btn-ghost'}`}
                      onClick={() => setTaskStatusFilter('done')}
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.2rem 0.55rem',
                        border: taskStatusFilter === 'done' ? '1px solid #10b981' : undefined,
                        color: taskStatusFilter === 'done' ? '#10b981' : undefined
                      }}
                    >
                      🟢 Done ({taskCounts.done})
                    </button>
                  </div>
                </div>

                {/* Tasks Render */}
                {activeProjectTasks.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px dashed var(--border-color)'
                  }}>
                    <CheckSquare size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>
                      {taskStatusFilter === 'all' 
                        ? 'No tasks in this project yet. Use the form above to add your first task!' 
                        : `No tasks matching the "${taskStatusFilter.replace('_', ' ')}" status.`}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {activeProjectTasks.map((task) => {
                      const isDone = task.status === 'done' || task.completed;
                      const isInProgress = task.status === 'in_progress';
                      const isTodo = task.status === 'todo' || (!isDone && !isInProgress);
                      const priorityColor = task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#06b6d4';

                      return (
                        <div
                          key={task.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.85rem 1.15rem',
                            borderRadius: 'var(--radius-md)',
                            background: isDone 
                              ? 'rgba(16, 185, 129, 0.05)' 
                              : isInProgress 
                                ? 'rgba(245, 158, 11, 0.05)' 
                                : 'var(--bg-surface)',
                            border: isDone 
                              ? '1px solid rgba(16, 185, 129, 0.3)' 
                              : isInProgress 
                                ? '1px solid rgba(245, 158, 11, 0.35)' 
                                : '1px solid var(--border-color)',
                            transition: 'all var(--transition-fast)',
                            gap: '0.75rem',
                            flexWrap: 'wrap'
                          }}
                        >
                          {/* Checkbox / Status Quick Toggle & Title */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 220px', minWidth: '180px' }}>
                            <div
                              onClick={() => toggleTask(activeProject.categoryId, activeProject.id, task.id)}
                              style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                borderRadius: '7px',
                                background: isDone 
                                  ? '#10b981' 
                                  : isInProgress 
                                    ? 'rgba(245, 158, 11, 0.2)' 
                                    : 'rgba(255, 255, 255, 0.05)',
                                border: isDone 
                                  ? '1px solid #10b981' 
                                  : isInProgress 
                                    ? '1px solid #f59e0b' 
                                    : '1px solid var(--border-color)',
                                transition: 'all var(--transition-fast)',
                                flexShrink: 0
                              }}
                              title={isDone ? 'Mark as In Progress' : 'Mark as Done'}
                            >
                              {isDone && <Check size={15} color="#ffffff" strokeWidth={3} />}
                              {isInProgress && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{
                                fontSize: '0.94rem',
                                fontWeight: isDone ? 500 : 700,
                                color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                                textDecoration: isDone ? 'line-through' : 'none',
                                lineHeight: '1.3',
                                display: 'block'
                              }}>
                                {task.title}
                              </span>
                            </div>
                          </div>

                          {/* Task Status Selector, Badges & Action Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0, flexWrap: 'wrap' }}>
                            {/* Interactive Task Status Selector */}
                            <select
                              value={task.status || (isDone ? 'done' : 'todo')}
                              onChange={(e) => handleUpdateTaskStatus(task, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '0.2rem 0.55rem',
                                borderRadius: 'var(--radius-full)',
                                border: isDone 
                                  ? '1px solid rgba(16, 185, 129, 0.4)' 
                                  : isInProgress 
                                    ? '1px solid rgba(245, 158, 11, 0.4)' 
                                    : '1px solid rgba(148, 163, 184, 0.4)',
                                background: isDone 
                                  ? 'rgba(16, 185, 129, 0.18)' 
                                  : isInProgress 
                                    ? 'rgba(245, 158, 11, 0.18)' 
                                    : 'rgba(148, 163, 184, 0.15)',
                                color: isDone ? '#10b981' : isInProgress ? '#f59e0b' : '#94a3b8',
                                cursor: 'pointer',
                                width: 'auto',
                                minWidth: '105px'
                              }}
                              title="Change task status"
                            >
                              <option value="todo">⚪ To Do</option>
                              <option value="in_progress">🟡 In Progress</option>
                              <option value="done">🟢 Done</option>
                            </select>

                            {/* Today Focus Toggle */}
                            <button
                              type="button"
                              className={`btn btn-sm ${task.isToday ? 'btn-primary' : 'btn-ghost'}`}
                              onClick={() => toggleTaskToday(activeProject.categoryId, activeProject.id, task.id)}
                              title={task.isToday ? "Scheduled for Today's Focus Board" : "Add to Today's Focus Board"}
                              style={{ 
                                fontSize: '0.7rem', 
                                padding: '0.2rem 0.5rem',
                                border: task.isToday ? undefined : '1px solid var(--border-color)' 
                              }}
                            >
                              <span>📌</span>
                              <span style={{ display: 'none' }}>{task.isToday ? 'Today' : '+Today'}</span>
                            </button>

                            {/* Tracked Time Badge */}
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: (task.trackedMinutes || 0) > 0 ? '#38bdf8' : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: 'rgba(255, 255, 255, 0.04)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-full)'
                            }} title="Total time tracked on this task">
                              <Clock size={12} />
                              {formatDurationHuman(task.trackedMinutes || 0)}
                            </span>

                            {/* Priority Badge */}
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '0.2rem 0.45rem',
                              borderRadius: '4px',
                              background: `${priorityColor}1a`,
                              color: priorityColor,
                              border: `1px solid ${priorityColor}40`
                            }}>
                              {task.priority || 'medium'}
                            </span>

                            {/* Start Timer on this Task Button */}
                            <button
                              type="button"
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => handleStartTaskTimer(task, activeProject)}
                              title="Start Focus Timer on this Task"
                              style={{ color: '#06b6d4' }}
                            >
                              <Play size={14} fill="currentColor" />
                            </button>

                            {/* Delete Task */}
                            <button
                              type="button"
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => deleteTask(activeProject.categoryId, activeProject.id, task.id)}
                              title="Delete Task"
                              style={{ color: '#ef4444', opacity: 0.7 }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <FolderKanban size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Project Selected</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                Select a project on the left or create a brand new one to manage its tasks and track time.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsNewProjectModalOpen(true)}
              >
                <Plus size={16} />
                <span>Create New Project</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW PROJECT WITH INITIAL TASKS */}
      {/* ========================================================================= */}
      {isNewProjectModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewProjectModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
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
                  <FolderKanban size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Create New Project</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Define the project and add its initial tasks.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setIsNewProjectModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Project Name */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. RHIZAN Enterprise Architecture"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Pillar / Category & Initial Status */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                      Life Pillar / Category *
                    </label>
                    <select
                      className="input"
                      value={newProjectCategory}
                      onChange={(e) => setNewProjectCategory(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      {(data.categories || []).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                      Project Status
                    </label>
                    <select
                      className="input"
                      value={newProjectStatus}
                      onChange={(e) => setNewProjectStatus(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="in_progress">🟡 In Progress</option>
                      <option value="done">🟢 Done</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Description / Outcome (Optional)
                  </label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="What is the outcome of this project?"
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    style={{ width: '100%', resize: 'none' }}
                  />
                </div>

                {/* Initial Tasks */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, margin: 0 }}>
                      Initial Tasks (Optional)
                    </label>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={addInitialTaskField}
                      style={{ fontSize: '0.75rem', color: 'var(--primary-light)', padding: '0.1rem 0.4rem' }}
                    >
                      + Add Task
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {initialTaskInputs.map((taskStr, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="input input-sm"
                          placeholder={`Task ${idx + 1}...`}
                          value={taskStr}
                          onChange={(e) => updateInitialTaskField(idx, e.target.value)}
                          style={{ flex: 1 }}
                        />
                        {initialTaskInputs.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => removeInitialTaskField(idx)}
                            style={{ color: '#ef4444' }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsNewProjectModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newProjectName.trim()}
                  style={{ gap: '0.4rem', fontWeight: 800 }}
                >
                  <Plus size={16} />
                  <span>Create Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
