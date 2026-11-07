'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Flame, 
  Plus, 
  LogOut, 
  Search,
  Clock,
  SunMedium
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getScoreLevel, calculateRoutineProgressToday, calculateCurrentStreak } from '@/utils/calculations';
import { getPrayerTimes } from '@/utils/prayerTimes';

interface TopbarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: any;
  onOpenNotifications?: () => void;
  onOpenManual?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenPillarModal?: () => void;
  onOpenRoutineModal?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  isMobileOpen, 
  setIsMobileOpen,
  onOpenManual,
  onOpenCommandPalette,
  onOpenPillarModal,
  onOpenRoutineModal
}) => {
  const { 
    data, 
    toggleTheme, 
    toggleSound, 
    setActiveModal, 
    handleSignOut,
    todayStr
  } = useApp();

  const [prayerInfo, setPrayerInfo] = useState(() => getPrayerTimes());

  useEffect(() => {
    const timer = setInterval(() => {
      setPrayerInfo(getPrayerTimes());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onOpenCommandPalette) onOpenCommandPalette();
      } else if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette, toggleTheme]);

  const currentTheme = data.profile?.theme || 'dark';
  const soundEnabled = data.profile?.soundEnabled !== false;

  const routines = data.routines || [];
  const routineLogs = data.routineLogsHistory?.[todayStr] || {};
  const progress = calculateRoutineProgressToday(routines, routineLogs, todayStr);
  const currentStreak = calculateCurrentStreak(data.dayScores || {}, todayStr);
  const todayScore = data.dayScores?.[todayStr] || progress.percentage;
  const scoreMeta = getScoreLevel(todayScore);
  const currentDay = data.challenge?.currentDay || 1;

  return (
    <header className="topbar">
      {/* Left: Mobile Menu Button & Day Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          id="mobile-menu-btn"
          className="btn btn-ghost btn-icon"
          onClick={() => setIsMobileOpen && setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle navigation"
          style={{ display: 'none' }}
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
            DAY {currentDay}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>
            <Flame size={15} fill="#f59e0b" color="#f59e0b" />
            <span>{currentStreak}d</span>
          </div>
        </div>

        {/* Daily Routine Completion Pill */}
        <div 
          className="hide-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}
        >
          <span>{scoreMeta.icon}</span>
          <span style={{ color: scoreMeta.color }}>
            {progress.completedCount}/{progress.scheduledCount} Routines ({progress.percentage}%)
          </span>
        </div>
      </div>

      {/* Middle: Live Prayer Times Countdown */}
      {prayerInfo && (
        <div 
          className="hide-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.74rem',
            color: '#10b981'
          }}
        >
          <Clock size={13} />
          <span>Next: <strong>{prayerInfo.nextPrayer?.name}</strong> in {prayerInfo.countdownFormatted}</span>
        </div>
      )}

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Quick Add Routine Button */}
        <button
          className="btn btn-primary"
          onClick={() => {
            if (onOpenRoutineModal) onOpenRoutineModal();
            else setActiveModal('routine_modal');
          }}
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.78rem',
            gap: '0.35rem',
            fontWeight: 700
          }}
        >
          <Plus size={15} />
          <span className="hide-mobile">Add Routine</span>
        </button>

        {/* Command Palette Trigger */}
        <button
          className="btn btn-ghost btn-icon hide-mobile"
          onClick={onOpenCommandPalette}
          title="Search & Commands (Ctrl+K)"
          style={{ padding: '0.4rem' }}
        >
          <Search size={17} />
        </button>

        {/* Sound Toggle */}
        <button
          className="btn btn-ghost btn-icon hide-mobile"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          style={{ padding: '0.4rem' }}
        >
          {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} color="var(--text-muted)" />}
        </button>

        {/* Dark/Light Theme Toggle */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          title="Toggle Theme"
          style={{ padding: '0.4rem' }}
        >
          {currentTheme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} />}
        </button>

        {/* Sign Out Button */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={handleSignOut}
          title="Sign Out"
          style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
};
