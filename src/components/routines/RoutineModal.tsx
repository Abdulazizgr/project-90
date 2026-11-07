'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const RoutineModal = () => {
  const { data, activeModal, setActiveModal, modalData, addRoutine, updateRoutine, triggerSound } = useApp();

  const isOpen = activeModal === 'routine_modal' || activeModal === 'add_routine' || activeModal === 'edit_routine';
  if (!isOpen) return null;

  const isEditing = activeModal === 'edit_routine' || (modalData && modalData.id && !modalData.isNew);
  const categories = data.categories || [];

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'pillar_spiritual');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('morning');
  const [days, setDays] = useState<string[]>(['daily']);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [color, setColor] = useState('#6366f1');
  const [steps, setSteps] = useState<Array<{ id: string; title: string; durationMinutes?: number }>>([
    { id: 'st_1', title: 'Start with 500ml water and focus intention', durationMinutes: 5 }
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

  useEffect(() => {
    if (isEditing && modalData) {
      setTitle(modalData.title || modalData.name || '');
      setCategoryId(modalData.categoryId || categories[0]?.id || '');
      setTimeOfDay(modalData.timeOfDay || 'morning');
      setDays(modalData.days || ['daily']);
      setDurationMinutes(modalData.durationMinutes || modalData.duration || 30);
      setDescription(modalData.description || '');
      setIcon(modalData.icon || '⚡');
      setColor(modalData.color || '#6366f1');
      setSteps(modalData.steps && modalData.steps.length > 0 ? modalData.steps : [
        { id: 'st_1', title: modalData.title || 'Execute Routine', durationMinutes: 15 }
      ]);
    } else {
      const defaultPillarId = modalData?.categoryId || categories[0]?.id || 'pillar_spiritual';
      const defaultPillar = categories.find((c: any) => c.id === defaultPillarId);
      setTitle('');
      setCategoryId(defaultPillarId);
      setTimeOfDay('morning');
      setDays(['daily']);
      setDurationMinutes(30);
      setDescription('');
      setIcon(defaultPillar?.icon || '⚡');
      setColor(defaultPillar?.color || '#6366f1');
      setSteps([
        { id: 'st_1', title: 'Prepare focus environment and hydrate', durationMinutes: 5 },
        { id: 'st_2', title: 'Execute primary routine block', durationMinutes: 20 },
        { id: 'st_3', title: 'Wrap up and log progress', durationMinutes: 5 }
      ]);
    }
  }, [activeModal, modalData]);

  // When pillar changes, update color and icon default
  const handlePillarChange = (newCatId: string) => {
    setCategoryId(newCatId);
    const pillar = categories.find((c: any) => c.id === newCatId);
    if (pillar) {
      setColor(pillar.color);
      setIcon(pillar.icon);
    }
  };

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
      title: title.trim(),
      categoryId,
      timeOfDay,
      days,
      durationMinutes: Number(durationMinutes) || 30,
      target: `${durationMinutes} mins`,
      description: description.trim(),
      icon,
      color,
      steps
    };

    if (isEditing && modalData?.id) {
      updateRoutine(modalData.id, routinePayload);
    } else {
      addRoutine(routinePayload);
    }

    setActiveModal(null);
  };

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
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              {isEditing ? 'Edit Daily Routine' : 'Create Daily Routine'}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Attach to a focus pillar and schedule days for daily execution
            </p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. Focus Pillar Selector */}
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
              Focus Pillar (Category) *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.45rem' }}>
              {categories.map((c: any) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handlePillarChange(c.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.65rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? `${c.color}25` : 'var(--bg-input)',
                      border: isSelected ? `2px solid ${c.color}` : '1px solid var(--border-color)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{c.icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Routine Title & Emoji */}
          <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '0.65rem', marginBottom: '1.1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>Icon</label>
              <input
                type="text"
                className="form-control"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.2rem', padding: '0.45rem' }}
                maxLength={4}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>Routine Title *</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Morning Awakening & Tilawat"
                required
              />
            </div>
          </div>

          {/* 3. Time of Day & Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>Time of Day</label>
              <select
                className="form-control"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as any)}
              >
                <option value="morning">🌅 Morning</option>
                <option value="afternoon">☀️ Afternoon</option>
                <option value="evening">🌙 Evening</option>
                <option value="anytime">⚡ Anytime</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>Target Duration (Minutes)</label>
              <input
                type="number"
                className="form-control"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min={1}
                max={480}
              />
            </div>
          </div>

          {/* 4. Scheduling Days */}
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
              Frequency / Days Scheduled
            </label>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-sm ${days.includes('daily') ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => toggleDay('daily')}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
              >
                Every Day
              </button>

              {daysOfWeek.map((d) => {
                const isSelected = !days.includes('daily') && days.includes(d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    className={`btn btn-sm ${isSelected ? 'btn-secondary' : 'btn-ghost'}`}
                    onClick={() => toggleDay(d.key)}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.55rem' }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Description / Mission */}
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does success look like in this routine?"
            />
          </div>

          {/* 6. Step-by-Step Checklist Builder */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
              Checklist Steps (for Guided Runner)
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.65rem' }}>
              {steps.map((st, idx) => (
                <div
                  key={st.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.75rem',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}.</span>
                    <span>{st.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(st.id)}
                    className="btn btn-ghost btn-icon"
                    style={{ padding: '0.2rem', color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Step Input */}
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              <input
                type="text"
                className="form-control"
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                placeholder="+ Add a step (e.g. Drink 500ml water)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStep();
                  }
                }}
                style={{ fontSize: '0.82rem' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddStep}
                style={{ whiteSpace: 'nowrap', fontWeight: 700 }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ fontWeight: 800, padding: '0.6rem 1.4rem' }}
            >
              {isEditing ? 'Save Changes' : 'Create Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
