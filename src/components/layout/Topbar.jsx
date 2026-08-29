import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Play, 
  Flame, 
  Award, 
  Sparkles, 
  Plus, 
  User, 
  LogIn, 
  LogOut, 
  Database,
  Bell,
  BookOpen,
  Search,
  Clock
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getScoreLevel } from '@/utils/calculations';
import { getPrayerTimes } from '@/utils/prayerTimes';

export const Topbar = ({ 
  isMobileOpen, 
  setIsMobileOpen,
  onOpenNotifications,
  onOpenManual,
  onOpenCommandPalette
}) => {
  const { 
    data, 
    user, 
    activeTab, 
    toggleTheme, 
    toggleSound, 
    setActiveModal, 
    setIsAuthModalOpen, 
    handleSignOut,
    startTimer, 
    stopTimer,
    todayStr,
    isDbSynced
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
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onOpenCommandPalette) onOpenCommandPalette();
      } else if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        if (data.activeTimer?.isRunning) {
          stopTimer();
        } else {
          startTimer({ activityName: 'Deep Work Session', categoryId: 'career' });
        }
      } else if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data.activeTimer?.isRunning, onOpenCommandPalette, startTimer, stopTimer, toggleTheme]);

  const currentTheme = data.profile?.theme || 'dark';
  const soundEnabled = data.profile?.soundEnabled !== false;
  const todayScore = data.dayScores?.[todayStr] || 0;
  const scoreMeta = getScoreLevel(todayScore);
  const isTimerRunning = data.activeTimer?.isRunning;

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return { title: 'Life Dashboard', sub: 'Today is Day 12 of your 90-day transformation' };
      case 'projects': return { title: 'Projects & Tasks', sub: 'Manage structured outcomes and task tracking' };
      case 'weekly': return { title: 'Weekly Recurring Schedule', sub: 'Fixed weekly commitments and routine blocks' };
      case 'timer': return { title: 'Time Tracking', sub: 'Clockify-style deep work and activity logger' };
      case 'habits': return { title: 'Habits & Daily Score', sub: 'Hit 100 points every single day' };
      case 'routines': return { title: 'Routines & Protocols', sub: 'Morning, Work, and Evening structured blocks' };
      case 'timeline': return { title: 'Daily Timeline', sub: 'Chronological visual stream of your day' };
      case 'calendar': return { title: '90-Day Challenge Matrix', sub: 'Inspect historical scores and journal archives' };
      case 'analytics': return { title: 'Productivity Analytics', sub: 'Category time breakdown and consistency metrics' };
      case 'journal': return { title: 'Daily Reflection & Journal', sub: 'Evening 4-question review and mood tracking' };
      case 'goals': return { title: 'Goals & Milestones', sub: 'Weekly targets and 90-day mastery goals' };
      case 'achievements': return { title: 'Achievements & Badges', sub: 'Unlock milestones on your 90-day journey' };
      case 'settings': return { title: 'System Settings', sub: 'Customization, appearance, and data management' };
      default: return { title: 'PROJECT 90', sub: 'Build Your Life, One Day at a Time' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        <button
          className="btn btn-ghost btn-icon"
          style={{ display: 'none' }}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          id="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pageInfo.title}</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pageInfo.sub}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {/* Next Salah Prayer Countdown */}
        {prayerInfo.nextPrayer && (
          <div className="hide-mobile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--cat-spiritual-bg)',
            border: '1px solid var(--cat-spiritual-border)',
            color: 'var(--cat-spiritual)',
            fontSize: '0.75rem',
            fontWeight: 700
          }} title={`Next: ${prayerInfo.nextPrayer.name} at ${prayerInfo.nextPrayer.time}`}>
            <span>{prayerInfo.nextPrayer.icon}</span>
            <span>{prayerInfo.nextPrayer.name} in {prayerInfo.countdownFormatted}</span>
          </div>
        )}

        {/* Command Palette Trigger */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenCommandPalette}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
          title="Search & Shortcuts (Ctrl+K)"
        >
          <Search size={14} />
          <kbd style={{ fontSize: '0.65rem', background: 'var(--bg-card)', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Ctrl K</kbd>
        </button>

        {/* User Manual Trigger */}
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={onOpenManual}
          title="Open User Manual & Blueprint"
          aria-label="Open User Manual"
        >
          <BookOpen size={18} color="var(--primary-light)" />
        </button>

        {/* Notification Bell */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={onOpenNotifications}
          title="Notifications & Nudges"
          aria-label="Open Notifications"
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ef4444'
          }} />
        </button>

        {/* Streak Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(249, 115, 22, 0.12)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          color: '#f97316',
          fontSize: '0.82rem',
          fontWeight: 700
        }}>
          <span className="flame-icon">🔥</span>
          <span>12 DAYS</span>
        </div>

        {/* Today's Score Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          background: scoreMeta.color ? `rgba(16, 185, 129, 0.12)` : 'var(--bg-surface)',
          border: `1px solid ${scoreMeta.color || 'var(--border-color)'}`,
          color: scoreMeta.color,
          fontSize: '0.82rem',
          fontWeight: 700
        }}>
          <span>⭐</span>
          <span>{todayScore} / 100</span>
        </div>

        {/* Quick Start Timer Button */}
        {!isTimerRunning && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => startTimer({ activityName: 'Deep Work Session', categoryId: 'career' })}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Play size={14} fill="currentColor" />
            <span>Quick Start</span>
          </button>
        )}

        {/* Sound Toggle */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 size={18} color="var(--primary-light)" /> : <VolumeX size={18} color="var(--text-muted)" />}
        </button>

        {/* Theme Toggle */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode (Alt+M)`}
          aria-label="Toggle Theme"
        >
          {currentTheme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* Better Auth User / Sign In Button */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              {user.name?.[0] || 'A'}
            </div>
            <button
              className="btn btn-ghost btn-sm btn-icon"
              onClick={handleSignOut}
              title="Sign Out"
              style={{ color: 'var(--text-muted)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsAuthModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderLeft: '1px solid var(--border-color)', marginLeft: '0.25rem' }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
