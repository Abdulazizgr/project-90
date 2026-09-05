import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { loadDataFromStorage, saveDataToStorage, exportDataAsJSON, importDataFromJSON, resetToDemoData } from '../utils/storage';
import { playSound } from '../utils/sound';
import { calculateDailyScore } from '../utils/calculations';
import { authClient } from '../lib/auth-client';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(() => loadDataFromStorage());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeModal, setActiveModal] = useState(null); // 'manual_time' | 'add_habit' | 'edit_habit' | 'routine_runner' | 'day_detail' | 'add_routine' | 'edit_routine' | 'add_goal' | 'category_manager' | 'sunday_planner'
  const [modalData, setModalData] = useState(null);
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
  const { data: sessionData, isPending: isSessionPending } = authClient.useSession ? authClient.useSession() : { data: null, isPending: false };
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

  // Sync with MongoDB Atlas on user login or startup
  useEffect(() => {
    let isMounted = true;
    const userId = user?.id || user?.email || 'guest_demo';

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

  // Debounced auto-sync to MongoDB Atlas and LocalStorage
  const syncTimeoutRef = useRef(null);

  useEffect(() => {
    saveDataToStorage(data);

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const userId = user?.id || user?.email || 'guest_demo';
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

  // Active Timer Interval Tick
  const timerRef = useRef(null);

  useEffect(() => {
    if (data.activeTimer?.isRunning) {
      timerRef.current = setInterval(() => {
        setData((prev) => ({
          ...prev,
          activeTimer: {
            ...prev.activeTimer,
            elapsedSeconds: (prev.activeTimer.elapsedSeconds || 0) + 1
          }
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [data.activeTimer?.isRunning]);

  // Sound helper that respects user setting
  const triggerSound = (type) => {
    if (data.profile?.soundEnabled !== false) {
      playSound(type);
    }
  };

  // Toggle Dark/Light Theme
  const toggleTheme = () => {
    setData((prev) => {
      const nextTheme = prev.profile?.theme === 'light' ? 'dark' : 'light';
      return {
        ...prev,
        profile: {
          ...prev.profile,
          theme: nextTheme
        }
      };
    });
  };

  // Toggle Sound Effects
  const toggleSound = () => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        soundEnabled: !prev.profile?.soundEnabled
      }
    }));
  };

  // Update Profile
  const updateProfile = (fields) => {
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...fields }
    }));
  };

  // Update Challenge
  const updateChallenge = (fields) => {
    setData((prev) => ({
      ...prev,
      challenge: { ...prev.challenge, ...fields }
    }));
  };

  // Habit Management & Daily Scoring
  const setHabitStatus = (habitId, status) => {
    setData((prev) => {
      const currentLogs = { ...(prev.habitLogsHistory?.[todayStr] || {}) };
      currentLogs[habitId] = status;

      const newHabitLogsHistory = {
        ...prev.habitLogsHistory,
        [todayStr]: currentLogs
      };

      const newScore = calculateDailyScore(prev.habits, currentLogs);
      const newDayScores = {
        ...prev.dayScores,
        [todayStr]: newScore
      };

      if (status === 'completed') {
        triggerSound('habit-complete');
        if (newScore >= 90) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
      }

      return {
        ...prev,
        habitLogsHistory: newHabitLogsHistory,
        dayScores: newDayScores
      };
    });
  };

  const addHabit = (newHabit) => {
    setData((prev) => ({
      ...prev,
      habits: [...(prev.habits || []), { ...newHabit, id: `h_${Date.now()}`, active: true }]
    }));
  };

  const updateHabit = (habitId, fields) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === habitId ? { ...h, ...fields } : h))
    }));
  };

  const deleteHabit = (habitId) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== habitId)
    }));
  };

  // Dynamic Category & Project & Task Hierarchy
  const addCategory = (newCat) => {
    setData((prev) => ({
      ...prev,
      categories: [
        ...(prev.categories || []),
        {
          id: `cat_${Date.now()}`,
          name: newCat.name,
          icon: newCat.icon || '🎯',
          color: newCat.color || '#6366f1',
          description: newCat.description || '',
          targetPercent: Number(newCat.targetPercent) || 20,
          projects: []
        }
      ]
    }));
    triggerSound('habit-complete');
  };

  const updateCategory = (catId, fields) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === catId ? { ...c, ...fields } : c))
    }));
  };

  const deleteCategory = (catId) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== catId),
      // Also remove habits associated with this category
      habits: (prev.habits || []).filter((h) => h.categoryId !== catId)
    }));
  };

  const addProject = (catId, newProj) => {
    const projId = `p_${Date.now()}`;
    const initialTasks = (newProj.initialTasks || []).map((t, idx) => ({
      id: `t_${Date.now()}_${idx}`,
      title: typeof t === 'string' ? t : t.title,
      priority: t.priority || 'medium',
      status: 'todo',
      completed: false,
      createdAt: new Date().toISOString()
    }));

    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => {
        if (c.id === catId) {
          return {
            ...c,
            projects: [
              ...(c.projects || []),
              {
                id: projId,
                name: newProj.name,
                description: newProj.description || '',
                status: newProj.status || 'in_progress', // 'in_progress' | 'done'
                color: newProj.color || c.color,
                icon: newProj.icon || c.icon,
                createdAt: new Date().toISOString(),
                tasks: initialTasks
              }
            ]
          };
        }
        return c;
      })
    }));
    triggerSound('habit-complete');
  };

  const updateProject = (catId, projId, fields) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => {
        if (c.id === catId) {
          return {
            ...c,
            projects: (c.projects || []).map((p) => (p.id === projId ? { ...p, ...fields } : p))
          };
        }
        return c;
      })
    }));
    triggerSound('click');
  };

  const deleteProject = (catId, projId) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => {
        if (c.id === catId) {
          return {
            ...c,
            projects: (c.projects || []).filter((p) => p.id !== projId)
          };
        }
        return c;
      })
    }));
    triggerSound('pop');
  };

  // Helper to recompute and sync today's score dynamically
  const recomputeTodayScore = (state) => {
    const execRes = calculateExecutionScore(
      state.routines || [],
      state.routineLogsHistory?.[todayStr] || {},
      state.categories || [],
      todayStr,
      state.habits || [],
      state.habitLogsHistory?.[todayStr] || {},
      state.recurringWeeklySchedule || [],
      state.weeklyEventLogsHistory?.[todayStr] || {}
    );

    const numericScore = typeof execRes === 'object' ? execRes.score : Number(execRes) || 0;
    return {
      ...state.dayScores,
      [todayStr]: numericScore
    };
  };

  // Tasks inside projects
  const addTask = (catId, projId, taskData) => {
    const isDone = typeof taskData === 'object' && taskData.status === 'done';
    const initialPoints = typeof taskData === 'object' && taskData.points !== undefined 
      ? Number(taskData.points) 
      : (taskData.priority === 'high' ? 30 : taskData.priority === 'medium' ? 20 : 10);

    setData((prev) => {
      const updatedCategories = prev.categories.map((c) => {
        if (c.id === catId) {
          return {
            ...c,
            projects: (c.projects || []).map((p) => {
              if (p.id === projId) {
                return {
                  ...p,
                  tasks: [
                    ...(p.tasks || []),
                    {
                      id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                      title: typeof taskData === 'string' ? taskData : taskData.title,
                      priority: taskData.priority || 'medium',
                      status: taskData.status || 'todo', // 'todo' | 'in_progress' | 'done'
                      points: initialPoints,
                      earnedPoints: isDone ? initialPoints : 0,
                      isToday: taskData.isToday !== undefined ? !!taskData.isToday : true,
                      completed: isDone,
                      notes: taskData.notes || '',
                      createdAt: new Date().toISOString()
                    }
                  ]
                };
              }
              return p;
            })
          };
        }
        return c;
      });

      const nextState = { ...prev, categories: updatedCategories };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });

    triggerSound('pop');
  };

  const updateTask = (catId, projId, taskId, fields) => {
    let completedNow = false;
    setData((prev) => {
      const updatedCategories = prev.categories.map((c) => {
        if (c.id === catId) {
          return {
            ...c,
            projects: (c.projects || []).map((p) => {
              if (p.id === projId) {
                return {
                  ...p,
                  tasks: (p.tasks || []).map((t) => {
                    if (t.id === taskId) {
                      const updated = { ...t, ...fields };
                      const totalPts = Number(updated.points) || (updated.priority === 'high' ? 30 : updated.priority === 'medium' ? 20 : 10);
                      
                      if (fields.status) {
                        updated.completed = fields.status === 'done';
                        if (fields.status === 'done') {
                          completedNow = true;
                          updated.earnedPoints = totalPts; // award full points
                        } else if (fields.status === 'in_progress' && updated.earnedPoints === undefined) {
                          updated.earnedPoints = Math.round(totalPts * 0.5); // 50% partial
                        }
                      } else if (fields.completed !== undefined) {
                        updated.status = fields.completed ? 'done' : (t.status === 'done' ? 'todo' : t.status);
                        if (fields.completed) {
                          completedNow = true;
                          updated.earnedPoints = totalPts;
                        }
                      }

                      if (fields.earnedPoints !== undefined) {
                        updated.earnedPoints = Number(fields.earnedPoints);
                      }

                      return updated;
                    }
                    return t;
                  })
                };
              }
              return p;
            })
          };
        }
        return c;
      });

      const nextState = { ...prev, categories: updatedCategories };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });

    if (completedNow) {
      triggerSound('habit-complete');
    } else {
      triggerSound('click');
    }
  };

  const toggleTask = (catId, projId, taskId) => {
    setData((prev) => {
      let isCompletedNow = false;
      const updatedCategories = prev.categories.map((c) => {
        if (c.id === catId) {
          return {
            ...c,
            projects: (c.projects || []).map((p) => {
              if (p.id === projId) {
                return {
                  ...p,
                  tasks: (p.tasks || []).map((t) => {
                    if (t.id === taskId) {
                      isCompletedNow = !(t.completed || t.status === 'done');
                      const totalPts = Number(t.points) || (t.priority === 'high' ? 30 : t.priority === 'medium' ? 20 : 10);
                      return { 
                        ...t, 
                        completed: isCompletedNow,
                        status: isCompletedNow ? 'done' : 'in_progress',
                        earnedPoints: isCompletedNow ? totalPts : 0
                      };
                    }
                    return t;
                  })
                };
              }
              return p;
            })
          };
        }
        return c;
      });

      const nextState = { ...prev, categories: updatedCategories };
      nextState.dayScores = recomputeTodayScore(nextState);

      if (isCompletedNow) triggerSound('habit-complete');
      return nextState;
    });
  };

  const toggleTaskToday = (catId, projId, taskId) => {
    setData((prev) => {
      const updatedCategories = prev.categories.map((c) => {
        if (c.id === catId) {
          return {
            ...c,
            projects: (c.projects || []).map((p) => {
              if (p.id === projId) {
                return {
                  ...p,
                  tasks: (p.tasks || []).map((t) => {
                    if (t.id === taskId) {
                      return { ...t, isToday: !t.isToday };
                    }
                    return t;
                  })
                };
              }
              return p;
            })
          };
        }
        return c;
      });

      const nextState = { ...prev, categories: updatedCategories };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });
    triggerSound('click');
  };

  const awardTaskPoints = (catId, projId, taskId, pointsEarned) => {
    setData((prev) => {
      const updatedCategories = prev.categories.map((c) => {
        if (c.id === catId) {
          return {
            ...c,
            projects: (c.projects || []).map((p) => {
              if (p.id === projId) {
                return {
                  ...p,
                  tasks: (p.tasks || []).map((t) => {
                    if (t.id === taskId) {
                      const maxPts = Number(t.points) || 20;
                      const awarded = Math.max(0, Math.min(maxPts, Number(pointsEarned) || 0));
                      const isDone = awarded >= maxPts;
                      return {
                        ...t,
                        earnedPoints: awarded,
                        status: isDone ? 'done' : (awarded > 0 ? 'in_progress' : 'todo'),
                        completed: isDone
                      };
                    }
                    return t;
                  })
                };
              }
              return p;
            })
          };
        }
        return c;
      });

      const nextState = { ...prev, categories: updatedCategories };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });
    triggerSound('success');
  };

  const setRoutineStatus = (routineId, status, customEarnedPoints = null) => {
    setData((prev) => {
      const currentLogs = { ...(prev.routineLogsHistory?.[todayStr] || {}) };
      const routine = (prev.routines || []).find((r) => r.id === routineId);
      const defaultPts = routine?.points || (routineId === 'morning' ? 15 : routineId === 'evening' ? 15 : 20);
      
      const isCompleted = status === 'completed';
      const earned = customEarnedPoints !== null 
        ? Number(customEarnedPoints) 
        : (isCompleted ? defaultPts : (status === 'in_progress' ? Math.round(defaultPts * 0.5) : 0));

      currentLogs[routineId] = {
        status,
        completed: isCompleted,
        earnedPoints: earned,
        updatedAt: new Date().toISOString()
      };

      const newRoutineLogsHistory = {
        ...prev.routineLogsHistory,
        [todayStr]: currentLogs
      };

      const nextState = {
        ...prev,
        routineLogsHistory: newRoutineLogsHistory
      };

      nextState.dayScores = recomputeTodayScore(nextState);

      if (isCompleted) triggerSound('habit-complete');
      return nextState;
    });
  };

  const deleteTask = (catId, projId, taskId) => {
    setData((prev) => {
      const updatedCategories = prev.categories.map((c) => {
        if (c.id === catId) {
          return {
            ...c,
            projects: (c.projects || []).map((p) => {
              if (p.id === projId) {
                return {
                  ...p,
                  tasks: (p.tasks || []).filter((t) => t.id !== taskId)
                };
              }
              return p;
            })
          };
        }
        return c;
      });

      const nextState = { ...prev, categories: updatedCategories };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });
    triggerSound('pop');
  };

  // Routine Management
  const addRoutine = (newRoutine) => {
    setData((prev) => ({
      ...prev,
      routines: [...prev.routines, { ...newRoutine, id: `r_${Date.now()}` }]
    }));
  };

  const updateRoutine = (routineId, fields) => {
    setData((prev) => ({
      ...prev,
      routines: prev.routines.map((r) => (r.id === routineId ? { ...r, ...fields } : r))
    }));
  };

  const deleteRoutine = (routineId) => {
    setData((prev) => ({
      ...prev,
      routines: prev.routines.filter((r) => r.id !== routineId)
    }));
  };

  // Clockify-style Timer Actions
  const startTimer = (details = {}) => {
    triggerSound('timer-start');
    setData((prev) => ({
      ...prev,
      activeTimer: {
        isRunning: true,
        activityName: details.activityName || prev.activeTimer?.activityName || 'Focus Session',
        categoryId: details.categoryId || prev.activeTimer?.categoryId || prev.categories?.[0]?.id || 'career',
        projectId: details.projectId !== undefined ? details.projectId : (prev.activeTimer?.projectId || ''),
        taskId: details.taskId !== undefined ? details.taskId : (prev.activeTimer?.taskId || ''),
        taskTitle: details.taskTitle !== undefined ? details.taskTitle : (prev.activeTimer?.taskTitle || ''),
        description: details.description || prev.activeTimer?.description || '',
        startTime: new Date().toISOString(),
        elapsedSeconds: details.reset ? 0 : (prev.activeTimer?.elapsedSeconds || 0)
      }
    }));
  };

  const pauseTimer = () => {
    triggerSound('click');
    setData((prev) => ({
      ...prev,
      activeTimer: {
        ...prev.activeTimer,
        isRunning: false
      }
    }));
  };

  const resumeTimer = () => {
    triggerSound('timer-start');
    setData((prev) => ({
      ...prev,
      activeTimer: {
        ...prev.activeTimer,
        isRunning: true
      }
    }));
  };

  const stopTimer = () => {
    const timer = data.activeTimer;
    if (!timer) return;

    const durationSeconds = timer.elapsedSeconds || 0;
    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

    triggerSound('timer-stop');

    const formatTimeNow = (d) => {
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const padM = String(minutes).padStart(2, '0');
      return `${hours}:${padM} ${ampm}`;
    };

    const now = new Date();
    const startTimeObj = timer.startTime ? new Date(timer.startTime) : new Date(now.getTime() - durationSeconds * 1000);

    const newEntry = {
      id: `te_${Date.now()}`,
      activityName: timer.activityName || (timer.taskTitle ? timer.taskTitle : 'Tracked Session'),
      categoryId: timer.categoryId || data.categories?.[0]?.id || 'career',
      projectId: timer.projectId || '',
      taskId: timer.taskId || '',
      taskTitle: timer.taskTitle || '',
      date: todayStr,
      startTime: formatTimeNow(startTimeObj),
      endTime: formatTimeNow(now),
      durationMinutes,
      description: timer.description || 'Clockify timer tracked entry'
    };

    setData((prev) => ({
      ...prev,
      timeEntries: [newEntry, ...(prev.timeEntries || [])],
      activeTimer: {
        isRunning: false,
        activityName: '',
        categoryId: prev.categories?.[0]?.id || 'career',
        projectId: '',
        taskId: '',
        taskTitle: '',
        description: '',
        startTime: null,
        elapsedSeconds: 0
      }
    }));
  };

  const updateActiveTimerFields = (fields) => {
    setData((prev) => ({
      ...prev,
      activeTimer: {
        ...prev.activeTimer,
        ...fields
      }
    }));
  };

  // Time Entries Management
  const addManualTimeEntry = (entry) => {
    setData((prev) => ({
      ...prev,
      timeEntries: [
        {
          ...entry,
          id: `te_man_${Date.now()}`,
          date: entry.date || todayStr
        },
        ...(prev.timeEntries || [])
      ]
    }));
    triggerSound('habit-complete');
  };

  const deleteTimeEntry = (id) => {
    setData((prev) => ({
      ...prev,
      timeEntries: prev.timeEntries.filter((e) => e.id !== id)
    }));
  };

  // Journal / Daily Reflection
  const saveJournalEntry = (dateStr, entryData) => {
    setData((prev) => {
      const updatedEntries = {
        ...prev.journalEntries,
        [dateStr]: {
          ...entryData,
          date: dateStr,
          timestamp: new Date().toISOString()
        }
      };

      // Also mark reflection habit as completed for today
      const currentTodayLogs = { ...(prev.habitLogsHistory?.[todayStr] || {}) };
      currentTodayLogs['h_reflection'] = 'completed';
      const newScore = calculateDailyScore(prev.habits, currentTodayLogs);

      triggerSound('fanfare');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      return {
        ...prev,
        journalEntries: updatedEntries,
        habitLogsHistory: {
          ...prev.habitLogsHistory,
          [todayStr]: currentTodayLogs
        },
        dayScores: {
          ...prev.dayScores,
          [todayStr]: newScore
        }
      };
    });
  };

  // Sunday Weekly Plan
  const saveWeeklyPlan = (planData) => {
    setData((prev) => ({
      ...prev,
      weeklyPlans: [
        {
          id: `wp_${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...planData
        },
        ...(prev.weeklyPlans || [])
      ]
    }));
    triggerSound('fanfare');
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  // Goal Management
  const updateGoalProgress = (goalId, newCurrent) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === goalId ? { ...g, current: newCurrent } : g))
    }));
  };

  const addGoal = (newGoal) => {
    setData((prev) => ({
      ...prev,
      goals: [...prev.goals, { ...newGoal, id: `g_${Date.now()}`, status: 'active' }]
    }));
  };

  const deleteGoal = (goalId) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== goalId)
    }));
  };

  // Recurring Weekly Schedule
  const addRecurringWeeklyEvent = (newEvent) => {
    setData((prev) => {
      const nextState = {
        ...prev,
        recurringWeeklySchedule: [
          ...(prev.recurringWeeklySchedule || []),
          {
            id: `rwe_${Date.now()}`,
            title: newEvent.title,
            categoryId: newEvent.categoryId || prev.categories?.[0]?.id || 'health',
            days: newEvent.days || ['mon'],
            timeSlot: newEvent.timeSlot || '06:00 PM - 07:30 PM',
            durationMinutes: Number(newEvent.durationMinutes) || 60,
            points: Number(newEvent.points) || 20,
            description: newEvent.description || ''
          }
        ]
      };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });
    triggerSound('habit-complete');
  };

  const updateRecurringWeeklyEvent = (eventId, fields) => {
    setData((prev) => {
      const nextState = {
        ...prev,
        recurringWeeklySchedule: (prev.recurringWeeklySchedule || []).map((e) =>
          e.id === eventId ? { ...e, ...fields } : e
        )
      };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });
    triggerSound('habit-complete');
  };

  const deleteRecurringWeeklyEvent = (eventId) => {
    setData((prev) => {
      const nextState = {
        ...prev,
        recurringWeeklySchedule: (prev.recurringWeeklySchedule || []).filter((e) => e.id !== eventId)
      };
      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });
  };

  const setWeeklyEventStatus = (eventId, status, earnedPoints) => {
    const isCompleted = status === 'done' || status === 'completed';
    const isProgress = status === 'in_progress';
    const event = (data.recurringWeeklySchedule || []).find((e) => e.id === eventId);
    const eventPts = Number(event?.points) || 20;

    const finalEarned = earnedPoints !== undefined 
      ? Number(earnedPoints) 
      : (isCompleted ? eventPts : (isProgress ? Math.round(eventPts * 0.5) : 0));

    setData((prev) => {
      const currentDayLogs = prev.weeklyEventLogsHistory?.[todayStr] || {};
      const nextDayLogs = {
        ...currentDayLogs,
        [eventId]: {
          status: isCompleted ? 'done' : (isProgress ? 'in_progress' : 'todo'),
          completed: isCompleted,
          earnedPoints: finalEarned,
          updatedAt: new Date().toISOString()
        }
      };

      const nextState = {
        ...prev,
        weeklyEventLogsHistory: {
          ...prev.weeklyEventLogsHistory,
          [todayStr]: nextDayLogs
        }
      };

      nextState.dayScores = recomputeTodayScore(nextState);
      return nextState;
    });

    if (isCompleted) {
      triggerSound('routine-complete');
    } else {
      triggerSound('click');
    }
  };

  const toggleWeeklyEventToday = (eventId) => {
    const currentLog = data.weeklyEventLogsHistory?.[todayStr]?.[eventId];
    const isCompleted = currentLog?.completed || currentLog?.status === 'done';
    setWeeklyEventStatus(eventId, isCompleted ? 'todo' : 'done');
  };

  // Onboarding Helpers
  const setOnboardingStep = (step) => {
    setData((prev) => ({
      ...prev,
      onboardingStep: step
    }));
  };

  const completeOnboarding = ({ startDate = todayStr, challengeName = '', goal = '' } = {}) => {
    const start = new Date(startDate || todayStr);
    const end = new Date(start);
    end.setDate(start.getDate() + 89);
    const formatDateStr = (d) => d.toISOString().split('T')[0];
    const isFuture = formatDateStr(start) > todayStr;

    setData((prev) => ({
      ...prev,
      onboardingStep: 'completed',
      profile: {
        ...prev.profile,
        ...(goal ? { challengeGoal: goal } : {})
      },
      challenge: {
        ...prev.challenge,
        name: challengeName || prev.challenge?.name || 'PROJECT 90: Master Life Sprint',
        startDate: formatDateStr(start),
        endDate: formatDateStr(end),
        totalDurationDays: 90,
        currentDay: isFuture ? 0 : 1,
        status: isFuture ? 'planning' : 'active'
      }
    }));

    triggerSound('fanfare');
    confetti({
      particleCount: 180,
      spread: 100,
      origin: { y: 0.5 }
    });
    setIsSetupWizardOpen(false);
  };

  // Launch 90-Day Sprint (Transitions from planning to active)
  const launchSprint = ({ startDate = todayStr, challengeName = '', goal = '' } = {}) => {
    const start = new Date(startDate || todayStr);
    const end = new Date(start);
    end.setDate(start.getDate() + 89);

    const formatDateStr = (d) => d.toISOString().split('T')[0];
    const isFuture = formatDateStr(start) > todayStr;

    setData((prev) => ({
      ...prev,
      onboardingStep: 'completed',
      profile: {
        ...prev.profile,
        ...(goal ? { challengeGoal: goal } : {})
      },
      challenge: {
        ...prev.challenge,
        name: challengeName || prev.challenge?.name || 'PROJECT 90: Master Life Sprint',
        startDate: formatDateStr(start),
        endDate: formatDateStr(end),
        totalDurationDays: 90,
        currentDay: isFuture ? 0 : 1,
        status: isFuture ? 'planning' : 'active'
      }
    }));

    triggerSound('fanfare');
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.5 }
    });
    setIsSetupWizardOpen(false);
  };

  // Reset & Backup
  const handleExport = () => exportDataAsJSON(data);
  const handleImport = (jsonStr) => {
    const imported = importDataFromJSON(jsonStr);
    setData(imported);
    triggerSound('fanfare');
  };
  const handleReset = async () => {
    try {
      const userId = user?.id || user?.email || 'guest_demo';
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData(json.data);
          triggerSound('fanfare');
          return;
        }
      }
    } catch (e) {
      console.debug('Resetting locally', e);
    }
    const reset = resetToDemoData();
    setData(reset);
    triggerSound('fanfare');
  };

  const loadDemoAccount = async () => {
    const demo = resetToDemoData();
    setData(demo);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('p90_logged_in', 'true');
    }
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'abdulaziz@project90.com', data: demo })
      });
    } catch (e) {
      console.debug('Failed to sync demo data to Mongo', e);
    }
    triggerSound('fanfare');
  };

  const loadCleanUserAccount = async ({ name = 'New User', email = '' } = {}) => {
    const clean = resetToCleanUserData({ name, email });
    setData(clean);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('p90_logged_in', 'true');
    }
    try {
      const userId = email || user?.id || `user_${Date.now()}`;
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, data: clean })
      });
    } catch (e) {
      console.debug('Failed to sync clean data to Mongo', e);
    }
    triggerSound('fanfare');
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (e) {
      console.debug('Sign out error', e);
    }
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('p90_logged_in');
    }
    triggerSound('click');
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
    isSetupWizardOpen,
    setIsSetupWizardOpen,
    isDbSynced,
    todayStr,
    toggleTheme,
    toggleSound,
    triggerSound,
    updateProfile,
    updateChallenge,
    launchSprint,
    setOnboardingStep,
    completeOnboarding,
    setHabitStatus,
    addHabit,
    updateHabit,
    deleteHabit,
    addCategory,
    updateCategory,
    deleteCategory,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    toggleTask,
    toggleTaskToday,
    awardTaskPoints,
    setRoutineStatus,
    deleteTask,
    addRoutine,
    updateRoutine,
    deleteRoutine,
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
    saveJournalEntry,
    saveWeeklyPlan,
    updateGoalProgress,
    addGoal,
    deleteGoal,
    handleExport,
    handleImport,
    handleReset,
    loadDemoAccount,
    loadCleanUserAccount,
    handleSignOut
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
