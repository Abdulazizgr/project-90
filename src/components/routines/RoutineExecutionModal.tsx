import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Flame, 
  Building2, 
  Home, 
  Briefcase,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface RoutineExecutionModalProps {
  routine: any;
  isOpen: boolean;
  onClose: () => void;
}

export const RoutineExecutionModal: React.FC<RoutineExecutionModalProps> = ({
  routine,
  isOpen,
  onClose
}) => {
  const { data, todayStr, logRoutineTaskExecution } = useApp();

  if (!isOpen || !routine) return null;

  const existingLog = data.routineLogsHistory?.[todayStr]?.[routine.id] || {};

  const [status, setStatus] = useState<string>(existingLog.status || 'done');
  const [onTime, setOnTime] = useState<boolean>(existingLog.onTime ?? true);
  const [location, setLocation] = useState<string>(existingLog.location || (routine.type === 'prayer' ? 'mosque' : 'home'));
  const [reason, setReason] = useState<string>(existingLog.reason || '');
  const [notes, setNotes] = useState<string>(existingLog.notes || '');

  useEffect(() => {
    const log = data.routineLogsHistory?.[todayStr]?.[routine.id] || {};
    setStatus(log.status || 'done');
    setOnTime(log.onTime !== undefined ? log.onTime : true);
    setLocation(log.location || (routine.type === 'prayer' ? 'mosque' : 'home'));
    setReason(log.reason || '');
    setNotes(log.notes || '');
  }, [routine?.id, data.routineLogsHistory, todayStr]);

  const commonReasons = [
    'Work overload / client emergency',
    'Meetings ran over schedule',
    'Low energy / needed recovery rest',
    'Traffic / transit delay',
    'Slept past alarm',
    'Family commitment',
    'Lack of preparation',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logRoutineTaskExecution(routine.id, status, {
      onTime,
      location,
      reason: reason.trim(),
      notes: notes.trim()
    });
    onClose();
  };

  const isPrayer = routine.type === 'prayer' || routine.categoryId === 'spiritual' || routine.title?.toLowerCase().includes('prayer') || routine.name?.toLowerCase().includes('prayer');
  const needsReason = status === 'late' || status === 'partial' || status === 'missed';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>{routine.icon || '☀️'}</span>
            <div>
              <h3 className="modal-title">{routine.title || routine.name}</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {routine.timeSlot || 'Scheduled Routine Task'}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Status Selector */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', fontWeight: 700 }}>
                Execution Status *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'done', label: 'Done', color: '#10b981', icon: '✅' },
                  { id: 'late', label: 'Late', color: '#f59e0b', icon: '⏱️' },
                  { id: 'partial', label: 'Partial', color: '#06b6d4', icon: '⏳' },
                  { id: 'missed', label: 'Missed', color: '#ef4444', icon: '❌' }
                ].map((st) => {
                  const isSelected = status === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setStatus(st.id);
                        if (st.id === 'done') setOnTime(true);
                        if (st.id === 'late') setOnTime(false);
                      }}
                      className="btn"
                      style={{
                        padding: '0.65rem 0.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: isSelected ? `${st.color}25` : 'var(--bg-surface)',
                        border: isSelected ? `2px solid ${st.color}` : '1px solid var(--border-color)',
                        color: isSelected ? st.color : 'var(--text-primary)',
                        fontWeight: isSelected ? 800 : 500
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{st.icon}</span>
                      <span style={{ fontSize: '0.78rem' }}>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location Selector (Specifically for Salah / Prayers or location-relevant tasks) */}
            {isPrayer && (
              <div style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                border: '1px solid var(--border-color-subtle)'
              }}>
                <label className="form-label" style={{ marginBottom: '0.4rem', fontWeight: 700 }}>
                  🕌 Prayer Location & Congregation
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'mosque', label: 'In Mosque', icon: '🕌' },
                    { id: 'home', label: 'At Home', icon: '🏠' },
                    { id: 'other', label: 'Work / Travel', icon: '🏢' }
                  ].map((loc) => {
                    const isLocSelected = location === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setLocation(loc.id)}
                        className="btn btn-sm"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          background: isLocSelected ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card)',
                          border: isLocSelected ? '1px solid #10b981' : '1px solid var(--border-color)',
                          color: isLocSelected ? '#10b981' : 'var(--text-secondary)',
                          fontSize: '0.78rem',
                          fontWeight: isLocSelected ? 700 : 500
                        }}
                      >
                        <span>{loc.icon}</span>
                        <span>{loc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Prompt for Reason if Late, Partial or Missed */}
            {needsReason && (
              <div style={{
                background: status === 'missed' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: status === 'missed' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={15} color={status === 'missed' ? '#ef4444' : '#f59e0b'} />
                  <label className="form-label" style={{ marginBottom: 0, fontWeight: 700, color: status === 'missed' ? '#ef4444' : '#f59e0b' }}>
                    Reason for {status.toUpperCase()} *
                  </label>
                </div>

                {/* Quick reason chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.6rem' }}>
                  {commonReasons.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason(r)}
                      style={{
                        background: reason === r ? 'var(--primary)' : 'var(--bg-card)',
                        color: reason === r ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-full)',
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.7rem',
                        cursor: 'pointer'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  className="form-input"
                  required={needsReason}
                  placeholder="Specify reason (e.g. Traffic on highway, deep coding flow, fatigue)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                />
              </div>
            )}

            {/* Additional Notes */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Optional Execution Notes / Reflection</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Any quick insights or adjustments for tomorrow..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ fontSize: '0.82rem' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem' }}>
              <Check size={16} />
              <span>Save Execution Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
