'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Flame, 
  Clock, 
  Target, 
  SunMedium, 
  Moon, 
  Dumbbell, 
  Laptop, 
  Smartphone, 
  Heart, 
  Plus, 
  Trash2, 
  Check, 
  Layers, 
  Rocket, 
  ShieldCheck, 
  Zap, 
  BarChart3,
  Timer
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const OnboardingFlow = ({ onComplete }) => {
  const { 
    data, 
    setData, 
    completeOnboarding, 
    loadDemoAccount, 
    triggerSound, 
    addRoutine, 
    addRecurringWeeklyEvent, 
    deleteRecurringWeeklyEvent 
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1); // 1: Philosophy & Pillars, 2: Start Date & Countdown, 3: Everyday Routines, 4: Weekly Plan

  // Step 2 Form State
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Next Monday
  const nextMon = new Date(today);
  const dayOfWeek = today.getDay();
  const daysUntilMon = ((1 - dayOfWeek + 7) % 7) || 7;
  nextMon.setDate(today.getDate() + daysUntilMon);
  const nextMonStr = nextMon.toISOString().split('T')[0];

  const [startDateOption, setStartDateOption] = useState('tomorrow');
  const [customStartDate, setCustomStartDate] = useState(tomorrowStr);
  const [challengeName, setChallengeName] = useState('PROJECT 90: Master Life Sprint');
  const [challengeGoal, setChallengeGoal] = useState('Build sustainable discipline, balance 5 life pillars, and eliminate burnout.');

  const selectedStartDateStr = startDateOption === 'today' 
    ? todayStr 
    : startDateOption === 'tomorrow' 
      ? tomorrowStr 
      : startDateOption === 'monday' 
        ? nextMonStr 
        : customStartDate;

  // Real-time countdown for Step 2 preview
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const updateCountdown = () => {
      if (!selectedStartDateStr) return;
      const target = new Date(selectedStartDateStr + 'T00:00:00').getTime();
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
          isPast: false
        });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [selectedStartDateStr]);

  // Step 4: Quick Add Recurring Weekly Event State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('health');
  const [newEventDays, setNewEventDays] = useState(['tue', 'thu', 'sat']);
  const [newEventTimeSlot, setNewEventTimeSlot] = useState('06:00 PM - 07:30 PM');
  const [newEventDuration, setNewEventDuration] = useState(90);

  const toggleDay = (dayKey) => {
    if (newEventDays.includes(dayKey)) {
      if (newEventDays.length > 1) {
        setNewEventDays(newEventDays.filter(d => d !== dayKey));
      }
    } else {
      setNewEventDays([...newEventDays, dayKey]);
    }
  };

  const handleAddWeeklyEvent = (e) => {
    e?.preventDefault();
    if (!newEventTitle.trim()) return;
    addRecurringWeeklyEvent({
      title: newEventTitle.trim(),
      categoryId: newEventCategory,
      days: newEventDays,
      timeSlot: newEventTimeSlot,
      durationMinutes: Number(newEventDuration) || 60,
      description: 'Scheduled recurring activity'
    });
    setNewEventTitle('');
    triggerSound('pop');
  };

  const handleFinishOnboarding = () => {
    completeOnboarding({
      startDate: selectedStartDateStr,
      challengeName: challengeName.trim() || 'PROJECT 90: Master Life Sprint',
      goal: challengeGoal.trim()
    });
    if (onComplete) onComplete();
  };

  const pillars = [
    {
      id: 'spiritual',
      icon: '🕌',
      title: 'Spiritual',
      color: '#10b981',
      tagline: 'Moral Grounding & Serenity',
      desc: 'Daily 5 Salah on time, Quran study, morning/evening adhkar, and mindful reflection to stay anchored.'
    },
    {
      id: 'digital',
      icon: '📱',
      title: 'Digital Discipline',
      color: '#06b6d4',
      tagline: 'Attention & Focus Shield',
      desc: 'Cap screen time strictly under 2 hours, eliminate mindless doomscrolling, and protect morning focus.'
    },
    {
      id: 'personal',
      icon: '👤',
      title: 'Personal Development',
      color: '#a855f7',
      tagline: 'Discipline & Self-Mastery',
      desc: 'Consistent early wake time, daily war-room planning, non-fiction reading, and an organized living environment.'
    },
    {
      id: 'health',
      icon: '💪',
      title: 'Health & Vitality',
      color: '#f59e0b',
      tagline: 'Physical Conditioning',
      desc: 'Structured gym & strength training, clean nutrition, 3L daily hydration, and restorative sleep protocol.'
    },
    {
      id: 'career',
      icon: '💻',
      title: 'Career & Engineering',
      color: '#f43f5e',
      tagline: 'High-Leverage Execution',
      desc: 'Uninterrupted 3+ hour deep work blocks, high-value project delivery, and rapid skill acquisition.'
    }
  ];

  const daysOfWeekList = [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top center, #1e1b4b 0%, #0f172a 45%, #030712 100%)',
      color: '#f8fafc',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Top Header & Progress Stepper */}
      <div style={{ maxWidth: '960px', width: '100%', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
            }}>
              ⚡
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                PROJECT 90
              </h1>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                Build Your Life, One Day at a Time.
              </p>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {[
              { num: 1, name: 'Philosophy' },
              { num: 2, name: 'Start Date' },
              { num: 3, name: 'Everyday' },
              { num: 4, name: 'Weekly Plan' }
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num;
              return (
                <div
                  key={step.num}
                  onClick={() => {
                    if (isDone || step.num < currentStep) setCurrentStep(step.num);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    background: isActive 
                      ? 'rgba(99, 102, 241, 0.25)' 
                      : isDone 
                        ? 'rgba(16, 185, 129, 0.2)' 
                        : 'rgba(255, 255, 255, 0.05)',
                    border: isActive 
                      ? '1px solid #6366f1' 
                      : isDone 
                        ? '1px solid rgba(16, 185, 129, 0.4)' 
                        : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: (isDone || step.num < currentStep) ? 'pointer' : 'default',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#818cf8' : isDone ? '#34d399' : '#64748b'
                  }}
                >
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: isActive ? '#6366f1' : isDone ? '#10b981' : '#334155',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 800
                  }}>
                    {isDone ? '✓' : step.num}
                  </span>
                  <span className="hide-mobile">{step.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div style={{
        maxWidth: '960px',
        width: '100%',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '2.25rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* ========================================================================= */}
        {/* STEP 1: PHILOSOPHY & THE 5 PILLARS */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                color: '#818cf8',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '0.8rem'
              }}>
                <Sparkles size={14} />
                Welcome to PROJECT 90
              </div>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.6rem' }}>
                Transform Your Life with Unshakeable Balance
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
                Most productivity systems fail because of burnout: you plan 20 things, push hard for 2 days, hyper-focus on one area, crash, and quit. 
                <strong> PROJECT 90 builds a balanced life operating system across 5 core pillars.</strong>
              </p>
            </div>

            {/* The 5 Life Pillars Grid */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '1rem' }}>
                The 5 Life Pillars (Fully Customizable)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {pillars.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: `1px solid ${p.color}33`,
                      borderRadius: '16px',
                      padding: '1.2rem',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '1.6rem' }}>{p.icon}</span>
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: p.color, fontWeight: 700 }}>
                          {p.tagline}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* The 4 System Engines */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '2.25rem'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#818cf8', marginBottom: '0.85rem' }}>
                How Your 90-Day Transformation Works
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🌅</span>
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>Everyday Routines</strong>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Morning momentum, deep work blocks, evening review.</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📅</span>
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>Weekly Plan</strong>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Gym on Tue/Thu/Sat, meetings, and scheduled appointments.</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>⏱️</span>
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>Clockify Tracker</strong>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Real-time focus stopwatch tagged to projects and pillars.</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📊</span>
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>Sunday Retrospective</strong>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Diagnose weekly imbalance and plan the next 7 days.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  loadDemoAccount();
                  if (onComplete) onComplete();
                }}
                style={{ fontSize: '0.85rem', color: '#94a3b8' }}
              >
                <span>Preview Populated Demo Data</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  triggerSound('click');
                  setCurrentStep(2);
                }}
                style={{
                  padding: '0.85rem 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  gap: '0.6rem',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
                }}
              >
                <span>Step 1: Choose Start Date</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: CHOOSE START DATE & LIVE COUNTDOWN */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#22d3ee',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '0.8rem'
              }}>
                <Calendar size={14} />
                Step 1 of 3: Sprint Scheduling
              </div>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.6rem' }}>
                When Do You Want Day 1 to Start?
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '620px', margin: '0 auto', lineHeight: '1.5' }}>
                You do not have to rush into Day 1 right now. Picking tomorrow or next Monday gives you time to set up your habits and schedule without pressure!
              </p>
            </div>

            {/* Start Date Option Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {/* Option 1: Today */}
              <div
                onClick={() => {
                  setStartDateOption('today');
                  triggerSound('click');
                }}
                style={{
                  background: startDateOption === 'today' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                  border: startDateOption === 'today' ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>⚡</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.2rem' }}>Start Today</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Immediate Day 1 launch right now</div>
                <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, marginTop: '0.6rem' }}>
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {/* Option 2: Tomorrow (Recommended) */}
              <div
                onClick={() => {
                  setStartDateOption('tomorrow');
                  triggerSound('click');
                }}
                style={{
                  background: startDateOption === 'tomorrow' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                  border: startDateOption === 'tomorrow' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#10b981',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)'
                }}>
                  RECOMMENDED
                </div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🌅</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.2rem' }}>Start Tomorrow</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Wake up fresh tomorrow morning</div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginTop: '0.6rem' }}>
                  {tomorrow.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Option 3: Next Monday */}
              <div
                onClick={() => {
                  setStartDateOption('monday');
                  triggerSound('click');
                }}
                style={{
                  background: startDateOption === 'monday' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                  border: startDateOption === 'monday' ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🚀</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.2rem' }}>Next Monday</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Full week alignment sprint</div>
                <div style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, marginTop: '0.6rem' }}>
                  {nextMon.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Option 4: Custom Date */}
              <div
                onClick={() => {
                  setStartDateOption('custom');
                  triggerSound('click');
                }}
                style={{
                  background: startDateOption === 'custom' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                  border: startDateOption === 'custom' ? '2px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📅</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.2rem' }}>Custom Date</div>
                <input
                  type="date"
                  className="input"
                  min={todayStr}
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                    setStartDateOption('custom');
                  }}
                  style={{
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.78rem',
                    marginTop: '0.4rem',
                    width: '100%'
                  }}
                />
              </div>
            </div>

            {/* Live Countdown Display Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.6))',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: '18px',
              padding: '1.5rem',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                {startDateOption === 'today' ? '⚡ Day 1 Starts Immediately' : '⏳ Live Countdown to Day 1 Launch'}
              </div>

              {startDateOption === 'today' ? (
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', padding: '0.75rem 0' }}>
                  Ready to conquer Day 1 of 90 right now!
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', margin: '0.75rem 0' }}>
                  {[
                    { label: 'DAYS', val: String(countdown.days).padStart(2, '0') },
                    { label: 'HOURS', val: String(countdown.hours).padStart(2, '0') },
                    { label: 'MINUTES', val: String(countdown.minutes).padStart(2, '0') },
                    { label: 'SECONDS', val: String(countdown.seconds).padStart(2, '0') }
                  ].map((item, idx) => (
                    <React.Fragment key={item.label}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(10, 15, 30, 0.85)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        borderRadius: '12px',
                        padding: '0.75rem 1.25rem',
                        minWidth: '75px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
                      }}>
                        <span className="mono" style={{
                          fontSize: '1.8rem',
                          fontWeight: 900,
                          color: idx === 3 ? '#06b6d4' : '#f8fafc',
                          lineHeight: '1'
                        }}>
                          {item.val}
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', marginTop: '0.35rem' }}>
                          {item.label}
                        </span>
                      </div>
                      {idx < 3 && <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6366f1' }}>:</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, marginTop: '0.5rem' }}>
                Start Date: <strong>{new Date(selectedStartDateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong> • Duration: <strong>90 Days</strong>
              </p>
            </div>

            {/* Main Goal / Vision Input */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#e2e8f0' }}>
                Your Main 90-Day Transformation Goal:
              </label>
              <input
                type="text"
                className="input"
                value={challengeGoal}
                onChange={(e) => setChallengeGoal(e.target.value)}
                placeholder="e.g. Build disciplined habits, get in peak physical shape, and deliver my core engineering projects."
                style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.92rem' }}
              />
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  triggerSound('click');
                  setCurrentStep(3);
                }}
                style={{
                  padding: '0.85rem 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  gap: '0.6rem',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
                }}
              >
                <span>Step 2: Setup Everyday Routines</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: EVERYDAY ROUTINES (THINGS TO DO EVERY DAY) */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34d399',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '0.8rem'
              }}>
                <SunMedium size={14} />
                Step 2 of 3: Everyday Routines
              </div>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.6rem' }}>
                What You Will Do Every Single Day
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto', lineHeight: '1.5' }}>
                Routines are your daily non-negotiable anchors. They ensure you start strong, execute deep work blocks, and reflect every evening.
              </p>
            </div>

            {/* 3 Main Routines Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {/* Routine 1: Morning */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>🌅</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#10b981' }}>Morning Momentum</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>06:00 AM - 08:00 AM (80 mins)</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={14} color="#10b981" /> 15m Hydration & Light
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={14} color="#10b981" /> 30m Salah / Mindfulness & Quran
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={14} color="#10b981" /> 20m Morning Movement / Stretch
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={14} color="#10b981" /> 15m Daily War-Room Planning
                  </div>
                </div>
              </div>

              {/* Routine 2: Deep Work */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '16px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>⚡</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f43f5e' }}>High-Impact Focus</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>09:00 AM - 05:00 PM (3+ hours)</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={14} color="#f43f5e" /> 90m Deep Work Sprint 1 (Zero Distraction)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={14} color="#f43f5e" /> 20m Movement / Restorative Break
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={14} color="#f43f5e" /> 90m Deep Work Sprint 2 (High Value)
                  </div>
                </div>
              </div>

              {/* Routine 3: Evening */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '16px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>🌙</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#a855f7' }}>Evening Wind-Down</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>08:00 PM - 10:00 PM (60 mins)</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={14} color="#a855f7" /> 15m PROJECT 90 Daily Reflection
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={14} color="#a855f7" /> 25m Non-Fiction Reading
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={14} color="#a855f7" /> 20m Tomorrow Prep & Sleep Protocol
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Habit Scorecard Anchors */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#cbd5e1', marginBottom: '0.75rem' }}>
                Included Daily Habit Scorecards (100 Points Total)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {[
                  '🕌 Faith & Reflection (20 pts)',
                  '📱 <2h Screen Time (15 pts)',
                  '⏰ Early Routine & Plan (15 pts)',
                  '💪 Workout & 3L Water (20 pts)',
                  '💻 3h+ Deep Work (20 pts)',
                  '📝 Evening Reflection (10 pts)'
                ].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      padding: '0.35rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  triggerSound('click');
                  setCurrentStep(4);
                }}
                style={{
                  padding: '0.85rem 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  gap: '0.6rem',
                  background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                  boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)'
                }}
              >
                <span>Step 3: Setup Weekly Plan (Gym Tue/Thu/Sat)</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: RECURRING WEEKLY PLAN (GYM ON TUE/THU/SAT, MEETINGS, ETC.) */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                color: '#f59e0b',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '0.8rem'
              }}>
                <Calendar size={14} />
                Step 3 of 3: Weekly Recurring Schedule
              </div>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.6rem' }}>
                What Happens Every Week (e.g. Gym on Tue, Thu, Sat)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto', lineHeight: '1.5' }}>
                Add the recurring things you already know you will do each week. They automatically appear on your 24-hour timeline and weekly calendar!
              </p>
            </div>

            {/* List of current recurring events */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.75rem' }}>
                Your Configured Weekly Events
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                {(data.recurringWeeklySchedule || []).map((event) => {
                  return (
                    <div
                      key={event.id}
                      style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '14px',
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                          {event.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: '#818cf8'
                          }}>
                            {event.timeSlot}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            ({event.durationMinutes} min)
                          </span>
                        </div>

                        {/* Days badges */}
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          {daysOfWeekList.map((d) => {
                            const isIncluded = event.days?.includes(d.key);
                            return (
                              <span
                                key={d.key}
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: '4px',
                                  background: isIncluded ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                                  color: isIncluded ? '#ffffff' : '#64748b'
                                }}
                              >
                                {d.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => deleteRecurringWeeklyEvent(event.id)}
                        style={{ color: '#ef4444', opacity: 0.8 }}
                        title="Delete recurring event"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Add Custom Weekly Event Form */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Plus size={16} />
                Add Another Weekly Recurring Event
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Event Title</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Gym & Strength Training"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Category</label>
                  <select
                    className="input"
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value)}
                    style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                  >
                    {(data.categories || []).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Time Slot</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="06:00 PM - 07:30 PM"
                    value={newEventTimeSlot}
                    onChange={(e) => setNewEventTimeSlot(e.target.value)}
                    style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Duration (mins)</label>
                  <input
                    type="number"
                    className="input"
                    value={newEventDuration}
                    onChange={(e) => setNewEventDuration(Number(e.target.value) || 0)}
                    style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>
              </div>

              {/* Days of Week Selector */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginRight: '0.25rem' }}>Days:</span>
                  {daysOfWeekList.map((d) => {
                    const isSelected = newEventDays.includes(d.key);
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => toggleDay(d.key)}
                        style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          border: isSelected ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          color: isSelected ? '#34d399' : '#94a3b8',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddWeeklyEvent}
                  disabled={!newEventTitle.trim()}
                  style={{ fontSize: '0.8rem', gap: '0.35rem' }}
                >
                  <Plus size={14} />
                  <span>Add to Weekly Plan</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentStep(3)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleFinishOnboarding}
                style={{
                  padding: '0.9rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 900,
                  gap: '0.65rem',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4, #6366f1)',
                  boxShadow: '0 6px 25px rgba(16, 185, 129, 0.45)'
                }}
              >
                <Rocket size={20} />
                <span>Launch PROJECT 90 🚀</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
