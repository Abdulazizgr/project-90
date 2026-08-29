import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Plus, 
  Layers, 
  X,
  Maximize2,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDurationHMS } from '@/utils/calculations';

export const GlobalTimerBar = () => {
  const { 
    data, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    stopTimer, 
    updateActiveTimerFields, 
    setActiveModal,
    setActiveTab,
    triggerSound
  } = useApp();

  const [timerMode, setTimerMode] = useState('stopwatch'); // 'stopwatch' | 'pomo_25' | 'pomo_50'
  const [pomodoroTargetSeconds, setPomodoroTargetSeconds] = useState(25 * 60);

  const activeTimer = data.activeTimer || {};
  const isRunning = !!activeTimer.isRunning;
  const elapsed = activeTimer.elapsedSeconds || 0;
  const categories = data.categories || [];

  const selectedCategory = categories.find((c) => c.id === activeTimer.categoryId) || categories[0];
  const availableProjects = selectedCategory?.projects || [];

  // Pomodoro countdown calculation
  const isPomodoro = timerMode === 'pomo_25' || timerMode === 'pomo_50';
  const remainingSeconds = Math.max(0, pomodoroTargetSeconds - elapsed);

  // Check if pomodoro completed
  useEffect(() => {
    if (isPomodoro && isRunning && elapsed >= pomodoroTargetSeconds && elapsed > 0) {
      stopTimer();
      triggerSound('fanfare');
      alert(`🎉 Pomodoro session finished! Great focus.`);
    }
  }, [isPomodoro, isRunning, elapsed, pomodoroTargetSeconds, stopTimer, triggerSound]);

  const handleStartOrToggle = () => {
    if (isRunning) {
      pauseTimer();
    } else if (elapsed > 0) {
      resumeTimer();
    } else {
      startTimer();
    }
  };

  const handleSetPomoMode = (mode, targetMinutes) => {
    setTimerMode(mode);
    setPomodoroTargetSeconds(targetMinutes * 60);
    if (!isRunning) {
      updateActiveTimerFields({ elapsedSeconds: 0 });
    }
  };

  return (
    <div className="global-timer-bar">
      {/* Left section: Live status, mode selector and inputs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, marginRight: '1.5rem' }}>
        {/* Pulsing live badge */}
        {isRunning ? (
          <div className="timer-live-badge">
            <span className="pulse-dot" />
            <span>{isPomodoro ? 'POMODORO' : 'TRACKING'}</span>
          </div>
        ) : elapsed > 0 ? (
          <div className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
            <span>PAUSED</span>
          </div>
        ) : (
          <div className="badge" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
            <Clock size={12} />
            <span>IDLE</span>
          </div>
        )}

        {/* Mode Selector Pill */}
        <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--bg-input)', padding: '0.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className={`btn btn-sm ${timerMode === 'stopwatch' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
            onClick={() => setTimerMode('stopwatch')}
            title="Standard Stopwatch"
          >
            ⏱️ Stop
          </button>
          <button
            type="button"
            className={`btn btn-sm ${timerMode === 'pomo_25' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
            onClick={() => handleSetPomoMode('pomo_25', 25)}
            title="25m Pomodoro"
          >
            🍅 25m
          </button>
          <button
            type="button"
            className={`btn btn-sm ${timerMode === 'pomo_50' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
            onClick={() => handleSetPomoMode('pomo_50', 50)}
            title="50m Deep Block"
          >
            ⚡ 50m
          </button>
        </div>

        {/* Activity Name Input */}
        <input
          type="text"
          className="form-input"
          placeholder="What are you working on right now?"
          value={activeTimer.activityName || ''}
          onChange={(e) => updateActiveTimerFields({ activityName: e.target.value })}
          style={{ maxWidth: '280px', fontWeight: 600, fontSize: '0.88rem' }}
        />

        {/* Category Picker */}
        <select
          className="form-select"
          value={activeTimer.categoryId || ''}
          onChange={(e) => {
            const newCatId = e.target.value;
            const newCat = categories.find((c) => c.id === newCatId);
            const firstProjId = newCat?.projects?.[0]?.id || '';
            updateActiveTimerFields({ categoryId: newCatId, projectId: firstProjId });
          }}
          style={{ maxWidth: '150px', fontSize: '0.82rem' }}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        {/* Project Picker */}
        {availableProjects.length > 0 && (
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
                activityName: newProj ? `${newProj.name}` : ''
              });
            }}
            style={{ maxWidth: '160px', fontSize: '0.82rem' }}
          >
            <option value="">No Project</option>
            {availableProjects.map((p) => (
              <option key={p.id} value={p.id}>
                📁 {p.name}
              </option>
            ))}
          </select>
        )}

        {/* Task Picker inside Selected Project */}
        {(() => {
          const selectedProj = availableProjects.find((p) => p.id === activeTimer.projectId);
          const availableTasks = selectedProj?.tasks || [];
          if (availableTasks.length === 0) return null;

          return (
            <select
              className="form-select"
              value={activeTimer.taskId || ''}
              onChange={(e) => {
                const tId = e.target.value;
                const tObj = availableTasks.find((t) => t.id === tId);
                updateActiveTimerFields({
                  taskId: tId,
                  taskTitle: tObj ? tObj.title : '',
                  activityName: tObj ? `${selectedProj.name}: ${tObj.title}` : (selectedProj ? selectedProj.name : '')
                });
              }}
              style={{ maxWidth: '160px', fontSize: '0.82rem' }}
            >
              <option value="">Select Task (Optional)</option>
              {availableTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.completed ? '✅' : '⚡'} {t.title}
                </option>
              ))}
            </select>
          );
        })()}
      </div>

      {/* Right section: Elapsed / Countdown Ticker and Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        {/* Monospace Clock Display */}
        <div
          className="mono"
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: isRunning ? (isPomodoro ? '#f59e0b' : '#ef4444') : 'var(--text-primary)',
            letterSpacing: '0.05em',
            minWidth: '115px',
            textAlign: 'right'
          }}
        >
          {isPomodoro ? formatDurationHMS(remainingSeconds) : formatDurationHMS(elapsed)}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {/* Play / Pause */}
          <button
            className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleStartOrToggle}
            title={isRunning ? 'Pause Timer' : 'Start Timer'}
            style={{ minWidth: '90px' }}
          >
            {isRunning ? (
              <>
                <Pause size={15} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={15} fill="currentColor" />
                <span>{elapsed > 0 ? 'Resume' : 'Start'}</span>
              </>
            )}
          </button>

          {/* Stop / Finish */}
          {(isRunning || elapsed > 0) && (
            <button
              className="btn btn-danger"
              onClick={stopTimer}
              title="Stop & Log Entry"
            >
              <Square size={15} fill="currentColor" />
              <span>Stop</span>
            </button>
          )}

          {/* Manual Entry Button */}
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => setActiveModal('manual_time')}
            title="Manual Time Entry"
          >
            <Plus size={16} />
          </button>

          {/* Open full tracker view */}
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setActiveTab('timer')}
            title="Open Dedicated Time Tracker"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
