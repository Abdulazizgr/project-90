'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNavBar } from '@/components/layout/MobileNavBar';

// Auth
import { LoginPage } from '@/components/auth/LoginPage';
import { AuthModal } from '@/components/auth/AuthModal';

// Views
import { DashboardView } from '@/components/dashboard/DashboardView';
import { RoutinesView } from '@/components/routines/RoutinesView';
import { DailyTimelineView } from '@/components/timeline/DailyTimelineView';
import { Calendar90View } from '@/components/calendar/Calendar90View';
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
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

function MainApp() {
  const { 
    data, 
    isAuthenticated, 
    setIsAuthenticated, 
    activeTab, 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    setOnboardingStep,
    setActiveModal
  } = useApp();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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
            onOpenRoutineModal={() => setActiveModal('routine_modal')}
            onOpenManual={() => setIsManualOpen(true)}
          />
        );
      case 'routines':
      case 'habits':
        return <RoutinesView />;
      case 'timeline':
        return <DailyTimelineView />;
      case 'calendar':
        return <Calendar90View />;
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
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
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

export default function Page() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
