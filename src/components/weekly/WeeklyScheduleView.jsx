import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles, 
  Dumbbell, 
  Users, 
  BookOpen, 
  Scale, 
  X, 
  ChevronRight,
  Info,
  Star,
  Zap,
  AlertTriangle,
  Award
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getDayPointsBudget, DAY_KEYS } from '@/utils/calculations';

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Monday', short: 'Mon', num: 1 },
  { key: 'tue', label: 'Tuesday', short: 'Tue', num: 2 },
  { key: 'wed', label: 'Wednesday', short: 'Wed', num: 3 },
  { key: 'thu', label: 'Thursday', short: 'Thu', num: 4 },
  { key: 'fri', label: 'Friday', short: 'Fri', num: 5 },
  { key: 'sat', label: 'Saturday', short: 'Sat', num: 6 },
  { key: 'sun', label: 'Sunday', short: 'Sun', num: 0 },
];

export const WeeklyScheduleView = () => {
  const { 
    data, 
    addRecurringWeeklyEvent, 
    updateRecurringWeeklyEvent, 
    deleteRecurringWeeklyEvent,
    setIsSetupWizardOpen,
    triggerSound
  } = useApp();

  const categories = data.categories || [];
  const routines = data.routines || [];
  const recurringEvents = data.recurringWeeklySchedule || [];

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'health');
  const [selectedDays, setSelectedDays] = useState(['tue', 'thu', 'sat']);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:30');
  const [points, setPoints] = useState(20);
  const [description, setDescription] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Today's day key
  const todayDayNum = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const todayDayObj = DAYS_OF_WEEK.find(d => d.num === todayDayNum) || DAYS_OF_WEEK[0];

  // Calculate Routines Base points (Non-negotiables that run every day)
  const routinesBase = useMemo(() => {
    return routines.reduce((acc, r) => {
      if (r.active !== false) {
        return acc + (Number(r.points) || (r.id === 'morning' ? 15 : r.id === 'evening' ? 15 : 20));
      }
      return acc;
    }, 0) || 50;
  }, [routines]);

  // Compute max points budget for selected days inside the modal
  const modalBudgetAnalysis = useMemo(() => {
    if (!selectedDays.length) {
      return { minSafeMax: 100 - routinesBase, dayBreakdowns: [], isOverBudget: false };
    }

    const breakdowns = selectedDays.map((dayKey) => {
      const dayObj = DAYS_OF_WEEK.find(d => d.key === dayKey) || { label: dayKey };
      const otherEvents = recurringEvents.filter(
        (e) => e.id !== editingEventId && e.days && e.days.includes(dayKey)
      );
      const otherPoints = otherEvents.reduce((acc, curr) => acc + (Number(curr.points) || 20), 0);
      const maxAllowed = Math.max(0, 100 - routinesBase - otherPoints);
      const willTotal = routinesBase + otherPoints + (Number(points) || 0);

      return {
        dayKey,
        dayLabel: dayObj.label,
        otherPoints,
        maxAllowed,
        willTotal,
        isOver: willTotal > 100
      };
    });

    const minSafeMax = Math.min(...breakdowns.map(b => b.maxAllowed));
    const isOverBudget = breakdowns.some(b => b.isOver);
    const overDays = breakdowns.filter(b => b.isOver).map(b => b.dayLabel);

    return {
      minSafeMax,
      dayBreakdowns: breakdowns,
      isOverBudget,
      overDays
    };
  }, [selectedDays, recurringEvents, editingEventId, routinesBase, points]);

  const handleOpenAddModal = (presetDay = null) => {
    setEditingEventId(null);
    setTitle('');
    setCategoryId(categories[0]?.id || 'health');
    const initDays = presetDay ? [presetDay] : ['mon', 'wed', 'fri'];
    setSelectedDays(initDays);
    setStartTime('18:00');
    setEndTime('19:30');
    
    // Auto-calculate safe max points for initial day(s)
    const initialOtherPoints = recurringEvents
      .filter(e => e.days && initDays.some(d => e.days.includes(d)))
      .reduce((acc, curr) => acc + (Number(curr.points) || 20), 0);
    const initialSafeMax = Math.max(10, Math.min(30, 100 - routinesBase - initialOtherPoints));
    setPoints(initialSafeMax || 20);
    
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setEditingEventId(event.id);
    setTitle(event.title);
    setCategoryId(event.categoryId || categories[0]?.id || 'health');
    setSelectedDays(event.days || ['mon']);
    setPoints(Number(event.points) || 20);
    
    // Parse timeSlot "06:00 PM - 07:30 PM" or fallback
    const times = (event.timeSlot || '18:00 - 19:30').split('-').map(t => t.trim());
    setStartTime(times[0] || '18:00');
    setEndTime(times[1] || '19:30');
    setDescription(event.description || '');
    setIsModalOpen(true);
  };

  const toggleDay = (dayKey) => {
    if (selectedDays.includes(dayKey)) {
      if (selectedDays.length === 1) return; // Must have at least 1 day
      setSelectedDays(selectedDays.filter(d => d !== dayKey));
    } else {
      setSelectedDays([...selectedDays, dayKey]);
    }
  };

  const applyPreset = (preset) => {
    if (preset === 'gym') {
      setSelectedDays(['tue', 'thu', 'sat']);
    } else if (preset === 'weekdays') {
      setSelectedDays(['mon', 'tue', 'wed', 'thu', 'fri']);
    } else if (preset === 'weekends') {
      setSelectedDays(['sat', 'sun']);
    } else if (preset === 'mon_wed_fri') {
      setSelectedDays(['mon', 'wed', 'fri']);
    }
    triggerSound('click');
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const timeSlotStr = `${startTime} - ${endTime}`;
    
    // Approximate duration in minutes
    let durationMins = 60;
    try {
      const [sh, sm] = startTime.includes(':') ? startTime.split(':').map(Number) : [18, 0];
      const [eh, em] = endTime.includes(':') ? endTime.split(':').map(Number) : [19, 30];
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0) durationMins = diff;
    } catch (err) {
      durationMins = 60;
    }

    const payload = {
      title: title.trim(),
      categoryId,
      days: selectedDays,
      timeSlot: timeSlotStr,
      durationMinutes: durationMins,
      points: Number(points) || 20,
      description: description.trim()
    };

    if (editingEventId) {
      updateRecurringWeeklyEvent(editingEventId, payload);
    } else {
      addRecurringWeeklyEvent(payload);
    }

    setIsModalOpen(false);
  };

  // Filter events
  const filteredEvents = filterCategory === 'all' 
    ? recurringEvents 
    : recurringEvents.filter(e => e.categoryId === filterCategory);

  // Calculate total scheduled hours per category
  const hoursByCategory = {};
  recurringEvents.forEach(e => {
    const cat = categories.find(c => c.id === e.categoryId);
    const catName = cat?.name || 'Other';
    const totalMins = (e.durationMinutes || 60) * (e.days?.length || 1);
    hoursByCategory[catName] = (hoursByCategory[catName] || 0) + (totalMins / 60);
  });

  return (
    <div className="page-container">
      {/* Header Deck */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🗓️</span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Weekly Schedule & Recurring Plan
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
              Schedule commitments that occur on specific days of the week (e.g. <strong>Gym on Tue/Thu/Sat</strong>, team meetings, or study circles). These automatically integrate into your <strong>Daily Timeline</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setIsSetupWizardOpen(true)}
              style={{ gap: '0.4rem' }}
            >
              <Sparkles size={15} color="var(--primary-light)" />
              <span>Sprint Setup Guide</span>
            </button>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenAddModal()}
              style={{ gap: '0.4rem' }}
            >
              <Plus size={16} />
              <span>Add Recurring Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Hours Allocation Pill Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 700 }}>
            <Scale size={16} color="var(--primary-light)" />
            <span>Weekly Recurring Time Commitment:</span>
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button 
              className={`btn btn-sm ${filterCategory === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterCategory('all')}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            >
              All ({recurringEvents.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`btn btn-sm ${filterCategory === cat.id ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setFilterCategory(cat.id)}
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category breakdown pills */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {categories.map(cat => {
            const hrs = hoursByCategory[cat.name] || 0;
            return (
              <div 
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-surface)',
                  border: `1px solid ${cat.color}33`,
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}:</span>
                <span style={{ color: cat.color, fontWeight: 700 }}>{hrs.toFixed(1)}h / week</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Visual Weekly Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        alignItems: 'stretch'
      }}>
        {DAYS_OF_WEEK.map((day) => {
          const isToday = day.key === todayDayObj.key;
          const dayBudget = getDayPointsBudget(day.key, routines, recurringEvents, categories);
          const dayEvents = filteredEvents.filter(e => e.days && e.days.includes(day.key));

          return (
            <div 
              key={day.key}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '1.15rem',
                border: isToday ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: isToday 
                  ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, var(--bg-card) 100%)' 
                  : 'var(--bg-card)',
                boxShadow: isToday ? '0 0 20px rgba(99, 102, 241, 0.15)' : 'none',
                minHeight: '300px'
              }}
            >
              {/* Day Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.65rem',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '0.65rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>{day.label}</span>
                  {isToday && (
                    <span className="badge badge-primary" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                      TODAY
                    </span>
                  )}
                </div>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => handleOpenAddModal(day.key)}
                  title={`Add commitment to ${day.label}`}
                  style={{ width: '26px', height: '26px' }}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Day Point Budget Meter */}
              <div style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.55rem 0.75rem',
                marginBottom: '0.75rem',
                border: '1px solid var(--border-color-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                    ⭐ Planned: <strong style={{ color: 'var(--text-primary)' }}>{dayBudget.currentTotal}</strong> / 100 pts
                  </span>
                  <span style={{
                    fontWeight: 800,
                    color: dayBudget.status === 'optimal' 
                      ? '#10b981' 
                      : dayBudget.status === 'over' 
                        ? '#ef4444' 
                        : 'var(--primary-light)'
                  }}>
                    {dayBudget.status === 'optimal' 
                      ? '🟢 100% Target' 
                      : dayBudget.status === 'over' 
                        ? `🔴 +${dayBudget.currentTotal - 100} pts Over` 
                        : `🔵 ${dayBudget.maxAvailable} pts open`}
                  </span>
                </div>

                <div className="progress-bar-container" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${Math.min(100, (dayBudget.currentTotal / 100) * 100)}%`,
                      background: dayBudget.currentTotal > 100 
                        ? '#ef4444' 
                        : dayBudget.currentTotal === 100 
                          ? '#10b981' 
                          : 'var(--primary)'
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <span>Base: {dayBudget.routinesBase} pts</span>
                  <span>Events: {dayBudget.scheduledEventsPoints} pts</span>
                </div>
              </div>

              {/* Day Events List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                {dayEvents.length === 0 ? (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.25rem 0.5rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem'
                  }}>
                    <Clock size={20} style={{ opacity: 0.3, marginBottom: '0.35rem' }} />
                    <span>No recurring events</span>
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal(day.key)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-light)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: '0.35rem'
                      }}
                    >
                      + Schedule item ({dayBudget.maxAvailable} pts max)
                    </button>
                  </div>
                ) : (
                  dayEvents.map(event => {
                    const cat = categories.find(c => c.id === event.categoryId) || {
                      name: 'General',
                      icon: '🎯',
                      color: '#6366f1'
                    };

                    return (
                      <div
                        key={event.id}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface)',
                          borderLeft: `3px solid ${cat.color}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          position: 'relative',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.3rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.25 }}>
                            {event.title}
                          </span>
                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                            <button
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => handleOpenEditModal(event)}
                              title="Edit"
                              style={{ width: '22px', height: '22px', padding: 0 }}
                            >
                              <Edit3 size={12} color="var(--text-muted)" />
                            </button>
                            <button
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => {
                                if (window.confirm(`Delete recurring event "${event.title}"?`)) {
                                  deleteRecurringWeeklyEvent(event.id);
                                }
                              }}
                              title="Delete"
                              style={{ width: '22px', height: '22px', padding: 0 }}
                            >
                              <Trash2 size={12} color="var(--danger)" />
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          <Clock size={12} />
                          <span>{event.timeSlot}</span>
                          <span style={{ color: 'var(--text-muted)' }}>({event.durationMinutes || 60}m)</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.7rem' }}>{cat.icon}</span>
                            <span style={{ fontSize: '0.7rem', color: cat.color, fontWeight: 600 }}>{cat.name}</span>
                          </div>

                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: 'var(--primary-light)',
                            background: 'rgba(99, 102, 241, 0.15)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-full)'
                          }}>
                            ⭐ {event.points || 20} pts
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add / Edit Recurring Commitment Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="var(--primary-light)" />
                <h3 className="modal-title">
                  {editingEventId ? 'Edit Recurring Commitment' : 'Add Recurring Weekly Commitment'}
                </h3>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent}>
              <div className="modal-body">
                {/* Title */}
                <div className="form-group">
                  <label className="form-label">Commitment Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Gym & Strength Training, Team Sync, Study Circle"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                {/* Life Pillar */}
                <div className="form-group">
                  <label className="form-label">Life Pillar Category *</label>
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Days of Week Checkboxes */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Recurring Days of Week *</label>
                    {/* Presets */}
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() => applyPreset('gym')}
                        className="badge badge-health"
                        style={{ cursor: 'pointer', border: 'none', fontSize: '0.68rem' }}
                      >
                        Tue/Thu/Sat
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('weekdays')}
                        className="badge badge-career"
                        style={{ cursor: 'pointer', border: 'none', fontSize: '0.68rem' }}
                      >
                        Mon–Fri
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('weekends')}
                        className="badge badge-personal"
                        style={{ cursor: 'pointer', border: 'none', fontSize: '0.68rem' }}
                      >
                        Sat–Sun
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {DAYS_OF_WEEK.map(d => {
                      const isSelected = selectedDays.includes(d.key);
                      return (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => toggleDay(d.key)}
                          className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                          style={{
                            flex: 1,
                            minWidth: '42px',
                            fontWeight: isSelected ? 800 : 500,
                            padding: '0.45rem 0.2rem',
                            fontSize: '0.78rem'
                          }}
                        >
                          {d.short}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ========================================================= */}
                {/* DYNAMIC POINTS ALLOCATION & MAX POINTS CALCULATOR WIDGET */}
                {/* ========================================================= */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
                  border: modalBudgetAnalysis.isOverBudget 
                    ? '1px solid rgba(239, 68, 68, 0.4)' 
                    : '1px solid rgba(99, 102, 241, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Award size={16} color="var(--primary-light)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                        Daily Execution Points & Max Allowance
                      </span>
                    </div>

                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: modalBudgetAnalysis.isOverBudget ? '#ef4444' : '#10b981',
                      background: modalBudgetAnalysis.isOverBudget ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      border: modalBudgetAnalysis.isOverBudget ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      ⭐ Max You Can Give: {modalBudgetAnalysis.minSafeMax} pts
                    </div>
                  </div>

                  {/* Day-by-Day Point Availability Breakdown */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {modalBudgetAnalysis.dayBreakdowns.map((bd) => (
                      <div
                        key={bd.dayKey}
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.25rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          background: bd.isOver ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-surface)',
                          border: bd.isOver ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-color)',
                          color: bd.isOver ? '#ef4444' : 'var(--text-secondary)'
                        }}
                      >
                        <strong>{bd.dayLabel}:</strong> Max <strong>{bd.maxAllowed} pts</strong> ({bd.willTotal}/100)
                      </div>
                    ))}
                  </div>

                  {/* Points Selector Buttons */}
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {[10, 15, 20, 25, 30].map((pt) => {
                      const isSelected = points === pt;
                      const isOver = pt > modalBudgetAnalysis.minSafeMax;
                      return (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => setPoints(pt)}
                          className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            flex: '1 1 55px',
                            fontSize: '0.78rem',
                            padding: '0.4rem 0.2rem',
                            fontWeight: isSelected ? 800 : 600,
                            borderColor: isOver && isSelected ? '#ef4444' : undefined
                          }}
                        >
                          ⭐ {pt} pts
                        </button>
                      );
                    })}

                    {modalBudgetAnalysis.minSafeMax > 0 && ![10, 15, 20, 25, 30].includes(modalBudgetAnalysis.minSafeMax) && (
                      <button
                        type="button"
                        onClick={() => setPoints(modalBudgetAnalysis.minSafeMax)}
                        className={`btn btn-sm ${points === modalBudgetAnalysis.minSafeMax ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.78rem', padding: '0.4rem 0.5rem', fontWeight: 800 }}
                      >
                        Max ({modalBudgetAnalysis.minSafeMax} pts)
                      </button>
                    )}
                  </div>

                  {/* Over Budget Alert */}
                  {modalBudgetAnalysis.isOverBudget && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      marginTop: '0.65rem',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      fontSize: '0.74rem'
                    }}>
                      <AlertTriangle size={14} flexShrink={0} />
                      <span>
                        Assigning <strong>{points} pts</strong> exceeds the 100-point daily limit on <strong>{modalBudgetAnalysis.overDays.join(', ')}</strong>. Consider setting points to <strong>{modalBudgetAnalysis.minSafeMax} pts</strong> or lower.
                      </span>
                    </div>
                  )}
                </div>

                {/* Time Range */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Notes / Description */}
                <div className="form-group">
                  <label className="form-label">Description / Routine Notes</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="e.g. Upper body hypertrophy, bring 1.5L bottle"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem' }}>
                  <Check size={16} />
                  <span>{editingEventId ? 'Update Commitment' : 'Save Recurring Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
