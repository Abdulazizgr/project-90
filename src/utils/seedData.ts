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
  // --- GYM DAYS (Tuesday, Thursday, Saturday) ---
  {
    id: 'rt_fajr_gym',
    name: 'Fajr Prayer & Quran',
    title: 'Fajr Prayer & Quran',
    categoryId: 'spiritual',
    startTime: '05:00',
    endTime: '05:45',
    durationMinutes: 45,
    assignedDays: ['tue', 'thu', 'sat'],
    template: 'gym',
    description: 'Fajr in congregation and 5 pages of Quran recitation',
    active: true,
    steps: [
      { id: 'st_g1', title: 'Fajr prayer with khushu in congregation', durationMinutes: 25 },
      { id: 'st_g2', title: 'Morning Adhkar & Quran Tilawat', durationMinutes: 20 }
    ]
  },
  {
    id: 'rt_rhizan_deep_gym',
    name: 'RHIZAN Deep Work Block',
    title: 'RHIZAN Deep Work Block',
    categoryId: 'career',
    startTime: '08:30',
    endTime: '12:30',
    durationMinutes: 240,
    assignedDays: ['tue', 'thu', 'sat'],
    template: 'gym',
    description: 'Uninterrupted RHIZAN engineering and client deliverables',
    active: true,
    steps: [
      { id: 'st_g3', title: 'Backend / frontend sprint execution', durationMinutes: 180 },
      { id: 'st_g4', title: 'Code reviews and testing verification', durationMinutes: 60 }
    ]
  },
  {
    id: 'rt_dhuhr_gym',
    name: 'Dhuhr Prayer & Lunch',
    title: 'Dhuhr Prayer & Lunch',
    categoryId: 'spiritual',
    startTime: '12:30',
    endTime: '13:30',
    durationMinutes: 60,
    assignedDays: ['tue', 'thu', 'sat'],
    template: 'gym',
    description: 'On-time Dhuhr prayer, nutritious lunch, and rejuvenation',
    active: true
  },
  {
    id: 'rt_learning_gym',
    name: 'Technical Learning & Practice',
    title: 'Technical Learning & Practice',
    categoryId: 'learning',
    startTime: '14:00',
    endTime: '15:15',
    durationMinutes: 75,
    assignedDays: ['tue', 'thu', 'sat'],
    template: 'gym',
    description: 'Full-stack & AI architecture study',
    active: true
  },
  {
    id: 'rt_english_gym',
    name: 'English Communication Practice',
    title: 'English Communication Practice',
    categoryId: 'english',
    startTime: '15:30',
    endTime: '16:15',
    durationMinutes: 45,
    assignedDays: ['tue', 'thu', 'sat'],
    template: 'gym',
    description: 'Active speaking, vocabulary, and communication listening',
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
    template: 'gym',
    description: 'Weight training, strength circuit, and 1L hydration',
    active: true,
    steps: [
      { id: 'st_gym_1', title: 'Warmup & dynamic mobility', durationMinutes: 10 },
      { id: 'st_gym_2', title: 'Compound lifts & resistance training', durationMinutes: 65 },
      { id: 'st_gym_3', title: 'Cool down, stretching & hydration', durationMinutes: 15 }
    ]
  },
  {
    id: 'rt_prayers_evening_gym',
    name: 'Maghrib & Isha Prayers',
    title: 'Maghrib & Isha Prayers',
    categoryId: 'spiritual',
    startTime: '18:45',
    endTime: '20:00',
    durationMinutes: 75,
    assignedDays: ['tue', 'thu', 'sat'],
    template: 'gym',
    description: 'Congregational Maghrib and Isha prayers',
    active: true
  },
  {
    id: 'rt_personal_gym',
    name: 'Reading & Typing Practice',
    title: 'Reading & Typing Practice',
    categoryId: 'personal',
    startTime: '20:30',
    endTime: '21:30',
    durationMinutes: 60,
    assignedDays: ['tue', 'thu', 'sat'],
    template: 'gym',
    description: '20 pages of non-fiction reading and 15 mins typing practice',
    active: true
  },
  {
    id: 'rt_sleep_gym',
    name: 'Night Sleep & Recovery',
    title: 'Night Sleep & Recovery',
    categoryId: 'sleep',
    startTime: '22:30',
    endTime: '05:00',
    durationMinutes: 390, // 6h 30m
    assignedDays: ['tue', 'thu', 'sat'],
    template: 'gym',
    description: 'Phone charged in living room, pitch dark room for optimal deep sleep',
    active: true
  },

  // --- NON-GYM WEEKDAYS (Monday, Wednesday, Friday) ---
  {
    id: 'rt_fajr_nongym',
    name: 'Fajr Prayer & Quran',
    title: 'Fajr Prayer & Quran',
    categoryId: 'spiritual',
    startTime: '05:00',
    endTime: '05:45',
    durationMinutes: 45,
    assignedDays: ['mon', 'wed', 'fri'],
    template: 'non_gym',
    description: 'Fajr in congregation and morning Quran contemplation',
    active: true
  },
  {
    id: 'rt_morning_walk_nongym',
    name: 'Morning Walk & Cold Shower',
    title: 'Morning Walk & Cold Shower',
    categoryId: 'fitness',
    startTime: '06:00',
    endTime: '06:45',
    durationMinutes: 45,
    assignedDays: ['mon', 'wed', 'fri'],
    template: 'non_gym',
    description: 'Fast-paced brisk walk and invigorating cold shower',
    active: true
  },
  {
    id: 'rt_rhizan_1_nongym',
    name: 'RHIZAN Core Deliverable Sprint',
    title: 'RHIZAN Core Deliverable Sprint',
    categoryId: 'career',
    startTime: '08:30',
    endTime: '12:30',
    durationMinutes: 240,
    assignedDays: ['mon', 'wed', 'fri'],
    template: 'non_gym',
    description: 'High-impact coding and project execution',
    active: true
  },
  {
    id: 'rt_dhuhr_nongym',
    name: 'Dhuhr Prayer & Lunch',
    title: 'Dhuhr Prayer & Lunch',
    categoryId: 'spiritual',
    startTime: '12:30',
    endTime: '13:30',
    durationMinutes: 60,
    assignedDays: ['mon', 'wed', 'fri'],
    template: 'non_gym',
    description: 'Dhuhr prayer and mindful meal',
    active: true
  },
  {
    id: 'rt_rhizan_2_nongym',
    name: 'RHIZAN Technical Implementation',
    title: 'RHIZAN Technical Implementation',
    categoryId: 'career',
    startTime: '13:30',
    endTime: '16:00',
    durationMinutes: 150,
    assignedDays: ['mon', 'wed', 'fri'],
    template: 'non_gym',
    description: 'Component architecture, testing, and system integration',
    active: true
  },
  {
    id: 'rt_learning_nongym',
    name: 'Technical Mastery & Deep Dive',
    title: 'Technical Mastery & Deep Dive',
    categoryId: 'learning',
    startTime: '16:30',
    endTime: '17:45',
    durationMinutes: 75,
    assignedDays: ['mon', 'wed', 'fri'],
    template: 'non_gym',
    description: 'System design patterns and new framework learning',
    active: true
  },
  {
    id: 'rt_english_nongym',
    name: 'English Communication Practice',
    title: 'English Communication Practice',
    categoryId: 'english',
    startTime: '18:00',
    endTime: '18:45',
    durationMinutes: 45,
    assignedDays: ['mon', 'wed', 'fri'],
    template: 'non_gym',
    description: 'Structured speaking exercises and listening comprehension',
    active: true
  },
  {
    id: 'rt_prayers_evening_nongym',
    name: 'Maghrib & Isha Prayers',
    title: 'Maghrib & Isha Prayers',
    categoryId: 'spiritual',
    startTime: '18:45',
    endTime: '20:00',
    durationMinutes: 75,
    assignedDays: ['mon', 'wed', 'fri'],
    template: 'non_gym',
    description: 'Prayers in congregation',
    active: true
  },
  {
    id: 'rt_personal_nongym',
    name: 'Reading & Night Reset',
    title: 'Reading & Night Reset',
    categoryId: 'personal',
    startTime: '20:30',
    endTime: '21:30',
    durationMinutes: 60,
    assignedDays: ['mon', 'wed', 'fri'],
    template: 'non_gym',
    description: '20 pages reading and preparation for tomorrow',
    active: true
  },
  {
    id: 'rt_sleep_nongym',
    name: 'Night Sleep & Recovery',
    title: 'Night Sleep & Recovery',
    categoryId: 'sleep',
    startTime: '22:30',
    endTime: '05:00',
    durationMinutes: 390,
    assignedDays: ['mon', 'wed', 'fri'],
    template: 'non_gym',
    description: 'Quality sleep restoration',
    active: true
  },

  // --- SUNDAY (Flexible Rest & Reset Day) ---
  {
    id: 'rt_fajr_sun',
    name: 'Fajr Prayer & Quran',
    title: 'Fajr Prayer & Quran',
    categoryId: 'spiritual',
    startTime: '05:00',
    endTime: '06:00',
    durationMinutes: 60,
    assignedDays: ['sun'],
    template: 'sunday',
    description: 'Extended Sunday morning reflection and recitation',
    active: true
  },
  {
    id: 'rt_walk_sun',
    name: 'Rejuvenation Walk & Family Time',
    title: 'Rejuvenation Walk & Family Time',
    categoryId: 'personal',
    startTime: '07:30',
    endTime: '09:30',
    durationMinutes: 120,
    assignedDays: ['sun'],
    template: 'sunday',
    description: 'Relaxed morning walk, family connection, and mental refresh',
    active: true
  },
  {
    id: 'rt_review_sun',
    name: 'Weekly Retrospective & Planning',
    title: 'Weekly Retrospective & Planning',
    categoryId: 'personal',
    startTime: '10:00',
    endTime: '11:30',
    durationMinutes: 90,
    assignedDays: ['sun'],
    template: 'sunday',
    description: 'Review weekly report, log insights, and set top priorities for upcoming week',
    active: true
  },
  {
    id: 'rt_dhuhr_sun',
    name: 'Dhuhr Prayer & Rest',
    title: 'Dhuhr Prayer & Rest',
    categoryId: 'spiritual',
    startTime: '12:30',
    endTime: '13:30',
    durationMinutes: 60,
    assignedDays: ['sun'],
    template: 'sunday',
    description: 'Sunday prayer and relaxing midday break',
    active: true
  },
  {
    id: 'rt_learning_sun',
    name: 'Light Reading & Tech Articles',
    title: 'Light Reading & Tech Articles',
    categoryId: 'learning',
    startTime: '14:30',
    endTime: '15:30',
    durationMinutes: 60,
    assignedDays: ['sun'],
    template: 'sunday',
    description: 'Explore high-level industry articles and creative thinking',
    active: true
  },
  {
    id: 'rt_mobility_sun',
    name: 'Light Mobility & Stretching',
    title: 'Light Mobility & Stretching',
    categoryId: 'fitness',
    startTime: '17:00',
    endTime: '17:45',
    durationMinutes: 45,
    assignedDays: ['sun'],
    template: 'sunday',
    description: 'Full-body joint mobility, foam rolling, and recovery',
    active: true
  },
  {
    id: 'rt_prayers_evening_sun',
    name: 'Maghrib & Isha Prayers',
    title: 'Maghrib & Isha Prayers',
    categoryId: 'spiritual',
    startTime: '18:45',
    endTime: '20:00',
    durationMinutes: 75,
    assignedDays: ['sun'],
    template: 'sunday',
    description: 'Evening prayers',
    active: true
  },
  {
    id: 'rt_sleep_sun',
    name: 'Early Sleep Protocol',
    title: 'Early Sleep Protocol',
    categoryId: 'sleep',
    startTime: '22:00',
    endTime: '05:00',
    durationMinutes: 420, // 7h
    assignedDays: ['sun'],
    template: 'sunday',
    description: 'Rest for powerful Monday launch',
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

export const getCleanUserData = ({ name = 'Abdulaziz', email = '' }: { name?: string; email?: string } = {}) => {
  const todayStr = getLocalDateString();
  const startDate = todayStr;
  const duration = 19; // Project 19 default (configurable)

  // Compute end date: startDate + duration - 1
  const s = new Date(startDate);
  const e = new Date(s);
  e.setDate(s.getDate() + (duration - 1));
  const endDate = getLocalDateString(e);

  return {
    profile: {
      name: name || 'User',
      email: email || '',
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
