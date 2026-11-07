'use client';

import React from 'react';
import { ChallengeHero } from './ChallengeHero';
import { MetricsOverview } from './MetricsOverview';
import { CategoryCards } from './CategoryCards';
import { TodayExecutionBoard } from './TodayExecutionBoard';
import { GettingStartedGuide } from './GettingStartedGuide';

interface DashboardViewProps {
  onOpenCategoryManager?: () => void;
  onOpenRoutineModal?: () => void;
  onOpenSundayPlanner?: () => void;
  onOpenManual?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onOpenCategoryManager, 
  onOpenRoutineModal,
  onOpenManual
}) => {
  return (
    <div className="page-container">
      {/* 90-Day Challenge Progress Hero */}
      <ChallengeHero />

      {/* Day 1 Quick Start & Guidelines Card (Dismissible) */}
      <GettingStartedGuide 
        onOpenManual={onOpenManual} 
        onOpenCategoryManager={onOpenCategoryManager} 
      />

      {/* 4 Key Metrics (Score, Routine Execution, Streak, Dynamic Pillars) */}
      <MetricsOverview />

      {/* TODAY'S ROUTINE EXECUTION BOARD */}
      <TodayExecutionBoard 
        onOpenRoutineModal={onOpenRoutineModal} 
        onOpenPillarModal={onOpenCategoryManager} 
      />

      {/* MY DYNAMIC FOCUS PILLARS */}
      <CategoryCards 
        onOpenCategoryManager={onOpenCategoryManager} 
        onOpenRoutineModal={onOpenRoutineModal} 
      />
    </div>
  );
};
