// Data Seed Generators for Project 90
// 1. getDemoData(): Pre-loaded Day 12 transformation sprint for demo testing
// 2. getCleanUserData(): Fresh, clean Day 1 slate with zero logs for newly registered users

const formatDate = (date) => date.toISOString().split('T')[0];

export const getDemoData = () => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 11); // Started 11 days ago -> Today is Day 12

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 89); // Total 90 days

  const categories = [
    {
      id: 'spiritual',
      name: 'Spiritual',
      icon: '🕌',
      color: '#10b981',
      description: 'Strengthen faith, connection, daily prayers, and Quranic study',
      projects: [
        { 
          id: 'p_salah', 
          name: '5 Daily Salah', 
          description: 'Pray on time with khushu', 
          tasks: [
            { id: 't_salah_fajr', title: 'Fajr in congregation', priority: 'high', estimatedMinutes: 25, completed: true },
            { id: 't_salah_dhuhr', title: 'Dhuhr prayer on time', priority: 'high', estimatedMinutes: 15, completed: true },
            { id: 't_salah_asr', title: 'Asr prayer on time', priority: 'high', estimatedMinutes: 15, completed: true },
            { id: 't_salah_maghrib', title: 'Maghrib prayer on time', priority: 'high', estimatedMinutes: 15, completed: true },
            { id: 't_salah_isha', title: 'Isha prayer with Witr', priority: 'high', estimatedMinutes: 20, completed: false }
          ] 
        },
        { 
          id: 'p_quran', 
          name: 'Quran Tilawat & Tadabbur', 
          description: 'Daily recitation & meaning', 
          tasks: [
            { id: 't_quran_surah', title: 'Recite Surah Al-Kahf / Daily Juz portion', priority: 'high', estimatedMinutes: 30, completed: true },
            { id: 't_quran_tafsir', title: 'Read 2 pages of Tafsir Ibn Kathir', priority: 'medium', estimatedMinutes: 20, completed: false }
          ] 
        },
        { id: 'p_adhkar', name: 'Morning & Evening Adhkar', description: 'Daily remembrance & protection', tasks: [
          { id: 't_adhkar_morn', title: 'Morning Adhkar before sunrise', priority: 'high', estimatedMinutes: 15, completed: true },
          { id: 't_adhkar_eve', title: 'Evening Adhkar before Maghrib', priority: 'high', estimatedMinutes: 15, completed: true }
        ]},
        { id: 'p_islamic_learning', name: 'Islamic Knowledge', description: 'Seerah, Fiqh, and Hadith studies', tasks: [] }
      ]
    },
    {
      id: 'digital',
      name: 'Digital Discipline',
      icon: '📱',
      color: '#06b6d4',
      description: 'Master attention, limit mindless scrolling, and protect deep focus',
      projects: [
        { 
          id: 'p_screentime', 
          name: 'Screen-time Control', 
          description: 'Strict phone usage under 2h', 
          tasks: [
            { id: 't_screen_limits', title: 'Verify app screen limits enabled', priority: 'medium', estimatedMinutes: 5, completed: true },
            { id: 't_no_bed_phone', title: 'Charge phone outside bedroom', priority: 'high', estimatedMinutes: 5, completed: false }
          ] 
        },
        { id: 'p_no_scroll', name: 'Zero Mindless Scrolling', description: 'No TikTok, Reels or endless feeds', tasks: [] },
        { id: 'p_phone_free', name: 'Phone-Free Deep Work', description: 'Phone in another room while coding', tasks: [] },
        { id: 'p_offline_morning', name: 'First 90 Mins Offline', description: 'No notifications before 7:00 AM', tasks: [] }
      ]
    },
    {
      id: 'personal',
      name: 'Personal',
      icon: '👤',
      color: '#a855f7',
      description: 'Cultivate personal discipline, environment order, and mental clarity',
      projects: [
        { id: 'p_wake_early', name: 'Early Rising (5:00 AM)', description: 'Consistent wake-up schedule', tasks: [] },
        { id: 'p_planning', name: 'Daily Strategic Planning', description: 'Prioritize top 3 objectives', tasks: [
          { id: 't_plan_warroom', title: 'Morning war-room 3 priorities alignment', priority: 'high', estimatedMinutes: 15, completed: true },
          { id: 't_plan_review', title: 'Evening daily reflection scorecard check', priority: 'high', estimatedMinutes: 15, completed: false }
        ]},
        { id: 'p_reading', name: 'Mind Expansion Reading', description: 'Books on architecture, psychology, strategy', tasks: [
          { id: 't_read_atomic', title: 'Read 20 pages of Deep Work / Atomic Habits', priority: 'medium', estimatedMinutes: 30, completed: true }
        ]},
        { id: 'p_environment', name: 'Orderly Living Space', description: 'Clean room and organized workstation', tasks: [] },
        { id: 'p_sleep_routine', name: 'Evening Sleep Protocol', description: 'Wind down by 9:45 PM, lights out by 10:15 PM', tasks: [] }
      ]
    },
    {
      id: 'health',
      name: 'Health',
      icon: '💪',
      color: '#f59e0b',
      description: 'Build physical vitality, stamina, muscular endurance, and recovery',
      projects: [
        { 
          id: 'p_workout', 
          name: 'Strength & Conditioning', 
          description: 'Gym, calisthenics, and core work', 
          tasks: [
            { id: 't_gym_push', title: 'Chest, Shoulders & Triceps Strength Workout', priority: 'high', estimatedMinutes: 75, completed: true },
            { id: 't_gym_stretch', title: '15m Post-Workout Mobility & Foam Rolling', priority: 'medium', estimatedMinutes: 15, completed: true }
          ] 
        },
        { id: 'p_walking', name: 'Daily 8,000+ Steps', description: 'Active movement and brisk walks', tasks: [] },
        { id: 'p_water', name: '3 Liters Pure Water', description: 'Optimal hydration throughout the day', tasks: [
          { id: 't_water_bottle', title: 'Fill 1.5L bottle in morning', priority: 'medium', estimatedMinutes: 2, completed: true },
          { id: 't_water_afternoon', title: 'Finish second 1.5L bottle by 6 PM', priority: 'medium', estimatedMinutes: 2, completed: true }
        ]},
        { id: 'p_nutrition', name: 'Whole Foods Nutrition', description: 'High protein, zero refined sugar', tasks: [] },
        { id: 'p_sleep_health', name: '7.5+ Hours Quality Sleep', description: 'Optimized sleep environment & recovery', tasks: [] }
      ]
    },
    {
      id: 'career',
      name: 'Career',
      icon: '💻',
      color: '#f43f5e',
      description: 'Execute high-value engineering, build RHIZAN, and elevate technical mastery',
      projects: [
        { 
          id: 'p_rhizan', 
          name: 'RHIZAN ERP Development', 
          description: 'Core ERP architecture, modules, and APIs', 
          tasks: [
            { id: 't_rhizan_auth', title: 'Implement JWT & RBAC permission matrix', priority: 'high', estimatedMinutes: 90, completed: true },
            { id: 't_rhizan_inventory', title: 'Design PostgreSQL multi-tenant inventory schema', priority: 'high', estimatedMinutes: 120, completed: true },
            { id: 't_rhizan_frontend', title: 'Build responsive Next.js ERP dashboard interface', priority: 'high', estimatedMinutes: 90, completed: false },
            { id: 't_rhizan_tests', title: 'Write integration test suite for accounting engine', priority: 'medium', estimatedMinutes: 60, completed: false }
          ] 
        },
        { 
          id: 'p_learning_tech', 
          name: 'Advanced Engineering Learning', 
          description: 'NestJS, System Design, React & Microservices', 
          tasks: [
            { id: 't_learn_arch', title: 'Study Distributed Systems Caching & Redis patterns', priority: 'medium', estimatedMinutes: 60, completed: true }
          ] 
        },
        { id: 'p_client_projects', name: 'Client Deliverables & Consulting', description: 'High-impact solutions & stakeholder meetings', tasks: [] },
        { id: 'p_portfolio_code', name: 'Open Source & Portfolio', description: 'Refining architectural code showcases', tasks: [] }
      ]
    }
  ];

  const habits = [
    {
      id: 'h_salah',
      name: '5 Daily Salah on Time',
      categoryId: 'spiritual',
      projectId: 'p_salah',
      icon: '🕌',
      frequency: 'daily',
      target: '5 / 5 Prayers',
      points: 20,
      active: true
    },
    {
      id: 'h_quran',
      name: 'Quran Recitation & Reflection',
      categoryId: 'spiritual',
      projectId: 'p_quran',
      icon: '📖',
      frequency: 'daily',
      target: '5 Pages Daily',
      points: 10,
      active: true
    },
    {
      id: 'h_screen_limit',
      name: 'Digital Discipline (Screen < 2h & No Scrolling)',
      categoryId: 'digital',
      projectId: 'p_screentime',
      icon: '📱',
      frequency: 'daily',
      target: '< 2 Hours Screen Time',
      points: 10,
      active: true
    },
    {
      id: 'h_wake_5am',
      name: 'Wake Up at 5:00 AM & Morning Plan',
      categoryId: 'personal',
      projectId: 'p_wake_early',
      icon: '⏰',
      frequency: 'daily',
      target: '5:00 AM Prompt',
      points: 10,
      active: true
    },
    {
      id: 'h_reading',
      name: 'Read 20+ Pages of Non-Fiction',
      categoryId: 'personal',
      projectId: 'p_reading',
      icon: '📚',
      frequency: 'daily',
      target: '20 Pages',
      points: 10,
      active: true
    },
    {
      id: 'h_workout',
      name: 'Physical Exercise & 3L Water',
      categoryId: 'health',
      projectId: 'p_workout',
      icon: '💪',
      frequency: 'daily',
      target: '45m Workout + 3L Water',
      points: 15,
      active: true
    },
    {
      id: 'h_career_deepwork',
      name: 'RHIZAN Deep Work & Coding',
      categoryId: 'career',
      projectId: 'p_rhizan',
      icon: '💻',
      frequency: 'daily',
      target: '4+ Hours Deep Work',
      points: 15,
      active: true
    },
    {
      id: 'h_reflection',
      name: 'Evening Review & Daily Journal',
      categoryId: 'personal',
      projectId: 'p_planning',
      icon: '📝',
      frequency: 'daily',
      target: '4 Questions Answered',
      points: 10,
      active: true
    }
  ];

  const routines = [
    {
      id: 'r_morning',
      name: 'Morning Momentum Routine',
      tagline: 'Start with faith, clarity, and physical vitality',
      icon: '🌅',
      points: 15, // Default base points
      timeSlot: '05:00 AM - 07:00 AM',
      color: '#10b981',
      activities: [
        { id: 'ra_1', title: 'Wake up 5:00 AM & Wudu', duration: 15, categoryId: 'personal' },
        { id: 'ra_2', title: 'Fajr in Congregation & Morning Adhkar', duration: 35, categoryId: 'spiritual' },
        { id: 'ra_3', title: 'Quran Recitation (5 Pages)', duration: 20, categoryId: 'spiritual' },
        { id: 'ra_4', title: 'Calisthenics, Mobility & Hydration (1L)', duration: 30, categoryId: 'health' },
        { id: 'ra_5', title: 'Cold Shower & High Protein Breakfast', duration: 20, categoryId: 'health' }
      ]
    },
    {
      id: 'r_work',
      name: 'Work / High-Impact Routine',
      tagline: 'Deep flow engineering and relentless execution',
      icon: '☀️',
      points: 20, // Default base points
      timeSlot: '08:30 AM - 05:00 PM',
      color: '#f43f5e',
      activities: [
        { id: 'ra_6', title: 'Daily War-room Planning & Priority Matrix', duration: 15, categoryId: 'personal' },
        { id: 'ra_7', title: 'RHIZAN ERP Backend Core Engine (Deep Block 1)', duration: 120, categoryId: 'career' },
        { id: 'ra_8', title: 'Dhuhr Prayer & 15-Minute Rejuvenation Walk', duration: 30, categoryId: 'spiritual' },
        { id: 'ra_9', title: 'RHIZAN UI/UX & React Frontend (Deep Block 2)', duration: 90, categoryId: 'career' },
        { id: 'ra_10', title: 'Advanced NestJS & Architecture Learning', duration: 60, categoryId: 'career' }
      ]
    },
    {
      id: 'r_evening',
      name: 'Evening Reflection & Wind-down',
      tagline: 'Close the loops, reflect on growth, and recharge',
      icon: '🌙',
      points: 15, // Default base points
      timeSlot: '07:30 PM - 10:00 PM',
      color: '#a855f7',
      activities: [
        { id: 'ra_11', title: 'Maghrib & Isha Prayers', duration: 35, categoryId: 'spiritual' },
        { id: 'ra_12', title: 'Family Dinner & Digital-Free Conversation', duration: 45, categoryId: 'health' },
        { id: 'ra_13', title: '20 Pages Reading (Strategic / Tech)', duration: 25, categoryId: 'personal' },
        { id: 'ra_14', title: 'PROJECT 90 Daily Reflection & Scorecard', duration: 15, categoryId: 'personal' },
        { id: 'ra_15', title: 'Plan Tomorrow & Sleep Protocol (Lights Out 10:15 PM)', duration: 20, categoryId: 'personal' }
      ]
    }
  ];

  // Historical data for Days 1 to 11
  const dayScores = {};
  const habitLogsHistory = {};
  const journalEntries = {};
  const timeEntries = [];

  const pastScores = [88, 92, 85, 95, 80, 90, 92, 85, 90, 95, 90];
  const reflectionsArchive = [
    {
      q1: 'Wrote the complete authentication and JWT microservice for RHIZAN.',
      q2: 'Delayed workout by 40 minutes due to long debugging session.',
      q3: 'YouTube recommended video notifications during afternoon.',
      q4: 'Turn on Do Not Disturb mode during all deep work coding blocks.',
      mood: 'great'
    },
    {
      q1: 'Completed all 5 Salah in mosque and read 6 pages of Quran.',
      q2: 'Did not hit 3L water goal, only reached 2.2L.',
      q3: 'Snacking impulsively after dinner.',
      q4: 'Prep 3L water bottle on desk every morning before breakfast.',
      mood: 'good'
    },
    {
      q1: 'Built the responsive state management and dynamic category cards.',
      q2: 'Slept 15 minutes past 10:15 PM.',
      q3: 'Reading articles on phone in bed.',
      q4: 'Keep phone strictly charging across the room in the hallway.',
      mood: 'great'
    }
  ];

  for (let i = 0; i < 11; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = formatDate(d);
    const score = pastScores[i];
    dayScores[dateStr] = score;

    const dayHabitLog = {};
    habits.forEach((h, hIdx) => {
      dayHabitLog[h.id] = (score < 85 && hIdx === 4) ? 'skipped' : 'completed';
    });
    habitLogsHistory[dateStr] = dayHabitLog;

    timeEntries.push(
      {
        id: `te_past_${i}_1`,
        activityName: 'RHIZAN ERP Architecture & Coding',
        categoryId: 'career',
        projectId: 'p_rhizan',
        date: dateStr,
        startTime: '09:00 AM',
        endTime: '12:30 PM',
        durationMinutes: 210,
        description: 'Implemented multi-tenant data isolation and modular schemas'
      },
      {
        id: `te_past_${i}_2`,
        activityName: 'NestJS & React State Masterclass',
        categoryId: 'career',
        projectId: 'p_learning_tech',
        date: dateStr,
        startTime: '02:00 PM',
        endTime: '03:15 PM',
        durationMinutes: 75,
        description: 'Learned reactive event streams and optimistic UI updates'
      },
      {
        id: `te_past_${i}_3`,
        activityName: 'Strength Training & Core',
        categoryId: 'health',
        projectId: 'p_workout',
        date: dateStr,
        startTime: '06:00 AM',
        endTime: '06:45 AM',
        durationMinutes: 45,
        description: 'Upper body hypertrophy + abdominal circuit'
      },
      {
        id: `te_past_${i}_4`,
        activityName: 'Quran Recitation & Reflection',
        categoryId: 'spiritual',
        projectId: 'p_quran',
        date: dateStr,
        startTime: '05:35 AM',
        endTime: '06:00 AM',
        durationMinutes: 25,
        description: 'Surah Al-Mulk & Surah Al-Kahf verses with translation'
      }
    );

    if (i % 3 === 0) {
      const refIdx = Math.floor(i / 3) % reflectionsArchive.length;
      journalEntries[dateStr] = {
        date: dateStr,
        dayNumber: i + 1,
        mood: reflectionsArchive[refIdx].mood,
        q1: reflectionsArchive[refIdx].q1,
        q2: reflectionsArchive[refIdx].q2,
        q3: reflectionsArchive[refIdx].q3,
        q4: reflectionsArchive[refIdx].q4,
        timestamp: new Date(d.setHours(21, 30)).toISOString()
      };
    }
  }

  // Today is Day 12
  const todayStr = formatDate(today);
  const todayHabitLogs = {
    h_salah: 'completed',
    h_quran: 'completed',
    h_wake_5am: 'completed',
    h_workout: 'completed',
    h_screen_limit: 'in_progress',
    h_career_deepwork: 'in_progress',
    h_reading: 'pending',
    h_reflection: 'pending'
  };
  habitLogsHistory[todayStr] = todayHabitLogs;
  dayScores[todayStr] = 78;

  timeEntries.push(
    {
      id: 'te_today_1',
      activityName: 'Morning Fajr & Quran Tilawat',
      categoryId: 'spiritual',
      projectId: 'p_quran',
      date: todayStr,
      startTime: '05:15 AM',
      endTime: '06:00 AM',
      durationMinutes: 45,
      description: 'Morning prayer at mosque + 5 pages of Surah Maryam'
    },
    {
      id: 'te_today_2',
      activityName: 'Calisthenics & Strength Workout',
      categoryId: 'health',
      projectId: 'p_workout',
      date: todayStr,
      startTime: '06:10 AM',
      endTime: '06:55 AM',
      durationMinutes: 45,
      description: 'Weighted pull-ups, push-ups and 15m core stabilization'
    },
    {
      id: 'te_today_3',
      activityName: 'RHIZAN ERP — Database Schema & ORM',
      categoryId: 'career',
      projectId: 'p_rhizan',
      date: todayStr,
      startTime: '08:45 AM',
      endTime: '12:15 PM',
      durationMinutes: 210,
      description: 'Built customer invoicing and inventory ledger backend services'
    },
    {
      id: 'te_today_4',
      activityName: 'NestJS Microservices & Event Bus',
      categoryId: 'career',
      projectId: 'p_learning_tech',
      date: todayStr,
      startTime: '01:30 PM',
      endTime: '03:00 PM',
      durationMinutes: 90,
      description: 'Studied RabbitMQ message patterns and resilient retry policies'
    }
  );

  const goals = [
    {
      id: 'g_career_hours',
      title: 'RHIZAN & Engineering Deep Work',
      categoryId: 'career',
      target: 40,
      current: 32.5,
      unit: 'Hours / Week',
      frequency: 'weekly',
      status: 'active'
    },
    {
      id: 'g_workout_days',
      title: 'Strength & Cardio Sessions',
      categoryId: 'health',
      target: 5,
      current: 4,
      unit: 'Days / Week',
      frequency: 'weekly',
      status: 'active'
    },
    {
      id: 'g_quran_finish',
      title: 'Complete Quran 90-Day Khatmah',
      categoryId: 'spiritual',
      target: 604,
      current: 85,
      unit: 'Pages in 90 Days',
      frequency: 'challenge',
      status: 'active'
    },
    {
      id: 'g_digital_fast',
      title: 'Zero Social Media Scrolling Days',
      categoryId: 'digital',
      target: 7,
      current: 6,
      unit: 'Days / Week',
      frequency: 'weekly',
      status: 'active'
    }
  ];

  const achievements = [
    {
      id: 'ach_7day_streak',
      title: '7-Day Streak Warrior',
      description: 'Maintained 7 consecutive days of 70+ scores',
      icon: '🔥',
      unlocked: true,
      unlockedAt: 'Day 7'
    },
    {
      id: 'ach_30day_strong',
      title: '30 Days Strong',
      description: 'Conquer the first month of the 90-day challenge',
      icon: '🛡️',
      unlocked: false,
      progress: '12 / 30 Days'
    },
    {
      id: 'ach_100h_deepwork',
      title: '100 Hours of Deep Work',
      description: 'Clock 100 verified hours of focused engineering',
      icon: '⚡',
      unlocked: false,
      progress: '68 / 100 Hours'
    },
    {
      id: 'ach_career_machine',
      title: 'Career Machine',
      description: 'Complete 30 high-impact milestones on RHIZAN',
      icon: '💻',
      unlocked: true,
      unlockedAt: 'Day 10'
    },
    {
      id: 'ach_health_warrior',
      title: 'Health Warrior',
      description: 'Hit workout and hydration targets 10 consecutive days',
      icon: '💪',
      unlocked: true,
      unlockedAt: 'Day 11'
    },
    {
      id: 'ach_90day_finisher',
      title: '90-Day Master Finisher',
      description: 'Transform your entire life across 90 relentless days',
      icon: '👑',
      unlocked: false,
      progress: '12 / 90 Days'
    }
  ];

  return {
    profile: {
      name: 'Abdulaziz',
      avatarUrl: '',
      challengeGoal: 'Build unbreakable discipline, master RHIZAN & elevate spiritual focus',
      timezone: 'Asia/Riyadh (GMT+3)',
      soundEnabled: true,
      theme: 'dark'
    },
    challenge: {
      id: 'ch_90_v1',
      name: 'PROJECT 90: Master Life Sprint',
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      totalDurationDays: 90,
      currentDay: 12,
      status: 'active'
    },
    categories,
    habits,
    routines,
    dayScores,
    habitLogsHistory,
    journalEntries,
    timeEntries,
    goals,
    achievements,
    weeklyPlans: [
      {
        id: 'wp_demo_w1',
        createdAt: new Date(startDate.getTime() + 7 * 86400000).toISOString(),
        priorities: [
          'Deliver RHIZAN inventory module architecture',
          'Maintain 5 daily prayers on time without exception',
          'Cap screen time strictly under 2h daily'
        ],
        workCapHours: 40,
        rebalanceFocus: 'Spiritual & Health',
        notes: 'Great momentum on week 1, stay consistent and avoid late nights.'
      }
    ],
    recurringWeeklySchedule: [
      {
        id: 'rwe_gym',
        title: 'Gym & Strength Training (Push / Pull / Legs)',
        categoryId: 'health',
        days: ['tue', 'thu', 'sat'],
        timeSlot: '06:00 PM - 07:30 PM',
        durationMinutes: 90,
        points: 20,
        description: 'Hypertrophy weight training & core circuit'
      },
      {
        id: 'rwe_team_sync',
        title: 'RHIZAN Architecture & Stakeholder Sync',
        categoryId: 'career',
        days: ['mon'],
        timeSlot: '10:00 AM - 11:30 AM',
        durationMinutes: 90,
        points: 25,
        description: 'Weekly sprint planning, backlog review, and architecture sync'
      },
      {
        id: 'rwe_jumuah',
        title: "Jumu'ah Prayer & Spiritual Gathering",
        categoryId: 'spiritual',
        days: ['fri'],
        timeSlot: '12:30 PM - 02:00 PM',
        durationMinutes: 90,
        points: 20,
        description: 'Friday congregational prayer, khutbah, and Quran recitation'
      },
      {
        id: 'rwe_sunday_review',
        title: 'Sunday Life Retrospective & Next-Week Planner',
        categoryId: 'personal',
        days: ['sun'],
        timeSlot: '07:30 PM - 08:30 PM',
        durationMinutes: 60,
        points: 15,
        description: 'Analyze 7-day balance, diagnose burnout risks, and set top 3 priorities'
      }
    ],
    onboardingStep: 'completed',
    activeTimer: {
      isRunning: false,
      activityName: 'RHIZAN ERP Frontend Design',
      categoryId: 'career',
      projectId: 'p_rhizan',
      description: 'Building modern responsive layout with dark mode support',
      startTime: null,
      elapsedSeconds: 5076
    }
  };
};

