'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Play, 
  SunMedium, 
  Clock, 
  CalendarDays, 
  BookOpen, 
  Trophy, 
  Settings, 
  Moon, 
  Sun, 
  X,
  Layers,
  Plus
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface CommandPaletteModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenManual?: () => void;
  onOpenCategoryManager?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenManual, 
  onOpenCategoryManager
}) => {
  const { 
    data, 
    setActiveTab, 
    toggleTheme, 
    setActiveModal, 
    setModalData,
    handleExport
  } = useApp();

  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const routines = data.routines || [];
  const categories = data.categories || [];

  const handleAction = (callback: () => void) => {
    callback();
    if (onClose) onClose();
  };

  const navCommands = [
    {
      id: 'nav_dash',
      title: 'Go to Today Dashboard',
      category: 'Navigation',
      icon: SunMedium,
      action: () => setActiveTab('dashboard')
    },
    {
      id: 'nav_routines',
      title: 'Go to Pillars & Routines',
      category: 'Navigation',
      icon: SunMedium,
      action: () => setActiveTab('routines')
    },
    {
      id: 'nav_timeline',
      title: 'Go to Daily Timeline',
      category: 'Navigation',
      icon: Clock,
      action: () => setActiveTab('timeline')
    },
    {
      id: 'nav_calendar',
      title: 'Go to 90-Day Sprint Calendar',
      category: 'Navigation',
      icon: CalendarDays,
      action: () => setActiveTab('calendar')
    },
    {
      id: 'nav_achievements',
      title: 'Go to Achievements & Badges',
      category: 'Navigation',
      icon: Trophy,
      action: () => setActiveTab('achievements')
    },
    {
      id: 'nav_journal',
      title: 'Go to Daily Evening Reflection',
      category: 'Navigation',
      icon: BookOpen,
      action: () => setActiveTab('journal')
    },
    {
      id: 'nav_settings',
      title: 'Go to Settings & Profile',
      category: 'Navigation',
      icon: Settings,
      action: () => setActiveTab('settings')
    }
  ];

  const quickActions = [
    {
      id: 'act_new_routine',
      title: 'Create New Daily Routine',
      category: 'Actions',
      icon: Plus,
      action: () => {
        setModalData(null);
        setActiveModal('routine_modal');
      }
    },
    {
      id: 'act_manage_pillars',
      title: 'Register or Manage Focus Pillars',
      category: 'Actions',
      icon: Layers,
      action: () => {
        if (onOpenCategoryManager) onOpenCategoryManager();
        else setActiveModal('pillar_modal');
      }
    },
    {
      id: 'act_theme',
      title: 'Toggle Dark / Light Theme (Alt + M)',
      category: 'Preferences',
      icon: data.profile?.theme === 'dark' ? Sun : Moon,
      action: () => toggleTheme()
    },
    {
      id: 'act_export',
      title: 'Export Backup JSON',
      category: 'Data',
      icon: Settings,
      action: () => handleExport()
    }
  ];

  // Routine Launchers
  const routineActions = routines.map((r: any) => ({
    id: `run_rt_${r.id}`,
    title: `Run Routine: ${r.title || r.name}`,
    category: 'Run Guided Routine',
    icon: Play,
    action: () => {
      setModalData(r);
      setActiveModal('routine_runner');
    }
  }));

  const allItems = [...quickActions, ...navCommands, ...routineActions];

  const filtered = allItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '10vh' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '92%',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.65rem 0.85rem',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          border: '1px solid var(--border-color)'
        }}>
          <Search size={18} color="var(--primary-light)" />
          <input
            type="text"
            placeholder="Search commands, navigate, or run a routine... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}
          />
          <button 
            className="btn btn-ghost btn-icon" 
            onClick={onClose}
            style={{ padding: '0.2rem' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No commands found matching "{query}"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAction(item.action)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: 'var(--bg-input)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={14} color="var(--primary-light)" />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.title}</span>
                    </div>

                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
