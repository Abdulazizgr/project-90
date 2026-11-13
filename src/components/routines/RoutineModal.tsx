'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, Calendar, Sparkles, Moon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { calculateMinutesBetween, parseTimeToMinutes, formatDurationHuman } from '@/utils/calculations';

export const RoutineModal = () => {
  const { data, activeModal, setActiveModal, modalData, addRoutine, updateRoutine, triggerSound } = useApp();

  const isOpen = activeModal === 'routine_modal' || activeModal === 'add_routine' || activeModal === 'edit_routine';
  if (!isOpen) return null;

  const isEditing = activeModal === 'edit_routine' || (modalData && modalData.id && !modalData.isNew);
  const categories = data.categories || [];

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'spiritual');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('06:45');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [assignedDays, setAssignedDays] = useState<string[]>(['daily']);
  const [template, setTemplate] = useState<string>('all');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [color, setColor] = useState('#6366f1');
  const [steps, setSteps] = useState<Array<{ id: string; title: string; durationMinutes?: number }>>([
    { id: 'st_1', title: 'Start with 500ml water and intention', durationMinutes: 5 }
  ]);
  const [newStepText, setNewStepText] = useState('');

  const daysOfWeek = [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' }
  ];

  // Auto-calculate duration whenever start or end time changes
  useEffect(() => {
    if (startTime && endTime) {
      const dur = calculateMinutesBetween(startTime, endTime);
      setDurationMinutes(dur || 30);
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (isEditing && modalData) {
      setTitle(modalData.name || modalData.title || '');
      setCategoryId(modalData.categoryId || categories[0]?.id || 'spiritual');
      setStartTime(modalData.startTime || '06:00');
      setEndTime(modalData.endTime || '06:45');
      setDurationMinutes(modalData.durationMinutes || 45);
      setAssignedDays(modalData.assignedDays || modalData.days || ['daily']);
      setTemplate(modalData.template || 'all');
      setDescription(modalData.description || '');
      setIcon(modalData.icon || '⚡');
      setColor(modalData.color || '#6366f1');
      setSteps(modalData.steps && modalData.steps.length > 0 ? modalData.steps : [
        { id: 'st_1', title: modalData.title || modalData.name || 'Execute Routine', durationMinutes: 15 }
      ]);
    } else {
      const defaultPillarId = modalData?.categoryId || categories[0]?.id || 'spiritual';
      const defaultPillar = categories.find((c: any) => c.id === defaultPillarId);
      setTitle('');
      setCategoryId(defaultPillarId);
      setStartTime('06:00');
      setEndTime('06:45');
      setDurationMinutes(45);
      setAssignedDays(['daily']);
      setTemplate('all');
      setDescription('');
      setIcon(defaultPillar?.icon || '⚡');
      setColor(defaultPillar?.color || '#6366f1');
      setSteps([
        { id: 'st_1', title: 'Prepare focus environment and hydrate', durationMinutes: 5 },
        { id: 'st_2', title: 'Execute primary routine block', durationMinutes: 30 },
        { id: 'st_3', title: 'Review and wrap up', durationMinutes: 10 }
      ]);
    }
  }, [activeModal, modalData]);

  const handlePillarChange = (newCatId: string) => {
    setCategoryId(newCatId);
    const pillar = categories.find((c: any) => c.id === newCatId);
    if (pillar) {
      setColor(pillar.color);
      setIcon(pillar.icon);
    }
  };

  const applyTemplate = (type: 'gym' | 'nongym' | 'sunday' | 'daily') => {
    if (type === 'gym') {
      setAssignedDays(['tue', 'thu', 'sat']);
      setTemplate('gym');
    } else if (type === 'nongym') {
      setAssignedDays(['mon', 'wed', 'fri']);
      setTemplate('non_gym');
    } else if (type === 'sunday') {
      setAssignedDays(['sun']);
      setTemplate('sunday');
    } else {
      setAssignedDays(['daily']);
      setTemplate('all');
    }
  };

  const toggleDay = (dayKey: string) => {
    if (dayKey === 'daily') {
      setAssignedDays(['daily']);
      return;
    }

    let nextDays = assignedDays.filter((d) => d !== 'daily');
    if (nextDays.includes(dayKey)) {
      nextDays = nextDays.filter((d) => d !== dayKey);
      if (nextDays.length === 0) nextDays = ['daily'];
    } else {
      nextDays.push(dayKey);
    }
    setAssignedDays(nextDays);
  };

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    setSteps([
      ...steps,
      { id: `st_${Date.now()}`, title: newStepText.trim(), durationMinutes: 10 }
    ]);
    setNewStepText('');
    triggerSound('pop');
  };

  const handleRemoveStep = (stepId: string) => {
    setSteps(steps.filter((s) => s.id !== stepId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const routinePayload = {
      name: title.trim(),
      title: title.trim(),
      categoryId,
      startTime,
      endTime,
      durationMinutes: Number(durationMinutes) || 30,
      assignedDays,
      days: assignedDays,
      template,
      description: description.trim(),
      icon,
      color,
      steps,
      active: true
    };

    if (isEditing && modalData?.id) {
      updateRoutine(modalData.id, routinePayload);
    } else {
      addRoutine(routinePayload);
    }

    setActiveModal(null);
  };

  const isCrossMidnight = parseTimeToMinutes(endTime) < parseTimeToMinutes(startTime);

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '92%',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-xl)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {isEditing ? 'Edit Daily Routine' : 'Create Daily Routine'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Configure start time, duration, and assigned template days
            </p>
          </div>
          <button 
            type="button"
            className="btn btn-ghost btn-sm btn-icon" 
            onClick={() => setActiveModal(null)}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Routine Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Routine Name *
            </label>
            <input
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fajr Prayer & Quran, RHIZAN Sprint, Gym Workout..."
              required
              style={{ width: '100%' }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Category
            </label>
            <select
              className="input"
              value={categoryId}
              onChange={(e) => handlePillarChange(e.target.value)}
              style={{ width: '100%' }}
            >
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time, End Time & Auto-Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Start Time (24h)
              </label>
              <input
                type="time"
                className="input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                End Time (24h)
              </label>
              <input
                type="time"
                className="input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Duration Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.8rem',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem'
          }}>
            <span>Duration (Calculated): <strong style={{ color: 'var(--primary-light)' }}>{formatDurationHuman(durationMinutes)}</strong></span>
            {isCrossMidnight && (
              <span style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700 }}>
                <Moon size={12} /> Crosses Midnight
              </span>
            )}
          </div>

          {/* Template Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Template Presets
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-sm ${assignedDays.join(',') === 'tue,thu,sat' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => applyTemplate('gym')}
                style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
              >
                🏋️ Gym (Tue/Thu/Sat)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${assignedDays.join(',') === 'mon,wed,fri' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => applyTemplate('nongym')}
                style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
              >
                💻 Non-Gym (Mon/Wed/Fri)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${assignedDays.join(',') === 'sun' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => applyTemplate('sunday')}
                style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
              >
                ☕ Sunday (Rest Day)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${assignedDays.includes('daily') ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => applyTemplate('daily')}
                style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
              >
                🌟 Daily
              </button>
            </div>
          </div>

          {/* Custom Assigned Days Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Custom Days
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-sm ${assignedDays.includes('daily') ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => toggleDay('daily')}
                style={{ fontSize: '0.72rem' }}
              >
                Daily
              </button>
              {daysOfWeek.map((d) => {
                const isSelected = assignedDays.includes(d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleDay(d.key)}
                    style={{ fontSize: '0.72rem', minWidth: '40px' }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description & Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Notes / Instructions (Optional)
            </label>
            <input
              type="text"
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 5 pages of Quran recitation, hydration..."
              style={{ width: '100%' }}
            />
          </div>

          {/* Steps Checklist */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Checklist Steps ({steps.length})
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {steps.map((st, i) => (
                <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-input)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{i + 1}.</span>
                  <span style={{ flex: 1, fontSize: '0.8rem' }}>{st.title}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => handleRemoveStep(st.id)}
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                className="input"
                placeholder="Add sub-step..."
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStep(); } }}
                style={{ flex: 1, fontSize: '0.8rem' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddStep}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
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
              style={{ fontWeight: 700 }}
            >
              {isEditing ? 'Save Changes' : 'Create Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
