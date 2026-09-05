import React from 'react';
import { 
  Scale, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Heart, 
  Activity, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDurationHuman } from '@/utils/calculations';

export const LifeBalanceWidget = () => {
  const { data, todayStr, setActiveTab, startTimer, setHabitStatus } = useApp();

  const categories = data.categories || [];
  const habits = data.habits || [];
  const todayLogs = data.habitLogsHistory?.[todayStr] || {};
  const timeEntries = (data.timeEntries || []).filter((e) => e.date === todayStr);

  const totalMinutes = timeEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  // Compute distribution
  const categoryStats = categories.map((cat) => {
    const catEntries = timeEntries.filter((e) => e.categoryId === cat.id);
    const catMin = catEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const catHabits = habits.filter((h) => h.categoryId === cat.id && h.active !== false);
    const completedHabits = catHabits.filter((h) => todayLogs[h.id] === 'completed').length;
    const habitScore = catHabits.length > 0 ? (completedHabits / catHabits.length) : 1;

    const timeShare = totalMinutes > 0 ? (catMin / totalMinutes) : (1 / Math.max(1, categories.length));

    return {
      ...cat,
      minutes: catMin,
      percentage: totalMinutes > 0 ? Math.round((catMin / totalMinutes) * 100) : Math.round(100 / Math.max(1, categories.length)),
      completedHabits,
      totalHabits: catHabits.length,
      habitScore
    };
  });

  // Check for Hyper-focus / Burnout Risk
  const dominantCategory = categoryStats.find((c) => c.percentage >= 70 && totalMinutes >= 180);
  const neglectedCategory = categoryStats.find((c) => c.minutes === 0 && c.completedHabits === 0);

  const isBurnoutRisk = !!dominantCategory && !!neglectedCategory;

  // Compute overall balance index (0-100)
  const activePillarsCount = categoryStats.filter((c) => c.minutes > 0 || c.completedHabits > 0).length;
  const balanceIndex = Math.min(100, Math.round((activePillarsCount / Math.max(1, categories.length)) * 100));

  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, var(--bg-card), var(--bg-surface))',
      border: isBurnoutRisk ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
      marginBottom: '1.5rem',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: isBurnoutRisk ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isBurnoutRisk ? '#f59e0b' : 'var(--primary-light)'
          }}>
            <Scale size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Life Balance & Anti-Burnout Engine</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Monitoring holistic harmony across your {categories.length} life pillars
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Balance Index:</span>
          <span className="badge" style={{
            background: balanceIndex >= 80 ? 'rgba(16, 185, 129, 0.15)' : balanceIndex >= 50 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(234, 179, 8, 0.15)',
            color: balanceIndex >= 80 ? '#10b981' : balanceIndex >= 50 ? '#3b82f6' : '#eab308',
            fontSize: '0.78rem'
          }}>
            {balanceIndex}% Harmonious ({activePillarsCount}/{categories.length} Active)
          </span>
        </div>
      </div>

      {/* Burnout Warning Banner if detected */}
      {isBurnoutRisk && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.2rem' }}>
              ⚠️ Hyper-Focus Alert: Avoid the 2-Day Burnout Crash!
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              You've spent <strong>{dominantCategory.percentage}%</strong> of your time today on <strong>{dominantCategory.name}</strong>, while <strong>{neglectedCategory.name}</strong> has received 0 minutes. To protect mental stamina, take a short break before diving into another block.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                onClick={() => startTimer({ activityName: `${neglectedCategory.name} Rejuvenation Break`, categoryId: neglectedCategory.id })}
              >
                Start 15m {neglectedCategory.name} Break
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Segmented Distribution Bar */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{
          width: '100%',
          height: '10px',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          display: 'flex',
          background: 'var(--bg-surface)'
        }}>
          {categoryStats.map((cat) => (
            <div
              key={cat.id}
              style={{
                width: `${cat.percentage}%`,
                background: cat.color || 'var(--primary)',
                transition: 'width 0.4s ease'
              }}
              title={`${cat.name}: ${cat.percentage}% (${formatDurationHuman(cat.minutes)})`}
            />
          ))}
        </div>
      </div>

      {/* Category Chips Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {categoryStats.map((cat) => (
          <div
            key={cat.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              fontSize: '0.75rem'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color || 'var(--primary)' }} />
            <span style={{ fontWeight: 600 }}>{cat.icon} {cat.name}:</span>
            <span style={{ color: 'var(--text-muted)' }}>{formatDurationHuman(cat.minutes)} ({cat.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};
