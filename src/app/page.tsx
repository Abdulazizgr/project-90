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
import { MoneyTrackerView } from '@/components/finance/MoneyTrackerView';
import { AppLockModal } from '@/components/auth/AppLockModal';

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
import { ApexLogo } from '@/components/common/ApexLogo';

function MainApp() {
  const { 
    isAuthenticated,
    isAuthLoading,
    isViewLoading,
    isAppLocked,
    setIsAppLocked,
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

  // 1. While resolving session/local auth, show subtle splash screen (never flash Login screen!)
  if (isAuthLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        gap: '1.25rem',
        animation: 'pageFadeIn 0.25s ease-out'
      }}>
        <ApexLogo size={52} />
        <div style={{
          width: '140px',
          height: '3px',
          background: 'var(--bg-surface)',
          borderRadius: '999px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            background: 'linear-gradient(90deg, transparent, var(--primary-light), transparent)',
            animation: 'progressIndeterminate 1.2s ease-in-out infinite'
          }} />
        </div>
      </div>
    );
  }

  // 2. If owner is not logged in after check completes, render the Sign In screen
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
      case 'finance':
      case 'money':
        return <MoneyTrackerView />;
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

        {/* Dynamic View Component with Top Slim Loading Progress Bar */}
        <main style={{ flex: 1, minWidth: 0, width: '100%', overflowX: 'hidden', position: 'relative' }}>
          {isViewLoading && (
            <div style={{
              position: 'sticky',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              zIndex: 99,
              overflow: 'hidden',
              background: 'var(--bg-surface)'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                background: 'linear-gradient(90deg, var(--primary), var(--primary-light), #ec4899)',
                animation: 'progressIndeterminate 0.8s ease-in-out infinite',
                boxShadow: '0 0 10px var(--primary-glow)'
              }} />
            </div>
          )}
          <div key={activeTab} className="page-transition-enter">
            {renderActiveView()}
          </div>
        </main>

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
      
      {/* Biometric Security Lock Overlay */}
      <AppLockModal isLocked={isAppLocked} onUnlock={() => setIsAppLocked(false)} />
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
