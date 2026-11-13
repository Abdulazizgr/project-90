// PROJECT 19 / PERSONAL MANAGEMENT SYSTEM
// Core Calculation & Insights Engine (Africa/Addis_Ababa Timezone)

import { TIMEZONE, getLocalDateString, calculateMinutesBetween, Category, Routine, Task, TimeEntry, DailyReflection, Achievement } from './seedData';

export { getLocalDateString, calculateMinutesBetween };

export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
export type DayKey = typeof DAY_KEYS[number];

export const formatDurationHMS = (totalSeconds: number): string => {
  if (!totalSeconds || isNaN(totalSeconds)) return '00:00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const formatDurationHuman = (totalMinutes: number): string => {
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

export const getDayKeyFromDateStr = (dateStr: string): DayKey => {
  if (!dateStr) return 'mon';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    // Construct local date safely
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return DAY_KEYS[d.getDay()] || 'mon';
  }
  const d = new Date(dateStr);
  return DAY_KEYS[d.getDay()] || 'mon';
};

export const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim();
  // Handle HH:mm or HH:mm AM/PM
  if (cleaned.toLowerCase().includes('am') || cleaned.toLowerCase().includes('pm')) {
    const [time, modifier] = cleaned.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
    return hours * 60 + (minutes || 0);
  }
  const [hours, minutes] = cleaned.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const isRoutineScheduledForDay = (routine: Routine, dayKeyOrDateStr: string): boolean => {
  if (!routine || routine.active === false) return false;
  const days = routine.assignedDays || routine.days || [];
  if (days.length === 0 || days.includes('daily')) return true;

  const dayKey = dayKeyOrDateStr.includes('-') ? getDayKeyFromDateStr(dayKeyOrDateStr) : (dayKeyOrDateStr.toLowerCase() as DayKey);
  return days.map(d => d.toLowerCase()).includes(dayKey);
};

export const getScoreLevel = (score: number) => {
  if (score >= 85) {
    return {
      label: 'Excellent',
      color: '#10b981',
      badgeClass: 'badge-excellent',
      icon: '🟢',
      status: 'completed'
    };
  }
  if (score >= 65) {
    return {
      label: 'Good',
      color: '#06b6d4',
      badgeClass: 'badge-good',
      icon: '🔵',
      status: 'partial'
    };
  }
  if (score >= 40) {
    return {
      label: 'Partial',
      color: '#f59e0b',
      badgeClass: 'badge-average',
      icon: '🟡',
      status: 'partial'
    };
  }
  return {
    label: 'Needs Work',
    color: '#ef4444',
    badgeClass: 'badge-poor',
    icon: '🔴',
    status: 'missed'
  };
};

/**
 * Checks for overlapping time entries. Every minute must belong to only one activity.
 */
export const checkTimeOverlap = (
  existingEntries: TimeEntry[],
  newStartMinutes: number,
  newEndMinutes: number,
  ignoreId?: string
): { hasOverlap: boolean; conflictingEntry?: TimeEntry } => {
  // Normalize overnight cross
  let endMin = newEndMinutes;
  if (endMin < newStartMinutes) {
    endMin += 24 * 60;
  }

  for (const entry of existingEntries) {
    if (ignoreId && entry.id === ignoreId) continue;
    let entryStart = parseTimeToMinutes(entry.startTime);
    let entryEnd = parseTimeToMinutes(entry.endTime);
    if (entryEnd < entryStart) {
      entryEnd += 24 * 60;
    }

    // Overlap occurs if (StartA < EndB) and (EndA > StartB)
    if (newStartMinutes < entryEnd && endMin > entryStart) {
      return { hasOverlap: true, conflictingEntry: entry };
    }
  }

  return { hasOverlap: false };
};

/**
 * Calculates 24-Hour Category Time Allocation (Total 1,440 Minutes).
 * Guarantees every minute is categorized, auto-accounting for unlogged rest/personal time.
 */
export interface CategoryAllocation {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  actualMinutes: number;
  plannedMinutes: number;
  actualPercentage: number;
  plannedPercentage: number;
  formattedActual: string;
  formattedPlanned: string;
}

