'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Flame, 
  Trophy, 
  Clock, 
  Target, 
  ArrowUpRight, 
  ThumbsUp, 
  TrendingUp,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { generateWeeklyReport, formatDurationHuman } from '@/utils/calculations';

export const WeeklyReportView: React.FC = () => {
  const { data, todayStr } = useApp();

  const categories = data.categories || [];
  const routines = data.routines || [];
  const tasks = data.tasks || [];
  const routineLogsHistory = data.routineLogsHistory || {};
  const timeEntriesHistory = data.timeEntriesHistory || {};
  const dayScores = data.dayScores || {};
  const achievements = data.achievements || [];

  // Helper to find the Monday of a given date
  const getMondayOfDate = (d: Date): string => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const [currentWeekMonday, setCurrentWeekMonday] = useState<string>(() => {
    return getMondayOfDate(new Date(todayStr));
  });

  // Week navigation
  const handlePrevWeek = () => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() - 7);
    setCurrentWeekMonday(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() + 7);
    setCurrentWeekMonday(d.toISOString().split('T')[0]);
  };

  // Generate Weekly Report Data
  const report = generateWeeklyReport(
    currentWeekMonday,
    categories,
    routines,
    tasks,
    routineLogsHistory,
    timeEntriesHistory,
    dayScores,
    achievements
  );

  return (
    <div className="page-container" style={{ paddingBottom: '5rem' }}>
      {/* Top Banner & Week Selector */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.25rem',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <BarChart3 size={22} color="var(--primary-light)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Weekly Aggregated Report</h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Comprehensive Monday through Sunday review backed by actual recorded numbers.
            </p>
          </div>

          {/* Week Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', maxWidth: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1, minWidth: 0 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm btn-icon"
                onClick={handlePrevWeek}
                title="Previous Week"
              >
                <ChevronLeft size={16} />
              </button>
              <div style={{
                background: 'var(--bg-input)',
                padding: '0.35rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                fontSize: '0.78rem',
                flex: 1,
                minWidth: 0,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {report.weekStart} – {report.weekEnd}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm btn-icon"
                onClick={handleNextWeek}
                title="Next Week"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setCurrentWeekMonday(getMondayOfDate(new Date(todayStr)))}
              style={{ fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}
            >
              Current
            </button>
          </div>
        </div>

        {/* Overall Completion Metric */}
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Overall Weekly Completion Rate
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.1rem' }}>
              <span className="mono" style={{ fontSize: '2rem', fontWeight: 900, color: report.overallCompletionPct >= 75 ? '#10b981' : report.overallCompletionPct >= 50 ? '#f59e0b' : '#ef4444' }}>
                {report.overallCompletionPct}%
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {report.overallCompletionPct >= 80 ? '🌟 Outstanding Week' : report.overallCompletionPct >= 60 ? '⚡ Good Progress' : '🔧 Needs Focus'}
              </span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
            gap: '0.75rem',
            width: '100%',
            maxWidth: '100%'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>ROUTINE RATE</span>
              <span className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>{report.routineCompletionRate}%</span>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>TASK RATE</span>
              <span className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#06b6d4' }}>{report.taskCompletionRate}%</span>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>TIME LOGGED</span>
              <span className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatDurationHuman(report.totalTimeTrackedMinutes)}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>STREAK</span>
              <span className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Flame size={15} fill="#f59e0b" /> {report.currentStreak}d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Meaningful Data-Backed Insights Grid */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={18} color="var(--primary-light)" />
          <span>Data-Derived Weekly Insights</span>
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '1rem'
        }}>
          {/* What Went Well */}
          <div className="card" style={{
            padding: '1.1rem',
            background: 'var(--bg-card)',
            borderLeft: '4px solid #10b981'
          }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
              <ThumbsUp size={16} />
              <span>What I Did Well</span>
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {report.insights.whatDidWell.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Where I Improved */}
          <div className="card" style={{
            padding: '1.1rem',
            background: 'var(--bg-card)',
            borderLeft: '4px solid #06b6d4'
          }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
              <TrendingUp size={16} />
              <span>Where I Improved</span>
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {report.insights.whereImproved.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* What Needs Attention */}
          <div className="card" style={{
            padding: '1.1rem',
            background: 'var(--bg-card)',
            borderLeft: '4px solid #ef4444'
          }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
              <AlertTriangle size={16} />
              <span>What Needs Attention</span>
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {report.insights.needsAttention.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Practical Recommendations */}
          <div className="card" style={{
            padding: '1.1rem',
            background: 'var(--bg-card)',
            borderLeft: '4px solid #8b5cf6'
          }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
              <Lightbulb size={16} />
              <span>Next Week's Recommendations</span>
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {report.insights.recommendations.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Category Time Breakdown & Best Days */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
        gap: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        {/* Category Time Distribution */}
        <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={18} color="var(--primary-light)" />
            <span>Weekly Category Time Distribution</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {report.categoryTimeBreakdown.map((cat) => (
              <div key={cat.categoryId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', fontSize: '0.82rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                    <span>{cat.icon}</span>
                    <span>{cat.categoryName}</span>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="mono" style={{ fontWeight: 800, color: cat.color }}>
                      {cat.hoursFormatted}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: '32px', textAlign: 'right' }}>
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                <div style={{
                  height: '6px',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      width: `${cat.percentage}%`,
                      height: '100%',
                      backgroundColor: cat.color,
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Performing Days & Incomplete Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Best Days Card */}
          <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Trophy size={18} color="#f59e0b" />
              <span>Best-Performing Days</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {report.bestDays.map((day, idx) => (
                <div
                  key={day.date}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="mono" style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: idx === 0 ? '#f59e0b' : 'var(--bg-card)',
                      color: idx === 0 ? '#000' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}>
                      #{idx + 1}
                    </span>
                    <div>
                      <strong style={{ fontSize: '0.85rem' }}>{day.dayName}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{day.date}</span>
                    </div>
                  </div>

                  <span className="mono" style={{ fontSize: '0.92rem', fontWeight: 800, color: day.score >= 70 ? '#10b981' : '#f59e0b' }}>
                    {day.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Missed / Incomplete Activities Card */}
          <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={18} color="#ef4444" />
              <span>Incomplete Activities ({report.incompleteActivities.length})</span>
            </h3>

            {report.incompleteActivities.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#10b981', fontStyle: 'italic' }}>
                🎉 Outstanding! Zero missed routines or tasks this week.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '220px', overflowY: 'auto' }}>
                {report.incompleteActivities.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      padding: '0.5rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(239, 68, 68, 0.05)',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, wordBreak: 'normal', overflowWrap: 'break-word' }}>
                      <span style={{ fontWeight: 600 }}>{item.title}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '0.35rem', fontSize: '0.7rem' }}>
                        ({item.type} • {item.category})
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', flexShrink: 0 }} className="mono">
                      {item.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

