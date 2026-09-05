import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Plus, 
  Sparkles,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDurationHuman, getCategoryMeta } from '../../utils/calculations';

export const DailyTimelineView = () => {
  const { data, todayStr, setActiveModal } = useApp();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const categories = data.categories || [];
  const timeEntries = (data.timeEntries || []).filter((e) => (e.date || todayStr) === selectedDate);
  const habitLogs = data.habitLogsHistory?.[selectedDate] || {};
  const habits = data.habits || [];
  const journalEntry = data.journalEntries?.[selectedDate];
  const dayScore = data.dayScores?.[selectedDate] || 0;

  // Build composite chronological events
  const timelineEvents = [];

  // Add time entries
  timeEntries.forEach((entry) => {
    timelineEvents.push({
      type: 'time_entry',
      id: entry.id,
      title: entry.activityName,
      time: entry.startTime || '10:00 AM',
      endTime: entry.endTime,
      duration: entry.durationMinutes,
      categoryId: entry.categoryId,
      projectId: entry.projectId,
      description: entry.description,
      icon: '⏱️'
    });
  });

  // Add completed habits
  habits.forEach((habit) => {
    const status = habitLogs[habit.id];
    if (status === 'completed') {
      timelineEvents.push({
        type: 'habit',
        id: `h_event_${habit.id}`,
        title: habit.name,
        time: habit.categoryId === 'spiritual' ? '05:30 AM' : habit.categoryId === 'health' ? '06:30 AM' : '02:00 PM',
        duration: null,
        categoryId: habit.categoryId,
        description: `Target achieved: ${habit.target} (+${habit.points} pts)`,
        icon: habit.icon || '✅'
      });
    }
  });

  // Add journal reflection if exists
  if (journalEntry) {
    timelineEvents.push({
      type: 'journal',
      id: 'journal_event',
      title: 'Daily Reflection & Evening Review',
      time: '09:30 PM',
      duration: 15,
      categoryId: 'personal',
      description: `Mood: ${journalEntry.mood?.toUpperCase()} • What went well: "${journalEntry.q1?.slice(0, 60)}..."`,
      icon: '📝'
    });
  }

  // Add Recurring Weekly Events for this day of week
  const selectedDateObj = new Date(selectedDate);
  const dayKeyMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayKey = dayKeyMap[selectedDateObj.getDay()];

  const recurringEvents = (data.recurringWeeklySchedule || []).filter(e => e.days && e.days.includes(dayKey));
  recurringEvents.forEach(re => {
    const startTimeStr = re.timeSlot?.split('-')?.[0]?.trim() || '06:00 PM';
    timelineEvents.push({
      type: 'recurring_weekly',
      id: `rwe_event_${re.id}`,
      title: re.title,
      time: startTimeStr,
      duration: re.durationMinutes || 60,
      categoryId: re.categoryId,
      description: re.description || `Recurring weekly commitment scheduled for ${dayKey.toUpperCase()}`,
      icon: '🗓️',
      isRecurring: true
    });
  });

  // Sort events by time string roughly
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(' ');
    const timeParts = parts[0].split(':');
    let hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;
    const isPM = parts[1]?.toUpperCase() === 'PM';
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  timelineEvents.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

  const totalDayMinutes = timeEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  return (
    <div className="page-container">
      {/* Date Switcher & Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--bg-card), var(--bg-surface))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🕒</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Chronological Day Timeline</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              A full chronological replay of your tracked work blocks, habits, and routines
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ maxWidth: '160px', fontSize: '0.85rem' }}
            />

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedDate(todayStr)}
            >
              Today
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => setActiveModal('manual_time')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Plus size={14} />
              <span>Add Block</span>
            </button>
          </div>
        </div>

        {/* Day Stats Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.88rem'
        }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Date: <strong style={{ color: 'var(--text-primary)' }}>{selectedDate === todayStr ? `Today (${selectedDate})` : selectedDate}</strong></span>
            <span>Total Tracked: <strong style={{ color: 'var(--primary-light)' }}>{formatDurationHuman(totalDayMinutes)}</strong></span>
            <span>Events: <strong style={{ color: 'var(--text-primary)' }}>{timelineEvents.length}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Day Score:</span>
            <span className="badge badge-excellent" style={{ fontSize: '0.8rem' }}>
              ⭐ {dayScore} / 100
            </span>
          </div>
        </div>
      </div>

      {/* Vertical Timeline Tree */}
      <div style={{ position: 'relative', paddingLeft: '2rem', marginLeft: '1rem' }}>
        {/* Continuous vertical line */}
        <div style={{
          position: 'absolute',
          top: '10px',
          bottom: '20px',
          left: '11px',
          width: '3px',
          background: 'linear-gradient(180deg, var(--primary), var(--cat-spiritual), var(--cat-career), var(--cat-personal))',
          borderRadius: 'var(--radius-full)'
        }} />

        {timelineEvents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Clock size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Timeline Events For This Date</h4>
            <p style={{ fontSize: '0.85rem' }}>Track sessions or mark daily habits to populate the chronological stream.</p>
          </div>
        ) : (
          timelineEvents.map((event, idx) => {
            const meta = getCategoryMeta(event.categoryId, categories);
            const catObj = categories.find((c) => c.id === event.categoryId);
            const projObj = catObj?.projects?.find((p) => p.id === event.projectId);

            return (
              <div
                key={event.id || idx}
                style={{
                  position: 'relative',
                  marginBottom: '1.5rem',
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                {/* Node Dot on vertical line */}
                <div style={{
                  position: 'absolute',
                  left: '-2rem',
                  top: '12px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--bg-app)',
                  border: `3px solid ${meta.color || 'var(--primary)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  boxShadow: `0 0 10px ${meta.color}40`,
                  zIndex: 2
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.color || 'var(--primary)' }} />
                </div>

                {/* Event Card */}
                <div
                  className="card"
                  style={{
                    padding: '1.15rem 1.35rem',
                    borderLeft: `4px solid ${meta.color || 'var(--primary)'}`,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>{event.icon}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{event.title}</h4>
                          <span className={`badge ${meta.badgeClass}`} style={{ fontSize: '0.7rem' }}>
                            {meta.name}
                          </span>
                          {projObj && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              📁 {projObj.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {event.time} {event.endTime ? `– ${event.endTime}` : ''}
                      </span>
                      {event.duration && (
                        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', fontSize: '0.75rem' }}>
                          {formatDurationHuman(event.duration)}
                        </span>
                      )}
                    </div>
                  </div>

                  {event.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '2rem' }}>
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