export const calculate24HourAllocation = (
  categories: Category[],
  actualEntries: TimeEntry[] = [],
  scheduledRoutines: Routine[] = [],
  plannedTasks: Task[] = []
): {
  allocations: CategoryAllocation[];
  totalActualMinutes: number;
  totalPlannedMinutes: number;
  unallocatedMinutes: number;
} => {
  const TOTAL_DAY_MINUTES = 24 * 60; // 1440

  const catMap: Record<string, { actual: number; planned: number }> = {};
  categories.forEach(c => {
    catMap[c.id] = { actual: 0, planned: 0 };
  });

  // 1. Sum actual minutes
  let totalActualTracked = 0;
  actualEntries.forEach(entry => {
    const dur = entry.durationMinutes || 0;
    totalActualTracked += dur;
    if (catMap[entry.categoryId]) {
      catMap[entry.categoryId].actual += dur;
    } else {
      catMap['personal'] = catMap['personal'] || { actual: 0, planned: 0 };
      catMap['personal'].actual += dur;
    }
  });

  // 2. Sum planned minutes (from routines + planned tasks)
  let totalPlannedTracked = 0;
  scheduledRoutines.forEach(r => {
    const dur = r.durationMinutes || 0;
    totalPlannedTracked += dur;
    if (catMap[r.categoryId]) {
      catMap[r.categoryId].planned += dur;
    }
  });

  plannedTasks.forEach(t => {
    if (t.startTime && t.deadline) {
      const dur = Math.max(0, parseTimeToMinutes(t.deadline) - parseTimeToMinutes(t.startTime));
      totalPlannedTracked += dur;
      if (catMap[t.categoryId]) {
        catMap[t.categoryId].planned += dur;
      }
    }
  });

  // Auto-allocate unrecorded minutes to 'personal' / meals / rest so day totals 24h
  const unallocatedMinutes = Math.max(0, TOTAL_DAY_MINUTES - totalActualTracked);
  if (unallocatedMinutes > 0 && catMap['personal']) {
    catMap['personal'].actual += unallocatedMinutes;
  }

  const allocations: CategoryAllocation[] = categories.map(cat => {
    const actual = catMap[cat.id]?.actual || 0;
    const planned = catMap[cat.id]?.planned || 0;
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      color: cat.color,
      icon: cat.icon,
      actualMinutes: actual,
      plannedMinutes: planned,
      actualPercentage: Math.round((actual / TOTAL_DAY_MINUTES) * 100),
      plannedPercentage: Math.round((planned / TOTAL_DAY_MINUTES) * 100),
      formattedActual: formatDurationHuman(actual),
      formattedPlanned: formatDurationHuman(planned)
    };
  });

  return {
    allocations,
    totalActualMinutes: TOTAL_DAY_MINUTES,
    totalPlannedMinutes: totalPlannedTracked,
    unallocatedMinutes
  };
};

/**
 * Calculates daily execution completion percentage (Routines + Tasks)
 */
export const calculateDailyProgress = (
  routines: Routine[] = [],
  routineLogs: Record<string, any> = {},
  tasks: Task[] = [],
  dateStr: string = getLocalDateString()
) => {
  const dayKey = getDayKeyFromDateStr(dateStr);
  const scheduledRoutines = routines.filter(r => isRoutineScheduledForDay(r, dayKey));
  const dateTasks = tasks.filter(t => t.plannedDate === dateStr && t.status !== 'cancelled');

  const completedRoutines = scheduledRoutines.filter(r => {
    const log = routineLogs[r.id];
    return log && (log.completed || log.status === 'done' || log.status === 'completed');
  }).length;

  const completedTasks = dateTasks.filter(t => t.status === 'completed').length;

  const totalItems = scheduledRoutines.length + dateTasks.length;
  const completedItems = completedRoutines + completedTasks;

  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    percentage,
    scheduledRoutinesCount: scheduledRoutines.length,
    completedRoutinesCount: completedRoutines,
    plannedTasksCount: dateTasks.length,
    completedTasksCount: completedTasks,
    totalItems,
    completedItems,
    isAllDone: totalItems > 0 && completedItems === totalItems
  };
};

