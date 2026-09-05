import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Filter, 
  Search, 
  Layers, 
  CheckCircle,
  BarChart2,
  Repeat,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDurationHMS, formatDurationHuman, getCategoryMeta } from '@/utils/calculations';
import { exportTimeEntriesAsCSV } from '@/utils/storage';

export const TimeTrackerView = () => {
  const { 
    data, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    stopTimer, 
    updateActiveTimerFields, 
    deleteTimeEntry, 
    setActiveModal, 
    todayStr 
  } = useApp();

  const [selectedFilterCategory, setSelectedFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timerMode, setTimerMode] = useState('stopwatch'); // 'stopwatch' | 'pomo_25' | 'pomo_50'

  const activeTimer = data.activeTimer || {};
  const isRunning = !!activeTimer.isRunning;
  const elapsed = activeTimer.elapsedSeconds || 0;
  const categories = data.categories || [];
  const timeEntries = data.timeEntries || [];

  const selectedCategory = categories.find((c) => c.id === activeTimer.categoryId) || categories[0];
  const availableProjects = selectedCategory?.projects || [];

  // Filter entries
  const filteredEntries = timeEntries.filter((entry) => {
    const matchesCat = selectedFilterCategory === 'all' || entry.categoryId === selectedFilterCategory;
    const matchesSearch = !searchQuery || 
      entry.activityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Group entries by date
  const initialGroups: Record<string, any[]> = {};
  const groupedEntries: Record<string, any[]> = (filteredEntries as any[]).reduce((groups, entry) => {
    const date = entry.date || todayStr;
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, initialGroups);

  // Calculate totals
  const todayEntries = timeEntries.filter((e) => e.date === todayStr);
  const totalMinutesToday = todayEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const totalMinutesAll = timeEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  const handleStartOrToggle = () => {
    if (isRunning) {
      pauseTimer();
    } else if (elapsed > 0) {
      resumeTimer();
    } else {
      startTimer();
    }
  };

  const handleReTrack = (entry) => {
    updateActiveTimerFields({
      activityName: entry.activityName,
      categoryId: entry.categoryId,
      projectId: entry.projectId || '',
      description: entry.description || ''
    });
    startTimer({
      activityName: entry.activityName,
      categoryId: entry.categoryId,
      projectId: entry.projectId || '',
      description: entry.description || '',
      reset: true
    });
  };

  return (
    <div className="page-container">
      {/* Clockify-Style Top Tracker Deck */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--bg-card), var(--bg-surface))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.75rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⏱️</span>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Clockify & Pomodoro Tracker</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Track deep focus sessions with second-precision
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => exportTimeEntriesAsCSV(timeEntries, categories)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              title="Download CSV Spreadsheet"
            >
              <FileSpreadsheet size={15} color="#10b981" />
              <span>Export CSV</span>
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => setActiveModal('manual_time')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={15} />
              <span>Add Manual Entry</span>
            </button>
          </div>
        </div>

        {/* Tracker Input Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 0.9fr 0.9fr 0.9fr 1fr auto auto',
          gap: '0.65rem',
          alignItems: 'center',
          background: 'var(--bg-input)',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-lg)',
          border: isRunning ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)'
        }}>
          {/* Activity Name */}
          <input
            type="text"
            className="form-input"
            placeholder="What are you working on?"
            value={activeTimer.activityName || ''}
            onChange={(e) => updateActiveTimerFields({ activityName: e.target.value })}
            style={{ border: 'none', background: 'transparent', padding: '0.4rem 0', fontWeight: 600, fontSize: '0.92rem' }}
          />

          {/* Category */}
          <select
            className="form-select"
            value={activeTimer.categoryId || ''}
            onChange={(e) => {
              const newCatId = e.target.value;
              const newCat = categories.find((c) => c.id === newCatId);
              const firstProjId = newCat?.projects?.[0]?.id || '';
              updateActiveTimerFields({ 
                categoryId: newCatId, 
                projectId: firstProjId,
                taskId: '',
                taskTitle: ''
              });
            }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {/* Project */}
          <select
            className="form-select"
            value={activeTimer.projectId || ''}
            onChange={(e) => {
              const newProjId = e.target.value;
              const newProj = availableProjects.find((p) => p.id === newProjId);
              updateActiveTimerFields({ 
                projectId: newProjId,
                taskId: '',
                taskTitle: '',
                activityName: newProj ? newProj.name : (activeTimer.activityName || '')
              });
            }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
          >
            <option value="">No Project</option>
            {availableProjects.map((p) => (
              <option key={p.id} value={p.id}>
                📁 {p.name}
              </option>
            ))}
          </select>

          {/* Task inside Project */}
          {(() => {
            const currentProj = availableProjects.find((p) => p.id === activeTimer.projectId);
            const projTasks = currentProj?.tasks || [];

            return (
              <select
                className="form-select"
                value={activeTimer.taskId || ''}
                onChange={(e) => {
                  const tId = e.target.value;
                  const tObj = projTasks.find((t) => t.id === tId);
                  updateActiveTimerFields({
                    taskId: tId,
                    taskTitle: tObj ? tObj.title : '',
                    activityName: tObj ? `${currentProj?.name}: ${tObj.title}` : (currentProj ? currentProj.name : '')
                  });
                }}
                disabled={projTasks.length === 0}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
              >
                <option value="">{projTasks.length === 0 ? 'No tasks' : 'Select Task'}</option>
                {projTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.completed ? '✅' : '⚡'} {t.title}
                  </option>
                ))}
              </select>
            );
          })()}

          {/* Description */}
          <input
            type="text"
            className="form-input"
            placeholder="Notes / description..."
            value={activeTimer.description || ''}
            onChange={(e) => updateActiveTimerFields({ description: e.target.value })}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
          />

          {/* Elapsed Ticker */}
          <div
            className="mono"
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: isRunning ? '#ef4444' : 'var(--text-primary)',
              letterSpacing: '0.05em',
              padding: '0 0.5rem',
              minWidth: '120px',
              textAlign: 'center'
            }}
          >
            {formatDurationHMS(elapsed)}
          </div>

          {/* Play/Pause & Stop */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleStartOrToggle}
              style={{ minWidth: '85px' }}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
              <span>{isRunning ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start'}</span>
            </button>

            {(isRunning || elapsed > 0) && (
              <button
                className="btn btn-danger"
                onClick={stopTimer}
                title="Stop & Log Entry"
              >
                <Square size={16} fill="currentColor" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.2rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Today's Logged Time
          </span>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '0.3rem' }}>
            {formatDurationHuman(totalMinutesToday)}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Across {todayEntries.length} logged sessions
          </p>
        </div>

        <div className="card" style={{ padding: '1.2rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total 90-Day Sprint Time
          </span>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cat-spiritual)', marginTop: '0.3rem' }}>
            {formatDurationHuman(totalMinutesAll)}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Day 12 / 90 average: {formatDurationHuman(Math.round(totalMinutesAll / 12))}/day
          </p>
        </div>

        <div className="card" style={{ padding: '1.2rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Active Category
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{selectedCategory.icon}</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedCategory.name}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {availableProjects.length} projects configured
          </p>
        </div>
      </div>

      {/* Time Entries Section */}
      <div className="card">
        {/* Filter bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Time Log History</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Showing {filteredEntries.length} tracked time blocks
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search entries..."
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', maxWidth: '180px', fontSize: '0.85rem' }}
              />
            </div>

            {/* Category Filter */}
            <select
              className="form-select"
              value={selectedFilterCategory}
              onChange={(e) => setSelectedFilterCategory(e.target.value)}
              style={{ maxWidth: '180px', fontSize: '0.85rem' }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grouped Logs */}
        {Object.keys(groupedEntries).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Clock size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>No time entries match your filters</p>
            <p style={{ fontSize: '0.82rem' }}>Start the timer or add a manual entry to begin tracking</p>
          </div>
        ) : (
          Object.entries(groupedEntries).map(([date, entries]) => {
            const isDateToday = date === todayStr;
            const dayTotalMin = entries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

            return (
              <div key={date} style={{ marginBottom: '1.75rem' }}>
                {/* Date header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-surface)',
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem' }}>
                    <Calendar size={15} color="var(--primary-light)" />
                    <span>{isDateToday ? 'Today' : date}</span>
                    {isDateToday && (
                      <span className="badge badge-excellent" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                        Active Day 12
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Total: <span style={{ color: 'var(--text-primary)' }}>{formatDurationHuman(dayTotalMin)}</span>
                  </div>
                </div>

                {/* Entry Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {entries.map((entry) => {
                    const meta = getCategoryMeta(entry.categoryId, categories);
                    const catObj = categories.find((c) => c.id === entry.categoryId);
                    const projObj = catObj?.projects?.find((p) => p.id === entry.projectId);

                    return (
                      <div
                        key={entry.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-color)',
                          transition: 'border-color var(--transition-fast)'
                        }}
                      >
                        {/* Left: Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '1.25rem' }}>{meta.icon}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{entry.activityName}</span>
                              <span className={`badge ${meta.badgeClass}`} style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                                {meta.name}
                              </span>
                              {projObj && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                  📁 {projObj.name}
                                </span>
                              )}
                            </div>
                            {entry.description && (
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                {entry.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Time, Duration & Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <div>{entry.startTime} – {entry.endTime}</div>
                          </div>

                          <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, minWidth: '70px', textAlign: 'right', color: 'var(--text-primary)' }}>
                            {formatDurationHuman(entry.durationMinutes)}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            {/* Re-track button */}
                            <button
                              className="btn btn-ghost btn-sm btn-icon"
                              onClick={() => handleReTrack(entry)}
                              title="Continue this activity"
                            >
                              <Repeat size={14} color="var(--primary-light)" />
                            </button>

                            {/* Delete */}
                            <button
                              className="btn btn-ghost btn-sm btn-icon"
                              onClick={() => deleteTimeEntry(entry.id)}
                              title="Delete entry"
                              style={{ color: '#ef4444' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
