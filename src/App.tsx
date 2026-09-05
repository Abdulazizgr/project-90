import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { GlobalTimerBar } from './components/layout/GlobalTimerBar';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { TimeTrackerView } from './components/timer/TimeTrackerView';
import { HabitsView } from './components/habits/HabitsView';
import { RoutinesView } from './components/routines/RoutinesView';
import { DailyTimelineView } from './components/timeline/DailyTimelineView';
import { Calendar90View } from './components/calendar/Calendar90View';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { DailyReflectionView } from './components/journal/DailyReflectionView';
import { GoalsView } from './components/goals/GoalsView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { ManualEntryModal } from './components/timer/ManualEntryModal';
import { HabitModal } from './components/habits/HabitModal';
import { RoutineRunnerModal } from './components/routines/RoutineRunnerModal';
import { RoutineModal } from './components/routines/RoutineModal';
import { DayDetailModal } from './components/calendar/DayDetailModal';

export const App = () => {
  const { activeTab } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'timer':
        return <TimeTrackerView />;
      case 'habits':
        return <HabitsView />;
      case 'routines':
        return <RoutinesView />;
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
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main App Deck */}
      <div className="main-content">
        {/* Topbar Header */}
        <Topbar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        {/* Dynamic View Component */}
        <main style={{ flex: 1 }}>{renderActiveView()}</main>

        {/* Global Persistent Clockify Timer Bottom Bar */}
        <GlobalTimerBar />
      </div>

      {/* Global Modals */}
      <ManualEntryModal />
      <HabitModal />
      <RoutineRunnerModal />
      <RoutineModal />
      <DayDetailModal />
    </div>
  );
};
