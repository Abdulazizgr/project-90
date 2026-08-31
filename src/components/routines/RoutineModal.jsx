import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Clock, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RoutineModal = () => {
  const { data, activeModal, setActiveModal, modalData, addRoutine, updateRoutine } = useApp();

  if (activeModal !== 'add_routine' && activeModal !== 'edit_routine') return null;

  const isEditing = activeModal === 'edit_routine';
  const categories = data.categories || [];

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [icon, setIcon] = useState('🌅');
  const [timeSlot, setTimeSlot] = useState('06:00 AM - 08:00 AM');
  const [color, setColor] = useState('#10b981');
  const [points, setPoints] = useState(15);
  const [activities, setActivities] = useState([
    { id: 'act_1', title: 'Wake up & Hydrate', duration: 15, categoryId: 'personal' },
    { id: 'act_2', title: 'Deep Focus Session', duration: 45, categoryId: 'career' }
  ]);

  useEffect(() => {
    if (isEditing && modalData) {
      setName(modalData.name || '');
      setTagline(modalData.tagline || '');
      setIcon(modalData.icon || '🌅');
      setTimeSlot(modalData.timeSlot || '');
      setColor(modalData.color || '#10b981');
      setPoints(Number(modalData.points) || 15);
      setActivities(modalData.activities || []);
    } else {
      setName('');
      setTagline('');
      setIcon('🌅');
      setTimeSlot('06:00 AM - 08:00 AM');
      setColor('#10b981');
      setPoints(15);
      setActivities([
        { id: `act_${Date.now()}_1`, title: 'Preparation & Wudu', duration: 15, categoryId: 'spiritual' },
        { id: `act_${Date.now()}_2`, title: 'Core Activity Block', duration: 45, categoryId: 'career' }
      ]);
    }
  }, [activeModal, modalData]);

  const handleAddActivity = () => {
    setActivities((prev) => [
      ...prev,
      {
        id: `act_${Date.now()}`,
        title: 'New Activity',
        duration: 30,
        categoryId: 'personal'
      }
    ]);
  };

  const handleUpdateActivity = (index, field, value) => {
    setActivities((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteActivity = (index) => {
    setActivities((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const routinePayload = {
      name: name.trim(),
      tagline: tagline.trim(),
      icon: icon || '🌅',
      timeSlot: timeSlot.trim(),
      color,
      points: Number(points) || 15,
      activities
    };

    if (isEditing && modalData) {
      updateRoutine(modalData.id, routinePayload);
    } else {
      addRoutine(routinePayload);
    }

    setActiveModal(null);
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>{icon}</span>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {isEditing ? 'Edit Routine' : 'Build Custom Routine'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Configure sequential steps, default baseline points, and time targets
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Routine Name *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '50px', textAlign: 'center', fontSize: '1.1rem' }}
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Morning Momentum"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Time Slot</label>
              <input
                type="text"
                className="form-input"
                placeholder="05:00 AM - 07:00 AM"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Tagline / Purpose</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Start with faith, clarity, and physical vitality"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Daily Baseline Points</label>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                  ⭐ {points} pts
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[10, 15, 20, 25, 30].map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    className={`btn btn-sm ${points === pt ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPoints(pt)}
                    style={{ flex: 1, padding: '0.35rem 0.2rem', fontSize: '0.75rem' }}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Activities List */}
          <div style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Sequential Steps ({activities.length})</label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddActivity}
                style={{ fontSize: '0.75rem', gap: '0.3rem' }}
              >
                <Plus size={13} />
                <span>Add Step</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {activities.map((act, idx) => (
                <div
                  key={act.id || idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.8fr 1.2fr 0.8fr auto',
                    gap: '0.5rem',
                    alignItems: 'center',
                    background: 'var(--bg-surface)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Step title"
                    value={act.title}
                    onChange={(e) => handleUpdateActivity(idx, 'title', e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />

                  <select
                    className="form-select"
                    value={act.categoryId || 'personal'}
                    onChange={(e) => handleUpdateActivity(idx, 'categoryId', e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={act.duration}
                      onChange={(e) => handleUpdateActivity(idx, 'duration', Number(e.target.value))}
                      style={{ width: '60px', fontSize: '0.85rem', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>min</span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => handleDeleteActivity(idx)}
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>{isEditing ? 'Save Changes' : 'Create Routine'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
