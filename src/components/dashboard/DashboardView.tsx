import React from 'react';
import { Calendar, ArrowRight, Sparkles, Layers } from 'lucide-react';
import { ChallengeHero } from './ChallengeHero';
import { MetricsOverview } from './MetricsOverview';
import { LifeBalanceWidget } from './LifeBalanceWidget';
import { CategoryCards } from './CategoryCards';
import { TodayExecutionBoard } from './TodayExecutionBoard';
import { GettingStartedGuide } from './GettingStartedGuide';

interface DashboardViewProps {
  onOpenCategoryManager?: () => void;
  onOpenSundayPlanner?: () => void;
  onOpenManual?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onOpenCategoryManager, 
  onOpenSundayPlanner,
  onOpenManual
}) => {
  const isSunday = new Date().getDay() === 0;

  return (
    <div className="page-container">
      {/* 90-Day Challenge Progress Hero */}
      <ChallengeHero />

      {/* Day 1 Quick Start & Guidelines Card (Collapsible/Dismissible) */}
      <GettingStartedGuide 
        onOpenManual={onOpenManual} 
        onOpenCategoryManager={onOpenCategoryManager} 
      />

      {/* Sunday Weekly Review Callout Banner (only if Sunday or user wants to review) */}
      {isSunday && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.08))',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.6rem' }}>🗓️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Weekly Sprint Retrospective & Next-Week Planner</span>
                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '0.65rem' }}>
                  IT'S SUNDAY!
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Analyze past 7 days, diagnose imbalance, and lock in your Top 3 priorities for the new sprint.
              </p>
            </div>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={onOpenSundayPlanner}
            style={{ gap: '0.4rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontWeight: 700 }}
          >
            <span>Launch Sunday Planner</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 4 Key Metrics (Score, Streak, Time Tracked, Routines Done) */}
      <MetricsOverview />

      {/* TODAY'S EXECUTION & FOCUS HUB (ROUTINES + PROJECT TASKS) */}
      <TodayExecutionBoard />

      {/* Life Balance & Anti-Burnout Engine */}
      <LifeBalanceWidget />

      {/* Dynamic Life Pillars Progress Cards */}
      <CategoryCards onOpenCategoryManager={onOpenCategoryManager} />
    </div>
  );
};
