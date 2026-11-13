// APEX OS / PERSONAL MANAGEMENT SYSTEM
// Data Models & Clean Seed Generator

export const TIMEZONE = 'Africa/Addis_Ababa';

export const getLocalDateString = (date = new Date()): string => {
  // Return YYYY-MM-DD in Africa/Addis_Ababa timezone
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

export const getLocalTimeString = (date = new Date()): string => {
  // Return HH:mm in Africa/Addis_Ababa timezone
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  order: number;
}

export interface RoutineStep {
  id: string;
  title: string;
  durationMinutes?: number;
}

export interface Routine {
  id: string;
  name: string;
  title?: string;
  categoryId: string;
  startTime: string; // "05:00"
  endTime: string; // "05:45"
  durationMinutes: number; // calculated automatically
  assignedDays: string[]; // ['mon', 'tue', ...] or ['daily']
  days?: string[]; // compatibility
  template?: 'gym' | 'non_gym' | 'sunday' | 'custom' | 'all';
  description?: string;
  notes?: string;
  active: boolean;
  color?: string;
  icon?: string;
  target?: string;
  steps?: RoutineStep[];
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  priority: TaskPriority;
  plannedDate: string; // YYYY-MM-DD
  startTime?: string; // "09:00"
  deadline?: string; // "12:00"
  status: TaskStatus;
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  activityName: string;
  categoryId: string;
  startTime: string; // "08:30"
  endTime: string; // "12:30"
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  isPlanned: boolean; // planned vs actual
  notes?: string;
  crossesMidnight?: boolean;
}

export interface DailyReflection {
  date: string; // YYYY-MM-DD
  mood: 'great' | 'good' | 'normal' | 'tough';
  q1_well: string; // What went well today?
  q2_failed: string; // What did not go as planned?
  q3_learned: string; // What did I learn?
  q4_improve: string; // What should I improve tomorrow?
  q5_priority: string; // What is tomorrow's most important priority?
  savedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: string;
  category: 'Consistency' | 'Discipline' | 'Milestone' | 'Balance';
  unlockedAt?: string;
}

export interface Challenge {
  id: string;
  name: string; // e.g. "Apex OS"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDurationDays: number; // e.g. 19
  currentDay: number;
  status: 'active' | 'completed' | 'planning';
}

export interface Profile {
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  challengeGoal?: string;
  timezone?: string;
  soundEnabled?: boolean;
  theme?: 'dark' | 'light';
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'spiritual',
    name: 'Spiritual',
    icon: '🕌',
    color: '#10b981',
    description: 'Fajr, 5 daily prayers on time, Quran recitation, and spiritual mindfulness',
    order: 1
  },
  {
    id: 'career',
    name: 'Career & RHIZAN',
    icon: '💼',
    color: '#6366f1',
    description: 'RHIZAN ERP development, deliverables, architecture, and professional work',
    order: 2
  },
  {
    id: 'learning',
    name: 'Learning',
    icon: '🧠',
    color: '#3b82f6',
    description: 'Technical learning, programming mastery, algorithms, and skill development',
    order: 3
  },
  {
    id: 'english',
    name: 'English',
    icon: '🗣️',
    color: '#06b6d4',
    description: 'Spoken English, active listening, communication fluency, and vocabulary',
    order: 4
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: '💪',
    color: '#f59e0b',
    description: 'Gym workouts, running, walking, strength training, and physical vitality',
    order: 5
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: '👤',
    color: '#a855f7',
    description: 'Reading, typing practice, personal responsibilities, and environment order',
    order: 6
  },
  {
    id: 'sleep',
    name: 'Sleep & Rest',
    icon: '🌙',
    color: '#64748b',
    description: 'Quality night sleep, physical recovery, scheduled breaks, and rest',
    order: 7
  }
];

