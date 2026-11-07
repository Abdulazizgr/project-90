// Data Seed Generators for Project 90
// Clean Dynamic Pillars & Routine-First System

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export interface Pillar {
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
  title: string;
  name?: string;
  categoryId: string; // Linked to Pillar ID
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  days: string[]; // ['daily'] or ['mon', 'tue', ...]
  target: string;
  durationMinutes: number;
  duration?: number;
  description: string;
  color: string;
  icon: string;
  steps: RoutineStep[];
  active: boolean;
  points?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: string;
  category?: string;
}

export const DEFAULT_PILLARS: Pillar[] = [
  {
    id: 'pillar_spiritual',
    name: 'Spiritual Discipline',
    icon: '🕌',
    color: '#10b981',
    description: 'Faith, daily prayers on time, Quran recitation, and spiritual grounding',
    order: 1
  },
  {
    id: 'pillar_health',
    name: 'Health & Vitality',
    icon: '💪',
    color: '#f59e0b',
    description: 'Physical training, hydration, proper nutrition, and body strength',
    order: 2
  },
  {
    id: 'pillar_personal',
    name: 'Personal Order',
    icon: '👤',
    color: '#a855f7',
    description: 'Early rising, daily planning, reading, and mental clarity',
    order: 3
  },
  {
    id: 'pillar_focus',
    name: 'Deep Focus & Work',
    icon: '⚡',
    color: '#f43f5e',
    description: 'Uninterrupted deep work blocks, high-leverage execution, and learning',
    order: 4
  },
  {
    id: 'pillar_digital',
    name: 'Digital Discipline',
    icon: '📱',
    color: '#06b6d4',
    description: 'Phone-free mornings, screen-time control, and zero mindless scrolling',
    order: 5
  }
];

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'rt_morning_momentum',
    title: 'Morning Momentum Protocol',
    name: 'Morning Momentum Protocol',
    categoryId: 'pillar_personal',
    timeOfDay: 'morning',
    days: ['daily'],
    target: '45 mins',
    durationMinutes: 45,
    duration: 45,
    description: 'Wake up early, drink 500ml water, mental grounding, and plan top priorities',
    color: '#a855f7',
    icon: '🌅',
    active: true,
    steps: [
      { id: 'st_1', title: '5:00 AM Wake Up & Drink 500ml Water', durationMinutes: 5 },
      { id: 'st_2', title: 'Wudu & Congregation Fajr Prayer', durationMinutes: 20 },
      { id: 'st_3', title: 'Morning Adhkar & 5 Pages of Quran', durationMinutes: 15 },
      { id: 'st_4', title: 'Set Top 3 Non-Negotiable Priorities', durationMinutes: 5 }
    ]
  },
  {
    id: 'rt_fajr_prayer',
    title: 'Fajr & Quran Connection',
    name: 'Fajr & Quran Connection',
    categoryId: 'pillar_spiritual',
    timeOfDay: 'morning',
    days: ['daily'],
    target: '30 mins',
    durationMinutes: 30,
    duration: 30,
    description: 'On-time Fajr prayer in the mosque and contemplative Quran reading',
    color: '#10b981',
    icon: '🕌',
    active: true,
    steps: [
      { id: 'st_fajr_1', title: 'Pray Fajr on time with khushu', durationMinutes: 15 },
      { id: 'st_fajr_2', title: 'Morning Remembrance & Tilawat', durationMinutes: 15 }
    ]
  },
  {
    id: 'rt_physical_vitality',
    title: 'Physical Strength & Conditioning',
    name: 'Physical Strength & Conditioning',
    categoryId: 'pillar_health',
    timeOfDay: 'afternoon',
    days: ['mon', 'tue', 'wed', 'thu', 'sat'],
    target: '45 mins',
    durationMinutes: 45,
    duration: 45,
    description: 'Focused workout, calisthenics or weights + 1L water hydration',
    color: '#f59e0b',
    icon: '💪',
    active: true,
    steps: [
      { id: 'st_fit_1', title: 'Dynamic Warmup & Mobility', durationMinutes: 5 },
      { id: 'st_fit_2', title: 'Main Workout / Strength Session', durationMinutes: 30 },
      { id: 'st_fit_3', title: 'Cool down & 1 Liter Hydration', durationMinutes: 10 }
    ]
  },
  {
    id: 'rt_deep_focus_block',
    title: 'Deep Focus Sprint',
    name: 'Deep Focus Sprint',
    categoryId: 'pillar_focus',
    timeOfDay: 'afternoon',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    target: '90 mins',
    durationMinutes: 90,
    duration: 90,
    description: 'Phone locked away, single-tasking on primary deliverable',
    color: '#f43f5e',
    icon: '⚡',
    active: true,
    steps: [
      { id: 'st_df_1', title: 'Eliminate all tab and phone distractions', durationMinutes: 3 },
      { id: 'st_df_2', title: 'Uninterrupted deep work sprint', durationMinutes: 80 },
      { id: 'st_df_3', title: 'Quick progress review & notes', durationMinutes: 7 }
    ]
  },
  {
    id: 'rt_digital_detox',
    title: 'Digital Sunset Protocol',
    name: 'Digital Sunset Protocol',
    categoryId: 'pillar_digital',
    timeOfDay: 'evening',
    days: ['daily'],
    target: '20 mins',
    durationMinutes: 20,
    duration: 20,
    description: 'Put phone to charge outside the bedroom and disconnect screens',
    color: '#06b6d4',
    icon: '📴',
    active: true,
    steps: [
      { id: 'st_dd_1', title: 'Turn off notifications & close laptop', durationMinutes: 5 },
      { id: 'st_dd_2', title: 'Dock phone outside sleeping room', durationMinutes: 5 },
      { id: 'st_dd_3', title: 'Dim lights & prepare room for deep sleep', durationMinutes: 10 }
    ]
  },
  {
    id: 'rt_evening_shutdown',
    title: 'Evening Shutdown & Review',
    name: 'Evening Shutdown & Review',
    categoryId: 'pillar_personal',
    timeOfDay: 'evening',
    days: ['daily'],
    target: '30 mins',
    durationMinutes: 30,
    duration: 30,
    description: 'Daily reflection, 20 pages of reading, and sleep preparation',
    color: '#a855f7',
    icon: '🌙',
    active: true,
    steps: [
      { id: 'st_es_1', title: 'Log Daily Evening Reflection in Project 90', durationMinutes: 5 },
      { id: 'st_es_2', title: 'Read 20 pages of non-fiction book', durationMinutes: 20 },
      { id: 'st_es_3', title: 'Night Duas & Lights out by 10:15 PM', durationMinutes: 5 }
    ]
  }
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_routine',
    title: 'First Step',
    description: 'Complete your first guided routine execution',
    icon: '⚡',
    unlocked: false,
    progress: '0 / 1 Routine',
    category: 'Milestone'
  },
  {
    id: 'ach_pillar_architect',
    title: 'Pillar Architect',
    description: 'Register and customize your personal focus pillars',
    icon: '🏛️',
    unlocked: true,
    progress: '5 / 5 Pillars Ready',
    category: 'Pillars'
  },
  {
    id: 'ach_morning_streak',
    title: 'Dawn Master',
    description: 'Complete your morning routine for 7 consecutive days',
    icon: '🌅',
    unlocked: false,
    progress: '0 / 7 Days',
    category: 'Streaks'
  },
  {
    id: 'ach_evening_streak',
    title: 'Night Guardian',
    description: 'Complete your evening shutdown routine for 7 consecutive days',
    icon: '🌙',
    unlocked: false,
    progress: '0 / 7 Days',
    category: 'Streaks'
  },
  {
    id: 'ach_flawless_day',
    title: 'Flawless Execution',
    description: 'Complete 100% of all scheduled routines in a single day',
    icon: '🎯',
    unlocked: false,
    progress: '0 / 1 Day',
    category: 'Mastery'
  },
  {
    id: 'ach_7day_streak',
    title: '7-Day Routine Streak',
    description: 'Complete all scheduled routines for 7 consecutive days',
    icon: '🔥',
    unlocked: false,
    progress: '0 / 7 Days',
    category: 'Streaks'
  },
  {
    id: 'ach_30day_warrior',
    title: '30-Day Routine Warrior',
    description: 'Maintain unbreakable routine discipline for 30 straight days',
    icon: '🛡️',
    unlocked: false,
    progress: '0 / 30 Days',
    category: 'Streaks'
  },
  {
    id: 'ach_holistic_harmony',
    title: 'Holistic Harmony',
    description: 'Complete at least one routine from each of your pillars in a day',
    icon: '🌈',
    unlocked: false,
    progress: '0 / 5 Pillars',
    category: 'Balance'
  },
  {
    id: 'ach_90day_master',
    title: '90-Day Master Finisher',
    description: 'Transform your daily execution across all 90 days of the sprint',
    icon: '👑',
    unlocked: false,
    progress: '1 / 90 Days',
    category: 'Legend'
  }
];

export const getCleanUserData = ({ name = 'User', email = '' }: { name?: string; email?: string } = {}) => {
  const today = new Date();
  const startDate = new Date(today);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 89); // 90 days total starting from Day 1

  const todayStr = formatDate(today);

  return {
    profile: {
      name: name || 'User',
      email: email || '',
      avatarUrl: '',
      challengeGoal: 'Master daily discipline and build unbreakable routines',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      soundEnabled: true,
      theme: 'dark'
    },
    challenge: {
      id: `ch_90_${Date.now()}`,
      name: 'PROJECT 90: Routine & Life OS',
      startDate: todayStr,
      endDate: formatDate(endDate),
      totalDurationDays: 90,
      currentDay: 1,
      status: 'active'
    },
    categories: DEFAULT_PILLARS, // Dynamic Focus Pillars
    routines: DEFAULT_ROUTINES,   // User's Routines
    routineLogsHistory: {
      [todayStr]: {}
    },
    dayScores: {},
    journalEntries: {},
    achievements: DEFAULT_ACHIEVEMENTS,
    onboardingStep: 'completed',
    showGettingStartedGuide: true
  };
};

export const getDemoData = () => getCleanUserData();
export const getInitialData = () => getCleanUserData();
