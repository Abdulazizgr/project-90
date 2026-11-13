'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNavBar } from '@/components/layout/MobileNavBar';

// Auth
import { LoginPage } from '@/components/auth/LoginPage';

// 8 Core Views
import { DashboardView } from '@/components/dashboard/DashboardView';
import { MyDayView } from '@/components/timeline/MyDayView';
import { RoutinesView } from '@/components/routines/RoutinesView';
import { TasksView } from '@/components/tasks/TasksView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { WeeklyReportView } from '@/components/reports/WeeklyReportView';
import { DailyReflectionView } from '@/components/journal/DailyReflectionView';
import { AchievementsView } from '@/components/achievements/AchievementsView';
import { SettingsView } from '@/components/settings/SettingsView';

// Modals & Drawers
import { RoutineRunnerModal } from '@/components/routines/RoutineRunnerModal';
import { RoutineModal } from '@/components/routines/RoutineModal';
import { DayDetailModal } from '@/components/calendar/DayDetailModal';
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer';
import { CategoryManagerModal } from '@/components/categories/CategoryManagerModal';
import { CommandPaletteModal } from '@/components/common/CommandPaletteModal';
import { UserManualModal } from '@/components/manual/UserManualModal';
import { SetupWizardModal } from '@/components/onboarding/SetupWizardModal';
import { PWAInstallBanner } from '@/components/common/PWAInstallBanner';

function MainApp() {
  const { 
    isAuthenticated,
    setIsAuthenticated,
    activeTab, 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    setActiveModal
  } = useApp();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);

  // If owner is not logged in, render the secure Sign In screen!
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
            onOpenRoutineModal={() => setActiveModal('routine_modal')}
            onOpenManual={() => setIsManualOpen(true)}
          />
        );
      case 'my_day':
      case 'timeline':
        return <MyDayView />;
      case 'routines':
      case 'habits':
        return <RoutinesView />;
      case 'tasks':
        return <TasksView />;
      case 'calendar':
        return <CalendarView />;
      case 'reports':
        return <WeeklyReportView />;
      case 'journal':
        return <DailyReflectionView />;
      case 'achievements':
        return <AchievementsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView 
            onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
            onOpenRoutineModal={() => setActiveModal('routine_modal')}
            onOpenManual={() => setIsManualOpen(true)}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* PWA Mobile Add to Home Screen Prompt */}
      <PWAInstallBanner />

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

      {/* Desktop / Responsive Sidebar Navigation */}
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
          onOpenPillarModal={() => setIsCategoryManagerOpen(true)}
          onOpenRoutineModal={() => setActiveModal('routine_modal')}
        />

        {/* Dynamic View Component */}
        <main style={{ flex: 1 }}>{renderActiveView()}</main>

        {/* Mobile-First Bottom Navigation Bar */}
        <MobileNavBar />
      </div>

      {/* Modals & Drawers */}
      <RoutineRunnerModal />
      <RoutineModal />
      <DayDetailModal />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <CategoryManagerModal isOpen={isCategoryManagerOpen} onClose={() => setIsCategoryManagerOpen(false)} />
      <SetupWizardModal />
      <CommandPaletteModal 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenManual={() => setIsManualOpen(true)}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
      />
      <UserManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
