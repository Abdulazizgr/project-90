'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Circle,
  Play, 
  Layers, 
  SunMedium, 
  Filter,
  Check,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { isRoutineScheduledForDay, getDayKeyFromDateStr, formatDurationHuman } from '@/utils/calculations';

export const RoutinesView = () => {
  const { 
    data, 
    todayStr, 
    deleteRoutine, 
    setActiveModal, 
    setModalData, 
    logRoutineTaskExecution,
    triggerSound 
  } = useApp();

  const routines = data.routines || [];
  const categories = data.categories || [];
  const todayLogs = data.routineLogsHistory?.[todayStr] || {};
  const todayDayKey = getDayKeyFromDateStr(todayStr);

  // Filters
  const [activeFilter, setActiveFilter] = useState<'today' | 'all'>('today');
  const [selectedPillarFilter, setSelectedPillarFilter] = useState('all');

  const filteredRoutines = useMemo(() => {
    return routines.filter((r: any) => {
      // Category / Pillar filter
      if (selectedPillarFilter !== 'all' && r.categoryId !== selectedPillarFilter) {
        return false;
      }
      if (activeFilter === 'today') {
        if (!isRoutineScheduledForDay(r, todayDayKey)) return false;
      }
      return true;
    });
  }, [routines, selectedPillarFilter, activeFilter, todayDayKey]);

  const handleEditRoutine = (routine: any) => {
    setModalData(routine);
    setActiveModal('routine_modal');
  };

  const handleDeleteRoutine = (routineId: string, title: string) => {
    if (confirm(`Delete routine "${title}"?`)) {
      deleteRoutine(routineId);
      triggerSound('pop');
    }
  };

  const handleLaunchRunner = (routine: any) => {
    setModalData(routine);
    setActiveModal('routine_runner');
  };

  const handleToggleRoutineToday = (routineId: string) => {
    const isDone = todayLogs[routineId]?.completed || todayLogs[routineId]?.status === 'done';
    logRoutineTaskExecution(routineId, isDone ? 'missed' : 'done');
  };

  return (
    <div className="page-container" style={{ paddingBottom: '5rem' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SunMedium size={24} color="var(--primary-light)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Daily Routines</h1>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Your core daily routines with scheduled start and end times across your focus pillars.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setModalData(null);
              setActiveModal('routine_modal');
            }}
            style={{ gap: '0.35rem', fontWeight: 800 }}
          >
            <Plus size={15} />
            <span>Create Routine</span>
          </button>
        </div>
      </div>

      {/* Routine Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        padding: '0.75rem 1rem',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)'
      }}>
        {/* View Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeFilter === 'today' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveFilter('today')}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.85rem', fontWeight: 700 }}
          >
            Today's Schedule
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveFilter('all')}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.85rem', fontWeight: 700 }}
          >
            All Routines ({routines.length})
          </button>
        </div>

        {/* Pillar Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <select
            className="input"
            value={selectedPillarFilter}
            onChange={(e) => setSelectedPillarFilter(e.target.value)}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem', width: 'auto' }}
          >
            <option value="all">All Categories</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Routine Cards Grid */}
      {filteredRoutines.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'transparent', border: '1px dashed var(--border-color)' }}>
          <SunMedium size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            No routines found for this filter
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Adjust your day filter or create a new routine to schedule your day.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setModalData(null);
              setActiveModal('routine_modal');
            }}
            style={{ fontWeight: 700, gap: '0.4rem' }}
          >
            <Plus size={16} />
            <span>Create Routine</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))', gap: '1rem' }}>
          {filteredRoutines.map((routine: any) => {
            const pillar = categories.find((c: any) => c.id === routine.categoryId);
            const pillarColor = routine.color || pillar?.color || '#6366f1';
            const pillarIcon = routine.icon || pillar?.icon || '⚡';
            const log = todayLogs[routine.id] || {};
            const isDoneToday = log.completed || log.status === 'done' || log.status === 'completed';
            const stepsCount = routine.steps?.length || 0;
            const daysScheduled = routine.assignedDays || routine.days || ['daily'];
            const dur = routine.durationMinutes || 30;

            return (
              <div
                key={routine.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  borderTop: `4px solid ${pillarColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: isDoneToday ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
                  border: isDoneToday ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-color)',
                  borderTopColor: pillarColor
                }}
              >
                <div>
                  {/* Top Bar: Pillar & Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        background: `${pillarColor}20`,
                        color: pillarColor,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <span>{pillarIcon}</span>
                      <span>{pillar?.name || 'Category'}</span>
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => handleEditRoutine(routine)}
                        title="Edit Routine"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => handleDeleteRoutine(routine.id, routine.name || routine.title)}
                        title="Delete Routine"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                    {routine.name || routine.title}
                  </h3>
                  {routine.description && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                      {routine.description}
                    </p>
                  )}

                  {/* Time & Duration Pill */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="mono" style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: 'var(--bg-input)',
                      padding: '0.25rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <Clock size={13} color="var(--primary-light)" />
                      {routine.startTime && routine.endTime ? `${routine.startTime} – ${routine.endTime}` : `${dur}m block`}
                    </span>

                    <span className="badge" style={{ fontSize: '0.68rem', background: 'var(--bg-input)' }}>
                      ⏱️ {formatDurationHuman(dur)}
                    </span>

                    {stepsCount > 0 && (
                      <span className="badge" style={{ fontSize: '0.68rem', background: 'var(--bg-input)' }}>
                        ✓ {stepsCount} steps
                      </span>
                    )}
                  </div>

                  {/* Assigned Days */}
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {daysScheduled.includes('daily') ? (
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Daily</span>
                    ) : (
                      ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => {
                        const isAssigned = daysScheduled.includes(d);
                        return (
                          <span
                            key={d}
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              background: isAssigned ? 'var(--primary)' : 'var(--bg-input)',
                              color: isAssigned ? '#fff' : 'var(--text-muted)'
                            }}
                          >
                            {d}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Footer Controls: Runner & Today Checkbox */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-color)',
                  gap: '0.5rem'
                }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleLaunchRunner(routine)}
                    style={{ gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Focus Runner</span>
                  </button>

                  <button
                    type="button"
                    className={`btn btn-sm ${isDoneToday ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleToggleRoutineToday(routine.id)}
                    style={{ gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    {isDoneToday ? (
                      <>
                        <Check size={14} />
                        <span>Done Today</span>
                      </>
                    ) : (
                      <span>Mark Done</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
