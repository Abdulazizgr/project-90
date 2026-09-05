import React from 'react';
import { 
  Play, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  SunMedium, 
  Sunrise, 
  Moon, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getCategoryMeta } from '../../utils/calculations';

export const RoutinesView = () => {
  const { 
    data, 
    deleteRoutine, 
    setActiveModal, 
    setModalData,
    setActiveTab
  } = useApp();

  const routines = data.routines || [];
  const categories = data.categories || [];

  const handleLaunch = (routine) => {
    setModalData(routine);
    setActiveModal('routine_runner');
  };

  const handleEdit = (routine) => {
    setModalData(routine);
    setActiveModal('edit_routine');
  };

  const handleAdd = () => {
    setModalData(null);
    setActiveModal('add_routine');
  };

  return (
    <div className="page-container">
      {/* Header Deck */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.9), rgba(15, 23, 42, 0.9))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🔄</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Routines & Structured Protocols</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '580px' }}>
              Transform daily willpower into automated execution systems. Launch guided routine runner mode to stay in flow.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setActiveTab('weekly')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>🗓️ Weekly Schedule</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} />
              <span>Create Daily Routine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {routines.map((routine) => {
          const totalDuration = (routine.activities || []).reduce((acc, curr) => acc + (curr.duration || 0), 0);

          return (
            <div
              key={routine.id}
              className="card"
              style={{
                borderLeft: `5px solid ${routine.color || 'var(--primary)'}`,
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Routine Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                  <span style={{ fontSize: '2rem' }}>{routine.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{routine.name}</h4>
                      <span className="badge" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.75rem' }}>
                        <Clock size={12} />
                        {routine.timeSlot}
                      </span>
                      <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', fontSize: '0.75rem' }}>
                        {totalDuration} mins total
                      </span>
                      <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.75rem', fontWeight: 800 }}>
                        ⭐ {routine.points || (routine.id === 'morning' ? 15 : routine.id === 'evening' ? 15 : 20)} pts (Daily)
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {routine.tagline}
                    </p>
                  </div>
                </div>

                {/* Routine Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    className="btn btn-success"
                    onClick={() => handleLaunch(routine)}
                    style={{ gap: '0.4rem' }}
                  >
                    <Play size={15} fill="currentColor" />
                    <span>Launch Guided Runner</span>
                  </button>

                  <button
                    className="btn btn-secondary btn-icon"
                    onClick={() => handleEdit(routine)}
                    title="Edit Routine"
                  >
                    <Edit3 size={15} />
                  </button>

                  {routines.length > 1 && (
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => deleteRoutine(routine.id)}
                      title="Delete Routine"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Step Sequence Chips */}
              <div style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Sequence of {(routine.activities || []).length} Activities
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '0.65rem'
                }}>
                  {(routine.activities || []).map((activity, idx) => {
                    const meta = getCategoryMeta(activity.categoryId, categories);
                    return (
                      <div
                        key={activity.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-color-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                          <span style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'var(--bg-card)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'var(--text-muted)'
                          }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {activity.title}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: meta.color, fontWeight: 700, marginLeft: '0.5rem' }}>
                          {activity.duration}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
