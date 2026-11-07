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
  Moon, 
  Sunrise, 
  ChevronRight,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { 
  getDayKeyFromDateStr,
  isRoutineScheduledForDay
} from '@/utils/calculations';

interface TodayExecutionBoardProps {
  onOpenRoutineModal?: () => void;
  onOpenPillarModal?: () => void;
}

export const TodayExecutionBoard: React.FC<TodayExecutionBoardProps> = ({
  onOpenRoutineModal,
  onOpenPillarModal
}) => {
  const { 
    data, 
    todayStr, 
    setActiveTab, 
    setActiveModal,
    setModalData,
    logRoutineTaskExecution
  } = useApp();

  const [selectedPillarFilter, setSelectedPillarFilter] = useState('all');

  const routines = data.routines || [];
  const categories = data.categories || [];
  const routineLogs = data.routineLogsHistory?.[todayStr] || {};
  const todayDayKey = getDayKeyFromDateStr(todayStr);

  // Filter routines scheduled for today
  const scheduledTodayRoutines = useMemo(() => {
    return routines.filter((r: any) => isRoutineScheduledForDay(r, todayDayKey));
  }, [routines, todayDayKey]);

  // Apply pillar filter if selected
  const filteredRoutines = useMemo(() => {
    if (selectedPillarFilter === 'all') return scheduledTodayRoutines;
    return scheduledTodayRoutines.filter((r: any) => r.categoryId === selectedPillarFilter);
  }, [scheduledTodayRoutines, selectedPillarFilter]);

  // Group by Time of Day
  const grouped = useMemo(() => {
    return {
      morning: filteredRoutines.filter((r: any) => r.timeOfDay === 'morning'),
      afternoon: filteredRoutines.filter((r: any) => r.timeOfDay === 'afternoon'),
      evening: filteredRoutines.filter((r: any) => r.timeOfDay === 'evening'),
      anytime: filteredRoutines.filter((r: any) => !r.timeOfDay || r.timeOfDay === 'anytime')
    };
  }, [filteredRoutines]);

  const completedCount = useMemo(() => {
    return scheduledTodayRoutines.filter((r: any) => {
      const log = routineLogs[r.id];
      return log && (log.completed || log.status === 'done' || log.status === 'completed');
    }).length;
  }, [scheduledTodayRoutines, routineLogs]);

  const progressPct = scheduledTodayRoutines.length > 0 
    ? Math.round((completedCount / scheduledTodayRoutines.length) * 100) 
    : 0;

  const handleLaunchRunner = (routine: any) => {
    setModalData(routine);
    setActiveModal('routine_runner');
  };

  const handleToggleRoutine = (routineId: string) => {
    const isCurrentlyDone = routineLogs[routineId]?.completed || routineLogs[routineId]?.status === 'done';
    logRoutineTaskExecution(routineId, isCurrentlyDone ? 'missed' : 'done');
  };

  const renderTimeSection = (title: string, icon: React.ReactNode, sectionRoutines: any[]) => {
    if (sectionRoutines.length === 0) return null;

    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {icon}
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{title}</h4>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            ({sectionRoutines.length})
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {sectionRoutines.map((routine: any) => {
            const log = routineLogs[routine.id] || {};
            const isDone = log.completed || log.status === 'done' || log.status === 'completed';
            const pillar = categories.find((c: any) => c.id === routine.categoryId);
            const pillarColor = routine.color || pillar?.color || '#6366f1';
            const pillarIcon = routine.icon || pillar?.icon || '⚡';
            const stepsCount = routine.steps?.length || 0;

            return (
              <div
                key={routine.id}
                className="card"
                style={{
                  padding: '1rem',
                  borderLeft: `4px solid ${pillarColor}`,
                  background: isDone ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
                  borderColor: isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Left: Info */}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      {/* Dynamic Pillar Tag */}
                      <span 
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          background: `${pillarColor}20`,
                          color: pillarColor,
                          border: `1px solid ${pillarColor}40`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <span>{pillarIcon}</span>
                        <span>{pillar?.name || 'Custom Pillar'}</span>
                      </span>

                      {/* Duration */}
                      {(routine.durationMinutes || routine.duration) ? (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Clock size={11} />
                          <span>{routine.durationMinutes || routine.duration}m</span>
                        </span>
                      ) : null}

                      {/* Steps Count */}
                      {stepsCount > 0 && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          • {stepsCount} steps
                        </span>
                      )}
                    </div>

                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      marginBottom: '0.25rem',
                      textDecoration: isDone ? 'line-through' : 'none',
                      color: isDone ? 'var(--text-muted)' : 'var(--text-primary)'
                    }}>
                      {routine.title || routine.name}
                    </h3>

                    {routine.description && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                        {routine.description}
                      </p>
                    )}

                    {/* Steps Checklist mini preview */}
                    {stepsCount > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.4rem' }}>
                        {routine.steps.map((st: any, idx: number) => {
                          const isStepCompleted = log.completedSteps?.includes(st.id) || isDone;
                          return (
                            <span
                              key={st.id || idx}
                              style={{
                                fontSize: '0.68rem',
                                padding: '0.12rem 0.45rem',
                                borderRadius: '4px',
                                background: isStepCompleted ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)',
                                color: isStepCompleted ? '#10b981' : 'var(--text-muted)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              {isStepCompleted ? <Check size={10} /> : <Circle size={8} />}
                              <span>{st.title}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Actions: Guided Runner & Quick Check */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Launch Guided Runner Button */}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleLaunchRunner(routine)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.78rem',
                        gap: '0.35rem',
                        fontWeight: 700
                      }}
                    >
                      <Play size={13} fill="currentColor" />
                      <span>Run Guided</span>
                    </button>

                    {/* Big Tactile Checkbox */}
                    <button
                      className={`btn ${isDone ? 'btn-success' : 'btn-ghost'}`}
                      onClick={() => handleToggleRoutine(routine.id)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        gap: '0.35rem',
                        borderRadius: 'var(--radius-md)',
                        border: isDone ? 'none' : '1px solid var(--border-color)',
                        background: isDone ? '#10b981' : 'var(--bg-input)',
                        color: isDone ? '#ffffff' : 'var(--text-secondary)'
                      }}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <Circle size={16} />
                          <span>Complete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Header & Pillar Filter Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Today's Execution Board</h3>
            <span 
              className="badge" 
              style={{ 
                background: progressPct === 100 ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-surface)', 
                color: progressPct === 100 ? '#10b981' : 'var(--primary-light)',
                fontWeight: 700
              }}
            >
              {completedCount} / {scheduledTodayRoutines.length} Done ({progressPct}%)
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Track and complete your scheduled daily routines across all focus pillars
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenPillarModal || (() => setActiveTab('routines'))}
            style={{ fontSize: '0.78rem', gap: '0.35rem' }}
          >
            <Layers size={14} />
            <span>Manage Pillars</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={onOpenRoutineModal || (() => setActiveModal('routine_modal'))}
            style={{ fontSize: '0.78rem', gap: '0.35rem', fontWeight: 700 }}
          >
            <Plus size={14} />
            <span>New Routine</span>
          </button>
        </div>
      </div>

      {/* Dynamic Pillar Filter Tabs */}
      <div 
        style={{
          display: 'flex',
          gap: '0.45rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          marginBottom: '1.25rem',
          scrollbarWidth: 'none'
        }}
      >
        <button
          className={`btn btn-sm ${selectedPillarFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setSelectedPillarFilter('all')}
          style={{
            fontSize: '0.75rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            whiteSpace: 'nowrap',
            fontWeight: selectedPillarFilter === 'all' ? 700 : 500
          }}
        >
          All Pillars ({scheduledTodayRoutines.length})
        </button>

        {categories.map((pillar: any) => {
          const count = scheduledTodayRoutines.filter((r: any) => r.categoryId === pillar.id).length;
          const completedInPillar = scheduledTodayRoutines.filter(
            (r: any) => r.categoryId === pillar.id && (routineLogs[r.id]?.completed || routineLogs[r.id]?.status === 'done')
          ).length;
          const isSelected = selectedPillarFilter === pillar.id;

          return (
            <button
              key={pillar.id}
              className={`btn btn-sm ${isSelected ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setSelectedPillarFilter(pillar.id)}
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: isSelected ? pillar.color : 'var(--border-color)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <span>{pillar.icon}</span>
              <span>{pillar.name}</span>
              <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>
                ({completedInPillar}/{count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRoutines.length === 0 ? (
        <div 
          className="card" 
          style={{ 
            textAlign: 'center', 
            padding: '2.5rem 1.5rem',
            background: 'var(--bg-card)',
            border: '1px dashed var(--border-color)'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--bg-input)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '1.5rem'
          }}>
            ⚡
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            No routines scheduled for this filter
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', maxWidth: '400px', margin: '0 auto 1rem' }}>
            Create a custom routine attached to your focus pillars, or schedule routines for today.
          </p>
          <button
            className="btn btn-primary"
            onClick={onOpenRoutineModal || (() => setActiveModal('routine_modal'))}
            style={{ fontWeight: 700, gap: '0.4rem' }}
          >
            <Plus size={16} />
            <span>Create Your First Routine</span>
          </button>
        </div>
      ) : (
        <div>
          {renderTimeSection('🌅 Morning Routines', <Sunrise size={18} color="#f59e0b" />, grouped.morning)}
          {renderTimeSection('☀️ Afternoon Routines', <SunMedium size={18} color="#06b6d4" />, grouped.afternoon)}
          {renderTimeSection('🌙 Evening Shutdown Routines', <Moon size={18} color="#a855f7" />, grouped.evening)}
          {renderTimeSection('⚡ Anytime Routines', <Sparkles size={18} color="var(--primary-light)" />, grouped.anytime)}
        </div>
      )}
    </div>
  );
};
