const { MongoClient } = require('mongodb');

const categories = [
  { id: 'spiritual', name: 'Spiritual & Core Values', icon: '🕌', color: '#10b981', description: 'Prayers, Quran, reflection and spiritual connection', order: 1 },
  { id: 'fitness', name: 'Fitness & Physical Health', icon: '💪', color: '#f59e0b', description: 'Gym training, walks, active recovery, cold showers', order: 2 },
  { id: 'career', name: 'Career & RHIZAN', icon: '💼', color: '#6366f1', description: 'RHIZAN ERP engineering, client deliverables, system architecture', order: 3 },
  { id: 'learning', name: 'Learning & Technical Mastery', icon: '🧠', color: '#06b6d4', description: 'System design, engineering books, framework mastery', order: 4 },
  { id: 'english', name: 'English Fluency & Speaking', icon: '🗣️', color: '#3b82f6', description: 'Active speaking, voice recordings, vocabulary drills', order: 5 },
  { id: 'personal', name: 'Personal & Mindset', icon: '👤', color: '#a855f7', description: 'Reading, typing speed, family time, night reflection', order: 6 },
  { id: 'sleep', name: 'Sleep & Biological Recovery', icon: '🌙', color: '#8b5cf6', description: '7 hours quality sleep protocol', order: 7 }
];

const routines = [
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
    active: true
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
    active: true
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
    active: true
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

const todayStr = '2026-11-13';

const tasks = [
  {
    id: 't_init_1',
    title: 'RHIZAN ERP Multi-tenant Security Audit',
    description: 'Verify role-based access control and tenant isolation on API endpoints',
    categoryId: 'career',
    priority: 'high',
    plannedDate: todayStr,
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
    plannedDate: todayStr,
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
    plannedDate: todayStr,
    startTime: '14:00',
    deadline: '15:15',
    status: 'not_started',
    notes: 'Take concise bullet notes',
    createdAt: new Date().toISOString()
  }
];

const seedPayload = {
  profile: {
    name: 'Abdulaziz',
    email: 'abdulazizisa579@gmail.com',
    password: 'password',
    challengeGoal: 'Master daily discipline, RHIZAN engineering, and healthy life balance',
    timezone: 'Africa/Addis_Ababa',
    soundEnabled: true,
    theme: 'dark'
  },
  challenge: {
    id: 'ch_apex_init',
    name: 'Apex OS: Personal Management System',
    startDate: todayStr,
    endDate: '2026-12-01',
    totalDurationDays: 19,
    currentDay: 1,
    status: 'active'
  },
  categories,
  routines,
  tasks,
  routineLogsHistory: {
    [todayStr]: {}
  },
  timeEntriesHistory: {
    [todayStr]: []
  },
  journalEntries: {},
  dayScores: {},
  achievements: [
    { id: 'ach_1', title: 'Day 1 Launch', description: 'Began the sprint', icon: '🚀', unlocked: true },
    { id: 'ach_2', title: '7-Day Streak', description: '7 consecutive days', icon: '🔥', unlocked: false }
  ],
  onboardingStep: 'completed',
  showGettingStartedGuide: false
};

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/project90';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('project90');
    const collection = db.collection('user_data');

    await collection.updateOne(
      { userId: 'abdulazizisa579@gmail.com' },
      { $set: { userId: 'abdulazizisa579@gmail.com', ...seedPayload, updatedAt: new Date() } },
      { upsert: true }
    );

    await collection.updateOne(
      { userId: 'guest_user' },
      { $set: { userId: 'guest_user', ...seedPayload, updatedAt: new Date() } },
      { upsert: true }
    );

    console.log('✅ Successfully seeded MongoDB with clean routines (no templates) and tasks!');
    const count = await collection.countDocuments();
    console.log('User documents count in MongoDB:', count);
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await client.close();
  }
}

seed();
