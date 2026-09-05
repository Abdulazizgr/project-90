import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Clock, 
  Calendar, 
  Award, 
  Flame, 
  Sparkles,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDurationHuman, getCategoryMeta } from '../../utils/calculations';

export const AnalyticsView = () => {
  const { data, todayStr } = useApp();
  const [timeframe, setTimeframe] = useState('sprint'); // 'today' | 'week' | 'sprint'

  const categories = data.categories || [];
  const timeEntries = data.timeEntries || [];
  const habits = data.habits || [];
  const dayScores = data.dayScores || {};

  // Compute category times based on timeframe
  const relevantEntries = timeframe === 'today'
    ? timeEntries.filter((e) => e.date === todayStr)
    : timeEntries;

  const totalMinutes = relevantEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  const categoryTimeBreakdown = categories.map((cat) => {
    const catEntries = relevantEntries.filter((e) => e.categoryId === cat.id);
    const catMin = catEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const percentage = totalMinutes > 0 ? Math.round((catMin / totalMinutes) * 100) : 0;
    return {
      ...cat,
      minutes: catMin,
      percentage,
      sessionsCount: catEntries.length
    };
  }).sort((a, b) => b.minutes - a.minutes);

  // Project breakdown
  const projectMap: Record<string, { name: string; category: string; color: string; icon: string; minutes: number; count: number }> = {};
  relevantEntries.forEach((entry: any) => {
    const key = entry.projectId || 'unassigned';
    if (!projectMap[key]) {
      const cat = categories.find((c: any) => c.id === entry.categoryId);
      const proj = (cat as any)?.projects?.find((p: any) => p.id === entry.projectId);
      projectMap[key] = {
        name: proj?.name || entry.activityName || 'General Activity',
        category: cat?.name || 'General',
        color: cat?.color || 'var(--primary)',
        icon: cat?.icon || '📁',
        minutes: 0,
        count: 0
      };
    }
    projectMap[key].minutes += entry.durationMinutes || 0;
    projectMap[key].count += 1;
  });

  const projectBreakdown = Object.values(projectMap).sort((a, b) => b.minutes - a.minutes);

  // Scores progression (Last 12 days)
  const scoreEntries = Object.entries(dayScores).map(([date, score], idx) => ({
    dayNumber: idx + 1,
    date,
    score: Number(score) || 0
  })).slice(-12);

  const bestDay = scoreEntries.reduce((max, curr) => (curr.score > max.score ? curr : max), scoreEntries[0] || { dayNumber: 1, date: '', score: 0 });
  const avgScore = scoreEntries.length > 0 
    ? Math.round(scoreEntries.reduce((acc, curr) => acc + curr.score, 0) / scoreEntries.length)
    : 0;

  return (
    <div className="page-container">
      {/* Top Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.9), rgba(15, 23, 42, 0.9))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>📊</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Productivity & Category Analytics</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '580px' }}>
              Deep dive into your time allocation, project balance, and daily habit consistency trends
            </p>
          </div>

          {/* Timeframe Switcher */}
          <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-card)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button
              className={`btn btn-sm ${timeframe === 'today' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTimeframe('today')}
              style={{ fontSize: '0.78rem' }}
            >
              Today
            </button>
            <button
              className={`btn btn-sm ${timeframe === 'week' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTimeframe('week')}
              style={{ fontSize: '0.78rem' }}
            >
              This Week
            </button>
            <button
              className={`btn btn-sm ${timeframe === 'sprint' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTimeframe('sprint')}
              style={{ fontSize: '0.78rem' }}
            >
              Full 90-Day Sprint
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Tracked Time
            </div>
            <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '0.2rem' }}>
              {formatDurationHuman(totalMinutes)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Average Daily Score
            </div>
            <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--score-excellent)', marginTop: '0.2rem' }}>
              {avgScore} / 100 pts
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Top Performing Day
            </div>
            <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>
              Day {bestDay?.dayNumber} ({bestDay?.score} pts)
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Active Life Categories
            </div>
            <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              5 / 5 Active
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Category Time Breakdown & Score Progression Chart */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* Category Time Analytics */}
        <div className="card">
          <div className="card-header">
            <div>
              <h4 className="card-title">
                <span>⏱️</span>
                <span>Time by Category</span>
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Distribution across 5 core life dimensions
              </p>
            </div>
            <span className="badge" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
              {formatDurationHuman(totalMinutes)}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {categoryTimeBreakdown.map((cat) => (
              <div key={cat.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatDurationHuman(cat.minutes)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '36px', textAlign: 'right' }}>
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                <div className="progress-bar-container" style={{ height: '8px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color || 'var(--primary)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 12-Day Score Progression Chart (CSS/SVG Bar Chart) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h4 className="card-title">
                <span>📈</span>
                <span>12-Day Score Progression</span>
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Consistency chart across Days 1 to 12
              </p>
            </div>
            <span className="badge badge-excellent">
              12-Day Streak 🔥
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '0.4rem',
            height: '190px',
            paddingTop: '1rem',
            paddingBottom: '0.5rem'
          }}>
            {scoreEntries.map((item) => {
              const heightPct = Math.max(10, item.score);
              const isToday = item.dayNumber === 12;
              const barColor = item.score >= 90 ? '#10b981' : item.score >= 70 ? '#3b82f6' : '#eab308';

              return (
                <div
                  key={item.dayNumber}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}
                  title={`Day ${item.dayNumber}: ${item.score} pts`}
                >
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {item.score}
                  </span>

                  <div
                    style={{
                      width: '100%',
                      maxWidth: '32px',
                      height: `${heightPct}%`,
                      background: isToday ? 'linear-gradient(180deg, var(--primary-light), var(--primary))' : barColor,
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease',
                      border: isToday ? '1px solid #fff' : 'none'
                    }}
                  />

                  <span style={{ fontSize: '0.7rem', fontWeight: isToday ? 800 : 500, color: isToday ? 'var(--primary-light)' : 'var(--text-secondary)' }}>
                    D{item.dayNumber}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
            <span>🟢 90+ Excellent</span>
            <span>🔵 70-89 Good</span>
            <span>🟡 50-69 Average</span>
          </div>
        </div>
      </div>

      {/* Project Breakdown Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h4 className="card-title">
              <span>🚀</span>
              <span>Project & Initiative Breakdown</span>
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              High-impact engineering, learning, and personal mastery projects
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {projectBreakdown.map((proj, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.3rem' }}>{proj.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{proj.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {proj.category} • {proj.count} tracked sessions
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="mono" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatDurationHuman(proj.minutes)}
                </span>
                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', fontSize: '0.72rem' }}>
                  {totalMinutes > 0 ? `${Math.round((proj.minutes / totalMinutes) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