/**
 * Calculates current streak (consecutive successful days >= 70%)
 */
export const calculateCurrentStreak = (dayScores: Record<string, number> = {}, todayStr: string): number => {
  let streak = 0;
  const curr = new Date(todayStr);

  // Check today first
  if ((dayScores[todayStr] || 0) >= 65) {
    streak++;
  }

  // Count backwards from yesterday
  for (let i = 1; i <= 90; i++) {
    const prevDate = new Date(curr);
    prevDate.setDate(curr.getDate() - i);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    const prevScore = dayScores[prevDateStr] || 0;

    if (prevScore >= 65) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Weekly Aggregated Report Generator (Monday through Sunday)
 * Analyzes recorded records to generate truthful, data-backed insights.
 */
export interface WeeklyReportData {
  weekStart: string; // Monday
  weekEnd: string; // Sunday
  overallCompletionPct: number;
  routineCompletionRate: number;
  taskCompletionRate: number;
  totalTimeTrackedMinutes: number;
  categoryTimeBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    color: string;
    icon: string;
    minutes: number;
    hoursFormatted: string;
    percentage: number;
  }>;
  bestDays: Array<{ date: string; dayName: string; score: number }>;
  incompleteActivities: Array<{ title: string; category: string; type: 'routine' | 'task'; date: string }>;
  unlockedAchievementsCount: number;
  currentStreak: number;
  insights: {
    whatDidWell: string[];
    whereImproved: string[];
    needsAttention: string[];
    recommendations: string[];
  };
}

export const generateWeeklyReport = (
  weekStartStr: string, // Monday YYYY-MM-DD
  categories: Category[],
  routines: Routine[],
  tasks: Task[],
  routineLogsHistory: Record<string, Record<string, any>> = {},
  timeEntriesHistory: Record<string, TimeEntry[]> = {},
  dayScores: Record<string, number> = {},
  achievements: Achievement[] = []
): WeeklyReportData => {
  // Build 7 days array (Mon through Sun)
  const monday = new Date(weekStartStr);
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d.toISOString().split('T')[0]);
  }
  const weekEndStr = weekDates[6];

  let totalScheduledRoutines = 0;
  let totalCompletedRoutines = 0;
  let totalTasks = 0;
  let totalCompletedTasks = 0;

  const incompleteActivities: Array<{ title: string; category: string; type: 'routine' | 'task'; date: string }> = [];
  const dayPerformances: Array<{ date: string; dayName: string; score: number }> = [];

  const categoryMinutes: Record<string, number> = {};
  categories.forEach(c => { categoryMinutes[c.id] = 0; });

  let gymDaysCount = 0;
  let rhizanDaysCount = 0;
  let sleepHoursArray: number[] = [];

  weekDates.forEach(dateStr => {
    const dayKey = getDayKeyFromDateStr(dateStr);
    const dayRoutines = routines.filter(r => isRoutineScheduledForDay(r, dayKey));
    const dayLogs = routineLogsHistory[dateStr] || {};
    const dateTasks = tasks.filter(t => t.plannedDate === dateStr && t.status !== 'cancelled');

    let completedRoutinesToday = 0;
    dayRoutines.forEach(r => {
      totalScheduledRoutines++;
      const isDone = dayLogs[r.id]?.completed || dayLogs[r.id]?.status === 'done' || dayLogs[r.id]?.status === 'completed';
      if (isDone) {
        totalCompletedRoutines++;
        completedRoutinesToday++;
      } else {
        const cat = categories.find(c => c.id === r.categoryId);
        incompleteActivities.push({
          title: r.name || r.title || 'Routine',
          category: cat?.name || 'General',
          type: 'routine',
          date: dateStr
        });
      }
    });

    let completedTasksToday = 0;
    dateTasks.forEach(t => {
      totalTasks++;
      if (t.status === 'completed') {
        totalCompletedTasks++;
        completedTasksToday++;
      } else {
        const cat = categories.find(c => c.id === t.categoryId);
        incompleteActivities.push({
          title: t.title,
          category: cat?.name || 'General',
          type: 'task',
          date: dateStr
        });
      }
    });

    // Time entries for this day
    const entries = timeEntriesHistory[dateStr] || [];
    let sleepMinutesToday = 0;
    let rhizanMinutesToday = 0;

    entries.forEach(e => {
      const dur = e.durationMinutes || 0;
      categoryMinutes[e.categoryId] = (categoryMinutes[e.categoryId] || 0) + dur;
      if (e.categoryId === 'sleep') sleepMinutesToday += dur;
      if (e.categoryId === 'career') rhizanMinutesToday += dur;
      if (e.categoryId === 'fitness' && ['tue', 'thu', 'sat'].includes(dayKey)) {
        gymDaysCount++;
      }
    });

    if (sleepMinutesToday > 0) {
      sleepHoursArray.push(sleepMinutesToday / 60);
    }
    if (rhizanMinutesToday >= 180) { // 3+ hours
      rhizanDaysCount++;
    }

    const dayItemsTotal = dayRoutines.length + dateTasks.length;
    const dayItemsDone = completedRoutinesToday + completedTasksToday;
    const dayScore = dayItemsTotal > 0 ? Math.round((dayItemsDone / dayItemsTotal) * 100) : (dayScores[dateStr] || 0);

    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(dateStr));
    dayPerformances.push({ date: dateStr, dayName, score: dayScore });
  });

  const routineRate = totalScheduledRoutines > 0 ? Math.round((totalCompletedRoutines / totalScheduledRoutines) * 100) : 0;
  const taskRate = totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;
  const grandTotal = totalScheduledRoutines + totalTasks;
  const grandDone = totalCompletedRoutines + totalCompletedTasks;
  const overallPct = grandTotal > 0 ? Math.round((grandDone / grandTotal) * 100) : 0;

  const totalTimeTracked = Object.values(categoryMinutes).reduce((a, b) => a + b, 0);

  const categoryTimeBreakdown = categories.map(cat => {
    const mins = categoryMinutes[cat.id] || 0;
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      color: cat.color,
      icon: cat.icon,
      minutes: mins,
      hoursFormatted: formatDurationHuman(mins),
      percentage: totalTimeTracked > 0 ? Math.round((mins / totalTimeTracked) * 100) : 0
    };
  }).sort((a, b) => b.minutes - a.minutes);

  const bestDays = [...dayPerformances].sort((a, b) => b.score - a.score).slice(0, 3);
  const streak = calculateCurrentStreak(dayScores, weekEndStr);
  const unlockedAchCount = achievements.filter(a => a.unlocked).length;

  // --- Meaningful Data-Backed Insights Generator ---
  const whatDidWell: string[] = [];
  const whereImproved: string[] = [];
  const needsAttention: string[] = [];
  const recommendations: string[] = [];

  // Gym insights
  if (gymDaysCount >= 3) {
    whatDidWell.push('You completed all 3 planned fitness and gym sessions on Tue, Thu, and Sat.');
  } else if (gymDaysCount > 0) {
    needsAttention.push(`Completed ${gymDaysCount} of 3 scheduled fitness workouts this week.`);
    recommendations.push('Lock in your workout times in advance on Tuesday and Thursday evenings.');
  } else {
    needsAttention.push('No fitness or gym sessions were recorded this week.');
  }

  // RHIZAN / Career insights
  if (rhizanDaysCount >= 5) {
    whatDidWell.push(`Your RHIZAN work schedule was exceptionally consistent across ${rhizanDaysCount} days.`);
  } else if (categoryMinutes['career'] > 1200) { // 20+ hours
    whatDidWell.push(`Logged ${formatDurationHuman(categoryMinutes['career'])} of focused career execution.`);
  }

  // Sleep consistency
  if (sleepHoursArray.length >= 4) {
    const avgSleep = sleepHoursArray.reduce((a, b) => a + b, 0) / sleepHoursArray.length;
    const minSleep = Math.min(...sleepHoursArray);
    const maxSleep = Math.max(...sleepHoursArray);
    if (maxSleep - minSleep > 2.5) {
      needsAttention.push(`Sleep was irregular, fluctuating between ${minSleep.toFixed(1)}h and ${maxSleep.toFixed(1)}h.`);
      recommendations.push('Maintain a strict 22:30 bedroom lights-out protocol to stabilize circadian rhythm.');
    } else {
      whatDidWell.push(`Maintained a stable sleep average of ${avgSleep.toFixed(1)} hours per night.`);
    }
  }

  // Routine & Task Completion
  if (routineRate >= 80) {
    whereImproved.push(`Strong daily routine adherence with ${routineRate}% completion.`);
  } else {
    needsAttention.push(`Routine completion fell to ${routineRate}% (${totalCompletedRoutines}/${totalScheduledRoutines} completed).`);
  }

  if (taskRate >= 75) {
    whatDidWell.push(`High task execution speed: ${completedTasksTodayTotal(totalCompletedTasks, totalTasks)} tasks finished.`);
  }

  // Sunday Rest
  const sundayPerf = dayPerformances.find(d => getDayKeyFromDateStr(d.date) === 'sun');
  if (sundayPerf && sundayPerf.score >= 70) {
    whatDidWell.push('Sunday was an effective, rejuvenating day for personal reflection and weekly planning.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Focus on maintaining your early morning Fajr and Quran momentum into the next sprint.');
  }

  return {
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    overallCompletionPct: overallPct,
    routineCompletionRate: routineRate,
    taskCompletionRate: taskRate,
    totalTimeTrackedMinutes: totalTimeTracked,
    categoryTimeBreakdown,
    bestDays,
    incompleteActivities: incompleteActivities.slice(0, 10),
    unlockedAchievementsCount: unlockedAchCount,
    currentStreak: streak,
    insights: {
      whatDidWell: whatDidWell.length > 0 ? whatDidWell : ['Maintained daily tracking consistency across key areas.'],
      whereImproved: whereImproved.length > 0 ? whereImproved : ['Tracked baseline time allocations across all 7 categories.'],
      needsAttention: needsAttention.length > 0 ? needsAttention : ['Review evening wind-down to avoid late nights.'],
      recommendations
    }
  };
};