export const calculateMinutesBetween = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;
  if (endMinutes < startMinutes) {
    // Crosses midnight (e.g. 23:00 to 06:30)
    endMinutes += 24 * 60;
  }
  return Math.max(0, endMinutes - startMinutes);
};

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'rt_fajr',
    name: 'Fajr Prayer & Quran',
    title: 'Fajr Prayer & Quran',
    categoryId: 'spiritual',
    startTime: '05:00',
    endTime: '05:45',
    durationMinutes: 45,
    assignedDays: ['daily'],
    description: 'Fajr in congregation and morning Quran contemplation',
    active: true,
    steps: [
      { id: 'st_f1', title: 'Fajr prayer with khushu in congregation', durationMinutes: 25 },
      { id: 'st_f2', title: 'Morning Adhkar & Quran Tilawat', durationMinutes: 20 }
    ]
  },
  {
    id: 'rt_morning_walk',
    name: 'Morning Walk & Cold Shower',
    title: 'Morning Walk & Cold Shower',
    categoryId: 'fitness',
    startTime: '06:00',
    endTime: '06:45',
    durationMinutes: 45,
    assignedDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    description: 'Fast-paced brisk walk and invigorating cold shower',
    active: true
  },
  {
    id: 'rt_rhizan_sprint_1',
    name: 'RHIZAN Core Deliverable Sprint',
    title: 'RHIZAN Core Deliverable Sprint',
    categoryId: 'career',
    startTime: '08:30',
    endTime: '12:30',
    durationMinutes: 240,
    assignedDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    description: 'High-impact coding and project deliverable execution',
    active: true,
    steps: [
      { id: 'st_r1', title: 'Backend / frontend sprint execution', durationMinutes: 180 },
      { id: 'st_r2', title: 'Code reviews and testing verification', durationMinutes: 60 }
    ]
  },
  {
    id: 'rt_dhuhr',
    name: 'Dhuhr Prayer & Lunch',
    title: 'Dhuhr Prayer & Lunch',
    categoryId: 'spiritual',
    startTime: '12:30',
    endTime: '13:30',
    durationMinutes: 60,
    assignedDays: ['daily'],
    description: 'Dhuhr prayer and mindful meal',
    active: true
  },
  {
    id: 'rt_rhizan_sprint_2',
    name: 'RHIZAN Technical Implementation',
    title: 'RHIZAN Technical Implementation',
    categoryId: 'career',
    startTime: '13:30',
    endTime: '16:00',
    durationMinutes: 150,
    assignedDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    description: 'Component architecture, testing, and system integration',
    active: true
  },
  {
    id: 'rt_learning',
    name: 'Technical Mastery & Deep Dive',
    title: 'Technical Mastery & Deep Dive',
    categoryId: 'learning',
    startTime: '16:30',
    endTime: '17:45',
    durationMinutes: 75,
    assignedDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    description: 'System design patterns, AI engineering, and new framework learning',
    active: true
  },
  {
    id: 'rt_gym_workout',
    name: 'Gym & Strength Session',
    title: 'Gym & Strength Session',
    categoryId: 'fitness',
    startTime: '17:00',
    endTime: '18:30',
    durationMinutes: 90,
    assignedDays: ['tue', 'thu', 'sat'],
    description: 'Weight training, strength circuit, and 1L hydration',
    active: true,
    steps: [
      { id: 'st_gym_1', title: 'Warmup & dynamic mobility', durationMinutes: 10 },
      { id: 'st_gym_2', title: 'Compound lifts & resistance training', durationMinutes: 65 },
      { id: 'st_gym_3', title: 'Cool down, stretching & hydration', durationMinutes: 15 }
    ]
  },
  {
    id: 'rt_english',
    name: 'English Communication Practice',
    title: 'English Communication Practice',
    categoryId: 'english',
    startTime: '18:00',
    endTime: '18:45',
    durationMinutes: 45,
    assignedDays: ['mon', 'wed', 'fri'],
    description: 'Structured speaking exercises and technical listening comprehension',
    active: true
  },
  {
    id: 'rt_maghrib_isha',
    name: 'Maghrib & Isha Prayers',
    title: 'Maghrib & Isha Prayers',
    categoryId: 'spiritual',
    startTime: '18:45',
    endTime: '20:00',
    durationMinutes: 75,
    assignedDays: ['daily'],
    description: 'Congregational evening prayers and reflection',
    active: true
  },
  {
    id: 'rt_reading_reset',
    name: 'Reading & Night Reset',
    title: 'Reading & Night Reset',
    categoryId: 'personal',
    startTime: '20:30',
    endTime: '21:30',
    durationMinutes: 60,
    assignedDays: ['daily'],
    description: '20 pages non-fiction reading and tomorrow alignment',
    active: true
  },
  {
    id: 'rt_sleep',
    name: 'Night Sleep & Recovery',
    title: 'Night Sleep & Recovery',
    categoryId: 'sleep',
    startTime: '22:30',
    endTime: '05:00',
    durationMinutes: 390,
    assignedDays: ['daily'],
    description: 'Quality sleep restoration, phone charged outside bedroom',
    active: true
  },
  {
    id: 'rt_sunday_retro',
    name: 'Weekly Retrospective & Planning',
    title: 'Weekly Retrospective & Planning',
    categoryId: 'personal',
    startTime: '10:00',
    endTime: '11:30',
    durationMinutes: 90,
    assignedDays: ['sun'],
    description: 'Review weekly report, log insights, and set top priorities for upcoming week',
    active: true
  }
];

