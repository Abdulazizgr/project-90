import React, { useState, useEffect } from 'react';
import { Target, Calendar, Clock, Flame, Sparkles, ChevronRight, Rocket, CheckCircle2, Dumbbell, SunMedium, Timer, ArrowRight, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const calculateTimeRemaining = (targetDateStr) => {
  if (!targetDateStr) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, totalSeconds: 0 };
  const targetTime = new Date(targetDateStr + 'T00:00:00').getTime();
  const now = new Date().getTime();
  const diff = targetTime - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, totalSeconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isPast: false, totalSeconds: Math.floor(diff / 1000) };
};

export const ChallengeHero = () => {
  const { data, setActiveTab, setIsSetupWizardOpen, launchSprint } = useApp();
  const challenge = data.challenge || {};
  const isPlanning = challenge.status === 'planning';
  const currentDay = challenge.currentDay || 1;
  const totalDays = challenge.totalDurationDays || 90;
  const pctComplete = Math.min(100, Math.round((currentDay / totalDays) * 100));
  const daysLeft = Math.max(0, totalDays - currentDay);

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeRemaining(challenge.startDate));

  useEffect(() => {
    setTimeLeft(calculateTimeRemaining(challenge.startDate));
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(challenge.startDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [challenge.startDate]);

  if (isPlanning || !timeLeft.isPast) {
    const formattedStartDate = challenge.startDate 
      ? new Date(challenge.startDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
      : 'Upcoming';

    return (
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 27, 45, 0.95), rgba(10, 15, 29, 0.98))',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '1.5rem',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)'
      }}>
        {/* Ambient background glow */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.06) 50%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(245, 158, 11, 0.18)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.4)'
              }}>
                ⏳ Countdown to Day 1
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                Starts: {formattedStartDate}
              </span>
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
              {challenge.name || 'PROJECT 90: Master Life Sprint'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '620px', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Preparation phase active. Plan what you will do <strong>every day</strong> (routines/habits) and <strong>every week</strong> (gym on Tue/Thu/Sat, meetings) before Day 1 triggers!
            </p>

            {/* Interactive Countdown Timer Flip Boxes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { label: 'DAYS', val: String(timeLeft.days).padStart(2, '0') },
                { label: 'HOURS', val: String(timeLeft.hours).padStart(2, '0') },
                { label: 'MINUTES', val: String(timeLeft.minutes).padStart(2, '0') },
                { label: 'SECONDS', val: String(timeLeft.seconds).padStart(2, '0') }
              ].map((item, idx) => (
                <React.Fragment key={item.label}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.6rem 0.9rem',
                    minWidth: '65px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                  }}>
                    <span className="mono" style={{
                      fontSize: '1.45rem',
                      fontWeight: 900,
                      color: idx === 3 ? '#06b6d4' : 'var(--text-primary)',
                      lineHeight: '1.1'
                    }}>
                      {item.val}
                    </span>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.06em',
                      marginTop: '0.2rem'
                    }}>
                      {item.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'rgba(99, 102, 241, 0.6)' }}>:</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* 3 Step Interactive Setup Checklist */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.6rem' }}>
              <div 
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                onClick={() => setActiveTab('routines')}
              >
                <SunMedium size={16} color="#10b981" />
                <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  1. Everyday Routines &rarr;
                </div>
              </div>

              <div 
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                onClick={() => setActiveTab('weekly')}
              >
                <Calendar size={16} color="#06b6d4" />
                <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  2. Weekly Schedule &rarr;
                </div>
              </div>

              <div 
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                onClick={() => setIsSetupWizardOpen(true)}
              >
                <Timer size={16} color="var(--primary-light)" />
                <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  3. Adjust Date &rarr;
                </div>
              </div>
            </div>
          </div>

          {/* Action Launch Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', alignItems: 'flex-start', alignSelf: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={() => launchSprint({ startDate: new Date().toISOString().split('T')[0] })}
              style={{
                gap: '0.5rem',
                fontWeight: 800,
                padding: '0.85rem 1.4rem',
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              <Play size={17} fill="currentColor" />
              <span>Launch Day 1 Now</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsSetupWizardOpen(true)}
              style={{ fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}
            >
              <Calendar size={14} />
              <span>Change Start Date</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.85))',
      border: '1px solid rgba(99, 102, 241, 0.25)',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '1.5rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Background glowing gradient orb */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.2)',
              color: 'var(--primary-light)',
              border: '1px solid rgba(99, 102, 241, 0.4)'
            }}>
              90-Day Transformation
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--cat-spiritual)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              🟢 Active Sprint
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            {challenge.name || 'PROJECT 90: Master Life Sprint'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '650px' }}>
            "{data.profile?.challengeGoal || 'Build Your Life, One Day at a Time.'}"
          </p>
        </div>

        {/* Action button to 90-day matrix */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setActiveTab('calendar')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Calendar size={15} />
          <span>View 90-Day Matrix</span>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Progress Bar & Stats */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              DAY {currentDay}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>/ {totalDays}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.88rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{pctComplete}% COMPLETE</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{daysLeft} DAYS LEFT</span>
          </div>
        </div>

        {/* Large segmented progress bar */}
        <div className="progress-bar-container" style={{ height: '12px', background: 'rgba(255, 255, 255, 0.06)' }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${pctComplete}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

