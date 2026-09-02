import React, { useState } from 'react';
import { 
  Sparkles, 
  SunMedium, 
  Calendar, 
  Rocket, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  Plus, 
  Clock, 
  Dumbbell, 
  Flame, 
  Target,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const SetupWizardModal = ({ isOpen, onClose }) => {
  const { 
    data, 
    isSetupWizardOpen, 
    setIsSetupWizardOpen, 
    launchSprint, 
    addRecurringWeeklyEvent,
    triggerSound 
  } = useApp();

  const isModalOpen = isOpen !== undefined ? isOpen : isSetupWizardOpen;
  const handleClose = onClose || (() => setIsSetupWizardOpen(false));

  const [step, setStep] = useState(1); // 1 | 2 | 3
  
  // Step 3 Launch Form State
  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Next Monday
  const nextMonday = new Date(today);
  const daysUntilMon = ((1 - today.getDay() + 7) % 7) || 7;
  nextMonday.setDate(today.getDate() + daysUntilMon);

  const [startDate, setStartDate] = useState(formatDate(today));
  const [sprintName, setSprintName] = useState(data.challenge?.name || 'PROJECT 90: Master Life Sprint');
  const [goal, setGoal] = useState(data.profile?.challengeGoal || 'Transform my life across 90 days with balance, discipline, and focus');

  if (!isModalOpen) return null;

  const categories = data.categories || [];
  const routines = data.routines || [];
  const habits = data.habits || [];
  const weeklySchedule = data.recurringWeeklySchedule || [];

  const handleLaunch = () => {
    launchSprint({
      startDate,
      challengeName: sprintName.trim(),
      goal: goal.trim()
    });
    handleClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '680px', 
          width: '95%', 
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header & Progress Stepper */}
        <div className="modal-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px var(--primary-glow)'
              }}>
                <Sparkles size={18} color="#fff" />
              </div>
              <div>
                <h3 className="modal-title" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  90-Day Sprint Setup Guide
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Design your life blueprint before activating Day 1
                </p>
              </div>
            </div>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={handleClose}>
              <X size={18} />
            </button>
          </div>

          {/* Stepper Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.35rem', borderRadius: 'var(--radius-md)' }}>
            <div 
              style={{
                flex: 1,
                padding: '0.45rem',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                fontSize: '0.78rem',
                fontWeight: step === 1 ? 800 : 600,
                background: step === 1 ? 'var(--primary)' : 'transparent',
                color: step === 1 ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setStep(1)}
            >
              1. Everyday Routines
            </div>
            <div 
              style={{
                flex: 1,
                padding: '0.45rem',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                fontSize: '0.78rem',
                fontWeight: step === 2 ? 800 : 600,
                background: step === 2 ? 'var(--primary)' : 'transparent',
                color: step === 2 ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setStep(2)}
            >
              2. Weekly Schedule
            </div>
            <div 
              style={{
                flex: 1,
                padding: '0.45rem',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                fontSize: '0.78rem',
                fontWeight: step === 3 ? 800 : 600,
                background: step === 3 ? 'var(--primary)' : 'transparent',
                color: step === 3 ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setStep(3)}
            >
              3. Set Start Date & Launch
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {/* STEP 1: Daily Blueprint */}
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  🌅 Step 1: Everyday Routines & Habits
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  These are the foundational actions you execute <strong>every single day</strong>. They anchor your discipline and drive your 100-point daily scorecard.
                </p>
              </div>

              {/* Routines Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {routines.map(r => (
                  <div 
                    key={r.id}
                    style={{
                      padding: '0.9rem 1.1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface)',
                      borderLeft: `4px solid ${r.color || 'var(--primary)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span>{r.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{r.name}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.timeSlot} • {r.activities?.length || 0} sequential flow steps
                      </div>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                      Daily Anchor
                    </span>
                  </div>
                ))}
              </div>

              {/* Habits Preview */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Scorecard Habits ({habits.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {habits.map(h => (
                    <span 
                      key={h.id} 
                      className="badge badge-spiritual"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    >
                      {h.icon} {h.name} ({h.points} pts)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Weekly Schedule */}
          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  🗓️ Step 2: Recurring Weekly Commitments
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Add things that happen on <strong>specific days of the week</strong> (e.g. <strong>Gym on Tue/Thu/Sat</strong>, team syncs on Mon, family dinners).
                </p>
              </div>

              {/* Existing Schedule Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {weeklySchedule.map(item => {
                  const cat = categories.find(c => c.id === item.categoryId) || { icon: '🎯', color: '#6366f1' };
                  return (
                    <div 
                      key={item.id}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        borderLeft: `4px solid ${cat.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                          {item.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                            {item.days?.map(d => d.toUpperCase()).join(', ')}
                          </span>
                          <span>•</span>
                          <span>{item.timeSlot}</span>
                        </div>
                      </div>
                      <span className="badge" style={{ background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}44`, fontSize: '0.72rem' }}>
                        {cat.icon} {item.durationMinutes || 60}m
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Quick Gym / Common Presets */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
                border: '1px dashed var(--primary)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.6rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Want to add more weekly events?</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    You can manage and add custom events anytime in the Weekly Schedule tab.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    addRecurringWeeklyEvent({
                      title: 'Gym & Strength Conditioning',
                      categoryId: 'health',
                      days: ['tue', 'thu', 'sat'],
                      timeSlot: '06:00 PM - 07:30 PM',
                      durationMinutes: 90,
                      description: 'Hypertrophy workout'
                    });
                  }}
                  style={{ gap: '0.35rem' }}
                >
                  <Dumbbell size={14} />
                  <span>+ Add Tue/Thu/Sat Gym</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Set Start Date & Launch */}
          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  🚀 Step 3: Choose Start Date & Launch
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Choose when Day 1 of your 90-day transformation officially begins.
                </p>
              </div>

              {/* Date Presets */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">When do you want to start Day 1?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${startDate === formatDate(today) ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setStartDate(formatDate(today)); triggerSound('click'); }}
                    style={{ padding: '0.65rem 0.5rem', fontWeight: 700 }}
                  >
                    ⚡ Start Today
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${startDate === formatDate(tomorrow) ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setStartDate(formatDate(tomorrow)); triggerSound('click'); }}
                    style={{ padding: '0.65rem 0.5rem', fontWeight: 700 }}
                  >
                    🌅 Start Tomorrow
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${startDate === formatDate(nextMonday) ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setStartDate(formatDate(nextMonday)); triggerSound('click'); }}
                    style={{ padding: '0.65rem 0.5rem', fontWeight: 700 }}
                  >
                    🗓️ Next Monday
                  </button>
                </div>

                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>

              {/* Sprint Name */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Sprint Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={sprintName}
                  onChange={e => setSprintName(e.target.value)}
                  placeholder="PROJECT 90: Master Life Sprint"
                />
              </div>

              {/* Challenge Goal */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">90-Day Challenge Goal / Personal Mantra</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="e.g. Build unbreakable discipline, master engineering & elevate spiritual connection"
                />
              </div>

              {/* Summary Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', marginBottom: '0.25rem' }}>
                  🎯 90-DAY TRANSFORMATION SCHEDULE
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Start Date: <strong>{startDate}</strong> &rarr; Completion Date: <strong>{
                    (() => {
                      const d = new Date(startDate);
                      d.setDate(d.getDate() + 89);
                      return formatDate(d);
                    })()
                  }</strong> (90 Full Days)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {step > 1 ? (
            <button 
              type="button" 
              className="btn btn-ghost btn-sm" 
              onClick={() => setStep(step - 1)}
              style={{ gap: '0.35rem' }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button 
              type="button" 
              className="btn btn-primary btn-sm" 
              onClick={() => { setStep(step + 1); triggerSound('click'); }}
              style={{ gap: '0.35rem' }}
            >
              <span>Next Step</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleLaunch}
              style={{
                gap: '0.5rem',
                fontWeight: 800,
                padding: '0.65rem 1.25rem',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Rocket size={18} />
              <span>🚀 Launch My 90-Day Sprint</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
