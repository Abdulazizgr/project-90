'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { loadDataFromStorage, saveDataToStorage, exportDataAsJSON, importDataFromJSON, resetToCleanUserData } from '../utils/storage';
import { playSound } from '../utils/sound';
import { calculateExecutionScore, calculateRoutineProgressToday, isRoutineScheduledForDay, getScoreLevel } from '../utils/calculations';
import { authClient } from '../lib/auth-client';
import { DEFAULT_ACHIEVEMENTS } from '../utils/seedData';

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  const [data, setData] = useState<any>(() => loadDataFromStorage());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeModal, setActiveModal] = useState<string | null>(null); // 'routine_runner' | 'routine_modal' | 'pillar_modal' | 'day_detail'
  const [modalData, setModalData] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [isDbSynced, setIsDbSynced] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('p90_logged_in') === 'true';
    }
    return false;
  });

  // Better Auth session hook
  const sessionResult = (authClient as any)?.useSession ? (authClient as any).useSession() : { data: null, isPending: false };
  const sessionData: any = sessionResult?.data;
  const user = sessionData?.user;

  // Sync user login status
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('p90_logged_in', 'true');
      }
    }
  }, [user]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Apply theme to document element
  useEffect(() => {
    const currentTheme = data.profile?.theme || 'dark';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, [data.profile?.theme]);

  // Sync with MongoDB Atlas or use LocalStorage fallback
  useEffect(() => {
    let isMounted = true;
    const userId = user?.id || user?.email || 'guest_user';

    const fetchMongoData = async () => {
      try {
        const res = await fetch(`/api/data?userId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setData(json.data);
            setIsDbSynced(true);
          }
        }
      } catch (err) {
        console.debug('Using local storage fallback', err);
      }
    };

    fetchMongoData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email]);

  // Debounced auto-sync to LocalStorage and MongoDB
  const syncTimeoutRef = useRef<any>(null);

  useEffect(() => {
    saveDataToStorage(data);

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const userId = user?.id || user?.email || 'guest_user';
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, data })
        });
        setIsDbSynced(true);
      } catch (err) {
        console.debug('Failed to sync to MongoDB', err);
      }
    }, 1500);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [data, user?.id, user?.email]);

  // Sound trigger helper
  const triggerSound = (type: string) => {
    if (data.profile?.soundEnabled !== false) {
      playSound(type);
    }
  };

  // Confetti fanfare helper
  const triggerCelebration = () => {
    triggerSound('level-up');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Recompute daily score and check achievements
  const recomputeTodayScore = (state: any, targetDate: string = todayStr) => {
    const calculatedScore = calculateExecutionScore(
      state.routines || [],
      state.routineLogsHistory?.[targetDate] || {},
      state.categories || [],
      targetDate,
      [],
      {},
      [],
      {},
      state.journalEntries || {}
    );

    const updatedDayScores = {
      ...(state.dayScores || {}),
      [targetDate]: calculatedScore
    };

    // Evaluate Achievements
    const updatedAchievements = (state.achievements || DEFAULT_ACHIEVEMENTS).map((ach: any) => {
      let unlocked = ach.unlocked;
      let progress = ach.progress;

      // 1. First routine completed
      if (ach.id === 'ach_first_routine') {
        const anyLog = Object.values(state.routineLogsHistory || {}).some((dayLog: any) =>
          Object.values(dayLog || {}).some((l: any) => l.completed || l.status === 'done' || l.status === 'completed')
        );
        if (anyLog) {
          unlocked = true;
          progress = '1 / 1 Routine';
        }
      }

      // 2. Pillar Architect (at least 3 custom pillars registered)
      if (ach.id === 'ach_pillar_architect') {
        const count = state.categories?.length || 0;
        unlocked = count >= 3;
        progress = `${count} Pillars Active`;
      }

      // 3. Flawless execution today
      if (ach.id === 'ach_flawless_day') {
        const progressRes = calculateRoutineProgressToday(state.routines || [], state.routineLogsHistory?.[targetDate] || {}, targetDate);
        if (progressRes.isAllDone && progressRes.scheduledCount > 0) {
          unlocked = true;
          progress = '100% Completed Today';
        }
      }

      // 4. Holistic Harmony (at least one routine completed in each pillar today)
      if (ach.id === 'ach_holistic_harmony') {
        const dayLogs = state.routineLogsHistory?.[targetDate] || {};
        const completedRoutineIds = Object.keys(dayLogs).filter(id => dayLogs[id]?.completed || dayLogs[id]?.status === 'done');
        const completedPillars = new Set();
        (state.routines || []).forEach((r: any) => {
          if (completedRoutineIds.includes(r.id)) {
            completedPillars.add(r.categoryId);
          }
        });
        const totalPillars = (state.categories || []).length;
        const matched = completedPillars.size;
        progress = `${matched} / ${totalPillars} Pillars`;
        if (matched >= totalPillars && totalPillars > 0) {
          unlocked = true;
        }
      }

      return { ...ach, unlocked, progress };
    });

    state.achievements = updatedAchievements;
    return updatedDayScores;
  };

  // --- Dynamic Pillars (Focus Areas) API ---
  const addPillar = (newPillar: { name: string; icon?: string; color?: string; description?: string }) => {
    setData((prev: any) => {
      const pillarId = `pillar_${Date.now()}`;
      const nextCategories = [
        ...(prev.categories || []),
        {
          id: pillarId,
          name: newPillar.name,
          icon: newPillar.icon || '🎯',
          color: newPillar.color || '#6366f1',
          description: newPillar.description || '',
          order: (prev.categories?.length || 0) + 1
        }
      ];
      const nextState = { ...prev, categories: nextCategories };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });
    triggerSound('habit-complete');
  };

  const updatePillar = (pillarId: string, fields: any) => {
    setData((prev: any) => {
      const nextCategories = (prev.categories || []).map((c: any) =>
        c.id === pillarId ? { ...c, ...fields } : c
      );
      const nextState = { ...prev, categories: nextCategories };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });
  };

  const deletePillar = (pillarId: string) => {
    setData((prev: any) => {
      const nextCategories = (prev.categories || []).filter((c: any) => c.id !== pillarId);
      // Remove routines under this deleted pillar
      const nextRoutines = (prev.routines || []).filter((r: any) => r.categoryId !== pillarId);
      const nextState = { ...prev, categories: nextCategories, routines: nextRoutines };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });
  };

  // Aliases for compatibility
  const addCategory = addPillar;
  const updateCategory = updatePillar;
  const deleteCategory = deletePillar;

  // --- Routines API ---
  const addRoutine = (newRoutine: any) => {
    const routineId = `rt_${Date.now()}`;
    const formattedSteps = (newRoutine.steps || []).map((s: any, idx: number) => ({
      id: s.id || `st_${Date.now()}_${idx}`,
      title: typeof s === 'string' ? s : s.title,
      durationMinutes: s.durationMinutes || 10
    }));

    setData((prev: any) => {
      const pillar = (prev.categories || []).find((c: any) => c.id === newRoutine.categoryId);
      const routineObj = {
        id: routineId,
        title: newRoutine.title || newRoutine.name || 'New Routine',
        name: newRoutine.title || newRoutine.name || 'New Routine',
        categoryId: newRoutine.categoryId || prev.categories?.[0]?.id || 'pillar_general',
        timeOfDay: newRoutine.timeOfDay || 'morning',
        days: newRoutine.days && newRoutine.days.length > 0 ? newRoutine.days : ['daily'],
        target: newRoutine.target || `${newRoutine.durationMinutes || 30} mins`,
        durationMinutes: Number(newRoutine.durationMinutes) || 30,
        duration: Number(newRoutine.durationMinutes) || 30,
        description: newRoutine.description || '',
        color: newRoutine.color || pillar?.color || '#6366f1',
        icon: newRoutine.icon || pillar?.icon || '⚡',
        active: newRoutine.active !== false,
        steps: formattedSteps
      };

      const nextRoutines = [...(prev.routines || []), routineObj];
      const nextState = { ...prev, routines: nextRoutines };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });

    triggerSound('pop');
  };

  const updateRoutine = (routineId: string, fields: any) => {
    setData((prev: any) => {
      const nextRoutines = (prev.routines || []).map((r: any) => {
        if (r.id === routineId) {
          const updated = { ...r, ...fields };
          if (fields.title) updated.name = fields.title;
          if (fields.steps) {
            updated.steps = fields.steps.map((s: any, idx: number) => ({
              id: s.id || `st_${Date.now()}_${idx}`,
              title: typeof s === 'string' ? s : s.title,
              durationMinutes: s.durationMinutes || 10
            }));
          }
          return updated;
        }
        return r;
      });
      const nextState = { ...prev, routines: nextRoutines };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });
  };

  const deleteRoutine = (routineId: string) => {
    setData((prev: any) => {
      const nextRoutines = (prev.routines || []).filter((r: any) => r.id !== routineId);
      const nextState = { ...prev, routines: nextRoutines };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });
  };

  const toggleRoutineActive = (routineId: string) => {
    setData((prev: any) => {
      const nextRoutines = (prev.routines || []).map((r: any) =>
        r.id === routineId ? { ...r, active: !r.active } : r
      );
      const nextState = { ...prev, routines: nextRoutines };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });
  };

  // Routine Execution Logging
  const logRoutineTaskExecution = (routineId: string, status: string, metadata: any = {}) => {
    const isDone = status === 'done' || status === 'completed';
    const isLate = status === 'late';
    const isPartial = status === 'partial';

    setData((prev: any) => {
      const currentLogs = { ...(prev.routineLogsHistory?.[todayStr] || {}) };
      const currentLog = currentLogs[routineId] || {};

      // Toggle off if already completed and user clicks done again
      if (isDone && currentLog.completed && !metadata.forceDone) {
        delete currentLogs[routineId];
      } else {
        currentLogs[routineId] = {
          status: isDone ? 'done' : isLate ? 'late' : isPartial ? 'partial' : 'missed',
          completed: isDone || isLate,
          completedAt: new Date().toISOString(),
          completedSteps: metadata.completedSteps || [],
          completedStepsCount: metadata.completedSteps?.length || (isDone ? 99 : 0),
          notes: metadata.notes || '',
          updatedAt: new Date().toISOString()
        };
      }

      const nextState = {
        ...prev,
        routineLogsHistory: {
          ...(prev.routineLogsHistory || {}),
          [todayStr]: currentLogs
        }
      };

      nextState.dayScores = recomputeTodayScore(nextState);

      // Check if all routines completed today to trigger celebration!
      const progress = calculateRoutineProgressToday(nextState.routines, currentLogs, todayStr);
      if (progress.isAllDone && isDone) {
        setTimeout(triggerCelebration, 150);
      }

      return nextState;
    });

    if (isDone) {
      triggerSound('habit-complete');
    } else {
      triggerSound('click');
    }
  };

  const setRoutineStatus = (routineId: string, status: string) => {
    logRoutineTaskExecution(routineId, status, { forceDone: true });
  };

  // Evening Reflection
  const saveJournalEntry = (dateStr: string, entry: any) => {
    setData((prev: any) => {
      const nextState = {
        ...prev,
        journalEntries: {
          ...(prev.journalEntries || {}),
          [dateStr]: {
            ...entry,
            updatedAt: new Date().toISOString()
          }
        }
      };
      nextState.dayScores = recomputeTodayScore(nextState, dateStr);
      return nextState;
    });
    triggerCelebration();
  };

  const saveCategoryDayScores = (dateStr: string, scores: any, notes: string = '') => {
    saveJournalEntry(dateStr, { scores, notes, mood: 'good' });
  };

  // Profile & Theme controls
  const toggleTheme = () => {
    setData((prev: any) => {
      const nextTheme = prev.profile?.theme === 'light' ? 'dark' : 'light';
      return {
        ...prev,
        profile: { ...prev.profile, theme: nextTheme }
      };
    });
    triggerSound('click');
  };

  const toggleSound = () => {
    setData((prev: any) => ({
      ...prev,
      profile: { ...prev.profile, soundEnabled: !prev.profile?.soundEnabled }
    }));
  };

  const updateProfile = (fields: any) => {
    setData((prev: any) => ({
      ...prev,
      profile: { ...prev.profile, ...fields }
    }));
  };

  const updateChallenge = (fields: any) => {
    setData((prev: any) => ({
      ...prev,
      challenge: { ...prev.challenge, ...fields }
    }));
  };

  const launchSprint = (startDate: string) => {
    setData((prev: any) => {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 89);
      return {
        ...prev,
        challenge: {
          ...prev.challenge,
          startDate,
          endDate: end.toISOString().split('T')[0],
          currentDay: 1,
          status: 'active'
        }
      };
    });
    triggerCelebration();
  };

  const setOnboardingStep = (step: string) => {
    setData((prev: any) => ({
      ...prev,
      onboardingStep: step
    }));
  };

  const completeOnboarding = () => {
    setOnboardingStep('completed');
  };

  const toggleGettingStartedGuide = () => {
    setData((prev: any) => ({
      ...prev,
      showGettingStartedGuide: !prev.showGettingStartedGuide
    }));
  };

  // Backups and Clean Reset
  const handleExport = () => {
    exportDataAsJSON(data);
    triggerSound('pop');
  };

  const handleImport = (jsonStr: string) => {
    try {
      const imported = importDataFromJSON(jsonStr);
      setData(imported);
      triggerCelebration();
      return true;
    } catch (e) {
      alert('Failed to import backup file. Please check file format.');
      return false;
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data back to the clean Day 1 state?')) {
      const clean = resetToCleanUserData(data.profile);
      setData(clean);
      triggerSound('pop');
    }
  };

  const clearAllDataToScratch = async () => {
    const clean = resetToCleanUserData(data.profile);
    setData(clean);
    triggerSound('pop');
  };

  const loadDemoAccount = () => {
    const clean = resetToCleanUserData();
    setData(clean);
    triggerCelebration();
  };

  const loadCleanUserAccount = async (profile: any) => {
    const clean = resetToCleanUserData(profile);
    setData(clean);
    return clean;
  };

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('p90_logged_in');
    }
    setIsAuthenticated(false);
    if ((authClient as any)?.signOut) {
      await (authClient as any).signOut();
    }
  };

  // Safe stubs for legacy functions
  const setHabitStatus = () => {};
  const addHabit = () => {};
  const updateHabit = () => {};
  const deleteHabit = () => {};
  const addProject = () => {};
  const updateProject = () => {};
  const deleteProject = () => {};
  const addTask = () => {};
  const updateTask = () => {};
  const toggleTask = () => {};
  const toggleTaskToday = () => {};
  const awardTaskPoints = () => {};
  const deleteTask = () => {};
  const addRecurringWeeklyEvent = () => {};
  const updateRecurringWeeklyEvent = () => {};
  const deleteRecurringWeeklyEvent = () => {};
  const setWeeklyEventStatus = () => {};
  const toggleWeeklyEventToday = () => {};
  const startTimer = () => {};
  const pauseTimer = () => {};
  const resumeTimer = () => {};
  const stopTimer = () => {};
  const updateActiveTimerFields = () => {};
  const addManualTimeEntry = () => {};
  const deleteTimeEntry = () => {};
  const saveWeeklyPlan = () => {};
  const updateGoalProgress = () => {};
  const addGoal = () => {};
  const deleteGoal = () => {};

  const value = {
    data,
    setData,
    user,
    isAuthenticated,
    setIsAuthenticated,
    activeTab,
    setActiveTab,
    activeModal,
    setActiveModal,
    modalData,
    setModalData,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isSetupWizardOpen,
    setIsSetupWizardOpen,
    isDbSynced,
    todayStr,
    toggleTheme,
    toggleSound,
    triggerSound,
    triggerCelebration,
    updateProfile,
    updateChallenge,
    launchSprint,
    setOnboardingStep,
    completeOnboarding,
    // Dynamic Pillars
    addPillar,
    updatePillar,
    deletePillar,
    addCategory,
    updateCategory,
    deleteCategory,
    // Routines
    addRoutine,
    updateRoutine,
    deleteRoutine,
    toggleRoutineActive,
    logRoutineTaskExecution,
    setRoutineStatus,
    // Journal & Scores
    saveJournalEntry,
    saveCategoryDayScores,
    // Data & Backups
    handleExport,
    handleImport,
    handleReset,
    clearAllDataToScratch,
    toggleGettingStartedGuide,
    loadDemoAccount,
    loadCleanUserAccount,
    handleSignOut,
    // Legacy stubs
    setHabitStatus,
    addHabit,
    updateHabit,
    deleteHabit,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    toggleTask,
    toggleTaskToday,
    awardTaskPoints,
    deleteTask,
    addRecurringWeeklyEvent,
    updateRecurringWeeklyEvent,
    deleteRecurringWeeklyEvent,
    setWeeklyEventStatus,
    toggleWeeklyEventToday,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    updateActiveTimerFields,
    addManualTimeEntry,
    deleteTimeEntry,
    saveWeeklyPlan,
    updateGoalProgress,
    addGoal,
    deleteGoal
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