export const DEFAULT_TASKS: Task[] = [
  {
    id: 't_init_1',
    title: 'RHIZAN ERP Multi-tenant Security Audit',
    description: 'Verify role-based access control and tenant isolation on API endpoints',
    categoryId: 'career',
    priority: 'high',
    plannedDate: getLocalDateString(),
    startTime: '09:00',
    deadline: '11:00',
    status: 'in_progress',
    notes: 'Focus on middleware checks',
    createdAt: new Date().toISOString()
  },
  {
    id: 't_init_2',
    title: 'English Speaking: Record 3-minute technical summary',
    description: 'Explain distributed caching clearly without filler words',
    categoryId: 'english',
    priority: 'medium',
    plannedDate: getLocalDateString(),
    startTime: '15:30',
    deadline: '16:00',
    status: 'not_started',
    notes: 'Record via phone voice memos',
    createdAt: new Date().toISOString()
  },
  {
    id: 't_init_3',
    title: 'Review System Architecture Chapter 4',
    description: 'High-availability data pipelines and event streaming',
    categoryId: 'learning',
    priority: 'medium',
    plannedDate: getLocalDateString(),
    startTime: '14:00',
    deadline: '15:15',
    status: 'not_started',
    notes: 'Take concise bullet notes',
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_3day_consistency',
    title: '3-Day Consistency',
    description: 'Complete all scheduled routines and log time for 3 consecutive days',
    icon: '🌱',
    unlocked: false,
    progress: '0 / 3 Days',
    category: 'Consistency'
  },
  {
    id: 'ach_7day_streak',
    title: '7-Day Streak',
    description: 'Maintain 7 consecutive successful days of routine and task execution',
    icon: '🔥',
    unlocked: false,
    progress: '0 / 7 Days',
    category: 'Consistency'
  },
  {
    id: 'ach_14day_commitment',
    title: '14-Day Commitment',
    description: 'Two full weeks of reliable daily execution and 24h time accounting',
    icon: '⚡',
    unlocked: false,
    progress: '0 / 14 Days',
    category: 'Discipline'
  },
  {
    id: 'ach_30day_consistency',
    title: '30-Day Master Sprint',
    description: 'Unbreakable consistency across 30 days of deliberate self-management',
    icon: '🛡️',
    unlocked: false,
    progress: '0 / 30 Days',
    category: 'Discipline'
  },
  {
    id: 'ach_spiritual_consistency',
    title: 'Spiritual Steadfastness',
    description: 'Complete all 5 daily prayers and Quran routines on time for 7 days',
    icon: '🕌',
    unlocked: false,
    progress: '0 / 7 Days',
    category: 'Discipline'
  },
  {
    id: 'ach_fitness_discipline',
    title: 'Fitness Discipline',
    description: 'Complete all 3 weekly gym workouts on Tuesday, Thursday, and Saturday',
    icon: '💪',
    unlocked: false,
    progress: '0 / 3 Workouts',
    category: 'Discipline'
  },
  {
    id: 'ach_learning_streak',
    title: 'Learning Momentum',
    description: 'Log 5+ hours of dedicated technical learning in a single week',
    icon: '🧠',
    unlocked: false,
    progress: '0 / 5 Hours',
    category: 'Discipline'
  },
  {
    id: 'ach_task_finisher',
    title: 'Task Finisher',
    description: 'Complete 25 planned daily tasks without procrastination',
    icon: '🎯',
    unlocked: false,
    progress: '0 / 25 Tasks',
    category: 'Milestone'
  },
  {
    id: 'ach_weekly_champion',
    title: 'Weekly Champion',
    description: 'Achieve an 85%+ overall routine & task completion rate in Sunday review',
    icon: '👑',
    unlocked: false,
    progress: '0 / 85%',
    category: 'Balance'
  }
];

export const getCleanUserData = ({ name = 'Abdulaziz', email = 'abdulazizisa579@gmail.com' }: { name?: string; email?: string } = {}) => {
  const todayStr = getLocalDateString();
  const startDate = todayStr;
  const duration = 19; // Project duration default (configurable)

  // Compute end date: startDate + duration - 1
  const s = new Date(startDate);
  const e = new Date(s);
  e.setDate(s.getDate() + (duration - 1));
  const endDate = getLocalDateString(e);

  return {
    profile: {
      name: name || 'Abdulaziz',
      email: email || 'abdulazizisa579@gmail.com',
      password: 'password',
      avatarUrl: '',
      challengeGoal: 'Master daily discipline, RHIZAN engineering, and healthy life balance',
      timezone: TIMEZONE,
      soundEnabled: true,
      theme: 'dark'
    },
    challenge: {
      id: `ch_apex_${Date.now()}`,
      name: 'Apex OS: Personal Management System',
      startDate: startDate,
      endDate: endDate,
      totalDurationDays: duration,
      currentDay: 1,
      status: 'active' as const
    },
    categories: DEFAULT_CATEGORIES,
    routines: DEFAULT_ROUTINES,
    tasks: DEFAULT_TASKS,
    routineLogsHistory: {
      [todayStr]: {}
    },
    timeEntriesHistory: {
      [todayStr]: [] as TimeEntry[]
    },
    journalEntries: {} as Record<string, DailyReflection>,
    dayScores: {} as Record<string, number>,
    achievements: DEFAULT_ACHIEVEMENTS,
    onboardingStep: 'completed',
    showGettingStartedGuide: false
  };
};

export const getDemoData = () => getCleanUserData();
export const getInitialData = () => getCleanUserData();
