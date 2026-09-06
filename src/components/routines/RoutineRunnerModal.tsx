import React, { useState, useEffect } from 'react';
import { X, Play, Pause, CheckCircle2, ArrowRight, Clock, Trophy, Sparkles, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { formatDurationHMS, formatDurationHuman, getCategoryMeta } from '../../utils/calculations';

export const RoutineRunnerModal = () => {
  const { data, activeModal, setActiveModal, modalData, logRoutineTaskExecution, triggerSound, todayStr } = useApp();

  if (activeModal !== 'routine_runner' || !modalData) return null;

  const routine = modalData;
  const activities = routine.activities || [];
  const categories = data.categories || [];

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [stepElapsedSeconds, setStepElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const currentActivity = activities[currentStepIdx] || activities[0];
  const totalSteps = activities.length;
  const isFinished = currentStepIdx >= totalSteps;

  // Interval timer for current step
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !isFinished) {
      interval = setInterval(() => {
        setStepElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isFinished]);

  const handleNextStep = () => {
    triggerSound('habit-complete');
    setCompletedSteps((prev) => ({
      ...prev,
      [currentActivity.id || currentStepIdx]: true
    }));

    if (currentStepIdx + 1 < totalSteps) {
      setCurrentStepIdx((prev) => prev + 1);
      setStepElapsedSeconds(0);
    } else {
      // Completed entire routine!
      setCurrentStepIdx(totalSteps);
      triggerSound('fanfare');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  };

  const handleFinishAndLog = () => {
    // Log routine as completed (NO fake time entries created)
    logRoutineTaskExecution(routine.id, 'done', {
      onTime: true,
      location: routine.type === 'prayer' || routine.categoryId === 'spiritual' ? 'mosque' : 'home'
    });

    setActiveModal(null);
  };

  const currentCategoryMeta = getCategoryMeta(currentActivity?.categoryId, categories);

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', padding: '2.25rem' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.6rem' }}>{routine.icon}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{routine.name}</h3>
                <span className="badge badge-excellent" style={{ fontSize: '0.7rem' }}>
                  RUNNER MODE
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{routine.timeSlot}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        {!isFinished ? (
          <div>
            {/* Step Progress Bar */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  STEP {currentStepIdx + 1} OF {totalSteps}
                </span>
                <span style={{ color: 'var(--primary-light)' }}>
                  {Math.round(((currentStepIdx) / totalSteps) * 100)}% COMPLETE
                </span>
              </div>
              <div className="progress-bar-container" style={{ height: '8px' }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${((currentStepIdx + 1) / totalSteps) * 100}%`,
                    background: 'linear-gradient(90deg, var(--primary), #10b981)'
                  }} 
                />
              </div>
            </div>

            {/* Current Active Step Box */}
            <div style={{
              background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-card))',
              border: `2px solid ${currentCategoryMeta.color || 'var(--primary)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              textAlign: 'center',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-md)'
            }}>
              <span className={`badge ${currentCategoryMeta.badgeClass}`} style={{ marginBottom: '0.75rem' }}>
                {currentCategoryMeta.name}
              </span>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                {currentActivity?.title}
              </h2>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                <Clock size={16} />
                <span>Planned: <strong>{currentActivity?.duration} mins</strong></span>
              </div>

              {/* Step Timer Ticker */}
              <div className="mono" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                {formatDurationHMS(stepElapsedSeconds)}
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  style={{ minWidth: '110px' }}
                >
                  {isTimerRunning ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                  <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
                </button>

                <button
                  className="btn btn-success btn-lg"
                  onClick={handleNextStep}
                  style={{ gap: '0.5rem' }}
                >
                  <CheckCircle2 size={18} />
                  <span>{currentStepIdx + 1 === totalSteps ? 'Complete Routine' : 'Next Step'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Checklist of all steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Routine Sequence
              </div>
              {activities.map((act, idx) => {
                const isCurrent = idx === currentStepIdx;
                const isDone = idx < currentStepIdx;
                return (
                  <div
                    key={act.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: isCurrent ? 'var(--primary-glow)' : isDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-app)',
                      border: isCurrent ? '1px solid var(--primary-light)' : '1px solid var(--border-color)',
                      opacity: isDone ? 0.7 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {isDone ? (
                        <CheckCircle2 size={16} color="#10b981" />
                      ) : (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: '18px' }}>
                          #{idx + 1}
                        </span>
                      )}
                      <span style={{ fontSize: '0.85rem', fontWeight: isCurrent ? 700 : 500 }}>
                        {act.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{act.duration}m</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Finished Screen */
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)'
            }}>
              <Trophy size={36} />
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Routine Completed! 🔥
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '450px', margin: '0 auto 1.75rem' }}>
              Outstanding discipline! All {totalSteps} activities in <strong>{routine.name}</strong> have been completed and scored.
            </p>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleFinishAndLog}
              style={{ minWidth: '220px', margin: '0 auto' }}
            >
              <CheckCircle2 size={18} />
              <span>Log to Timeline & Close</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
