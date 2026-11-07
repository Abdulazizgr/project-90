'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Smile, 
  Save, 
  Calendar, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Flame, 
  History,
  SlidersHorizontal,
  Wand2,
  HelpCircle,
  Clock,
  ChevronRight,
  Check,
  AlertCircle,
  FolderKanban,
  Zap,
  ListTodo,
  ChevronDown,
  ChevronUp,
  MapPin,
  Timer
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { 
  getScoreLevel, 
  calculateCategoryDayScore, 
  getSuggestedCategoryScores,
  getCategoryMeta,
  getDayKeyFromDateStr,
  isRoutineScheduledForDay,
  formatDurationHuman
} from '@/utils/calculations';

export const DailyReflectionView = () => {
  const { 
    data, 
    todayStr, 
    saveJournalEntry, 
    saveCategoryDayScores,
    triggerSound 
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [activeRightTab, setActiveRightTab] = useState<'dossier' | 'archive'>('dossier');
  const [expandedPillarDetails, setExpandedPillarDetails] = useState<Record<string, boolean>>({
    spiritual: true,
    career: true,
    digital: false,
    personal: false,
    health: false
  });

  const existingJournal = data.journalEntries?.[selectedDate] || {};
  const existingCategoryScores = data.categoryScores?.[selectedDate] || {};

  // Qualitative reflection fields
  const [mood, setMood] = useState(existingJournal.mood || 'great');
  const [q1, setQ1] = useState(existingJournal.q1 || '');
  const [q2, setQ2] = useState(existingJournal.q2 || '');
  const [q3, setQ3] = useState(existingJournal.q3 || '');
  const [q4, setQ4] = useState(existingJournal.q4 || '');

  // Dynamic Focus Pillar Scores (0 - 100)
  const [catScores, setCatScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    (data.categories || []).forEach((c: any) => {
      initial[c.id] = existingCategoryScores[c.id] !== undefined ? existingCategoryScores[c.id] : 85;
    });
    return initial;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const journal = data.journalEntries?.[selectedDate] || {};
    const catScoreObj = data.categoryScores?.[selectedDate] || {};

    setMood(journal.mood || 'great');
    setQ1(journal.q1 || '');
    setQ2(journal.q2 || '');
    setQ3(journal.q3 || '');
    setQ4(journal.q4 || '');

    const nextScores: Record<string, number> = {};
    (data.categories || []).forEach((c: any) => {
      nextScores[c.id] = catScoreObj[c.id] !== undefined ? catScoreObj[c.id] : 80;
    });
    setCatScores(nextScores);
  }, [selectedDate, data.journalEntries, data.categoryScores, data.categories]);

  // Compute live day average
  const computedAverage = calculateCategoryDayScore(catScores);
  const scoreLevel = getScoreLevel(computedAverage);

  const moods = [
    { id: 'great', label: 'Great', emoji: '😊', color: '#10b981' },
    { id: 'good', label: 'Good', emoji: '🙂', color: '#3b82f6' },
    { id: 'normal', label: 'Normal', emoji: '😐', color: '#eab308' },
    { id: 'bad', label: 'Tough', emoji: '😞', color: '#ef4444' }
  ];

  const categoryPillars = (data.categories || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon || '🎯',
    color: cat.color || '#6366f1',
    desc: cat.description || 'Focus pillar routine and discipline tracking'
  }));

  const selectedDayKey = getDayKeyFromDateStr(selectedDate);
  const dayRoutineLogs = data.routineLogsHistory?.[selectedDate] || {};
  const dayWeeklyEventLogs = data.weeklyEventLogsHistory?.[selectedDate] || {};
  const dayTimeEntries = (data.timeEntries || []).filter((e: any) => e.date === selectedDate);

  // Extract all scheduled routines for selected date
  const scheduledRoutines = useMemo(() => {
    return (data.routines || []).filter((r: any) => isRoutineScheduledForDay(r, selectedDayKey));
  }, [data.routines, selectedDayKey]);

  // Extract all tasks for selected date (either scheduled, marked isToday, or completed on this date)
  const scheduledTasks = useMemo(() => {
    const list: any[] = [];
    (data.categories || []).forEach((cat: any) => {
      (cat.projects || []).forEach((proj: any) => {
        (proj.tasks || []).forEach((task: any) => {
          if (
            task.scheduledDate === selectedDate || 
            (selectedDate === todayStr && task.isToday) || 
            task.completedDate === selectedDate
          ) {
            list.push({
              ...task,
              categoryId: cat.id,
              categoryName: cat.name,
              categoryColor: cat.color,
              categoryIcon: cat.icon,
              projectId: proj.id,
              projectName: proj.name,
              isDone: task.status === 'done' || task.completed
            });
          }
        });
      });
    });
    return list;
  }, [data.categories, selectedDate, todayStr]);

  // Recurring events for selected date
  const scheduledRecurringEvents = useMemo(() => {
    return (data.recurringWeeklySchedule || []).filter((e: any) => 
      e.days && Array.isArray(e.days) && e.days.includes(selectedDayKey)
    );
  }, [data.recurringWeeklySchedule, selectedDayKey]);

  // Map activities per pillar for comprehensive scoring context
  const activitiesByPillar = useMemo(() => {
    const map: Record<string, { routines: any[]; tasks: any[]; timeEntries: any[]; recurring: any[]; totalFocusMin: number }> = {
      spiritual: { routines: [], tasks: [], timeEntries: [], recurring: [], totalFocusMin: 0 },
      digital: { routines: [], tasks: [], timeEntries: [], recurring: [], totalFocusMin: 0 },
      personal: { routines: [], tasks: [], timeEntries: [], recurring: [], totalFocusMin: 0 },
      health: { routines: [], tasks: [], timeEntries: [], recurring: [], totalFocusMin: 0 },
      career: { routines: [], tasks: [], timeEntries: [], recurring: [], totalFocusMin: 0 }
    };

    // Routines
    scheduledRoutines.forEach((r: any) => {
      const catKey = r.categoryId || (r.type === 'prayer' ? 'spiritual' : 'personal');
      const log = dayRoutineLogs[r.id] || {};
      const status = log.status || (log.completed ? 'done' : 'pending');
      const item = { ...r, status, log, isDone: status === 'done' };

      if (map[catKey]) {
        map[catKey].routines.push(item);
      } else {
        map.personal.routines.push(item);
      }
    });

    // Project Tasks
    scheduledTasks.forEach((t: any) => {
      const catKey = t.categoryId || 'career';
      if (map[catKey]) {
        map[catKey].tasks.push(t);
      } else {
        map.career.tasks.push(t);
      }
    });

    // Recurring Events
    scheduledRecurringEvents.forEach((ev: any) => {
      const catKey = ev.categoryId || 'health';
      const log = dayWeeklyEventLogs[ev.id] || {};
      const status = log.status || (log.completed ? 'done' : 'todo');
      const item = { ...ev, status, log, isDone: status === 'done' };

      if (map[catKey]) {
        map[catKey].recurring.push(item);
      } else {
        map.health.recurring.push(item);
      }
    });

    // Time entries
    dayTimeEntries.forEach((entry: any) => {
      const catKey = entry.categoryId || 'career';
      if (map[catKey]) {
        map[catKey].timeEntries.push(entry);
        map[catKey].totalFocusMin += (entry.durationMinutes || 0);
      } else {
        map.career.timeEntries.push(entry);
        map.career.totalFocusMin += (entry.durationMinutes || 0);
      }
    });

    return map;
  }, [scheduledRoutines, scheduledTasks, scheduledRecurringEvents, dayTimeEntries, dayRoutineLogs, dayWeeklyEventLogs]);

  const handleScoreChange = (catKey: string, value: number) => {
    setCatScores((prev) => ({
      ...prev,
      [catKey]: Math.max(0, Math.min(100, value))
    }));
  };

  const handleAutoSuggest = () => {
    const suggested = getSuggestedCategoryScores(
      data.routines || [],
      data.routineLogsHistory?.[selectedDate] || {},
      data.timeEntries || [],
      selectedDate
    );
    setCatScores(suggested);
    triggerSound('pop');
  };

  const togglePillarExpand = (pillarId: string) => {
    setExpandedPillarDetails((prev) => ({
      ...prev,
      [pillarId]: !prev[pillarId]
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Save Category Day Scores
    saveCategoryDayScores(selectedDate, catScores, q1.trim());

    // 2. Save Qualitative Reflection
    saveJournalEntry(selectedDate, {
      mood,
      q1: q1.trim(),
      q2: q2.trim(),
      q3: q3.trim(),
      q4: q4.trim(),
      categoryScores: catScores,
      overallScore: computedAverage
    });

    setSavedSuccess(true);
    triggerSound('save');
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  // Past reflections list
  const pastEntries = Object.entries((data.journalEntries || {}) as Record<string, any>).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );

  return (
    <div className="page-container">
      {/* Header Deck */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.9), rgba(15, 23, 42, 0.9))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>📝</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Daily Reflection & Category Evaluation
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '620px' }}>
              Inspect your completed routines, project tasks, and deep work focus time to score each of the 5 life pillars.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ maxWidth: '160px', fontSize: '0.85rem' }}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedDate(todayStr)}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start', gap: '1.5rem' }}>
        {/* Main Evaluation & Reflection Form (LEFT COLUMN) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <form onSubmit={handleSave}>
            {/* ========================================================================= */}
            {/* 1. 5-CATEGORY EVENING SELF-EVALUATION DECK */}
            {/* ========================================================================= */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <SlidersHorizontal size={18} color="var(--primary-light)" />
                    <span>5 Pillars Self-Scoring (0–100)</span>
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Grade your execution based on completed actions below. Day score is the 5-pillar average.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAutoSuggest}
                  style={{ gap: '0.35rem', fontSize: '0.75rem' }}
                >
                  <Wand2 size={13} color="var(--primary-light)" />
                  <span>Auto-Suggest Baseline</span>
                </button>
              </div>

              {/* Live Overall Average Score Display Box */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Overall Day Score (5-Pillar Average)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: 900, color: scoreLevel.color, lineHeight: 1 }}>
                      {computedAverage}%
                    </span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      ({scoreLevel.label})
                    </span>
                  </div>
                </div>

                <div className={`badge ${scoreLevel.badgeClass}`} style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem' }}>
                  <span>{scoreLevel.icon}</span>
                  <span>{scoreLevel.label}</span>
                </div>
              </div>

              {/* 5 Pillars Sliders with Inline Action Dossier */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {categoryPillars.map((cat) => {
                  const currentScore = catScores[cat.id as keyof typeof catScores] ?? 80;
                  const pillarActivity = activitiesByPillar[cat.id] || { routines: [], tasks: [], timeEntries: [], recurring: [], totalFocusMin: 0 };
                  const isExpanded = expandedPillarDetails[cat.id];

                  const totalActions = pillarActivity.routines.length + pillarActivity.tasks.length + pillarActivity.recurring.length;
                  const doneActions = 
                    pillarActivity.routines.filter(r => r.isDone).length + 
                    pillarActivity.tasks.filter(t => t.isDone).length + 
                    pillarActivity.recurring.filter(e => e.isDone).length;

                  return (
                    <div
                      key={cat.id}
                      style={{
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        border: '1px solid var(--border-color-subtle)',
                        transition: 'border-color 0.15s ease'
                      }}
                    >
                      {/* Top row: Icon, Name & Number Input */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.3rem' }}>{cat.icon}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: cat.color }}>
                                {cat.name}
                              </span>
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '0.1rem 0.45rem',
                                borderRadius: 'var(--radius-full)',
                                background: doneActions > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: doneActions > 0 ? '#10b981' : 'var(--text-muted)',
                                fontWeight: 700
                              }}>
                                {doneActions}/{totalActions} Done
                                {pillarActivity.totalFocusMin > 0 && ` • ${formatDurationHuman(pillarActivity.totalFocusMin)} focus`}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                              {cat.desc}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="form-input"
                            value={currentScore}
                            onChange={(e) => handleScoreChange(cat.id, Number(e.target.value))}
                            style={{ width: '60px', textAlign: 'center', fontWeight: 800, fontSize: '0.9rem', padding: '0.25rem 0.4rem' }}
                          />
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>%</span>
                        </div>
                      </div>

                      {/* Range Slider */}
                      <div style={{ marginBottom: '0.6rem' }}>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={currentScore}
                          onChange={(e) => handleScoreChange(cat.id, Number(e.target.value))}
                          style={{
                            width: '100%',
                            accentColor: cat.color,
                            cursor: 'pointer'
                          }}
                        />
                      </div>

                      {/* Inline Activity Context Accordion */}
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.6rem 0.75rem',
                        border: '1px solid rgba(255, 255, 255, 0.04)'
                      }}>
                        <div 
                          onClick={() => togglePillarExpand(cat.id)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>📋 Today's Logged Actions ({totalActions})</span>
                            {pillarActivity.totalFocusMin > 0 && (
                              <span style={{ color: 'var(--primary-light)' }}>
                                • {formatDurationHuman(pillarActivity.totalFocusMin)} Focus
                              </span>
                            )}
                          </div>
                          <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '0.1rem' }}>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>

                        {isExpanded && (
                          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {/* Routines in this pillar */}
                            {pillarActivity.routines.map((r) => (
                              <div 
                                key={r.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  fontSize: '0.76rem',
                                  padding: '0.35rem 0.5rem',
                                  borderRadius: 'var(--radius-sm)',
                                  background: r.isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                  border: r.isDone ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-color)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <span>{r.icon}</span>
                                  <span style={{ fontWeight: r.isDone ? 600 : 400, textDecoration: r.isDone ? 'none' : 'none' }}>
                                    {r.title || r.name}
                                  </span>
                                  {r.log?.location === 'mosque' && (
                                    <span style={{ color: '#10b981', fontWeight: 700 }}>🕌 Mosque</span>
                                  )}
                                  {r.log?.location === 'home' && (
                                    <span style={{ color: 'var(--text-muted)' }}>🏠 Home</span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  {r.status === 'done' && <span style={{ color: '#10b981', fontWeight: 700 }}>✅ Done</span>}
                                  {r.status === 'late' && (
                                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                                      ⏱️ Late {r.log?.reason ? `(${r.log.reason})` : ''}
                                    </span>
                                  )}
                                  {r.status === 'missed' && (
                                    <span style={{ color: '#ef4444', fontWeight: 700 }}>
                                      ❌ Missed {r.log?.reason ? `(${r.log.reason})` : ''}
                                    </span>
                                  )}
                                  {r.status === 'pending' && <span style={{ color: 'var(--text-muted)' }}>⚪ Pending</span>}
                                </div>
                              </div>
                            ))}

                            {/* Project tasks in this pillar */}
                            {pillarActivity.tasks.map((t) => (
                              <div
                                key={t.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  fontSize: '0.76rem',
                                  padding: '0.35rem 0.5rem',
                                  borderRadius: 'var(--radius-sm)',
                                  background: t.isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                  border: t.isDone ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-color)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                                  <span>🎯</span>
                                  <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {t.projectName}: {t.title}
                                  </span>
                                </div>

                                <span style={{ color: t.isDone ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                                  {t.isDone ? '🟢 Done' : t.status === 'in_progress' ? '🟡 In Progress' : '⚪ To Do'}
                                </span>
                              </div>
                            ))}

                            {/* Focus time entries in this pillar */}
                            {pillarActivity.timeEntries.map((e, idx) => (
                              <div
                                key={e.id || idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  fontSize: '0.74rem',
                                  padding: '0.3rem 0.5rem',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'rgba(99, 102, 241, 0.08)',
                                  border: '1px solid rgba(99, 102, 241, 0.2)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <Timer size={12} color="var(--primary-light)" />
                                  <span>{e.activityName || 'Focus Session'}</span>
                                </div>
                                <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                                  {formatDurationHuman(e.durationMinutes || 0)}
                                </span>
                              </div>
                            ))}

                            {totalActions === 0 && pillarActivity.timeEntries.length === 0 && (
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontStyle: 'italic', padding: '0.2rem' }}>
                                No specific routines or tasks logged for this pillar today. Score based on your subjective discipline!
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. EVENING 4-QUESTION PROTOCOL */}
            {/* ========================================================================= */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h4 className="card-title">
                    <span>✨</span>
                    <span>Evening 4-Question Protocol</span>
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Diagnose wins, setbacks, and tomorrow's adjustments
                  </p>
                </div>
                {savedSuccess && (
                  <span className="badge badge-excellent" style={{ animation: 'fadeIn 0.2s ease' }}>
                    <CheckCircle2 size={12} />
                    <span>Evaluation & Reflection Saved!</span>
                  </span>
                )}
              </div>

              {/* Mood Selector */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">How was your overall discipline & mood today?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                  {moods.map((m) => {
                    const isSelected = mood === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        className="btn"
                        onClick={() => setMood(m.id)}
                        style={{
                          background: isSelected ? `${m.color}25` : 'var(--bg-surface)',
                          border: isSelected ? `2px solid ${m.color}` : '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem',
                          padding: '0.65rem 0.5rem',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <span style={{ fontSize: '1.4rem' }}>{m.emoji}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : 500 }}>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 1 */}
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--cat-spiritual)', fontWeight: 700 }}>
                  1. What did I do well today? (Wins & Discipline) *
                </label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  required
                  placeholder="e.g. Completed 10 hours of focused client engineering, prayed Fajr in mosque, stayed hydrated."
                  value={q1}
                  onChange={(e) => setQ1(e.target.value)}
                />
              </div>

              {/* Question 2 */}
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--cat-career)', fontWeight: 700 }}>
                  2. What did I fail to do or delay? (Missed Targets) *
                </label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  required
                  placeholder="e.g. Delayed reading session by 30 mins due to late coding block."
                  value={q2}
                  onChange={(e) => setQ2(e.target.value)}
                />
              </div>

              {/* Question 3 */}
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--cat-health)', fontWeight: 700 }}>
                  3. What distracted me? (Root Causes) *
                </label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  required
                  placeholder="e.g. Overthinking feature scope, checking messages after dinner."
                  value={q3}
                  onChange={(e) => setQ3(e.target.value)}
                />
              </div>

              {/* Question 4 */}
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--cat-digital)', fontWeight: 700 }}>
                  4. What will I improve tomorrow? (Action Protocol) *
                </label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  required
                  placeholder="e.g. Put phone in airplane mode at 10:00 PM, place water bottle on desk at 5:00 AM."
                  value={q4}
                  onChange={(e) => setQ4(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', gap: '0.5rem', fontWeight: 800 }}
                >
                  <Save size={18} />
                  <span>Save Category Scores & Reflection ({computedAverage}%)</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: TABS (DAY ACTIVITY DOSSIER & PAST REVIEWS) */}
        <div className="card" style={{ padding: '1.25rem' }}>
          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${activeRightTab === 'dossier' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveRightTab('dossier')}
              style={{ flex: 1, gap: '0.35rem', fontSize: '0.8rem' }}
            >
              <ListTodo size={14} />
              <span>Day Activity Dossier</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeRightTab === 'archive' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveRightTab('archive')}
              style={{ flex: 1, gap: '0.35rem', fontSize: '0.8rem' }}
            >
              <History size={14} />
              <span>Past Reviews ({pastEntries.length})</span>
            </button>
          </div>

          {/* TAB 1: DAY ACTIVITY DOSSIER */}
          {activeRightTab === 'dossier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>📊</span>
                  <span>Execution Summary for {selectedDate}</span>
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Review what you accomplished today to guide your scoring
                </p>
              </div>

              {/* 3 Quick Metrics Pill */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '0.65rem 0.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>ROUTINES</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981', marginTop: '0.1rem' }}>
                    {scheduledRoutines.filter(r => dayRoutineLogs[r.id]?.status === 'done' || dayRoutineLogs[r.id]?.completed).length}/{scheduledRoutines.length}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '0.65rem 0.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>TASKS</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '0.1rem' }}>
                    {scheduledTasks.filter(t => t.isDone).length}/{scheduledTasks.length}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '0.65rem 0.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>DEEP WORK</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                    {formatDurationHuman(dayTimeEntries.reduce((acc: number, curr: any) => acc + (curr.durationMinutes || 0), 0))}
                  </div>
                </div>
              </div>

              {/* Section 1: Daily Routines & Prayers */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>🌅</span>
                  <span>Scheduled Routines ({scheduledRoutines.length})</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {scheduledRoutines.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic', padding: '0.5rem' }}>
                      No routines scheduled for this day.
                    </div>
                  ) : (
                    scheduledRoutines.map((routine: any) => {
                      const log = dayRoutineLogs[routine.id] || {};
                      const isDone = log.status === 'done' || log.completed;
                      const isLate = log.status === 'late';
                      const isMissed = log.status === 'missed';

                      return (
                        <div
                          key={routine.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.55rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: isDone 
                              ? 'rgba(16, 185, 129, 0.06)' 
                              : isLate
                              ? 'rgba(245, 158, 11, 0.06)'
                              : isMissed
                              ? 'rgba(239, 68, 68, 0.06)'
                              : 'var(--bg-surface)',
                            border: isDone 
                              ? '1px solid rgba(16, 185, 129, 0.3)' 
                              : isLate
                              ? '1px solid rgba(245, 158, 11, 0.3)'
                              : isMissed
                              ? '1px solid rgba(239, 68, 68, 0.3)'
                              : '1px solid var(--border-color)',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                            <span>{routine.icon || '☀️'}</span>
                            <span style={{ fontWeight: isDone ? 600 : 500 }}>{routine.name || routine.title}</span>
                            {log.location === 'mosque' && (
                              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.7rem' }}>🕌 Mosque</span>
                            )}
                            {log.location === 'home' && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>🏠 Home</span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem' }}>
                            {isDone && <span style={{ color: '#10b981', fontWeight: 700 }}>✅ Done</span>}
                            {isLate && (
                              <span style={{ color: '#f59e0b', fontWeight: 700 }} title={log.reason}>
                                ⏱️ Late {log.reason ? `(${log.reason})` : ''}
                              </span>
                            )}
                            {isMissed && (
                              <span style={{ color: '#ef4444', fontWeight: 700 }} title={log.reason}>
                                ❌ Missed {log.reason ? `(${log.reason})` : ''}
                              </span>
                            )}
                            {!isDone && !isLate && !isMissed && (
                              <span style={{ color: 'var(--text-muted)' }}>⚪ Pending</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Section 2: Project Tasks */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>🎯</span>
                  <span>Project Tasks ({scheduledTasks.length})</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {scheduledTasks.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic', padding: '0.5rem' }}>
                      No project tasks in today's queue.
                    </div>
                  ) : (
                    scheduledTasks.map((task: any) => (
                      <div
                        key={task.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          background: task.isDone ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-surface)',
                          border: task.isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {task.title}
                          </div>
                          <span style={{ fontSize: '0.68rem', color: task.categoryColor || 'var(--primary-light)' }}>
                            📁 {task.projectName}
                          </span>
                        </div>

                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: task.isDone ? '#10b981' : task.status === 'in_progress' ? '#f59e0b' : 'var(--text-muted)'
                        }}>
                          {task.isDone ? '🟢 Done' : task.status === 'in_progress' ? '🟡 In Progress' : '⚪ To Do'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Section 3: Deep Work Focus Time Entries */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>⏱️</span>
                  <span>Tracked Focus Time Blocks ({dayTimeEntries.length})</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {dayTimeEntries.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic', padding: '0.5rem' }}>
                      No focus sessions tracked in Time Tracker today.
                    </div>
                  ) : (
                    dayTimeEntries.map((entry: any) => (
                      <div
                        key={entry.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(99, 102, 241, 0.06)',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{entry.activityName || 'Deep Work'}</div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {entry.startTime || ''} – {entry.endTime || ''} {entry.description ? `• ${entry.description}` : ''}
                          </span>
                        </div>

                        <span style={{ fontWeight: 800, color: 'var(--primary-light)' }}>
                          {formatDurationHuman(entry.durationMinutes || 0)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAST REFLECTIONS ARCHIVE */}
          {activeRightTab === 'archive' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', maxHeight: '750px', overflowY: 'auto' }}>
              {pastEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No past reflections found yet. Complete your first evaluation on the left!
                </div>
              ) : (
                pastEntries.map(([date, entry]) => {
                  const moodObj = moods.find((m) => m.id === entry.mood) || moods[0];
                  const dayScore = entry.overallScore !== undefined ? entry.overallScore : (data.dayScores?.[date] || 0);
                  const dayScoreMeta = getScoreLevel(dayScore);

                  return (
                    <div
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      style={{
                        background: selectedDate === date ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-surface)',
                        border: selectedDate === date ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem' }}>
                          <Calendar size={14} color="var(--primary-light)" />
                          <span>{date}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <span className={`badge ${dayScoreMeta.badgeClass}`} style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                            {dayScore}%
                          </span>
                          <span className="badge" style={{ background: `${moodObj.color}20`, color: moodObj.color, fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                            {moodObj.emoji}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {entry.q1 && (
                          <div>
                            <strong style={{ color: 'var(--cat-spiritual)' }}>Wins:</strong>{' '}
                            <span style={{ color: 'var(--text-secondary)' }}>{entry.q1}</span>
                          </div>
                        )}
                        {entry.q4 && (
                          <div>
                            <strong style={{ color: 'var(--cat-digital)' }}>Adjust:</strong>{' '}
                            <span style={{ color: 'var(--text-secondary)' }}>{entry.q4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
