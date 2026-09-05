import React, { useState } from 'react';
import { Play, SunMedium, Moon, Sunrise, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getCategoryMeta } from '../../utils/calculations';

export const QuickRoutineWidget = () => {
  const { data, setActiveTab, setActiveModal, setModalData } = useApp();
  const routines = data.routines || [];
  const categories = data.categories || [];
  const [selectedRoutineId, setSelectedRoutineId] = useState(routines[0]?.id || 'r_morning');

  const activeRoutine = routines.find((r) => r.id === selectedRoutineId) || routines[0];
  const totalDuration = (activeRoutine?.activities || []).reduce((acc, curr) => acc + (curr.duration || 0), 0);

  const startRoutineRunner = (routine) => {
    setModalData(routine);
    setActiveModal('routine_runner');
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h3 className="card-title">
            <span>🔄</span>
            <span>Daily Routines</span>
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Structured execution blocks for peak discipline
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setActiveTab('routines')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <span>All Routines</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Routine Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {routines.map((routine) => {
          const isSelected = routine.id === activeRoutine?.id;
          return (
            <button
              key={routine.id}
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedRoutineId(routine.id)}
              style={{ fontSize: '0.78rem', gap: '0.35rem' }}
            >
              <span>{routine.icon}</span>
              <span>{routine.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Routine Detail Box */}
      {activeRoutine && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{activeRoutine.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{activeRoutine.name}</span>
              </div>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)' }}>
                <Clock size={12} />
                {totalDuration} mins
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              {activeRoutine.tagline || activeRoutine.timeSlot}
            </p>

            {/* Activities List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem' }}>
              {(activeRoutine.activities || []).slice(0, 4).map((activity, idx) => {
                const meta = getCategoryMeta(activity.categoryId, categories);
                return (
                  <div
                    key={activity.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      padding: '0.45rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-card)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>#{idx + 1}</span>
                      <span>{activity.title}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{activity.duration}m</span>
                  </div>
                );
              })}
              {(activeRoutine.activities?.length || 0) > 4 && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  +{activeRoutine.activities.length - 4} more steps...
                </div>
              )}
            </div>
          </div>

          {/* Action Trigger */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'auto', gap: '0.5rem' }}
            onClick={() => startRoutineRunner(activeRoutine)}
          >
            <Play size={15} fill="currentColor" />
            <span>Launch Guided Routine</span>
          </button>
        </div>
      )}
    </div>
  );
};
