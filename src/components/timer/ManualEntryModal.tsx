import React, { useState } from 'react';
import { X, Clock, Calendar, Check, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ManualEntryModal = () => {
  const { data, activeModal, setActiveModal, addManualTimeEntry, todayStr } = useApp();

  if (activeModal !== 'manual_time') return null;

  const categories = data.categories || [];
  const [activityName, setActivityName] = useState('RHIZAN Planning & Design');
  const [categoryId, setCategoryId] = useState('career');
  const [projectId, setProjectId] = useState('p_rhizan');
  const [taskId, setTaskId] = useState('');
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('02:00 PM');
  const [endTime, setEndTime] = useState('04:00 PM');
  const [durationMinutes, setDurationMinutes] = useState(120); // 2 hours
  const [description, setDescription] = useState('Reviewed roadmap, schema definitions and UI specifications');

  const selectedCategory = categories.find((c) => c.id === categoryId) || categories[0];
  const availableProjects = selectedCategory?.projects || [];
  const selectedProject = availableProjects.find((p) => p.id === projectId);
  const availableTasks = selectedProject?.tasks || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activityName.trim()) return;

    const taskObj = availableTasks.find((t) => t.id === taskId);

    addManualTimeEntry({
      activityName: activityName.trim(),
      categoryId,
      projectId,
      taskId: taskId || '',
      taskTitle: taskObj ? taskObj.title : '',
      date,
      startTime,
      endTime,
      durationMinutes: Number(durationMinutes) || 30,
      description: description.trim()
    });

    setActiveModal(null);
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⏱️</span>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Add Manual Time Entry</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Log past or offline activities tagged by Project and Task
              </p>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setActiveModal(null)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Activity Name */}
          <div className="form-group">
            <label className="form-label">Activity / Task Name *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. RHIZAN Architecture Review"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
            />
          </div>

          {/* Category, Project & Task */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => {
                  const newCatId = e.target.value;
                  setCategoryId(newCatId);
                  const cat = categories.find((c) => c.id === newCatId);
                  setProjectId(cat?.projects?.[0]?.id || '');
                  setTaskId('');
                }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Project</label>
              <select
                className="form-select"
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setTaskId('');
                }}
              >
                <option value="">No Project</option>
                {availableProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    📁 {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Task (Optional)</label>
              <select
                className="form-select"
                value={taskId}
                onChange={(e) => {
                  const tId = e.target.value;
                  setTaskId(tId);
                  const t = availableTasks.find((item) => item.id === tId);
                  if (t && selectedProject) {
                    setActivityName(`${selectedProject.name}: ${t.title}`);
                  }
                }}
                disabled={availableTasks.length === 0}
              >
                <option value="">{availableTasks.length === 0 ? 'No Tasks' : 'Select Task'}</option>
                {availableTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.completed ? '✅' : '⚡'} {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Start Time & End Time */}
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="02:00 PM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="04:00 PM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Duration in Minutes */}
          <div className="form-group">
            <label className="form-label">Duration (Minutes)</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="number"
                min="1"
                step="5"
                className="form-input"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value) || 0)}
                style={{ maxWidth: '140px' }}
              />
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[30, 45, 60, 90, 120, 180].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setDurationMinutes(mins)}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description / Notes</label>
            <textarea
              className="form-textarea"
              placeholder="What did you accomplish in this session?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Footer Actions */}
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
              <span>Save Time Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
