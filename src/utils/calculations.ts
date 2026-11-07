// Utility calculation functions for Project 90
// Dynamic Pillars & Routine-First System

export const formatDurationHMS = (totalSeconds: number) => {
  if (!totalSeconds || isNaN(totalSeconds)) return '00:00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const formatDurationHuman = (totalMinutes: number) => {
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

export const getScoreLevel = (score: number) => {
  if (score >= 90) {
    return {
      label: 'Excellent',
      color: 'var(--score-excellent, #10b981)',
      badgeClass: 'badge-excellent',
      icon: '🟢',
      status: 'excellent'
    };
  }
  if (score >= 70) {
    return {
      label: 'Good',
      color: 'var(--score-good, #06b6d4)',
      badgeClass: 'badge-good',
      icon: '🔵',
      status: 'good'
    };
  }
  if (score >= 50) {
    return {
      label: 'Average',
      color: 'var(--score-average, #f59e0b)',
      badgeClass: 'badge-average',
      icon: '🟡',
      status: 'average'
    };
  }
  return {
    label: 'Needs Work',
    color: 'var(--score-poor, #ef4444)',
    badgeClass: 'badge-poor',
    icon: '🔴',
    status: 'poor'
  };
};

export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export const getDayKeyFromDateStr = (dateStr: string) => {
  if (!dateStr) return 'mon';
  // Parse YYYY-MM-DD cleanly in local timezone
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return DAY_KEYS[d.getDay()] || 'mon';
  }
  const d = new Date(dateStr);
  return DAY_KEYS[d.getDay()] || 'mon';
};

export const isRoutineScheduledForDay = (routine: any, dayKeyOrDateStr: string) => {
  if (!routine || routine.active === false) return false;
  const days = routine.days;
  if (!days || !Array.isArray(days) || days.length === 0 || days.includes('daily')) {
    return true;
  }
  const dayKey = dayKeyOrDateStr.includes('-') ? getDayKeyFromDateStr(dayKeyOrDateStr) : dayKeyOrDateStr.toLowerCase();
  return days.map(d => d.toLowerCase()).includes(dayKey);
};

/**
 * Calculates daily 0–100 score based on scheduled routines completed and evening reflection
 */
export const calculateExecutionScore = (
  routines: any[] = [],
  routineLogs: Record<string, any> = {},
  categories: any[] = [],
  todayStr: string = new Date().toISOString().split('T')[0],
  habits: any[] = [],
  habitLogs: Record<string, any> = {},
  recurringWeeklySchedule: any[] = [],
  weeklyEventLogs: Record<string, any> = {},
  journalEntries: Record<string, any> = {}
) => {
  const dayKey = getDayKeyFromDateStr(todayStr);
  const scheduledRoutines = routines.filter((r) => isRoutineScheduledForDay(r, dayKey));

  if (scheduledRoutines.length === 0) {
    // If no routines are scheduled, having journal done yields 100, otherwise 0
    return journalEntries?.[todayStr] ? 100 : 0;
  }

  // Routines carry 90 points total, Evening Reflection carries 10 points
  const routineWeightTotal = 90;
  const reflectionWeight = 10;
  const pointsPerRoutine = routineWeightTotal / scheduledRoutines.length;

  let earnedRoutinePoints = 0;
  scheduledRoutines.forEach((r) => {
    const log = routineLogs[r.id];
    if (log) {
      if (log.completed || log.status === 'done' || log.status === 'completed') {
        earnedRoutinePoints += pointsPerRoutine;
      } else if (log.status === 'late') {
        earnedRoutinePoints += pointsPerRoutine * 0.8;
      } else if (log.status === 'partial') {
        earnedRoutinePoints += pointsPerRoutine * 0.5;
      } else if (log.completedStepsCount && r.steps?.length) {
        const ratio = log.completedStepsCount / r.steps.length;
        earnedRoutinePoints += pointsPerRoutine * ratio;
      }
    }
  });

  const hasJournal = !!journalEntries?.[todayStr]?.answers || !!journalEntries?.[todayStr]?.reflection;
  const earnedJournalPoints = hasJournal ? reflectionWeight : 0;

  const totalScore = Math.min(100, Math.round(earnedRoutinePoints + earnedJournalPoints));
  return totalScore;
};

/**
 * Computes today's routine progress summary
 */
export const calculateRoutineProgressToday = (
  routines: any[] = [],
  routineLogsToday: Record<string, any> = {},
  dateStr: string = new Date().toISOString().split('T')[0]
) => {
  const dayKey = getDayKeyFromDateStr(dateStr);
  const scheduled = routines.filter((r) => isRoutineScheduledForDay(r, dayKey));
  const completed = scheduled.filter((r) => {
    const log = routineLogsToday[r.id];
    return log && (log.completed || log.status === 'done' || log.status === 'completed');
  });

  const percentage = scheduled.length > 0 ? Math.round((completed.length / scheduled.length) * 100) : 0;

  return {
    scheduledCount: scheduled.length,
    completedCount: completed.length,
    percentage,
    isAllDone: scheduled.length > 0 && completed.length === scheduled.length,
    scheduledRoutines: scheduled
  };
};

/**
 * Calculates current streak of consistent days (e.g. score >= 70 or 100% routines)
 */
export const calculateCurrentStreak = (dayScores: Record<string, number> = {}, todayStr: string) => {
  let streak = 0;
  const curr = new Date(todayStr);

  // Check today first
  const todayScore = dayScores[todayStr] || 0;
  if (todayScore >= 70) {
    streak++;
  }

  // Count backwards from yesterday
  for (let i = 1; i <= 90; i++) {
    const prevDate = new Date(curr);
    prevDate.setDate(curr.getDate() - i);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    const prevScore = dayScores[prevDateStr] || 0;

    if (prevScore >= 70) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export const getRoutinesForDay = (routines: any[] = [], dateStrOrDayKey: string) => {
  return routines.filter((r) => isRoutineScheduledForDay(r, dateStrOrDayKey));
};

export const getCategoryMeta = (categoryId: string, categories: any[] = []) => {
  const cat = categories.find((c) => c.id === categoryId);
  return {
    name: cat?.name || 'Custom Pillar',
    color: cat?.color || '#6366f1',
    icon: cat?.icon || '🎯',
    badgeClass: 'badge-primary'
  };
};

/**
 * Backward compatibility helpers
 */
export const calculateDailyScore = (habits: any[], habitLogs: any) => 0;
export const calculateCategoryDayScore = (scores: any) => {
  if (!scores || typeof scores !== 'object') return 0;
  const vals = Object.values(scores).map(Number).filter((v) => !isNaN(v));
  if (vals.length === 0) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
};

export const getSuggestedCategoryScores = (...args: any[]) => ({} as Record<string, number>);

export const getDayPointsBudget = (
  dayKey: string,
  routines: any[] = [],
  recurringEvents: any[] = [],
  categories: any[] = []
) => {
  return {
    dayKey,
    totalTarget: 100,
    routinesBase: 90,
    scheduledEventsPoints: 0,
    currentTotal: 90,
    maxAvailable: 10,
    status: 'available',
    dayEvents: []
  };
};
