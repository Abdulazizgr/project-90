'use client';

import React from 'react';
import { ChallengeHero } from './ChallengeHero';
import { TodayExecutionBoard } from './TodayExecutionBoard';
import { CategoryCards } from './CategoryCards';
import { Clock, BookOpen, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface DashboardViewProps {
  onOpenCategoryManager?: () => void;
  onOpenRoutineModal?: () => void;
  onOpenManual?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onOpenCategoryManager, 
  onOpenRoutineModal,
  onOpenManual
}) => {
  const { setActiveTab } = useApp();

  return (
    <div className="page-container">
      {/* 1. Challenge & Daily Snapshot Hero */}
      <ChallengeHero />

      {/* Quick Action Banners for My Day and Reflection */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '0.85rem',
        marginBottom: '1.5rem'
      }}>
        {/* Record 24h Time Banner */}
        <div 
          className="card"
          onClick={() => setActiveTab('my_day')}
          style={{
            padding: '1rem 1.15rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(59, 130, 246, 0.05))',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'transform var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-light)'
            }}>
              <Clock size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800 }}>My Day: 24h Time Review</h4>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Compare planned vs actual time & balance your 24 hours
              </p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--primary-light)" />
        </div>

        {/* Evening Reflection Banner */}
        <div 
          className="card"
          onClick={() => setActiveTab('journal')}
          style={{
            padding: '1rem 1.15rem',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05))',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'transform var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(168, 85, 247, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a855f7'
            }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800 }}>Daily 5-Question Reflection</h4>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Answer the 5 daily questions to lock in lessons and priorities
              </p>
            </div>
          </div>
          <ChevronRight size={18} color="#a855f7" />
        </div>
      </div>

      {/* 2. Today's Execution Board (Routines + Tasks) */}
      <TodayExecutionBoard 
        onOpenRoutineModal={onOpenRoutineModal} 
        onOpenTaskModal={() => setActiveTab('tasks')}
      />

      {/* 3. Core Categories & Focus Areas */}
      <CategoryCards 
        onOpenCategoryManager={onOpenCategoryManager} 
        onOpenRoutineModal={onOpenRoutineModal} 
      />
    </div>
  );
};
