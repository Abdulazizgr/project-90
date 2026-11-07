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
  Check
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { isRoutineScheduledForDay, getDayKeyFromDateStr } from '@/utils/calculations';

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

  const [activeTabSub, setActiveTabSub] = useState<'routines' | 'pillars'>('routines');
  const [selectedPillarFilter, setSelectedPillarFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState<'today' | 'all'>('today');

  const filteredRoutines = useMemo(() => {
    return routines.filter((r: any) => {
      // Pillar filter
      if (selectedPillarFilter !== 'all' && r.categoryId !== selectedPillarFilter) {
        return false;
      }
      // Day filter
      if (dayFilter === 'today' && !isRoutineScheduledForDay(r, todayDayKey)) {
        return false;
      }
      return true;
    });
  }, [routines, selectedPillarFilter, dayFilter, todayDayKey]);

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
    <div className="page-container">
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
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Pillars & Routines</h1>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Design and execute your daily workflows attached to your dynamic focus pillars
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveModal('pillar_modal')}
            style={{ gap: '0.35rem', fontWeight: 700 }}
          >
            <Layers size={14} />
            <span>Manage Pillars</span>
          </button>

          <button
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

      {/* Filter Bar */}
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
        {/* Day Filter */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            className={`btn btn-sm ${dayFilter === 'today' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setDayFilter('today')}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
          >
            Today's Schedule
          </button>
          <button
            className={`btn btn-sm ${dayFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setDayFilter('all')}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
          >
            All Routines ({routines.length})
          </button>
        </div>

        {/* Pillar Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflowX: 'auto', maxWidth: '100%' }}>
          <button
            className={`btn btn-sm ${selectedPillarFilter === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setSelectedPillarFilter('all')}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
          >
            All Pillars
          </button>

          {categories.map((p: any) => (
            <button
              key={p.id}
              className={`btn btn-sm ${selectedPillarFilter === p.id ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setSelectedPillarFilter(p.id)}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.65rem',
                whiteSpace: 'nowrap',
                borderColor: selectedPillarFilter === p.id ? p.color : 'transparent'
              }}
            >
              <span>{p.icon}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Routine Cards Grid */}
      {filteredRoutines.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <SunMedium size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            No routines found
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            {dayFilter === 'today' 
              ? 'No routines are scheduled for today under this filter. Try selecting "All Routines".'
              : 'Create your first daily routine and assign it to one of your focus pillars.'}
          </p>
          <button
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredRoutines.map((routine: any) => {
            const pillar = categories.find((c: any) => c.id === routine.categoryId);
            const pillarColor = routine.color || pillar?.color || '#6366f1';
            const pillarIcon = routine.icon || pillar?.icon || '⚡';
            const log = todayLogs[routine.id] || {};
            const isDoneToday = log.completed || log.status === 'done' || log.status === 'completed';
            const stepsCount = routine.steps?.length || 0;
            const daysScheduled = routine.days || ['daily'];

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
                  background: isDoneToday ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)'
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
                      <span>{pillar?.name || 'Custom Pillar'}</span>
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => handleEditRoutine(routine)}
                        title="Edit Routine"
                        style={{ padding: '0.3rem' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => handleDeleteRoutine(routine.id, routine.title || routine.name)}
                        title="Delete Routine"
                        style={{ padding: '0.3rem', color: '#ef4444' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Time */}
                  <h3 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                    {routine.title || routine.name}
                  </h3>

                  {routine.description && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.35 }}>
                      {routine.description}
                    </p>
                  )}

                  {/* Metadata Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                    <span className="badge" style={{ fontSize: '0.68rem', background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                      🕒 {routine.timeOfDay ? routine.timeOfDay.toUpperCase() : 'ANYTIME'}
                    </span>

                    {(routine.durationMinutes || routine.duration) ? (
                      <span className="badge" style={{ fontSize: '0.68rem', background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                        ⏳ {routine.durationMinutes || routine.duration} mins
                      </span>
                    ) : null}

                    {stepsCount > 0 && (
                      <span className="badge" style={{ fontSize: '0.68rem', background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                        📋 {stepsCount} steps
                      </span>
                    )}

                    <span className="badge" style={{ fontSize: '0.68rem', background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                      📅 {daysScheduled.includes('daily') ? 'Daily' : daysScheduled.join(', ').toUpperCase()}
                    </span>
                  </div>

                  {/* Steps preview */}
                  {stepsCount > 0 && (
                    <div style={{ marginBottom: '1.1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {routine.steps.slice(0, 3).map((st: any, idx: number) => (
                          <div
                            key={st.id || idx}
                            style={{
                              fontSize: '0.74rem',
                              color: 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            <span style={{ fontSize: '0.65rem' }}>•</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {st.title}
                            </span>
                          </div>
                        ))}
                        {stepsCount > 3 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                            +{stepsCount - 3} more steps
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div style={{
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {/* Guided Runner */}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleLaunchRunner(routine)}
                    style={{ flex: 1, gap: '0.35rem', fontWeight: 700, fontSize: '0.78rem' }}
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Run Guided</span>
                  </button>

                  {/* Quick Toggle Checkbox */}
                  <button
                    className={`btn btn-sm ${isDoneToday ? 'btn-success' : 'btn-ghost'}`}
                    onClick={() => handleToggleRoutineToday(routine.id)}
                    style={{
                      gap: '0.35rem',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      background: isDoneToday ? '#10b981' : 'var(--bg-input)',
                      color: isDoneToday ? '#ffffff' : 'var(--text-secondary)'
                    }}
                  >
                    {isDoneToday ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                    <span>{isDoneToday ? 'Done Today' : 'Mark Done'}</span>
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
