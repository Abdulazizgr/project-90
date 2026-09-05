'use client';

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { GlobalTimerBar } from '@/components/layout/GlobalTimerBar';

// Auth
import { LoginPage } from '@/components/auth/LoginPage';
import { AuthModal } from '@/components/auth/AuthModal';

// Views
import { DashboardView } from '@/components/dashboard/DashboardView';
import { ProjectsTasksView } from '@/components/projects/ProjectsTasksView';
import { TimeTrackerView } from '@/components/timer/TimeTrackerView';
import { HabitsView } from '@/components/habits/HabitsView';
import { RoutinesView } from '@/components/routines/RoutinesView';
import { WeeklyScheduleView } from '@/components/weekly/WeeklyScheduleView';
import { DailyTimelineView } from '@/components/timeline/DailyTimelineView';
import { Calendar90View } from '@/components/calendar/Calendar90View';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { DailyReflectionView } from '@/components/journal/DailyReflectionView';
import { GoalsView } from '@/components/goals/GoalsView';
import { AchievementsView } from '@/components/achievements/AchievementsView';
import { SettingsView } from '@/components/settings/SettingsView';

// Modals & Drawers
import { ManualEntryModal } from '@/components/timer/ManualEntryModal';
import { HabitModal } from '@/components/habits/HabitModal';
import { RoutineRunnerModal } from '@/components/routines/RoutineRunnerModal';
import { RoutineModal } from '@/components/routines/RoutineModal';
import { DayDetailModal } from '@/components/calendar/DayDetailModal';
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer';
import { WeeklyReviewModal } from '@/components/reviews/WeeklyReviewModal';
import { SundayPlannerModal } from '@/components/reviews/SundayPlannerModal';
import { CategoryManagerModal } from '@/components/categories/CategoryManagerModal';
import { CommandPaletteModal } from '@/components/common/CommandPaletteModal';
import { UserManualModal } from '@/components/manual/UserManualModal';
import { SetupWizardModal } from '@/components/onboarding/SetupWizardModal';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

function MainApp() {
  const { data, user, isAuthenticated, setIsAuthenticated, activeTab, isAuthModalOpen, setIsAuthModalOpen, handleSignOut, setOnboardingStep } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);
  const [isSundayPlannerOpen, setIsSundayPlannerOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);

  // If user is not authenticated yet, render the Login Page first!
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // If new user hasn't completed onboarding flow, show the dedicated setup experience!
  if (data.onboardingStep && data.onboardingStep !== 'completed') {
    return <OnboardingFlow onComplete={() => setOnboardingStep('completed')} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
            onOpenSundayPlanner={() => setIsSundayPlannerOpen(true)}
          />
        );
      case 'projects':
        return <ProjectsTasksView />;
      case 'timer':
        return <TimeTrackerView />;
      case 'habits':
        return <HabitsView />;
      case 'routines':
        return <RoutinesView />;
      case 'weekly':
        return <WeeklyScheduleView />;
      case 'timeline':
        return <DailyTimelineView />;
      case 'calendar':
        return <Calendar90View />;
      case 'analytics':
        return <AnalyticsView />;
      case 'journal':
        return <DailyReflectionView />;
      case 'goals':
        return <GoalsView />;
      case 'achievements':
        return <AchievementsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView 
            onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
            onOpenSundayPlanner={() => setIsSundayPlannerOpen(true)}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Sidebar Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 35
          }}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Topbar Header */}
        <Topbar 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenManual={() => setIsManualOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Dynamic View Component */}
        <main style={{ flex: 1 }}>{renderActiveView()}</main>

        {/* Global Persistent Clockify Timer Bar */}
        <GlobalTimerBar />
      </div>

      {/* Modals & Drawers */}
      <ManualEntryModal />
      <HabitModal />
      <RoutineRunnerModal />
      <RoutineModal />
      <DayDetailModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <WeeklyReviewModal isOpen={isWeeklyReviewOpen} onClose={() => setIsWeeklyReviewOpen(false)} />
      <SundayPlannerModal isOpen={isSundayPlannerOpen} onClose={() => setIsSundayPlannerOpen(false)} />
      <CategoryManagerModal isOpen={isCategoryManagerOpen} onClose={() => setIsCategoryManagerOpen(false)} />
      <SetupWizardModal />
      <CommandPaletteModal 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenManual={() => setIsManualOpen(true)}
        onOpenWeeklyReview={() => setIsWeeklyReviewOpen(true)}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
        onOpenSundayPlanner={() => setIsSundayPlannerOpen(true)}
      />
      <UserManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