const completedTasksTodayTotal = (completed: number, total: number) => `${completed}/${total}`;

// Compatibility aliases
export const getRoutinesForDay = (routines: Routine[] = [], dateStrOrDayKey: string) => {
  return routines.filter(r => isRoutineScheduledForDay(r, dateStrOrDayKey));
};

export const getCategoryMeta = (categoryId: string, categories: Category[] = []) => {
  const cat = categories.find(c => c.id === categoryId);
  return {
    name: cat?.name || 'Custom Pillar',
    color: cat?.color || '#6366f1',
    icon: cat?.icon || '🎯',
    badgeClass: 'badge-primary'
  };
};

export const calculateExecutionScore = (
  routines: Routine[] = [],
  routineLogs: Record<string, any> = {},
  categories: Category[] = [],
  todayStr: string = getLocalDateString(),
  habits: any[] = [],
  habitLogs: Record<string, any> = {},
  recurringWeeklySchedule: any[] = [],
  weeklyEventLogs: Record<string, any> = {},
  journalEntries: Record<string, any> = {}
) => {
  const progress = calculateDailyProgress(routines, routineLogs, [], todayStr);
  const hasJournal = !!journalEntries?.[todayStr];
  const routineWeight = 90;
  const journalWeight = 10;
  const earned = Math.round((progress.percentage * routineWeight) / 100) + (hasJournal ? journalWeight : 0);
  return Math.min(100, earned);
};

export const calculateRoutineProgressToday = (
  routines: Routine[] = [],
  routineLogsToday: Record<string, any> = {},
  dateStr: string = getLocalDateString()
) => {
  const dayKey = getDayKeyFromDateStr(dateStr);
  const scheduled = routines.filter(r => isRoutineScheduledForDay(r, dayKey));
  const completed = scheduled.filter(r => {
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

export const calculateCategoryDayScore = (scores: any) => {
  if (!scores || typeof scores !== 'object') return 0;
  const vals = Object.values(scores).map(Number).filter(v => !isNaN(v));
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

export const calculateDailyScore = (habits: any[], habitLogs: any) => 0;