export const getCleanUserData = ({ name = 'New User', email = '' } = {}) => {
  const today = new Date();
  const startDate = new Date(today);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 89); // 90 days total starting Day 1

  const todayStr = formatDate(today);

  const categories = [
    {
      id: 'spiritual',
      name: 'Spiritual',
      icon: '🕌',
      color: '#10b981',
      description: 'Faith, daily prayers, Quran, and reflection',
      projects: [
        { 
          id: `p_salah_${Date.now()}`, 
          name: 'Daily Prayers & Dhikr', 
          description: 'Pray 5 daily prayers on time with mindfulness', 
          tasks: [
            { id: `t_s1_${Date.now()}`, title: 'Fajr & Morning Adhkar', priority: 'high', estimatedMinutes: 20, completed: false },
            { id: `t_s2_${Date.now()}`, title: 'Dhuhr on time', priority: 'high', estimatedMinutes: 15, completed: false }
          ] 
        },
        { 
          id: `p_quran_${Date.now()}`, 
          name: 'Quran Study & Reflection', 
          description: 'Daily study and recitation', 
          tasks: [
            { id: `t_q1_${Date.now()}`, title: 'Recite 5 pages with translation', priority: 'medium', estimatedMinutes: 25, completed: false }
          ] 
        }
      ]
    },
    {
      id: 'digital',
      name: 'Digital Discipline',
      icon: '📱',
      color: '#06b6d4',
      description: 'Attention control, screen-time caps, and distraction elimination',
      projects: [
        { 
          id: `p_screen_${Date.now()}`, 
          name: 'Screen-time Limit (<2h)', 
          description: 'Keep leisure screen time under 2h', 
          tasks: [
            { id: `t_sc1_${Date.now()}`, title: 'Keep phone in another room during focus', priority: 'high', estimatedMinutes: 5, completed: false }
          ] 
        }
      ]
    },
    {
      id: 'personal',
      name: 'Personal',
      icon: '👤',
      color: '#a855f7',
      description: 'Mindset, continuous learning, environment, and sleep',
      projects: [
        { 
          id: `p_reading_${Date.now()}`, 
          name: 'Daily Reading', 
          description: 'Read high-impact non-fiction books', 
          tasks: [
            { id: `t_rd1_${Date.now()}`, title: 'Read 15 pages of self-mastery / technical book', priority: 'medium', estimatedMinutes: 30, completed: false }
          ] 
        },
        { 
          id: `p_planning_${Date.now()}`, 
          name: 'Daily War-Room Planning', 
          description: 'Set top 3 daily objectives', 
          tasks: [
            { id: `t_pl1_${Date.now()}`, title: 'Plan 3 non-negotiable daily objectives', priority: 'high', estimatedMinutes: 15, completed: false }
          ] 
        }
      ]
    },
    {
      id: 'health',
      name: 'Health',
      icon: '💪',
      color: '#f59e0b',
      description: 'Fitness, physical conditioning, nutrition, and rest',
      projects: [
        { 
          id: `p_workout_${Date.now()}`, 
          name: 'Physical Conditioning & Gym', 
          description: 'Workouts, steps, and hydration', 
          tasks: [
            { id: `t_wk1_${Date.now()}`, title: 'Complete 60-minute strength training workout', priority: 'high', estimatedMinutes: 60, completed: false },
            { id: `t_wk2_${Date.now()}`, title: 'Drink 3 Liters of water', priority: 'medium', estimatedMinutes: 5, completed: false }
          ] 
        }
      ]
    },
    {
      id: 'career',
      name: 'Career',
      icon: '💻',
      color: '#f43f5e',
      description: 'Engineering, deep work blocks, and high-leverage projects',
      projects: [
        { 
          id: `p_work_${Date.now()}`, 
          name: 'Core Project Execution', 
          description: 'Deep focus execution blocks', 
          tasks: [
            { id: `t_cw1_${Date.now()}`, title: 'Sprint 1: Core feature architecture & development', priority: 'high', estimatedMinutes: 90, completed: false },
            { id: `t_cw2_${Date.now()}`, title: 'Sprint 2: Code review, testing and deployment', priority: 'medium', estimatedMinutes: 60, completed: false }
          ] 
        }
      ]
    }
  ];

  const habits = [
    {
      id: 'h_clean_1',
      name: 'Daily Spiritual Practice & Reflection',
      categoryId: 'spiritual',
      icon: '🕌',
      frequency: 'daily',
      target: 'Daily Connection',
      points: 20,
      active: true
    },
    {
      id: 'h_clean_2',
      name: 'Digital Discipline & Phone-Free Morning',
      categoryId: 'digital',
      icon: '📱',
      frequency: 'daily',
      target: '< 2h Leisure Screen',
      points: 15,
      active: true
    },
    {
      id: 'h_clean_3',
      name: 'Early Morning Routine & Daily Plan',
      categoryId: 'personal',
      icon: '⏰',
      frequency: 'daily',
      target: 'Top 3 Priorities Set',
      points: 15,
      active: true
    },
    {
      id: 'h_clean_4',
      name: 'Physical Workout & 3L Water',
      categoryId: 'health',
      icon: '💪',
      frequency: 'daily',
      target: '45m Exercise + Hydration',
      points: 20,
      active: true
    },
    {
      id: 'h_clean_5',
      name: 'Deep Work Focus Block',
      categoryId: 'career',
      icon: '💻',
      frequency: 'daily',
      target: '3+ Hours Deep Focus',
      points: 20,
      active: true
    },
    {
      id: 'h_clean_6',
      name: 'Evening Reflection & Scorecard Review',
      categoryId: 'personal',
      icon: '📝',
      frequency: 'daily',
      target: 'Complete Evening Log',
      points: 10,
      active: true
    }
  ];

  const routines = [
    {
      id: 'r_morning_clean',
      name: 'Morning Momentum',
      tagline: 'Start the day with energy, intention, and focus',
      icon: '🌅',
      timeSlot: '06:00 AM - 08:00 AM',
      color: '#10b981',
      activities: [
        { id: 'ra_c1', title: 'Hydration & Morning Focus', duration: 15, categoryId: 'health' },
        { id: 'ra_c2', title: 'Spiritual / Mindfulness Session', duration: 30, categoryId: 'spiritual' },
        { id: 'ra_c3', title: 'Movement / Workout', duration: 35, categoryId: 'health' },
        { id: 'ra_c4', title: 'Daily War-room Planning', duration: 15, categoryId: 'personal' }
      ]
    },
    {
      id: 'r_deepwork_clean',
      name: 'High-Impact Focus Block',
      tagline: 'Uninterrupted deep execution on your primary goal',
      icon: '⚡',
      timeSlot: '09:00 AM - 05:00 PM',
      color: '#f43f5e',
      activities: [
        { id: 'ra_c5', title: 'Deep Work Sprint 1', duration: 90, categoryId: 'career' },
        { id: 'ra_c6', title: 'Restorative Movement Break', duration: 20, categoryId: 'health' },
        { id: 'ra_c7', title: 'Deep Work Sprint 2', duration: 90, categoryId: 'career' }
      ]
    },
    {
      id: 'r_evening_clean',
      name: 'Evening Wind-down & Review',
      tagline: 'Reflect on wins, plan tomorrow, and restore energy',
      icon: '🌙',
      timeSlot: '08:00 PM - 10:00 PM',
      color: '#a855f7',
      activities: [
        { id: 'ra_c8', title: 'PROJECT 90 Daily Reflection', duration: 15, categoryId: 'personal' },
        { id: 'ra_c9', title: 'Non-Fiction Reading', duration: 25, categoryId: 'personal' },
        { id: 'ra_c10', title: 'Tomorrow Prep & Sleep Protocol', duration: 20, categoryId: 'personal' }
      ]
    }
  ];

  const goals = [
    {
      id: 'g_clean_1',
      title: 'Weekly Deep Work Target',
      categoryId: 'career',
      target: 30,
      current: 0,
      unit: 'Hours / Week',
      frequency: 'weekly',
      status: 'active'
    },
    {
      id: 'g_clean_2',
      title: 'Weekly Workouts Completed',
      categoryId: 'health',
      target: 5,
      current: 0,
      unit: 'Sessions / Week',
      frequency: 'weekly',
      status: 'active'
    },
    {
      id: 'g_clean_3',
      title: 'Digital Discipline Days',
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
      name: name || 'New User',
      email: email || '',
      avatarUrl: '',
      challengeGoal: 'Transform my life across 90 days with balance, discipline, and focus',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      soundEnabled: true,
      theme: 'dark'
    },
    challenge: {
      id: `ch_90_${Date.now()}`,
      name: 'PROJECT 90: Master Life Sprint',
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      totalDurationDays: 90,
      currentDay: 1,
      status: 'planning' // 'planning' -> Setup & Onboarding phase before officially starting Day 1!
    },
    categories,
    habits,
    routines,
    dayScores: {},
    habitLogsHistory: {
      [todayStr]: {}
    },
    journalEntries: {},
    timeEntries: [],
    weeklyPlans: [],
    recurringWeeklySchedule: [
      {
        id: `rwe_clean_gym_${Date.now()}`,
        title: 'Gym & Strength Training',
        categoryId: 'health',
        days: ['tue', 'thu', 'sat'],
        timeSlot: '06:00 PM - 07:30 PM',
        durationMinutes: 90,
        points: 20,
        description: 'Physical workout & strength conditioning'
      },
      {
        id: `rwe_clean_review_${Date.now()}`,
        title: 'Weekly Review & Strategic Planning',
        categoryId: 'personal',
        days: ['sun'],
        timeSlot: '07:00 PM - 08:00 PM',
        durationMinutes: 60,
        points: 15,
        description: 'Evaluate weekly performance, life balance, and plan next sprint'
      }
    ],
    onboardingStep: 'welcome',
    goals,
    achievements,
    activeTimer: {
      isRunning: false,
      activityName: '',
      categoryId: 'career',
      projectId: '',
      description: '',
      startTime: null,
      elapsedSeconds: 0
    }
  };
};

export const getInitialData = (type = 'demo') => {
  if (type === 'clean') {
    return getCleanUserData();
  }
  return getDemoData();
};

