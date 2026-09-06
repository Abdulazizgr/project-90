import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Clock, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const RoutineModal = () => {
  const { data, activeModal, setActiveModal, modalData, addRoutine, updateRoutine, triggerSound } = useApp();

  if (activeModal !== 'add_routine' && activeModal !== 'edit_routine') return null;

  const isEditing = activeModal === 'edit_routine';
  const categories = data.categories || [];

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'spiritual');
  const [days, setDays] = useState<string[]>(['daily']);
  const [timeSlot, setTimeSlot] = useState('05:00 AM - 05:40 AM');
  const [target, setTarget] = useState('Complete on time');
  const [type, setType] = useState('task'); // 'prayer' | 'task'
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('☀️');

  const daysOfWeek = [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' }
  ];

  useEffect(() => {
    if (isEditing && modalData) {
      setTitle(modalData.title || modalData.name || '');
      setCategoryId(modalData.categoryId || categories[0]?.id || 'spiritual');
      setDays(modalData.days || ['daily']);
      setTimeSlot(modalData.timeSlot || '05:00 AM - 05:40 AM');
      setTarget(modalData.target || '');
      setType(modalData.type || (modalData.categoryId === 'spiritual' ? 'prayer' : 'task'));
      setDescription(modalData.description || modalData.tagline || '');
      setIcon(modalData.icon || '☀️');
    } else {
      setTitle('');
      setCategoryId(categories[0]?.id || 'spiritual');
      setDays(['daily']);
      setTimeSlot('05:00 AM - 05:40 AM');
      setTarget('Complete on time');
      setType('task');
      setDescription('');
      setIcon('☀️');
    }
  }, [activeModal, modalData]);

  const toggleDay = (dayKey: string) => {
    if (dayKey === 'daily') {
      setDays(['daily']);
      return;
    }

    let nextDays = days.filter((d) => d !== 'daily');
    if (nextDays.includes(dayKey)) {
      nextDays = nextDays.filter((d) => d !== dayKey);
      if (nextDays.length === 0) nextDays = ['daily'];
    } else {
      nextDays.push(dayKey);
    }
    setDays(nextDays);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const cat = categories.find((c: any) => c.id === categoryId);

    const routinePayload = {
      title: title.trim(),
      name: title.trim(),
      categoryId,
      days,
      timeSlot: timeSlot.trim(),
      target: target.trim(),
      type,
      description: description.trim(),
      color: cat?.color || '#10b981',
      icon: icon || cat?.icon || '☀️',
      active: true
    };

    if (isEditing && modalData) {
      updateRoutine(modalData.id, routinePayload);
    } else {
      addRoutine(routinePayload);
    }

    triggerSound('habit-complete');
    setActiveModal(null);
  };

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>{icon}</span>
            <div>
              <h3 className="modal-title">
                {isEditing ? 'Edit Recurring Routine Task' : 'Add Recurring Routine Task'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Scheduled daily or selected days (e.g. 3x/wk or 5x/wk)
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Title & Icon */}
            <div className="form-group">
              <label className="form-label">Routine Task Title *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '48px', textAlign: 'center', fontSize: '1.1rem' }}
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="☀️"
                />
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Fajr in Mosque, Gym & Strength, 3h Deep Work"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            {/* Life Category & Task Type */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Life Pillar Category *</label>
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setCategoryId(newCat);
                    if (newCat === 'spiritual') setType('prayer');
                  }}
                >
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Task Type</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="task">Actionable Task / Habit</option>
                  <option value="prayer">Prayer / Salah (Tracks Mosque / Home)</option>
                </select>
              </div>
            </div>

            {/* Recurring Days Frequency */}
            <div className="form-group">
              <label className="form-label">Recurring Frequency *</label>

              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => toggleDay('daily')}
                  className={`btn btn-sm ${days.includes('daily') ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: '1 1 90px', fontSize: '0.8rem', fontWeight: days.includes('daily') ? 800 : 500 }}
                >
                  Every Day
                </button>
                {daysOfWeek.map((d) => {
                  const isSelected = !days.includes('daily') && days.includes(d.key);
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => toggleDay(d.key)}
                      className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        flex: '1 1 42px',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 800 : 500,
                        padding: '0.4rem 0.2rem'
                      }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Time Slot & Target Goal */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Time Window / Slot</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 05:00 AM - 05:40 AM, All Day"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Standard</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Congregation in Mosque, 3L Water"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </div>
            </div>

            {/* Description / Instructions */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description & Standards</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Key non-negotiable details, khushu, or required focus protocol..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem' }}>
              <Check size={16} />
              <span>{isEditing ? 'Save Changes' : 'Create Routine Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
