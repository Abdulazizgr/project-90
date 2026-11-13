'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  SunMedium, 
  CheckSquare, 
  CalendarDays, 
  BarChart3, 
  Trophy, 
  Settings, 
  Flame,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { calculateDailyProgress, calculateCurrentStreak } from '@/utils/calculations';

interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const { data, activeTab, setActiveTab, todayStr, handleSignOut, triggerSound } = useApp();
  const challenge = data.challenge || {};
  const currentDay = challenge.currentDay || 1;
  const totalDays = challenge.totalDurationDays || 19;
  const challengeName = challenge.name || 'Project 19: Personal Management Sprint';
  const pctComplete = Math.min(100, Math.round((currentDay / totalDays) * 100));

  const routines = data.routines || [];
  const routineLogs = data.routineLogsHistory?.[todayStr] || {};
  const tasks = data.tasks || [];
  const progress = calculateDailyProgress(routines, routineLogs, tasks, todayStr);
  const currentStreak = calculateCurrentStreak(data.dayScores || {}, todayStr);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my_day', label: 'My Day (24h Time)', icon: Clock },
    { id: 'routines', label: 'Daily Routines', icon: SunMedium, count: progress.scheduledRoutinesCount },
    { id: 'tasks', label: 'Daily Tasks', icon: CheckSquare, count: progress.plannedTasksCount },
    { id: 'calendar', label: 'Monthly Calendar', icon: CalendarDays },
    { id: 'reports', label: 'Weekly Reports', icon: BarChart3 },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
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
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            {challengeName}
          </h1>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>Personal Management OS</p>
        </div>
      </div>

      {/* Challenge Progress Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem',
        marginBottom: '1.25rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Day {currentDay} of {totalDays}
          </span>
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

        {/* Today's Execution Snapshot */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.4rem 0.6rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.72rem'
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>Today's Execution:</span>
          <span style={{ fontWeight: 700, color: progress.percentage >= 80 ? '#10b981' : 'var(--text-primary)' }}>
            {progress.completedItems} / {progress.totalItems} ({progress.percentage}%)
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
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--primary-glow)' : 'transparent',
                color: isActive ? 'var(--primary-light)' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon size={17} color={isActive ? 'var(--primary-light)' : 'var(--text-muted)'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span style={{
                  fontSize: '0.65rem',
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
            {(data.profile?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {data.profile?.name || 'Abdulaziz'}
            </p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              Addis Ababa Time
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          title="Reset to Day 1 Seeds"
          className="btn btn-ghost btn-icon"
          style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </aside>
  );
};
