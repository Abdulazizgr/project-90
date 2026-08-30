import React, { useState, useEffect } from 'react';
import { X, Check, Award, Target, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HabitModal = () => {
  const { data, activeModal, setActiveModal, modalData, addHabit, updateHabit } = useApp();

  if (activeModal !== 'add_habit' && activeModal !== 'edit_habit') return null;

  const isEditing = activeModal === 'edit_habit';
  const categories = data.categories || [];

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('spiritual');
  const [projectId, setProjectId] = useState('');
  const [icon, setIcon] = useState('✨');
  const [frequency, setFrequency] = useState('daily');
  const [target, setTarget] = useState('Daily Habit');
  const [points, setPoints] = useState(10);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (isEditing && modalData) {
      setName(modalData.name || '');
      setCategoryId(modalData.categoryId || 'spiritual');
      setProjectId(modalData.projectId || '');
      setIcon(modalData.icon || '✨');
      setFrequency(modalData.frequency || 'daily');
      setTarget(modalData.target || '');
      setPoints(modalData.points || 10);
      setActive(modalData.active !== false);
    } else {
      setName('');
      setCategoryId('spiritual');
      setProjectId('');
      setIcon('🎯');
      setFrequency('daily');
      setTarget('1 Session');
      setPoints(10);
      setActive(true);
    }
  }, [activeModal, modalData]);

  const selectedCategory = categories.find((c) => c.id === categoryId) || categories[0];
  const availableProjects = selectedCategory?.projects || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const habitPayload = {
      name: name.trim(),
      categoryId,
      projectId,
      icon: icon || '🎯',
      frequency,
      target: target.trim(),
      points: Number(points) || 10,
      active
    };

    if (isEditing && modalData) {
      updateHabit(modalData.id, habitPayload);
    } else {
      addHabit(habitPayload);
    }

    setActiveModal(null);
  };

  const sampleIcons = ['🕌', '📖', '📱', '👤', '⏰', '📚', '💪', '🏃', '💧', '🥗', '💻', '🚀', '📝', '⚡', '🎯'];

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>{isEditing ? '✏️' : '⚡'}</span>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {isEditing ? 'Edit Habit' : 'Create New Habit'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Configure targets, category alignment, and score point weights
              </p>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setActiveModal(null)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Icon Selector & Name */}
          <div className="form-group">
            <label className="form-label">Habit Name *</label>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                type="text"
                className="form-input"
                style={{ width: '56px', textAlign: 'center', fontSize: '1.2rem', padding: '0.4rem' }}
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                title="Habit emoji icon"
              />
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Quran Recitation (5 Pages)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* Quick Emoji Bar */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {sampleIcons.map((ic) => (
              <button
                key={ic}
                type="button"
                className="btn btn-secondary btn-sm btn-icon"
                style={{
                  fontSize: '1rem',
                  padding: '0.3rem 0.5rem',
                  background: icon === ic ? 'var(--primary-glow)' : 'var(--bg-surface)'
                }}
                onClick={() => setIcon(ic)}
              >
                {ic}
              </button>
            ))}
          </div>

          {/* Category & Project */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => {
                  const newCatId = e.target.value;
                  setCategoryId(newCatId);
                  const cat = categories.find((c) => c.id === newCatId);
                  setProjectId(cat?.projects?.[0]?.id || '');
                }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Project</label>
              <select
                className="form-select"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">No Project</option>
                {availableProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    📁 {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target, Frequency & Points */}
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Target Unit</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 5 Pages / 45 mins"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select
                className="form-select"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Points (0–30)</label>
              <input
                type="number"
                min="1"
                max="50"
                className="form-input"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
          </div>

          {/* Active Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="habit-active-checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="habit-active-checkbox" style={{ fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
              Active habit (included in daily 100-point calculation)
            </label>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Check size={16} />
              <span>{isEditing ? 'Update Habit' : 'Save Habit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
