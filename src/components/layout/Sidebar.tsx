'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  SunMedium, 
  Clock, 
  CalendarDays, 
  Trophy, 
  BookOpen, 
  Settings, 
  Flame,
  Sparkles,
  Layers,
  LogOut
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getScoreLevel, calculateRoutineProgressToday, calculateCurrentStreak } from '@/utils/calculations';

interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const { data, activeTab, setActiveTab, todayStr, handleSignOut, triggerSound } = useApp();
  const challenge = data.challenge || {};
  const currentDay = challenge.currentDay || 1;
  const totalDays = challenge.totalDurationDays || 90;
  const pctComplete = Math.min(100, Math.round((currentDay / totalDays) * 100));

  const routines = data.routines || [];
  const routineLogs = data.routineLogsHistory?.[todayStr] || {};
  const routineProgress = calculateRoutineProgressToday(routines, routineLogs, todayStr);
  const currentStreak = calculateCurrentStreak(data.dayScores || {}, todayStr);
  const todayScore = data.dayScores?.[todayStr] || (routineProgress.percentage);
  const scoreMeta = getScoreLevel(todayScore);

  const navItems = [
    { id: 'dashboard', label: 'Today Dashboard', icon: LayoutDashboard },
    { id: 'routines', label: 'Pillars & Routines', icon: SunMedium, count: routineProgress.scheduledCount },
    { id: 'timeline', label: 'Daily Timeline', icon: Clock },
    { id: 'calendar', label: '90-Day Calendar', icon: CalendarDays },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'journal', label: 'Evening Reflection', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', padding: '0.25rem 0.5rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px var(--primary-glow)'
        }}>
          <Sparkles size={20} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            PROJECT <span style={{ color: 'var(--primary-light)' }}>90</span>
          </h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Routine & Pillars OS</p>
        </div>
      </div>

      {/* 90-Day Sprint Progress Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem',
        marginBottom: '1.25rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Day {currentDay} of {totalDays}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>
            <Flame size={14} color="#f59e0b" fill="#f59e0b" />
            <span>{currentStreak}d Streak</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--bg-input)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          marginBottom: '0.65rem'
        }}>
          <div style={{
            height: '100%',
            width: `${pctComplete}%`,
            background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease'
          }} />
        </div>

        {/* Today's Routine Snapshot */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.4rem 0.6rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.72rem'
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>Today's Routines:</span>
          <span style={{ fontWeight: 700, color: routineProgress.percentage === 100 ? '#10b981' : 'var(--text-primary)' }}>
            {routineProgress.completedCount} / {routineProgress.scheduledCount} ({routineProgress.percentage}%)
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                triggerSound('click');
                if (setIsMobileOpen) setIsMobileOpen(false);
              }}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--primary-glow)' : 'transparent',
                color: isActive ? 'var(--primary-light)' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--primary-light)' : 'var(--text-muted)'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span style={{
                  fontSize: '0.68rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  background: isActive ? 'var(--primary)' : 'var(--bg-input)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 700
                }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer with Sign Out */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '0.85rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--bg-input)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--primary-light)'
          }}>
            {(data.profile?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {data.profile?.name || 'User'}
            </p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {data.categories?.length || 0} Focus Pillars
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="btn btn-ghost btn-icon"
          style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
