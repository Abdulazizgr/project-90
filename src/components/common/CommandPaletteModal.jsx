import React, { useState } from 'react';
import { 
  Search, 
  Play, 
  Square, 
  CheckSquare, 
  SunMedium, 
  Clock, 
  CalendarDays, 
  BarChart3, 
  BookOpen, 
  Target, 
  Trophy, 
  Settings, 
  Moon, 
  Sun, 
  FileSpreadsheet, 
  Book,
  X,
  Sparkles,
  Layers,
  Calendar,
  FolderKanban
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { exportTimeEntriesAsCSV } from '@/utils/storage';

export const CommandPaletteModal = ({ 
  isOpen, 
  onClose, 
  onOpenManual, 
  onOpenWeeklyReview, 
  onOpenCategoryManager,
  onOpenSundayPlanner
}) => {
  const { 
    data, 
    setActiveTab, 
    startTimer, 
    stopTimer, 
    toggleTheme, 
    toggleSound, 
    setActiveModal, 
    setModalData 
  } = useApp();

  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const isTimerRunning = data.activeTimer?.isRunning;

  const commands = [
    {
      id: 'tab_dashboard',
      title: 'Go to Life Dashboard',
      category: 'Navigation',
      icon: <Sparkles size={16} />,
      action: () => { setActiveTab('dashboard'); onClose(); }
    },
    {
      id: 'tab_projects',
      title: '📁 Go to Projects & Tasks (Create Projects & Tasks)',
      category: 'Navigation',
      icon: <FolderKanban size={16} color="#6366f1" />,
      action: () => { setActiveTab('projects'); onClose(); }
    },
    {
      id: 'action_sunday_planner',
      title: '🗓️ Launch Sunday Retrospective & Next-Week Planner',
      category: 'Planning & Balance',
      icon: <Calendar size={16} color="#f59e0b" />,
      action: () => { onOpenSundayPlanner(); onClose(); }
    },
    {
      id: 'action_manage_categories',
      title: '📂 Manage Life Pillars, Projects & Tasks Hierarchy',
      category: 'Planning & Balance',
      icon: <Layers size={16} color="var(--primary-light)" />,
      action: () => { onOpenCategoryManager(); onClose(); }
    },
    {
      id: 'tab_timer',
      title: 'Go to Time Tracker & Pomodoro',
      category: 'Navigation',
      icon: <Clock size={16} />,
      action: () => { setActiveTab('timer'); onClose(); }
    },
    {
      id: 'tab_habits',
      title: 'Go to Habits & 100-Point Scorecard',
      category: 'Navigation',
      icon: <CheckSquare size={16} />,
      action: () => { setActiveTab('habits'); onClose(); }
    },
    {
      id: 'tab_routines',
      title: 'Go to Routines & Protocols',
      category: 'Navigation',
      icon: <SunMedium size={16} />,
      action: () => { setActiveTab('routines'); onClose(); }
    },
    {
      id: 'tab_timeline',
      title: 'Go to Daily Timeline',
      category: 'Navigation',
      icon: <Clock size={16} />,
      action: () => { setActiveTab('timeline'); onClose(); }
    },
    {
      id: 'tab_calendar',
      title: 'Go to 90-Day Challenge Matrix',
      category: 'Navigation',
      icon: <CalendarDays size={16} />,
      action: () => { setActiveTab('calendar'); onClose(); }
    },
    {
      id: 'tab_analytics',
      title: 'Go to Productivity Analytics',
      category: 'Navigation',
      icon: <BarChart3 size={16} />,
      action: () => { setActiveTab('analytics'); onClose(); }
    },
    {
      id: 'tab_journal',
      title: 'Go to Daily Reflection Journal',
      category: 'Navigation',
      icon: <BookOpen size={16} />,
      action: () => { setActiveTab('journal'); onClose(); }
    },
    {
      id: 'tab_goals',
      title: 'Go to Goals & Milestones',
      category: 'Navigation',
      icon: <Target size={16} />,
      action: () => { setActiveTab('goals'); onClose(); }
    },
    {
      id: 'tab_achievements',
      title: 'Go to Achievements & Badges',
      category: 'Navigation',
      icon: <Trophy size={16} />,
      action: () => { setActiveTab('achievements'); onClose(); }
    },
    // Quick Actions
    {
      id: 'action_timer_toggle',
      title: isTimerRunning ? '⏹️ Stop Active Clockify Timer' : '▶️ Quick Start Deep Work Timer',
      category: 'Quick Actions',
      icon: isTimerRunning ? <Square size={16} color="#ef4444" /> : <Play size={16} color="#10b981" />,
      action: () => {
        if (isTimerRunning) stopTimer();
        else startTimer({ activityName: 'Deep Work Session', categoryId: data.categories?.[0]?.id || 'career' });
        onClose();
      }
    },
    {
      id: 'action_manual_entry',
      title: '➕ Add Manual Time Entry',
      category: 'Quick Actions',
      icon: <Clock size={16} />,
      action: () => { setActiveModal('manual_time'); onClose(); }
    },
    {
      id: 'action_weekly_review',
      title: '📋 Launch Weekly Sprint Review',
      category: 'Quick Actions',
      icon: <BookOpen size={16} />,
      action: () => { onOpenWeeklyReview(); onClose(); }
    },
    {
      id: 'action_export_csv',
      title: '📄 Export Time Entries as CSV Spreadsheet',
      category: 'Data & Tools',
      icon: <FileSpreadsheet size={16} color="#10b981" />,
      action: () => { exportTimeEntriesAsCSV(data.timeEntries, data.categories); onClose(); }
    },
    {
      id: 'action_theme_toggle',
      title: '🎨 Toggle Dark / Light Color Theme',
      category: 'Appearance',
      icon: <Moon size={16} />,
      action: () => { toggleTheme(); onClose(); }
    },
    {
      id: 'action_user_manual',
      title: '📖 Open Complete User Manual & Daily Workflow',
      category: 'Help & Docs',
      icon: <Book size={16} />,
      action: () => { onOpenManual(); onClose(); }
    }
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px', padding: '1.25rem' }}
      >
        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.65rem 0.85rem',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--primary-light)',
          marginBottom: '1rem'
        }}>
          <Search size={18} color="var(--primary-light)" />
          <input
            type="text"
            placeholder="Type a command or search modules... (Ctrl + K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <kbd style={{
            fontSize: '0.7rem',
            background: 'var(--bg-surface)',
            padding: '0.2rem 0.4rem',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)'
          }}>ESC</kbd>
        </div>

        {/* Command List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {filteredCommands.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No commands matching "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd) => (
              <div
                key={cmd.id}
                onClick={cmd.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  background: 'var(--bg-card)',
                  border: '1px solid transparent',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-surface)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{cmd.icon}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{cmd.title}</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {cmd.category}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
