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
  Challenge,
  Transaction,
  DEFAULT_TRANSACTIONS
} from '../utils/seedData';
import {
  calculateDailyProgress,
  calculate24HourAllocation,
  checkTimeOverlap,
  parseTimeToMinutes
} from '../utils/calculations';
import { authClient } from '../lib/auth-client';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void | Promise<void>;
}

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  const [data, setData] = useState<any>(() => loadDataFromStorage());
  // Persist activeTab across refreshes & URL hash
  const [activeTab, setActiveTabState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('p19_active_tab');
      if (saved) return saved;
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash;
    }
    return 'dashboard';
  });

  const [isViewLoading, setIsViewLoading] = useState<boolean>(false);

  const setActiveTab = (tab: string) => {
    if (tab === activeTab) return;
    setIsViewLoading(true);
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('p19_active_tab', tab);
      try {
        window.history.replaceState(null, '', `#${tab}`);
      } catch {}
    }
    setTimeout(() => {
      setIsViewLoading(false);
    }, 150);
  };

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDbSynced, setIsDbSynced] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('p19_authenticated') === 'true';
    }
    return false;
  });

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      // If we already have authenticated flag in localStorage, we can mount immediately
      if (localStorage.getItem('p19_authenticated') === 'true') {
        return false;
      }
    }
    return true;
  });

  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);

  // Auto-lock when user switches away from the app / minimizes (if enabled)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const autoLock = data.profile?.autoLockOnExit !== false;
        if (autoLock && isAuthenticated) {
          setIsAppLocked(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [data.profile?.autoLockOnExit, isAuthenticated]);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);

  const confirmAction = (options: ConfirmDialogOptions) => {
    setConfirmDialog(options);
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(null);
  };

  const sessionResult = (authClient as any)?.useSession ? (authClient as any).useSession() : { data: null, isPending: false };
  const user = sessionResult?.data?.user;

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('p19_authenticated', 'true');
      }
      setIsAuthLoading(false);
    } else if (!sessionResult.isPending) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('p19_authenticated') === 'true';
        setIsAuthenticated(stored);
      }
      setIsAuthLoading(false);
    }
  }, [user, sessionResult.isPending]);

  const todayStr = getLocalDateString();

  // Apply theme to document element
  useEffect(() => {
    const currentTheme = data.profile?.theme || 'dark';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, [data.profile?.theme]);

  // Sync with MongoDB or use LocalStorage fallback
  useEffect(() => {
    let isMounted = true;
    const ownerEmail = data.profile?.email || user?.email || 'abdulazizisa579@gmail.com';

    const fetchMongoData = async () => {
      try {
        const res = await fetch(`/api/data?userId=${encodeURIComponent(ownerEmail)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            const remote = json.data;
            setData((localState: any) => {
              if (!localState || !localState.challenge) return remote;

              // Intelligent merge: never revert user task completions or challenge duration
              const localTasks = localState.tasks || [];
              const remoteTasks = remote.tasks || [];

              const mergedTasks = remoteTasks.map((rt: any) => {
                const lt = localTasks.find((t: any) => t.id === rt.id);
                if (lt && lt.status === 'completed') return lt;
                return rt;
              });

              return {
                ...remote,
                profile: {
                  ...remote.profile,
                  ...localState.profile
                },
                challenge: {
                  ...remote.challenge,
                  totalDurationDays: (localState.challenge?.totalDurationDays && Number(localState.challenge.totalDurationDays) !== 19)
                    ? Number(localState.challenge.totalDurationDays)
                    : (remote.challenge?.totalDurationDays && Number(remote.challenge.totalDurationDays) !== 19 ? Number(remote.challenge.totalDurationDays) : 90),
                  name: localState.challenge?.name || remote.challenge?.name || 'Project 90: Personal Management System'
                },
                tasks: mergedTasks.length ? mergedTasks : localTasks,
                routineLogsHistory: {
                  ...(remote.routineLogsHistory || {}),
                  ...(localState.routineLogsHistory || {})
                },
                timeEntriesHistory: {
                  ...(remote.timeEntriesHistory || {}),
                  ...(localState.timeEntriesHistory || {})
                },
                journalEntries: {
                  ...(remote.journalEntries || {}),
                  ...(localState.journalEntries || {})
                }
              };
            });
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
  }, []);

  // Debounced auto-sync to LocalStorage and MongoDB
  const syncTimeoutRef = useRef<any>(null);

  useEffect(() => {
    saveDataToStorage(data);

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const ownerEmail = data.profile?.email || 'abdulazizisa579@gmail.com';
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: ownerEmail, data })
        });
        setIsDbSynced(true);
      } catch (err) {
        console.debug('Failed to sync to MongoDB', err);
      }
    }, 600);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [data]);

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

    // Calculate Challenge Day Number with UTC date math
    if (state.challenge?.startDate) {
      if (!state.challenge.totalDurationDays || Number(state.challenge.totalDurationDays) === 19) {
        state.challenge.totalDurationDays = 90;
      }
      const [sy, sm, sd] = state.challenge.startDate.split('-').map(Number);
      const [ty, tm, td] = todayStr.split('-').map(Number);
      if (sy && sm && sd && ty && tm && td) {
        const startUtc = Date.UTC(sy, sm - 1, sd);
        const todayUtc = Date.UTC(ty, tm - 1, td);
        const diffDays = Math.round((todayUtc - startUtc) / 86400000) + 1;
        const totalDuration = state.challenge.totalDurationDays || 90;
        state.challenge.currentDay = Math.max(1, Math.min(totalDuration, diffDays));
      }
    }

    // Ensure every category has an achievement badge
    const existingAchievements: Achievement[] = [...(state.achievements || DEFAULT_ACHIEVEMENTS)];
    (state.categories || []).forEach((cat: Category) => {
      const hasBadge = existingAchievements.some(
        (a) => a.categoryId === cat.id || a.id === `ach_cat_${cat.id}` || a.title?.toLowerCase().includes(cat.name.toLowerCase())
      );
      if (!hasBadge) {
        existingAchievements.push({
          id: `ach_cat_${cat.id}`,
          title: `${cat.name} Mastery`,
          description: `Consistently complete routines and track progress in ${cat.name}`,
          icon: cat.icon || '🎯',
          unlocked: false,
          progress: '0 / 7 Sessions',
          category: cat.name,
          categoryId: cat.id
        });
      }
    });

    // Evaluate Achievements
    const updatedAchievements = existingAchievements.map((ach: Achievement) => {
      let unlocked = ach.unlocked;
      let progressStr = ach.progress;

      // 3-Day Consistency
      if (ach.id === 'ach_3day_consistency') {
        const successfulDays = Object.values(updatedDayScores).filter((s: any) => typeof s === 'number' && s >= 65).length;
        progressStr = `${Math.min(3, successfulDays)} / 3 Days`;
        if (successfulDays >= 3) unlocked = true;
      }

      // 7-Day Streak
      else if (ach.id === 'ach_7day_streak') {
        const successfulDays = Object.values(updatedDayScores).filter((s: any) => typeof s === 'number' && s >= 70).length;
        progressStr = `${Math.min(7, successfulDays)} / 7 Days`;
        if (successfulDays >= 7) unlocked = true;
      }

      // 14-Day Commitment
      else if (ach.id === 'ach_14day_commitment') {
        const successfulDays = Object.values(updatedDayScores).filter((s: any) => typeof s === 'number' && s >= 70).length;
        progressStr = `${Math.min(14, successfulDays)} / 14 Days`;
        if (successfulDays >= 14) unlocked = true;
      }

      // 30-Day Master Sprint
      else if (ach.id === 'ach_30day_consistency') {
        const successfulDays = Object.values(updatedDayScores).filter((s: any) => typeof s === 'number' && s >= 70).length;
        progressStr = `${Math.min(30, successfulDays)} / 30 Days`;
        if (successfulDays >= 30) unlocked = true;
      }

      // Task Finisher (25 tasks completed)
      else if (ach.id === 'ach_task_finisher') {
        const completedTasksCount = (state.tasks || []).filter((t: Task) => t.status === 'completed').length;
        progressStr = `${Math.min(25, completedTasksCount)} / 25 Tasks`;
        if (completedTasksCount >= 25) unlocked = true;
      }

      // Weekly Champion (85%+)
      else if (ach.id === 'ach_weekly_champion') {
        const highestScore = Math.max(0, ...(Object.values(updatedDayScores).filter((s) => typeof s === 'number') as number[]));
        progressStr = `${highestScore}% / 85%`;
        if (highestScore >= 85) unlocked = true;
      }

      // Category-Specific Badges (dynamic tracking for any core or custom category)
      else if (ach.categoryId || ach.id?.startsWith('ach_cat_') || ach.id === 'ach_spiritual_consistency' || ach.id === 'ach_fitness_discipline' || ach.id === 'ach_learning_streak') {
        const cat = (state.categories || []).find((c: Category) => 
          c.id === ach.categoryId || 
          ach.id === `ach_cat_${c.id}` || 
          ach.title?.toLowerCase().includes(c.name.toLowerCase()) || 
          ach.category?.toLowerCase() === c.name.toLowerCase()
        );

        const targetCatId = cat ? cat.id : ach.categoryId;
        if (targetCatId) {
          const catRoutines = (state.routines || []).filter((r: Routine) => r.categoryId === targetCatId);
          const catRoutineIds = new Set(catRoutines.map((r: Routine) => r.id));

          let completedSessions = 0;
          const allLogs = state.routineLogsHistory || {};
          for (const d of Object.keys(allLogs)) {
            const logsForDay = allLogs[d] || {};
            for (const rId of Object.keys(logsForDay)) {
              if (catRoutineIds.has(rId) && (logsForDay[rId]?.completed || logsForDay[rId]?.status === 'done')) {
                completedSessions++;
              }
            }
          }

          const allTimeEntries = Object.values(state.timeEntriesHistory || {}).flat() as any[];
          const timeCount = allTimeEntries.filter((te) => te && te.categoryId === targetCatId).length;
          
          const totalActivity = completedSessions + timeCount;
          const target = ach.id === 'ach_career_execution' ? 10 : 7;
          progressStr = `${Math.min(target, totalActivity)} / ${target} Sessions`;
          if (totalActivity >= target) {
            unlocked = true;
          }
        }
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
          name: name.trim() || 'Apex OS: Personal Management System',
          startDate,
          endDate,
          totalDurationDays: Number(durationDays) || 90,
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
    setData((prev: any) => {
      const isCurrentlyEnabled = prev.profile?.soundEnabled !== false && prev.soundEnabled !== false;
      const nextSound = !isCurrentlyEnabled;
      return {
        ...prev,
        soundEnabled: nextSound,
        profile: { ...prev.profile, soundEnabled: nextSound }
      };
    });
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
    confirmAction({
      title: 'Permanently Reset Account?',
      message: 'CRITICAL WARNING: This will permanently wipe all your logged data, tasks, habits, daily reflections, and time tracking. This action cannot be undone.',
      confirmText: 'Permanently Reset',
      variant: 'danger',
      onConfirm: () => {
        const clean = resetToCleanUserData(data.profile);
        setData(clean);
        triggerSound('pop');
      }
    });
  };

  // --- Achievements API ---
  const addAchievement = (newAch: Partial<Achievement>) => {
    setData((prev: any) => {
      const achId = `ach_custom_${Date.now()}`;
      const achObj: Achievement = {
        id: achId,
        title: newAch.title || 'Custom Mastery Badge',
        description: newAch.description || 'Custom focus milestone',
        icon: newAch.icon || '🏅',
        unlocked: false,
        progress: '0 / 7 Sessions',
        category: newAch.category || 'Custom',
        categoryId: newAch.categoryId,
        isCustom: true
      };
      const nextState = {
        ...prev,
        achievements: [...(prev.achievements || []), achObj]
      };
      return recomputeState(nextState);
    });
    triggerCelebration();
  };

  const updateAchievement = (achId: string, fields: Partial<Achievement>) => {
    setData((prev: any) => {
      const nextState = {
        ...prev,
        achievements: (prev.achievements || []).map((a: Achievement) => (a.id === achId ? { ...a, ...fields } : a))
      };
      return recomputeState(nextState);
    });
  };

  const deleteAchievement = (achId: string) => {
    setData((prev: any) => {
      const nextState = {
        ...prev,
        achievements: (prev.achievements || []).filter((a: Achievement) => a.id !== achId)
      };
      return recomputeState(nextState);
    });
    triggerSound('pop');
  };

  // --- Transaction & Money Management API ---
  const addTransaction = (newTx: Partial<Transaction>) => {
    setData((prev: any) => {
      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        title: newTx.title || 'Untitled',
        amount: Number(newTx.amount) || 0,
        type: newTx.type || 'expense',
        expenseType: newTx.expenseType || 'personal',
        category: newTx.category || 'General',
        date: newTx.date || todayStr,
        reimbursed: !!newTx.reimbursed,
        notes: newTx.notes || '',
        createdAt: new Date().toISOString()
      };
      const nextTransactions = [tx, ...(prev.transactions || [])];
      return recomputeState({
        ...prev,
        transactions: nextTransactions
      });
    });
  };

  const updateTransaction = (txId: string, updates: Partial<Transaction>) => {
    setData((prev: any) => {
      const nextTransactions = (prev.transactions || []).map((t: Transaction) => {
        if (t.id === txId) {
          return { ...t, ...updates };
        }
        return t;
      });
      return recomputeState({
        ...prev,
        transactions: nextTransactions
      });
    });
  };

  const deleteTransaction = (txId: string) => {
    setData((prev: any) => {
      const nextTransactions = (prev.transactions || []).filter((t: Transaction) => t.id !== txId);
      return recomputeState({
        ...prev,
        transactions: nextTransactions
      });
    });
  };

  const toggleReimbursementStatus = (txId: string) => {
    setData((prev: any) => {
      const nextTransactions = (prev.transactions || []).map((t: Transaction) => {
        if (t.id === txId) {
          const nextReimbursed = !t.reimbursed;
          return {
            ...t,
            reimbursed: nextReimbursed,
            reimbursedAt: nextReimbursed ? new Date().toISOString() : undefined
          };
        }
        return t;
      });
      return recomputeState({
        ...prev,
        transactions: nextTransactions
      });
    });
    triggerSound('habit-complete');
  };

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('p19_authenticated');
      localStorage.removeItem('p19_active_tab');
    }
    setIsAuthenticated(false);
    setActiveTabState('dashboard');
    if ((authClient as any)?.signOut) {
      try {
        await (authClient as any).signOut();
      } catch (e) {
        // ignore
      }
    }
    triggerSound('pop');
  };

  const value = {
    data,
    setData,
    user,
    isAuthenticated,
    setIsAuthenticated,
    isAuthLoading,
    isViewLoading,
    isAppLocked,
    setIsAppLocked,
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
    // Transactions & Money Management API
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleReimbursementStatus,
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
    // Achievements API
    addAchievement,
    updateAchievement,
    deleteAchievement,
    // Backup & Data
    handleExport,
    handleImport,
    handleReset,
    // Global Confirmation Dialog
    confirmAction,
    closeConfirmDialog
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <ConfirmationModal
        isOpen={!!confirmDialog}
        title={confirmDialog?.title || ''}
        message={confirmDialog?.message || ''}
        confirmText={confirmDialog?.confirmText}
        cancelText={confirmDialog?.cancelText}
        variant={confirmDialog?.variant}
        onClose={closeConfirmDialog}
        onConfirm={confirmDialog?.onConfirm || (() => {})}
      />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
