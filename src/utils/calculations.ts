// Utility calculation functions for Project 90

export const formatDurationHMS = (totalSeconds) => {
  if (!totalSeconds || isNaN(totalSeconds)) return '00:00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const formatDurationHuman = (totalMinutes) => {
  if (!totalMinutes || totalMinutes <= 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
};

export const getScoreLevel = (score) => {
  if (score >= 90) {
    return {
      label: 'Excellent',
      color: 'var(--score-excellent)',
      badgeClass: 'badge-excellent',
      icon: '🟢',
      status: 'excellent'
    };
  }
  if (score >= 70) {
    return {
      label: 'Good',
      color: 'var(--score-good)',
      badgeClass: 'badge-good',
      icon: '🔵',
      status: 'good'
    };
  }
  if (score >= 50) {
    return {
      label: 'Average',
      color: 'var(--score-average)',
      badgeClass: 'badge-average',
      icon: '🟡',
      status: 'average'
    };
  }
  return {
    label: 'Needs Improvement',
    color: 'var(--score-poor)',
    badgeClass: 'badge-poor',
    icon: '🔴',
    status: 'poor'
  };
};

export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export const getDayKeyFromDateStr = (dateStr) => {
  if (!dateStr) return 'mon';
  const d = new Date(dateStr);
  return DAY_KEYS[d.getDay()] || 'mon';
};

export const getDayPointsBudget = (
  dayKey,
  routines = [],
  recurringEvents = [],
  categories = []
) => {
  // 1. Calculate Daily Routines Baseline
  let routinesBase = 0;
  routines.forEach((r) => {
    if (r.active !== false) {
      routinesBase += Number(r.points) || (r.id === 'morning' ? 15 : r.id === 'evening' ? 15 : 20);
    }
  });

  // 2. Calculate points from recurring weekly schedule items on this day
  let scheduledEventsPoints = 0;
  const dayEvents = (recurringEvents || []).filter(
    (e) => e.days && Array.isArray(e.days) && e.days.includes(dayKey)
  );

  dayEvents.forEach((e) => {
    scheduledEventsPoints += Number(e.points) || 20;
  });

  const currentTotal = routinesBase + scheduledEventsPoints;
  const maxAvailable = Math.max(0, 100 - currentTotal);

  let status = 'available';
  if (currentTotal === 100) status = 'optimal';
  else if (currentTotal > 100) status = 'over';

  return {
    dayKey,
    totalTarget: 100,
    routinesBase,
    scheduledEventsPoints,
    currentTotal,
    maxAvailable,
    status,
    dayEvents
  };
};

export const calculateExecutionScore = (
  routines = [], 
  routineLogs = {}, 
  categories = [], 
  todayStr = new Date().toISOString().split('T')[0],
  habits = [],
  habitLogs = {},
  recurringWeeklySchedule = [],
  weeklyEventLogs = {}
) => {
  let plannedPoints = 0;
  let earnedPoints = 0;
  const todayDayKey = getDayKeyFromDateStr(todayStr);

  // 1. Calculate Routine Points (Default Baseline)
  routines.forEach((r) => {
    if (r.active !== false) {
      const routinePts = Number(r.points) || (r.id === 'morning' ? 15 : r.id === 'evening' ? 15 : 20);
      plannedPoints += routinePts;
      
      const log = routineLogs[r.id];
      if (log) {
        if (log.completed || log.status === 'completed') {
          earnedPoints += routinePts;
        } else if (log.earnedPoints !== undefined) {
          earnedPoints += Number(log.earnedPoints) || 0;
        } else if (log.completedStepsCount && r.steps?.length) {
          const ratio = log.completedStepsCount / r.steps.length;
          earnedPoints += Math.round(routinePts * ratio);
        }
      }
    }
  });

  // 2. Calculate Today's Recurring Weekly Schedule Events
  let todayRecurringCount = 0;
  (recurringWeeklySchedule || []).forEach((event) => {
    if (event.days && Array.isArray(event.days) && event.days.includes(todayDayKey)) {
      todayRecurringCount++;
      const eventPoints = Number(event.points) || 20;
      plannedPoints += eventPoints;

      const log = weeklyEventLogs[event.id];
      if (log) {
        if (log.status === 'done' || log.completed) {
          earnedPoints += log.earnedPoints !== undefined ? Number(log.earnedPoints) : eventPoints;
        } else if (log.status === 'in_progress') {
          earnedPoints += log.earnedPoints !== undefined ? Number(log.earnedPoints) : Math.round(eventPoints * 0.5);
        } else if (log.earnedPoints) {
          earnedPoints += Number(log.earnedPoints);
        }
      }
    }
  });

  // 3. Calculate Today's Planned Project Tasks Points (Dynamic Execution)
  let todayTasksCount = 0;
  categories.forEach((cat) => {
    (cat.projects || []).forEach((proj) => {
      (proj.tasks || []).forEach((task) => {
        // A task is in today's plan if task.isToday === true or scheduled for today
        if (task.isToday || task.scheduledDate === todayStr) {
          todayTasksCount++;
          const taskPoints = Number(task.points) || (task.priority === 'high' ? 30 : task.priority === 'medium' ? 20 : 10);
          plannedPoints += taskPoints;

          if (task.status === 'done' || task.completed) {
            // Full points awarded by default or custom earnedPoints
            earnedPoints += task.earnedPoints !== undefined ? Number(task.earnedPoints) : taskPoints;
          } else if (task.status === 'in_progress') {
            // Partial points: custom earnedPoints or 50% default
            earnedPoints += task.earnedPoints !== undefined ? Number(task.earnedPoints) : Math.round(taskPoints * 0.5);
          } else if (task.earnedPoints) {
            earnedPoints += Number(task.earnedPoints);
          }
        }
      });
    });
  });

  // 4. Fallback to habits if neither routines nor today's tasks exist
  if (plannedPoints === 0 && habits.length > 0) {
    return calculateDailyScore(habits, habitLogs);
  }

  if (plannedPoints === 0) return 0;
  const score = Math.min(100, Math.round((earnedPoints / plannedPoints) * 100));
  return {
    score,
    plannedPoints,
    earnedPoints,
    todayTasksCount,
    todayRecurringCount
  };
};

export const calculateDailyScore = (habits = [], habitLogs = {}) => {
  let earnedPoints = 0;
  let totalAvailablePoints = 0;

  habits.forEach((habit) => {
    if (habit.active !== false) {
      const points = habit.points || 10;
      totalAvailablePoints += points;
      const status = habitLogs[habit.id] || 'pending';
      if (status === 'completed') {
        earnedPoints += points;
      } else if (status === 'in_progress') {
        earnedPoints += Math.round(points * 0.5);
      }
    }
  });

  if (totalAvailablePoints === 0) return 0;
  return Math.min(100, Math.round((earnedPoints / totalAvailablePoints) * 100));
};

export const calculateCategoryStats = (categoryId, habits = [], habitLogs = {}, timeEntries = []) => {
  const catHabits = habits.filter(h => h.categoryId === categoryId && h.active !== false);
  const completedCount = catHabits.filter(h => habitLogs[h.id] === 'completed').length;
  const inProgressCount = catHabits.filter(h => habitLogs[h.id] === 'in_progress').length;
  const totalCount = catHabits.length;

  const completionPct = totalCount > 0 
    ? Math.round(((completedCount + (inProgressCount * 0.5)) / totalCount) * 100)
    : 0;

  // Calculate today's time spent in minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const catEntriesToday = timeEntries.filter(e => e.categoryId === categoryId && e.date === todayStr);
  const totalMinutesToday = catEntriesToday.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  // Calculate this week's time
  const catEntriesWeek = timeEntries.filter(e => e.categoryId === categoryId);
  const totalMinutesWeek = catEntriesWeek.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  return {
    totalHabits: totalCount,
    completedHabits: completedCount,
    completionPercentage: completionPct,
    timeSpentMinutesToday: totalMinutesToday,
    timeSpentMinutesWeek: totalMinutesWeek
  };
};

export const calculateCategoryDayScore = (categoryScores = {}) => {
  if (!categoryScores || typeof categoryScores !== 'object') return 0;
  const categories = ['spiritual', 'digital', 'personal', 'health', 'career'];
  let sum = 0;
  let validCount = 0;
  
  categories.forEach((catKey) => {
    if (categoryScores[catKey] !== undefined && categoryScores[catKey] !== null) {
      const val = Number(categoryScores[catKey]);
      if (!isNaN(val)) {
        sum += Math.max(0, Math.min(100, val));
        validCount++;
      }
    }
  });

  if (validCount === 0) return 0;
  return Math.round(sum / 5); // Average across the 5 core pillars
};

export const isRoutineScheduledForDay = (routine, dayKey) => {
  if (!routine || routine.active === false) return false;
  if (!routine.days || !Array.isArray(routine.days) || routine.days.length === 0) return true; // default daily
  if (routine.days.includes('daily') || routine.days.includes('all')) return true;
  return routine.days.includes(dayKey);
};

export const getRoutinesForDay = (routines = [], dateOrDayKey) => {
  const dayKey = dateOrDayKey?.length === 3 ? dateOrDayKey : getDayKeyFromDateStr(dateOrDayKey);
  return routines.filter((r) => isRoutineScheduledForDay(r, dayKey));
};

export const getSuggestedCategoryScores = (
  routines = [],
  routineLogs = {},
  timeEntries = [],
  dateStr = new Date().toISOString().split('T')[0]
) => {
  const dayKey = getDayKeyFromDateStr(dateStr);
  const categories = ['spiritual', 'digital', 'personal', 'health', 'career'];
  const result = {
    spiritual: 0,
    digital: 0,
    personal: 0,
    health: 0,
    career: 0
  };

  categories.forEach((catKey) => {
    // 1. Check routines for this category scheduled for this day
    const catRoutines = routines.filter(
      (r) => r.categoryId === catKey && isRoutineScheduledForDay(r, dayKey)
    );

    let routineScore = 0;
    if (catRoutines.length > 0) {
      let earned = 0;
      catRoutines.forEach((r) => {
        const log = routineLogs[r.id];
        if (log) {
          if (log.status === 'done' || log.completed) {
            earned += 100;
          } else if (log.status === 'late') {
            earned += 80;
          } else if (log.status === 'partial') {
            earned += 50;
          } else if (log.status === 'missed') {
            earned += 0;
          }
        }
      });
      routineScore = Math.round(earned / catRoutines.length);
    }

    // 2. Check time tracked for career / other categories
    const catTimeEntries = (timeEntries || []).filter(
      (e) => e.categoryId === catKey && e.date === dateStr
    );
    const totalMinutes = catTimeEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

    let timeScore = 0;
    if (catKey === 'career') {
      // 3+ hours (180 mins) = 100%, 2h = 75%, 1h = 50%
      timeScore = Math.min(100, Math.round((totalMinutes / 180) * 100));
      result[catKey] = catRoutines.length > 0 
        ? Math.max(routineScore, Math.round((routineScore * 0.4) + (timeScore * 0.6)))
        : timeScore;
    } else {
      result[catKey] = catRoutines.length > 0 ? routineScore : (totalMinutes > 0 ? Math.min(100, totalMinutes * 2) : 70);
    }
  });

  return result;
};

export const getCategoryMeta = (categoryId, categories = []) => {
  const cat = categories.find(c => c.id === categoryId);
  if (cat) return cat;

  const defaultMetas = {
    spiritual: { name: 'Spiritual', icon: '🕌', color: 'var(--cat-spiritual)', badgeClass: 'badge-spiritual' },
    digital: { name: 'Digital Discipline', icon: '📱', color: 'var(--cat-digital)', badgeClass: 'badge-digital' },
    personal: { name: 'Personal', icon: '👤', color: 'var(--cat-personal)', badgeClass: 'badge-personal' },
    health: { name: 'Health', icon: '💪', color: 'var(--cat-health)', badgeClass: 'badge-health' },
    career: { name: 'Career', icon: '💻', color: 'var(--cat-career)', badgeClass: 'badge-career' },
  };

  return defaultMetas[categoryId] || { name: categoryId, icon: '🎯', color: 'var(--primary)', badgeClass: 'badge-primary' };
};

