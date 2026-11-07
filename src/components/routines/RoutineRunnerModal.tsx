'use client';

import React, { useState, useEffect } from 'react';
import { X, Play, Pause, CheckCircle2, ArrowRight, Clock, Trophy, Sparkles, Volume2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import { formatDurationHMS, formatDurationHuman } from '@/utils/calculations';

export const RoutineRunnerModal = () => {
  const { data, activeModal, setActiveModal, modalData, logRoutineTaskExecution, triggerSound, todayStr } = useApp();

  if (activeModal !== 'routine_runner' || !modalData) return null;

  const routine = modalData;
  const rawSteps = routine.steps || routine.activities || [];
  // Fallback if no steps defined: create single step
  const steps = rawSteps.length > 0 ? rawSteps : [
    { id: 'st_main', title: routine.title || routine.name || 'Execute Routine', durationMinutes: routine.durationMinutes || 15 }
  ];

  const categories = data.categories || [];
  const pillar = categories.find((c: any) => c.id === routine.categoryId);
  const pillarColor = routine.color || pillar?.color || '#6366f1';
  const pillarIcon = routine.icon || pillar?.icon || '⚡';

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [stepElapsedSeconds, setStepElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);

  const totalSteps = steps.length;
  const isFinished = currentStepIdx >= totalSteps;
  const currentStep = steps[currentStepIdx] || steps[0];

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
    const stepId = currentStep.id || `st_${currentStepIdx}`;
    const nextCompleted = [...completedStepIds, stepId];
    setCompletedStepIds(nextCompleted);

    if (currentStepIdx + 1 < totalSteps) {
      setCurrentStepIdx((prev) => prev + 1);
      setStepElapsedSeconds(0);
    } else {
      // Completed entire routine!
      setCurrentStepIdx(totalSteps);
      triggerSound('level-up');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  };

  const handleFinishAndLog = () => {
    logRoutineTaskExecution(routine.id, 'done', {
      completedSteps: completedStepIds,
      onTime: true
    });
    setActiveModal(null);
  };

  const handleStepClick = (index: number) => {
    if (index < totalSteps) {
      setCurrentStepIdx(index);
      setStepElapsedSeconds(0);
    }
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
          border: `1px solid ${pillarColor}40`
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{pillarIcon}</span>
            <div>
              <span 
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: pillarColor
                }}
              >
                {pillar?.name || 'Focus Pillar'} • Guided Routine
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{routine.title || routine.name}</h2>
            </div>
          </div>
          <button 
            className="btn btn-ghost btn-icon" 
            onClick={() => setActiveModal(null)}
            aria-label="Close runner"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, Math.round((currentStepIdx / totalSteps) * 100))}%`,
            background: `linear-gradient(90deg, ${pillarColor}, #8b5cf6)`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {!isFinished ? (
          <div>
            {/* Step Card */}
            <div style={{
              background: 'var(--bg-input)',
              border: `1px solid ${pillarColor}30`,
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              textAlign: 'center',
              marginBottom: '1.25rem'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Step {currentStepIdx + 1} of {totalSteps}
              </span>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--text-primary)' }}>
                {currentStep.title}
              </h3>

              {currentStep.durationMinutes && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Target Duration: ~{currentStep.durationMinutes} mins
                </p>
              )}

              {/* Step Stopwatch */}
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: isTimerRunning ? pillarColor : 'var(--text-muted)',
                marginBottom: '1rem'
              }}>
                {formatDurationHMS(stepElapsedSeconds)}
              </div>

              {/* Timer Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  style={{ gap: '0.35rem' }}
                >
                  {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setStepElapsedSeconds(0)}
                  title="Reset Timer"
                  style={{ padding: '0.4rem' }}
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Checklist of Steps Preview */}
            <div style={{ marginBottom: '1.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {steps.map((st: any, idx: number) => {
                  const isCurrent = idx === currentStepIdx;
                  const isDone = completedStepIds.includes(st.id || `st_${idx}`);
                  return (
                    <div
                      key={st.id || idx}
                      onClick={() => handleStepClick(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: isCurrent ? 'var(--bg-surface)' : 'transparent',
                        border: isCurrent ? `1px solid ${pillarColor}50` : '1px solid transparent',
                        cursor: 'pointer',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isDone ? '#10b981' : isCurrent ? pillarColor : 'var(--bg-input)',
                          color: '#ffffff',
                          fontSize: '0.68rem',
                          fontWeight: 700
                        }}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span style={{
                          color: isDone ? 'var(--text-muted)' : isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                          textDecoration: isDone ? 'line-through' : 'none',
                          fontWeight: isCurrent ? 700 : 500
                        }}>
                          {st.title}
                        </span>
                      </div>
                      {st.durationMinutes && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {st.durationMinutes}m
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Primary Action Button */}
            <button
              className="btn btn-primary"
              onClick={handleNextStep}
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 800,
                gap: '0.5rem',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <span>{currentStepIdx + 1 === totalSteps ? 'Complete Last Step & Finish' : 'Next Step'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* Finished State */
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)'
            }}>
              <Trophy size={32} />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Routine Complete! 🎉
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
              Awesome discipline! All {totalSteps} steps completed and recorded toward your daily execution score.
            </p>

            <button
              className="btn btn-primary"
              onClick={handleFinishAndLog}
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: 'var(--radius-lg)'
              }}
            >
              Save to Timeline & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
