// Data Seed Generators for Project 90
// Clean Day 1 scratch slate for normal production use

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const getCleanUserData = ({ name = 'User', email = '' }: { name?: string; email?: string } = {}) => {
  const today = new Date();
  const startDate = new Date(today);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 89); // 90 days total starting from Day 1

  const todayStr = formatDate(today);

  const categories = [
    {
      id: 'spiritual',
      name: 'Spiritual',
      icon: '🕌',
      color: '#10b981',
      description: 'Faith, daily prayers, Quran, and spiritual mindfulness',
      projects: [
        { 
          id: 'p_tajweed_memorization', 
          name: 'Quran Memorization & Tajweed Course', 
          description: 'Structured memorization and tajweed mastery', 
          tasks: [
            { id: 't_memorize_surah', title: 'Memorize Surah Al-Mulk verses 1-15', priority: 'high', estimatedMinutes: 45, status: 'in_progress', completed: false, isToday: true },
            { id: 't_tajweed_review', title: 'Tajweed rules lesson & pronunciation check', priority: 'medium', estimatedMinutes: 30, status: 'todo', completed: false, isToday: false }
          ] 
        }
      ]
    },
    {
      id: 'digital',
      name: 'Digital Discipline',
      icon: '📱',
      color: '#06b6d4',
      description: 'Screen-time control, attention protection, and zero mindless scrolling',
      projects: [
        { 
          id: 'p_digital_declutter', 
          name: 'Digital Declutter & Minimalist System', 
          description: 'Eliminate attention leaks and configure strict desktop/phone environments', 
          tasks: [
            { id: 't_audit_notifications', title: 'Audit and turn off all non-essential push notifications', priority: 'high', estimatedMinutes: 20, status: 'done', completed: true, isToday: false },
            { id: 't_clean_desktop_inbox', title: 'Achieve Inbox Zero and organize cloud drive', priority: 'medium', estimatedMinutes: 30, status: 'todo', completed: false, isToday: true }
          ] 
        }
      ]
    },
    {
      id: 'personal',
      name: 'Personal',
      icon: '👤',
      color: '#a855f7',
      description: 'Personal discipline, morning war-room planning, reading, and environment order',
      projects: [
        { 
          id: 'p_knowledge_base', 
          name: 'Personal Knowledge Base & Reading Syntheses', 
          description: 'Writing deep notes on high-impact books and building life blueprints', 
          tasks: [
            { id: 't_book_synthesis', title: 'Write comprehensive chapter notes for Atomic Habits', priority: 'high', estimatedMinutes: 45, status: 'in_progress', completed: false, isToday: true },
            { id: 't_weekly_retro_template', title: 'Design weekly sprint retrospective checklist', priority: 'medium', estimatedMinutes: 25, status: 'done', completed: true, isToday: false }
          ] 
        }
      ]
    },
    {
      id: 'health',
      name: 'Health',
      icon: '💪',
      color: '#f59e0b',
      description: 'Physical vitality, strength training, hydration (3L), and sleep recovery',
      projects: [
        { 
          id: 'p_marathon_conditioning', 
          name: '12-Week Strength & Endurance Program', 
          description: 'Progressive overload training and cardio conditioning', 
          tasks: [
            { id: 't_bench_squat_max', title: 'Establish 5-rep baseline for core compound lifts', priority: 'high', estimatedMinutes: 60, status: 'done', completed: true, isToday: false },
            { id: 't_zone2_cardio', title: '5km steady-state Zone 2 heart rate endurance run', priority: 'high', estimatedMinutes: 35, status: 'in_progress', completed: false, isToday: true }
          ] 
        }
      ]
    },
    {
      id: 'career',
      name: 'Career',
      icon: '💻',
      color: '#f43f5e',
      description: 'High-leverage engineering, deep work focus blocks, and core project mastery',
      projects: [
        { 
          id: 'p_client_platform', 
          name: 'Client SaaS Web Platform', 
          description: 'High-performance Next.js full-stack platform with real-time analytics', 
          tasks: [
            { id: 't_client_auth_api', title: 'Build secure authentication and session middleware', priority: 'high', estimatedMinutes: 90, status: 'done', completed: true, isToday: false },
            { id: 't_client_dashboard_ui', title: 'Design responsive analytics dashboard with charts', priority: 'high', estimatedMinutes: 120, status: 'in_progress', completed: false, isToday: true },
            { id: 't_client_database_perf', title: 'Optimize database indexes and query latency', priority: 'medium', estimatedMinutes: 60, status: 'todo', completed: false, isToday: true },
            { id: 't_client_staging_deploy', title: 'Deploy to staging server and run end-to-end QA tests', priority: 'high', estimatedMinutes: 45, status: 'todo', completed: false, isToday: false }
          ] 
        },
        { 
          id: 'p_fullstack_ai_course', 
          name: 'Full-Stack & AI Engineering Course', 
          description: 'Advanced mastery of distributed systems and generative AI agents', 
          tasks: [
            { id: 't_agentic_workflow_mod', title: 'Complete Module 4: Agentic Reasoning & Tool Calling', priority: 'high', estimatedMinutes: 75, status: 'in_progress', completed: false, isToday: true },
            { id: 't_capstone_project_build', title: 'Build capstone microservice with automated test suite', priority: 'high', estimatedMinutes: 120, status: 'todo', completed: false, isToday: false }
          ] 
        }
      ]
    }
  ];

  const habits = [
    {
      id: 'h_salah',
      name: '5 Daily Prayers on Time',
      categoryId: 'spiritual',
      icon: '🕌',
      frequency: 'daily',
      target: '5 / 5 Prayers',
      points: 20,
      active: true
    },
    {
      id: 'h_quran',
      name: 'Quran Study & Recitation',
      categoryId: 'spiritual',
      icon: '📖',
      frequency: 'daily',
      target: '5 Pages Daily',
      points: 15,
      active: true
    },
    {
      id: 'h_screen_limit',
      name: 'Digital Discipline (Screen < 2h)',
      categoryId: 'digital',
      icon: '📱',
      frequency: 'daily',
      target: '< 2 Hours Screen Time',
      points: 15,
      active: true
    },
    {
      id: 'h_wake_early',
      name: 'Early Rising & Morning War-Room',
      categoryId: 'personal',
      icon: '⏰',
      frequency: 'daily',
      target: 'Top 3 Priorities Set',
      points: 15,
      active: true
    },
    {
      id: 'h_workout',
      name: 'Physical Workout & 3L Water',
      categoryId: 'health',
      icon: '💪',
      frequency: 'daily',
      target: '45m Exercise + 3L Water',
      points: 15,
      active: true
    },
    {
      id: 'h_deepwork',
      name: 'Deep Work & Focused Execution',
      categoryId: 'career',
      icon: '💻',
      frequency: 'daily',
      target: '3+ Hours Deep Focus',
      points: 20,
      active: true
    }
  ];

  const routines = [
    // 1. Spiritual Pillar
    {
      id: 'rt_fajr',
      name: 'Fajr Prayer',
      title: 'Fajr Prayer',
      categoryId: 'spiritual',
      days: ['daily'],
      timeSlot: '05:00 AM - 05:40 AM',
      duration: 25,
      type: 'prayer',
      target: 'Congregation in Mosque',
      color: '#10b981',
      icon: '🕌',
      active: true,
      description: 'Pray Fajr on time with khushu in congregation'
    },
    {
      id: 'rt_quran',
      name: 'Quran Recitation & Reflection',
      title: 'Quran Recitation & Reflection',
      categoryId: 'spiritual',
      days: ['daily'],
      timeSlot: '05:40 AM - 06:10 AM',
      duration: 30,
      type: 'task',
      target: '5 Pages Daily',
      color: '#10b981',
      icon: '📖',
      active: true,
      description: 'Recite 5 pages of Quran daily with contemplation'
    },
    {
      id: 'rt_dhuhr',
      name: 'Dhuhr Prayer',
      title: 'Dhuhr Prayer',
      categoryId: 'spiritual',
      days: ['daily'],
      timeSlot: '12:30 PM - 01:00 PM',
      duration: 20,
      type: 'prayer',
      target: 'On time',
      color: '#10b981',
      icon: '🕌',
      active: true,
      description: 'Pray Dhuhr on time'
    },
    {
      id: 'rt_asr',
      name: 'Asr Prayer',
      title: 'Asr Prayer',
      categoryId: 'spiritual',
      days: ['daily'],
      timeSlot: '03:45 PM - 04:15 PM',
      duration: 20,
      type: 'prayer',
      target: 'On time',
      color: '#10b981',
      icon: '🕌',
      active: true,
      description: 'Pray Asr on time'
    },
    {
      id: 'rt_maghrib',
      name: 'Maghrib Prayer',
      title: 'Maghrib Prayer',
      categoryId: 'spiritual',
      days: ['daily'],
      timeSlot: '06:15 PM - 06:45 PM',
      duration: 20,
      type: 'prayer',
      target: 'On time',
      color: '#10b981',
      icon: '🕌',
      active: true,
      description: 'Pray Maghrib on time in congregation'
    },
    {
      id: 'rt_isha',
      name: 'Isha & Witr Prayer',
      title: 'Isha & Witr Prayer',
      categoryId: 'spiritual',
      days: ['daily'],
      timeSlot: '07:45 PM - 08:30 PM',
      duration: 25,
      type: 'prayer',
      target: 'On time',
      color: '#10b981',
      icon: '🕌',
      active: true,
      description: 'Pray Isha and Witr prayer'
    },

    // 2. Digital Discipline Pillar
    {
      id: 'rt_screen_limit',
      name: 'Digital Discipline (< 2h Screen)',
      title: 'Digital Discipline (< 2h Screen)',
      categoryId: 'digital',
      days: ['daily'],
      timeSlot: 'All Day',
      duration: 0,
      type: 'task',
      target: '< 2 Hours Screen Time',
      color: '#06b6d4',
      icon: '📱',
      active: true,
      description: 'Strictly cap leisure screen time and zero mindless doomscrolling'
    },
    {
      id: 'rt_phone_sleep',
      name: 'Phone Outside Bedroom Overnight',
      title: 'Phone Outside Bedroom Overnight',
      categoryId: 'digital',
      days: ['daily'],
      timeSlot: '10:00 PM - 10:15 PM',
      duration: 5,
      type: 'task',
      target: 'Charged outside bedroom',
      color: '#06b6d4',
      icon: '📴',
      active: true,
      description: 'Charge phone outside bedroom before sleeping'
    },

    // 3. Personal Pillar
    {
      id: 'rt_warroom',
      name: 'Morning War-Room Planning',
      title: 'Morning War-Room Planning',
      categoryId: 'personal',
      days: ['daily'],
      timeSlot: '08:00 AM - 08:20 AM',
      duration: 20,
      type: 'task',
      target: 'Top 3 Priorities Set',
      color: '#a855f7',
      icon: '🎯',
      active: true,
      description: 'Align top 3 non-negotiable outcomes for the day'
    },
    {
      id: 'rt_reading',
      name: 'Non-Fiction Reading',
      title: 'Non-Fiction Reading',
      categoryId: 'personal',
      days: ['daily'],
      timeSlot: '08:30 PM - 09:15 PM',
      duration: 30,
      type: 'task',
      target: '20 Pages Daily',
      color: '#a855f7',
      icon: '📚',
      active: true,
      description: 'Read 20 pages of high-impact book'
    },

    // 4. Health Pillar (Scheduled Days)
    {
      id: 'rt_workout',
      name: 'Gym & Strength Conditioning',
      title: 'Gym & Strength Conditioning',
      categoryId: 'health',
      days: ['tue', 'thu', 'sat'],
      timeSlot: '06:00 PM - 07:30 PM',
      duration: 90,
      type: 'task',
      target: '90m Strength & Circuit',
      color: '#f59e0b',
      icon: '💪',
      active: true,
      description: 'Physical workout, weight training & conditioning session'
    },
    {
      id: 'rt_water',
      name: 'Hydration Protocol (3L Water)',
      title: 'Hydration Protocol (3L Water)',
      categoryId: 'health',
      days: ['daily'],
      timeSlot: 'All Day',
      duration: 0,
      type: 'task',
      target: '3 Liters Daily',
      color: '#f59e0b',
      icon: '💧',
      active: true,
      description: 'Drink 3 Liters of clean water throughout the day'
    },

    // 5. Career Pillar (Weekdays Focus)
    {
      id: 'rt_deepwork_1',
      name: 'Deep Work Sprint 1 (Core Deliverable)',
      title: 'Deep Work Sprint 1 (Core Deliverable)',
      categoryId: 'career',
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      timeSlot: '09:00 AM - 12:00 PM',
      duration: 180,
      type: 'task',
      target: '3h Focused Execution',
      color: '#f43f5e',
      icon: '💻',
      active: true,
      description: 'High-impact project engineering sprint with Clockify timer'
    },
    {
      id: 'rt_deepwork_2',
      name: 'Deep Work Sprint 2 (Project Milestones)',
      title: 'Deep Work Sprint 2 (Project Milestones)',
      categoryId: 'career',
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      timeSlot: '01:30 PM - 04:30 PM',
      duration: 150,
      type: 'task',
      target: '2.5h Feature Execution',
      color: '#f43f5e',
      icon: '⚡',
      active: true,
      description: 'Feature development, code reviews, and testing'
    }
  ];

  const goals = [
    {
      id: 'g_career_hours',
      title: 'Weekly Deep Work Target',
      categoryId: 'career',
      target: 35,
      current: 0,
      unit: 'Hours / Week',
      frequency: 'weekly',
      status: 'active'
    },
    {
      id: 'g_workout_days',
      title: 'Physical Training Sessions',
      categoryId: 'health',
      target: 5,
      current: 0,
      unit: 'Days / Week',
      frequency: 'weekly',
      status: 'active'
    },
    {
      id: 'g_quran_pages',
      title: 'Quran 90-Day Challenge',
      categoryId: 'spiritual',
      target: 604,
      current: 0,
      unit: 'Pages in 90 Days',
      frequency: 'challenge',
      status: 'active'
    },
    {
      id: 'g_digital_discipline',
      title: 'Zero Mindless Scrolling Days',
      categoryId: 'digital',
      target: 7,
      current: 0,
      unit: 'Days / Week',
      frequency: 'weekly',
      status: 'active'
    }
  ];

  const achievements = [
    {
      id: 'ach_7day_streak',
      title: '7-Day Streak Warrior',
      description: 'Maintain 7 consecutive days of 70+ scores',
      icon: '🔥',
      unlocked: false,
      progress: '0 / 7 Days'
    },
    {
      id: 'ach_30day_strong',
      title: '30 Days Strong',
      description: 'Conquer the first month of your 90-day challenge',
      icon: '🛡️',
      unlocked: false,
      progress: '0 / 30 Days'
    },
    {
      id: 'ach_100h_deepwork',
      title: '100 Hours of Deep Work',
      description: 'Clock 100 verified hours of focused deep work',
      icon: '⚡',
      unlocked: false,
      progress: '0 / 100 Hours'
    },
    {
      id: 'ach_career_machine',
      title: 'Career Machine',
      description: 'Complete 30 high-impact tasks and milestones',
      icon: '💻',
      unlocked: false,
      progress: '0 / 30 Tasks'
    },
    {
      id: 'ach_health_warrior',
      title: 'Health Warrior',
      description: 'Hit workout and hydration targets 10 days',
      icon: '💪',
      unlocked: false,
      progress: '0 / 10 Days'
    },
    {
      id: 'ach_90day_finisher',
      title: '90-Day Master Finisher',
      description: 'Transform your entire life across 90 relentless days',
      icon: '👑',
      unlocked: false,
      progress: '1 / 90 Days'
    }
  ];

  return {
    profile: {
      name: name || 'User',
      email: email || '',
      avatarUrl: '',
      challengeGoal: 'Build unbreakable daily discipline, deep focus, and life balance',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      soundEnabled: true,
      theme: 'dark'
    },
    challenge: {
      id: `ch_90_${Date.now()}`,
      name: 'PROJECT 90: Master Life Sprint',
      startDate: todayStr,
      endDate: formatDate(endDate),
      totalDurationDays: 90,
      currentDay: 1,
      status: 'active'
    },
    categories,
    habits,
    routines,
    categoryScores: {},
    dayScores: {},
    habitLogsHistory: {
      [todayStr]: {}
    },
    routineLogsHistory: {},
    weeklyEventLogsHistory: {},
    journalEntries: {},
    timeEntries: [],
    goals,
    achievements,
    weeklyPlans: [],
    recurringWeeklySchedule: [
      {
        id: `rwe_gym_1`,
        title: 'Gym & Strength Conditioning',
        categoryId: 'health',
        days: ['tue', 'thu', 'sat'],
        timeSlot: '06:00 PM - 07:30 PM',
        durationMinutes: 90,
        points: 20,
        description: 'Physical workout, weight training & core circuit'
      },
      {
        id: `rwe_sunday_review_1`,
        title: 'Sunday Life Retrospective & Sprint Planner',
        categoryId: 'personal',
        days: ['sun'],
        timeSlot: '07:30 PM - 08:30 PM',
        durationMinutes: 60,
        points: 20,
        description: 'Analyze 7-day balance, diagnose burnout risks, and set top 3 priorities'
      }
    ],
    onboardingStep: 'completed',
    showGettingStartedGuide: true,
    activeTimer: {
      isRunning: false,
      activityName: '',
      categoryId: 'career',
      projectId: '',
      taskId: '',
      taskTitle: '',
      description: '',
      startTime: null,
      elapsedSeconds: 0
    }
  };
};

export const getDemoData = () => getCleanUserData();
export const getInitialData = () => getCleanUserData();
