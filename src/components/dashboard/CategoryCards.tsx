'use client';

import React from 'react';
import { Layers, Plus, ChevronRight, SunMedium } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getDayKeyFromDateStr, isRoutineScheduledForDay } from '@/utils/calculations';

interface CategoryCardsProps {
  onOpenCategoryManager?: () => void;
  onOpenRoutineModal?: () => void;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({ 
  onOpenCategoryManager,
  onOpenRoutineModal
}) => {
  const { data, todayStr, setActiveTab, setActiveModal, setModalData } = useApp();
  const categories = data.categories || [];
  const routines = data.routines || [];
  const todayDayKey = getDayKeyFromDateStr(todayStr);
  const todayLogs = data.routineLogsHistory?.[todayStr] || {};

  return (
    <div style={{ marginBottom: '2rem' }}>
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>My Focus Pillars</h3>
            <span className="badge" style={{ background: 'var(--bg-surface)', color: 'var(--primary-light)', fontSize: '0.7rem', fontWeight: 700 }}>
              {categories.length} Registered Pillars
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Your custom life pillars and areas of focus. Create and customize whatever you want to build.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenCategoryManager || (() => setActiveModal('pillar_modal'))}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
          >
            <Layers size={14} />
            <span>Manage Pillars</span>
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setActiveTab('routines')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}
          >
            <SunMedium size={14} />
            <span>All Routines</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Grid of Dynamic Pillars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
        gap: '1rem'
      }}>
        {categories.map((pillar: any) => {
          const pillarRoutines = routines.filter((r: any) => r.categoryId === pillar.id);
          const scheduledToday = pillarRoutines.filter((r: any) => isRoutineScheduledForDay(r, todayDayKey));
          const completedToday = scheduledToday.filter((r: any) => {
            const log = todayLogs[r.id];
            return log && (log.completed || log.status === 'done' || log.status === 'completed');
          }).length;

          const pillarColor = pillar.color || '#6366f1';

          return (
            <div
              key={pillar.id}
              className="card"
              style={{
                padding: '1.2rem',
                borderTop: `4px solid ${pillarColor}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: `${pillarColor}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem'
                  }}>
                    {pillar.icon || '🎯'}
                  </div>

                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: scheduledToday.length > 0 && completedToday === scheduledToday.length ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)',
                    color: scheduledToday.length > 0 && completedToday === scheduledToday.length ? '#10b981' : 'var(--text-muted)'
                  }}>
                    {completedToday} / {scheduledToday.length} Done Today
                  </span>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {pillar.name}
                </h4>

                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1rem',
                  lineHeight: 1.4,
                  minHeight: '2.5rem'
                }}>
                  {pillar.description || 'Focus area for building daily discipline.'}
                </p>
              </div>

              {/* Card Footer */}
              <div style={{
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {pillarRoutines.length} {pillarRoutines.length === 1 ? 'Routine' : 'Routines'}
                </span>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setModalData({ categoryId: pillar.id });
                    if (onOpenRoutineModal) onOpenRoutineModal();
                    else setActiveModal('routine_modal');
                  }}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.72rem',
                    gap: '0.25rem',
                    color: pillarColor
                  }}
                >
                  <Plus size={12} />
                  <span>Add Routine</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Create New Pillar Action Card */}
        <div
          className="card"
          onClick={onOpenCategoryManager || (() => setActiveModal('pillar_modal'))}
          style={{
            padding: '1.2rem',
            border: '2px dashed var(--border-color)',
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            minHeight: '170px'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--bg-input)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <Plus size={20} color="var(--primary-light)" />
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.2rem' }}>
            Register New Focus Pillar
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Add whatever custom life area you want to track
          </p>
        </div>
      </div>
    </div>
  );
};
