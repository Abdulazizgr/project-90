'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Moon, 
  Layers, 
  BookOpen,
  Calendar,
  Info
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { 
  calculate24HourAllocation, 
  formatDurationHuman, 
  parseTimeToMinutes,
  getDayKeyFromDateStr,
  isRoutineScheduledForDay,
  checkTimeOverlap
} from '@/utils/calculations';
import { TimeEntry } from '@/utils/seedData';

export const MyDayView: React.FC = () => {
  const { 
    data, 
    todayStr, 
    addTimeEntry, 
    updateTimeEntry, 
    deleteTimeEntry, 
    setActiveTab, 
    triggerSound 
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Form states
  const [activityName, setActivityName] = useState('');
  const [categoryId, setCategoryId] = useState('career');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [isPlanned, setIsPlanned] = useState(false);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const categories = data.categories || [];
  const routines = data.routines || [];
  const tasks = data.tasks || [];
  const dayKey = getDayKeyFromDateStr(selectedDate);

  // Scheduled routines & tasks for this date
  const scheduledRoutines = routines.filter((r: any) => isRoutineScheduledForDay(r, dayKey));
  const plannedTasks = tasks.filter((t: any) => t.plannedDate === selectedDate && t.status !== 'cancelled');

  // Actual time entries recorded for this date
  const dateEntries: TimeEntry[] = (data.timeEntriesHistory?.[selectedDate] || []).sort(
    (a: TimeEntry, b: TimeEntry) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
  );

  // 24-Hour Category Allocation Calculation
  const { allocations, unallocatedMinutes } = calculate24HourAllocation(
    categories,
    dateEntries,
    scheduledRoutines,
    plannedTasks
  );

  const totalTrackedMinutes = dateEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  // Date Navigation
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Form Reset
  const resetForm = () => {
    setActivityName('');
    setCategoryId(categories[0]?.id || 'career');
    setStartTime('09:00');
    setEndTime('10:00');
    setIsPlanned(false);
    setNotes('');
    setFormError(null);
    setEditingEntryId(null);
    setIsAddOpen(false);
  };

  // Start Editing
  const handleStartEdit = (entry: TimeEntry) => {
    setEditingEntryId(entry.id);
    setActivityName(entry.activityName);
    setCategoryId(entry.categoryId);
    setStartTime(entry.startTime);
    setEndTime(entry.endTime);
    setIsPlanned(!!entry.isPlanned);
    setNotes(entry.notes || '');
    setFormError(null);
    setIsAddOpen(true);
  };

  // Submit Time Entry
  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!activityName.trim()) {
      setFormError('Please enter an activity name');
      return;
    }

    if (!startTime || !endTime) {
      setFormError('Start and end times are required');
      return;
    }

    if (editingEntryId) {
      const result = updateTimeEntry(selectedDate, editingEntryId, {
        activityName: activityName.trim(),
        categoryId,
        startTime,
        endTime,
        isPlanned,
        notes: notes.trim()
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to update time entry');
        return;
      }
    } else {
      const result = addTimeEntry(selectedDate, {
        activityName: activityName.trim(),
        categoryId,
        startTime,
        endTime,
        isPlanned,
        notes: notes.trim()
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to record time entry');
        return;
      }
    }

    resetForm();
  };

  // Calculate live preview duration
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  let previewDuration = endMin - startMin;
  let crossesMidnight = false;
  if (previewDuration < 0) {
    previewDuration += 24 * 60;
    crossesMidnight = true;
  }

  const isToday = selectedDate === todayStr;
  const dayReflection = data.journalEntries?.[selectedDate];

  return (
    <div className="page-container" style={{ paddingBottom: '5rem' }}>
      {/* Date Header & Navigation */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.25rem',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Clock size={22} color="var(--primary-light)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>My Day: 24-Hour Time Tracker</h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Accurately account for all 1,440 minutes of your day. Planned schedule vs. actual execution.
            </p>
          </div>

          {/* Date Picker Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm btn-icon"
              onClick={handlePrevDay}
              title="Previous Day"
            >
              <ChevronLeft size={16} />
            </button>
            <div style={{
              background: 'var(--bg-input)',
              padding: '0.35rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontWeight: 700,
              fontSize: '0.85rem',
              minWidth: '130px',
              textAlign: 'center'
            }}>
              {selectedDate} {isToday && <span style={{ color: 'var(--primary-light)', fontSize: '0.72rem' }}>(Today)</span>}
            </div>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm btn-icon"
              onClick={handleNextDay}
              title="Next Day"
            >
              <ChevronRight size={16} />
            </button>
            {!isToday && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedDate(todayStr)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* 24-Hour Visual Balance Bar */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <span>24-HOUR BALANCE (1,440 MIN)</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Recorded: <strong style={{ color: 'var(--text-primary)' }}>{formatDurationHuman(totalTrackedMinutes)}</strong> • Unlogged Rest: <strong style={{ color: 'var(--text-muted)' }}>{formatDurationHuman(unallocatedMinutes)}</strong>
            </span>
          </div>

          <div style={{
            height: '12px',
            backgroundColor: 'var(--bg-input)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            display: 'flex',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
          }}>
            {allocations.map((cat) => {
              if (cat.actualMinutes <= 0) return null;
              return (
                <div
                  key={cat.categoryId}
                  title={`${cat.categoryName}: ${cat.formattedActual} (${cat.actualPercentage}%)`}
                  style={{
                    width: `${cat.actualPercentage}%`,
                    height: '100%',
                    backgroundColor: cat.color,
                    transition: 'width 0.3s ease'
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Timeline Entries & Logger, Right = 24h Category Balance Table */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        {/* LEFT COLUMN: Time Entries & Quick Logger */}
        <div>
          {/* Action Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Activities Timeline</span>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                {dateEntries.length} Recorded
              </span>
            </h3>

            {!isAddOpen && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  resetForm();
                  setIsAddOpen(true);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
              >
                <Plus size={15} />
                <span>Log Time</span>
              </button>
            )}
          </div>

          {/* ADD / EDIT TIME ENTRY FORM */}
          {isAddOpen && (
            <div className="card" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--primary)',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)',
              marginBottom: '1.25rem',
              padding: '1.1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={16} color="var(--primary-light)" />
                  <span>{editingEntryId ? 'Edit Time Entry' : 'Record Actual Time'}</span>
                </h4>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-sm"
                  onClick={resetForm}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  Cancel
                </button>
              </div>

              {formError && (
                <div style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.85rem'
                }}>
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitEntry}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Activity Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    placeholder="e.g. RHIZAN Client API Integration, Gym Workout, Fajr..."
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      Category
                    </label>
                    <select
                      className="input"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      Entry Type
                    </label>
                    <select
                      className="input"
                      value={isPlanned ? 'planned' : 'actual'}
                      onChange={(e) => setIsPlanned(e.target.value === 'planned')}
                      style={{ width: '100%' }}
                    >
                      <option value="actual">Actual Time (Tracked)</option>
                      <option value="planned">Planned Time (Target)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
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
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
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

                {/* Duration Preview Helper */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.75rem',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem'
                }}>
                  <span>Calculated Duration: <strong style={{ color: 'var(--text-primary)' }}>{formatDurationHuman(previewDuration)}</strong></span>
                  {crossesMidnight && (
                    <span style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700 }}>
                      <Moon size={12} /> Crosses Midnight
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Key focus takeaways, friction points..."
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                    {editingEntryId ? 'Update Entry' : 'Save Entry'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TIMELINE LIST */}
          {dateEntries.length === 0 ? (
            <div className="card" style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              border: '1px dashed var(--border-color)',
              background: 'transparent'
            }}>
              <Clock size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>No time entries recorded for {selectedDate}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto 1.25rem' }}>
                Record your activities throughout the day. Non-overlapping entries guarantee every minute is accounted for.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsAddOpen(true)}
              >
                Log First Activity
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {dateEntries.map((entry: TimeEntry) => {
                const cat = categories.find((c: any) => c.id === entry.categoryId);

                return (
                  <div
                    key={entry.id}
                    className="card"
                    style={{
                      padding: '0.85rem 1rem',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderLeft: `4px solid ${cat?.color || 'var(--primary)'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '1rem' }}>{cat?.icon || '⏱️'}</span>
                        <h4 style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {entry.activityName}
                        </h4>
                        {entry.isPlanned && (
                          <span className="badge" style={{ fontSize: '0.65rem', background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                            Planned
                          </span>
                        )}
                        {entry.crossesMidnight && (
                          <span title="Overnight activity" style={{ fontSize: '0.75rem' }}>🌙</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span className="mono" style={{ fontWeight: 600 }}>
                          {entry.startTime} – {entry.endTime}
                        </span>
                        <span>•</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatDurationHuman(entry.durationMinutes)}
                        </span>
                        <span>•</span>
                        <span style={{ color: cat?.color || 'var(--text-muted)' }}>
                          {cat?.name || 'General'}
                        </span>
                      </div>

                      {entry.notes && (
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                          "{entry.notes}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => handleStartEdit(entry)}
                        title="Edit Entry"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => {
                          if (confirm(`Delete "${entry.activityName}"?`)) {
                            deleteTimeEntry(selectedDate, entry.id);
                          }
                        }}
                        title="Delete Entry"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: 24-Hour Category Allocation Breakdown */}
        <div>
          <div className="card" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={18} color="var(--primary-light)" />
                <span>24-Hour Category Breakdown</span>
              </h3>
              <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Sum: 24h 00m
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.1rem' }}>
              Every minute belongs to one category. Unrecorded gaps are automatically accounted for as Personal / Meals / Rest.
            </p>

            {/* Category Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {allocations.map((cat) => {
                return (
                  <div key={cat.categoryId} style={{
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '1rem' }}>{cat.icon}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{cat.categoryName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: cat.color }}>
                          {cat.formattedActual}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: '32px', textAlign: 'right' }}>
                          {cat.actualPercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      height: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          width: `${cat.actualPercentage}%`,
                          height: '100%',
                          backgroundColor: cat.color,
                          borderRadius: 'var(--radius-full)'
                        }}
                      />
                    </div>

                    {cat.plannedMinutes > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        <span>Target Planned: {cat.formattedPlanned}</span>
                        <span>
                          {cat.actualMinutes >= cat.plannedMinutes ? '✅ Target met' : `${cat.formattedPlanned} scheduled`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Evening Reflection Banner Card */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08))',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <BookOpen size={20} color="var(--primary-light)" />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800 }}>Daily 5-Question Reflection</h4>
            </div>

            {dayReflection ? (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Reflection recorded • Mood: <strong style={{ color: 'var(--primary-light)' }}>{dayReflection.mood?.toUpperCase()}</strong>
                </p>
                <div style={{
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.85rem',
                  fontStyle: 'italic'
                }}>
                  "{dayReflection.q1_well || dayReflection.q1 || 'Review completed'}"
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('journal')}
                  style={{ width: '100%', fontWeight: 700 }}
                >
                  Edit Reflection
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                  End your day with a structured 3-minute review: What went well, friction points, lessons learned, and tomorrow's top priority.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab('journal')}
                  style={{ width: '100%', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Sparkles size={14} />
                  <span>Start Evening Reflection</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
