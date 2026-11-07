import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  BookOpen, 
  X, 
  HelpCircle, 
  Layers, 
  Zap, 
  Clock, 
  Award,
  CalendarDays
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface GettingStartedGuideProps {
  onOpenManual?: () => void;
  onOpenCategoryManager?: () => void;
}

export const GettingStartedGuide: React.FC<GettingStartedGuideProps> = ({ 
  onOpenManual, 
  onOpenCategoryManager 
}) => {
  const { data, todayStr, setActiveTab, toggleGettingStartedGuide } = useApp();

  const isVisible = data.showGettingStartedGuide !== false;
  const currentDay = data.challenge?.currentDay || 1;
  const hasRoutinesChecked = Object.values(data.routineLogsHistory?.[todayStr] || {}).some((l: any) => l.completed || l.status === 'done');
  const hasReflection = Object.keys(data.journalEntries || {}).length > 0;

  if (!isVisible) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '1rem'
      }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={toggleGettingStartedGuide}
          style={{
            fontSize: '0.78rem',
            color: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)'
          }}
        >
          <HelpCircle size={14} />
          <span>Need Help? Show Day 1 Guidelines & Roadmap</span>
        </button>
      </div>
    );
  }

  const steps = [
    {
      id: 'step1',
      title: '1. Master Your 5 Core Life Pillars',
      desc: 'PROJECT 90 balances Spiritual 🕌, Digital 📱, Personal 👤, Health 💪, and Career 💻. Customize tasks anytime in Projects.',
      completed: true,
      actionLabel: 'View Pillars',
      onClick: () => onOpenCategoryManager?.()
    },
    {
      id: 'step2',
      title: '2. Check Off Today\'s Routines & Tasks',
      desc: 'Execute daily routines (prayers, workout, focus blocks) and log on-time or reasons.',
      completed: hasRoutinesChecked,
      actionLabel: 'Go to Routines',
      onClick: () => setActiveTab('routines')
    },
    {
      id: 'step3',
      title: '3. Run Your First Guided Routine',
      desc: 'Launch the step-by-step runner on any routine to focus and check off steps sequentially.',
      completed: Object.values(data.routineLogsHistory?.[todayStr] || {}).some((l: any) => l.completed || l.status === 'done'),
      actionLabel: 'Launch Routine',
      onClick: () => setActiveTab('routines')
    },
    {
      id: 'step4',
      title: '4. Complete Evening Reflection',
      desc: 'Answer the 4 daily reflection questions at night to diagnose distractions and lock in your score.',
      completed: hasReflection,
      actionLabel: 'Daily Reflection',
      onClick: () => setActiveTab('journal')
    }
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.06))',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      borderRadius: 'var(--radius-xl)',
      padding: '1.5rem',
      marginBottom: '1.75rem',
      position: 'relative',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--primary-glow)',
            color: '#ffffff'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Day {currentDay} Quick Start & Operational Guidelines</span>
              <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary-light)', fontSize: '0.7rem' }}>
                START FROM SCRATCH
              </span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Follow these 4 core principles to build unbreakable daily discipline and momentum.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onOpenManual && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenManual}
              style={{ gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700 }}
            >
              <BookOpen size={14} color="var(--primary-light)" />
              <span>Full User Manual</span>
            </button>
          )}
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={toggleGettingStartedGuide}
            title="Dismiss Guidelines Card"
            aria-label="Dismiss Guidelines"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 4 Roadmap Steps Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.85rem',
        marginTop: '0.75rem'
      }}>
        {steps.map((step) => (
          <div 
            key={step.id} 
            style={{
              background: 'var(--bg-card)',
              border: step.completed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: step.completed ? 'var(--cat-spiritual)' : 'var(--text-primary)' }}>
                  {step.title}
                </span>
                {step.completed ? (
                  <CheckCircle2 size={16} color="var(--cat-spiritual)" />
                ) : (
                  <Circle size={16} color="var(--text-muted)" />
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.85rem' }}>
                {step.desc}
              </p>
            </div>

            <button
              className="btn btn-ghost btn-sm"
              onClick={step.onClick}
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--primary-light)',
                padding: '0.35rem 0.5rem',
                justifyContent: 'space-between',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span>{step.actionLabel}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
