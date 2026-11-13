'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { loadDataFromStorage, saveDataToStorage, exportDataAsJSON, importDataFromJSON, resetToCleanUserData } from '../utils/storage';
import { playSound } from '../utils/sound';
import { 
  getLocalDateString, 
  TIMEZONE,
  DEFAULT_CATEGORIES,
  DEFAULT_ROUTINES,
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_TASKS,
  Category,
  Routine,
  Task,
  TimeEntry,
  DailyReflection,
  Achievement,
  Challenge
} from '../utils/seedData';
import {
  calculateDailyProgress,
  calculate24HourAllocation,
  checkTimeOverlap,
  parseTimeToMinutes
} from '../utils/calculations';
import { authClient } from '../lib/auth-client';

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  const [data, setData] = useState<any>(() => loadDataFromStorage());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDbSynced, setIsDbSynced] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('p90_logged_in') === 'true';
    }
    return false;
  });

  const sessionResult = (authClient as any)?.useSession ? (authClient as any).useSession() : { data: null, isPending: false };
  const user = sessionResult?.data?.user;

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('p90_logged_in', 'true');
      }
    }
  }, [user]);

  const todayStr = getLocalDateString();

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

  const triggerSound = (type: string) => {
    if (data.profile?.soundEnabled !== false) {
      playSound(type);
    }
  };

  const triggerCelebration = () => {
    triggerSound('level-up');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Recompute scores, day status, and evaluate achievements
  const recomputeState = (state: any, targetDate: string = todayStr) => {
    const progress = calculateDailyProgress(
      state.routines || [],
      state.routineLogsHistory?.[targetDate] || {},
      state.tasks || [],
      targetDate
    );

    const hasReflection = !!state.journalEntries?.[targetDate];
    const earnedScore = Math.min(100, Math.round((progress.percentage * 0.9) + (hasReflection ? 10 : 0)));

    const updatedDayScores = {
      ...(state.dayScores || {}),
      [targetDate]: earnedScore
    };

    // Calculate Challenge Day Number
    if (state.challenge?.startDate) {
      const start = new Date(state.challenge.startDate);
      const curr = new Date(todayStr);
      const diffTime = curr.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      state.challenge.currentDay = Math.max(1, Math.min(state.challenge.totalDurationDays || 19, diffDays));
    }

    // Evaluate Achievements
    const updatedAchievements = (state.achievements || DEFAULT_ACHIEVEMENTS).map((ach: Achievement) => {
      let unlocked = ach.unlocked;
      let progressStr = ach.progress;

      // 3-Day Consistency
      if (ach.id === 'ach_3day_consistency') {
        const successfulDays = Object.values(updatedDayScores).filter((s: any) => typeof s === 'number' && s >= 65).length;
        progressStr = `${Math.min(3, successfulDays)} / 3 Days`;
        if (successfulDays >= 3) unlocked = true;
      }

      // 7-Day Streak
      if (ach.id === 'ach_7day_streak') {
        const successfulDays = Object.values(updatedDayScores).filter((s: any) => typeof s === 'number' && s >= 70).length;
        progressStr = `${Math.min(7, successfulDays)} / 7 Days`;
        if (successfulDays >= 7) unlocked = true;
      }

      // Task Finisher (25 tasks completed)
      if (ach.id === 'ach_task_finisher') {
        const completedTasksCount = (state.tasks || []).filter((t: Task) => t.status === 'completed').length;
        progressStr = `${Math.min(25, completedTasksCount)} / 25 Tasks`;
        if (completedTasksCount >= 25) unlocked = true;
      }

      return { ...ach, unlocked, progress: progressStr };
    });

    state.achievements = updatedAchievements;
    state.dayScores = updatedDayScores;
    return state;
  };

  // --- Challenge Configuration API ---
  const updateChallenge = (fields: Partial<Challenge>) => {
    setData((prev: any) => {
      const nextChallenge = { ...prev.challenge, ...fields };
      // Recalculate end date if duration or start date changed
      if (fields.startDate || fields.totalDurationDays) {
        const s = new Date(nextChallenge.startDate);
        const e = new Date(s);
        e.setDate(s.getDate() + (nextChallenge.totalDurationDays - 1));
        nextChallenge.endDate = getLocalDateString(e);
      }
      const nextState = { ...prev, challenge: nextChallenge };
      return recomputeState(nextState);
    });
    triggerSound('pop');
  };

  const createNewChallenge = (name: string, startDate: string, durationDays: number) => {
    const s = new Date(startDate);
    const e = new Date(s);
    e.setDate(s.getDate() + (durationDays - 1));
    const endDate = getLocalDateString(e);

    setData((prev: any) => {
      const nextState = {
        ...prev,
        challenge: {
          id: `ch_${Date.now()}`,
          name: name.trim() || 'Project 19',
          startDate,
          endDate,
          totalDurationDays: Number(durationDays) || 19,
          currentDay: 1,
          status: 'active'
        }
      };
      return recomputeState(nextState);
    });
    triggerCelebration();
  };

  // --- Category / Dynamic Focus Pillars API ---
  const addCategory = (newCat: Partial<Category>) => {
    setData((prev: any) => {
      const catId = `cat_${Date.now()}`;
      const nextCategories = [
        ...(prev.categories || []),
        {
          id: catId,
          name: newCat.name || 'New Category',
          icon: newCat.icon || '🎯',
          color: newCat.color || '#6366f1',
          description: newCat.description || '',
          order: (prev.categories?.length || 0) + 1
        }
      ];
      return { ...prev, categories: nextCategories };
    });
    triggerSound('habit-complete');
  };

  const updateCategory = (catId: string, fields: Partial<Category>) => {
    setData((prev: any) => ({
      ...prev,
      categories: (prev.categories || []).map((c: Category) => (c.id === catId ? { ...c, ...fields } : c))
    }));
  };

  const deleteCategory = (catId: string) => {
    setData((prev: any) => ({
      ...prev,
      categories: (prev.categories || []).filter((c: Category) => c.id !== catId),
      routines: (prev.routines || []).filter((r: Routine) => r.categoryId !== catId),
      tasks: (prev.tasks || []).filter((t: Task) => t.categoryId !== catId)
    }));
  };

  // Aliases for compatibility
  const addPillar = addCategory;
  const updatePillar = updateCategory;
  const deletePillar = deleteCategory;

  // --- Daily Routines API ---
  const addRoutine = (newRoutine: Partial<Routine>) => {
    const routineId = `rt_${Date.now()}`;
    const startTime = newRoutine.startTime || '08:00';
    const endTime = newRoutine.endTime || '09:00';
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let dur = (eh * 60 + em) - (sh * 60 + sm);
    if (dur < 0) dur += 24 * 60;

    setData((prev: any) => {
      const routineObj: Routine = {
        id: routineId,
        name: newRoutine.name || newRoutine.title || 'New Routine',
        title: newRoutine.name || newRoutine.title || 'New Routine',
        categoryId: newRoutine.categoryId || prev.categories?.[0]?.id || 'spiritual',
        startTime,
        endTime,
        durationMinutes: dur > 0 ? dur : (newRoutine.durationMinutes || 30),
        assignedDays: newRoutine.assignedDays && newRoutine.assignedDays.length > 0 ? newRoutine.assignedDays : ['daily'],
        days: newRoutine.assignedDays || ['daily'],
        template: newRoutine.template || 'custom',
        description: newRoutine.description || '',
        active: newRoutine.active !== false,
        icon: newRoutine.icon || '⚡',
        color: newRoutine.color || '#6366f1',
        steps: newRoutine.steps || []
      };

      const nextState = { ...prev, routines: [...(prev.routines || []), routineObj] };
      return recomputeState(nextState);
    });
    triggerSound('pop');
  };

  const updateRoutine = (routineId: string, fields: Partial<Routine>) => {
    setData((prev: any) => {
      const nextRoutines = (prev.routines || []).map((r: Routine) => {
        if (r.id === routineId) {
          const updated = { ...r, ...fields };
          if (fields.name) updated.title = fields.name;
          if (fields.title) updated.name = fields.title;
          if (fields.startTime || fields.endTime) {
            const st = fields.startTime || r.startTime;
            const et = fields.endTime || r.endTime;
            const [sh, sm] = st.split(':').map(Number);
            const [eh, em] = et.split(':').map(Number);
            let dur = (eh * 60 + em) - (sh * 60 + sm);
            if (dur < 0) dur += 24 * 60;
            updated.durationMinutes = dur;
          }
          return updated;
        }
        return r;
      });
      const nextState = { ...prev, routines: nextRoutines };
      return recomputeState(nextState);
    });
  };

  const deleteRoutine = (routineId: string) => {
    setData((prev: any) => {
      const nextState = {
        ...prev,
        routines: (prev.routines || []).filter((r: Routine) => r.id !== routineId)
      };
      return recomputeState(nextState);
    });
  };

  const toggleRoutineActive = (routineId: string) => {
    setData((prev: any) => {
      const nextRoutines = (prev.routines || []).map((r: Routine) =>
        r.id === routineId ? { ...r, active: !r.active } : r
      );
      const nextState = { ...prev, routines: nextRoutines };
      return recomputeState(nextState);
    });
  };

  const logRoutineTaskExecution = (routineId: string, status: string, metadata: any = {}) => {
    const isDone = status === 'done' || status === 'completed';
    const isLate = status === 'late';
    const isPartial = status === 'partial';

    setData((prev: any) => {
      const currentLogs = { ...(prev.routineLogsHistory?.[todayStr] || {}) };
      const currentLog = currentLogs[routineId] || {};

      if (isDone && currentLog.completed && !metadata.forceDone) {
        delete currentLogs[routineId];
      } else {
        currentLogs[routineId] = {
          status: isDone ? 'done' : isLate ? 'late' : isPartial ? 'partial' : 'missed',
          completed: isDone || isLate,
          completedAt: new Date().toISOString(),
          completedSteps: metadata.completedSteps || [],
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

      const recomputed = recomputeState(nextState);
      const prog = calculateDailyProgress(recomputed.routines, currentLogs, recomputed.tasks, todayStr);
      if (prog.isAllDone && isDone) {
        setTimeout(triggerCelebration, 150);
      }
      return recomputed;
    });

    if (isDone) triggerSound('habit-complete');
    else triggerSound('click');
  };

  const setRoutineStatus = (routineId: string, status: string) => {
    logRoutineTaskExecution(routineId, status, { forceDone: true });
  };

  // --- Daily Tasks API ---
  const addTask = (taskData: Partial<Task>) => {
    const taskId = `t_${Date.now()}`;
    const newTask: Task = {
      id: taskId,
      title: taskData.title?.trim() || 'New Task',
      description: taskData.description || '',
      categoryId: taskData.categoryId || 'career',
      priority: taskData.priority || 'medium',
      plannedDate: taskData.plannedDate || todayStr,
      startTime: taskData.startTime || '',
      deadline: taskData.deadline || '',
      status: taskData.status || 'not_started',
      notes: taskData.notes || '',
      createdAt: new Date().toISOString()
    };

    setData((prev: any) => {
      const nextState = { ...prev, tasks: [...(prev.tasks || []), newTask] };
      return recomputeState(nextState, newTask.plannedDate);
    });
    triggerSound('pop');
  };

  const updateTask = (taskId: string, fields: Partial<Task>) => {
    setData((prev: any) => {
      let targetDate = todayStr;
      const nextTasks = (prev.tasks || []).map((t: Task) => {
        if (t.id === taskId) {
          const updated = { ...t, ...fields };
          targetDate = updated.plannedDate;
          if (fields.status === 'completed' && t.status !== 'completed') {
            updated.completedAt = new Date().toISOString();
          }
          return updated;
        }
        return t;
      });
      const nextState = { ...prev, tasks: nextTasks };
      return recomputeState(nextState, targetDate);
    });
  };

  const deleteTask = (taskId: string) => {
    setData((prev: any) => {
      const nextState = {
        ...prev,
        tasks: (prev.tasks || []).filter((t: Task) => t.id !== taskId)
      };
      return recomputeState(nextState);
    });
  };

  const toggleTaskStatus = (taskId: string) => {
    setData((prev: any) => {
      let isNowDone = false;
      let targetDate = todayStr;
      const nextTasks = (prev.tasks || []).map((t: Task) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'completed' ? 'not_started' : 'completed';
          isNowDone = nextStatus === 'completed';
          targetDate = t.plannedDate;
          return {
            ...t,
            status: nextStatus as any,
            completedAt: isNowDone ? new Date().toISOString() : undefined
          };
        }
        return t;
      });
      const nextState = { ...prev, tasks: nextTasks };
      const recomputed = recomputeState(nextState, targetDate);
      if (isNowDone) {
        triggerSound('habit-complete');
        const prog = calculateDailyProgress(recomputed.routines, recomputed.routineLogsHistory?.[targetDate] || {}, recomputed.tasks, targetDate);
        if (prog.isAllDone) setTimeout(triggerCelebration, 150);
      }
      return recomputed;
    });
  };

  // --- 24-Hour Time Entries API (Non-overlapping) ---
  const addTimeEntry = (entry: Omit<TimeEntry, 'id' | 'durationMinutes'> & { id?: string }): { success: boolean; error?: string } => {
    const targetDate = entry.date || todayStr;
    const startMin = parseTimeToMinutes(entry.startTime);
    const endMin = parseTimeToMinutes(entry.endTime);
    let dur = endMin - startMin;
    let crossesMidnight = false;
    if (dur < 0) {
      dur += 24 * 60;
      crossesMidnight = true;
    }

    const currentEntries: TimeEntry[] = data.timeEntriesHistory?.[targetDate] || [];
    const overlapCheck = checkTimeOverlap(currentEntries, startMin, endMin);
    if (overlapCheck.hasOverlap && !entry.isPlanned) {
      return {
        success: false,
        error: `Overlaps with "${overlapCheck.conflictingEntry?.activityName}" (${overlapCheck.conflictingEntry?.startTime} - ${overlapCheck.conflictingEntry?.endTime}). Every minute must belong to only one activity.`
      };
    }

    const newEntry: TimeEntry = {
      id: entry.id || `te_${Date.now()}`,
      activityName: entry.activityName.trim() || 'Recorded Activity',
      categoryId: entry.categoryId || 'personal',
      startTime: entry.startTime,
      endTime: entry.endTime,
      durationMinutes: dur,
      date: targetDate,
      isPlanned: !!entry.isPlanned,
      notes: entry.notes || '',
      crossesMidnight
    };

    setData((prev: any) => {
      const prevDateEntries = prev.timeEntriesHistory?.[targetDate] || [];
      const updatedDateEntries = [...prevDateEntries, newEntry].sort(
        (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
      );

      const nextHistory = {
        ...(prev.timeEntriesHistory || {}),
        [targetDate]: updatedDateEntries
      };

      const nextState = {
        ...prev,
        timeEntriesHistory: nextHistory,
        timeEntries: Object.values(nextHistory).flat()
      };
      return recomputeState(nextState, targetDate);
    });

    triggerSound('pop');
    return { success: true };
  };

  const updateTimeEntry = (targetDate: string, entryId: string, fields: Partial<TimeEntry>): { success: boolean; error?: string } => {
    const currentEntries: TimeEntry[] = data.timeEntriesHistory?.[targetDate] || [];
    const existing = currentEntries.find(e => e.id === entryId);
    if (!existing) return { success: false, error: 'Entry not found' };

    const st = fields.startTime || existing.startTime;
    const et = fields.endTime || existing.endTime;
    const startMin = parseTimeToMinutes(st);
    const endMin = parseTimeToMinutes(et);
    let dur = endMin - startMin;
    let crossesMidnight = false;
    if (dur < 0) {
      dur += 24 * 60;
      crossesMidnight = true;
    }

    const overlapCheck = checkTimeOverlap(currentEntries, startMin, endMin, entryId);
    if (overlapCheck.hasOverlap && !fields.isPlanned && !existing.isPlanned) {
      return {
        success: false,
        error: `Overlaps with "${overlapCheck.conflictingEntry?.activityName}" (${overlapCheck.conflictingEntry?.startTime} - ${overlapCheck.conflictingEntry?.endTime}).`
      };
    }

    setData((prev: any) => {
      const prevDateEntries = prev.timeEntriesHistory?.[targetDate] || [];
      const updatedDateEntries = prevDateEntries.map((e: TimeEntry) => {
        if (e.id === entryId) {
          return {
            ...e,
            ...fields,
            startTime: st,
            endTime: et,
            durationMinutes: dur,
            crossesMidnight
          };
        }
        return e;
      }).sort((a: any, b: any) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

      const nextHistory = {
        ...(prev.timeEntriesHistory || {}),
        [targetDate]: updatedDateEntries
      };

      const nextState = {
        ...prev,
        timeEntriesHistory: nextHistory,
        timeEntries: Object.values(nextHistory).flat()
      };
      return recomputeState(nextState, targetDate);
    });

    return { success: true };
  };

  const deleteTimeEntry = (targetDate: string, entryId: string) => {
    setData((prev: any) => {
      const prevDateEntries = prev.timeEntriesHistory?.[targetDate] || [];
      const updatedDateEntries = prevDateEntries.filter((e: TimeEntry) => e.id !== entryId);

      const nextHistory = {
        ...(prev.timeEntriesHistory || {}),
        [targetDate]: updatedDateEntries
      };

      const nextState = {
        ...prev,
        timeEntriesHistory: nextHistory,
        timeEntries: Object.values(nextHistory).flat()
      };
      return recomputeState(nextState, targetDate);
    });
    triggerSound('pop');
  };

  // --- Daily 5-Question Reflection API ---
  const saveDailyReflection = (dateStr: string, reflectionData: Partial<DailyReflection>) => {
    const fullReflection: DailyReflection = {
      date: dateStr,
      mood: reflectionData.mood || 'good',
      q1_well: reflectionData.q1_well || '',
      q2_failed: reflectionData.q2_failed || '',
      q3_learned: reflectionData.q3_learned || '',
      q4_improve: reflectionData.q4_improve || '',
      q5_priority: reflectionData.q5_priority || '',
      savedAt: new Date().toISOString()
    };

    setData((prev: any) => {
      const nextState = {
        ...prev,
        journalEntries: {
          ...(prev.journalEntries || {}),
          [dateStr]: fullReflection
        }
      };
      return recomputeState(nextState, dateStr);
    });
    triggerCelebration();
  };

  // Compatibility alias
  const saveJournalEntry = (dateStr: string, entry: any) => {
    saveDailyReflection(dateStr, {
      mood: entry.mood,
      q1_well: entry.q1 || entry.q1_well,
      q2_failed: entry.q2 || entry.q2_failed,
      q3_learned: entry.q3 || entry.q3_learned,
      q4_improve: entry.q4 || entry.q4_improve,
      q5_priority: entry.q5 || entry.q5_priority
    });
  };

  // --- Theme, Audio & General Preferences ---
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
    if (confirm('Are you sure you want to reset all data back to the clean Project 19 baseline?')) {
      const clean = resetToCleanUserData(data.profile);
      setData(clean);
      triggerSound('pop');
    }
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
    isDbSynced,
    todayStr,
    // Theme & Audio
    toggleTheme,
    toggleSound,
    triggerSound,
    triggerCelebration,
    updateProfile,
    handleSignOut,
    // Challenge API
    updateChallenge,
    createNewChallenge,
    // Categories API
    addCategory,
    updateCategory,
    deleteCategory,
    addPillar,
    updatePillar,
    deletePillar,
    // Routines API
    addRoutine,
    updateRoutine,
    deleteRoutine,
    toggleRoutineActive,
    logRoutineTaskExecution,
    setRoutineStatus,
    // Tasks API
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    // 24h Time Tracking API
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    // Reflection API
    saveDailyReflection,
    saveJournalEntry,
    // Backup & Data
    handleExport,
    handleImport,
    handleReset
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
