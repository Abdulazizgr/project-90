import React from 'react';
import { 
  LayoutDashboard, 
  Timer, 
  CheckSquare, 
  SunMedium, 
  Calendar,
  FolderKanban,
  Clock, 
  CalendarDays, 
  BarChart3, 
  BookOpen, 
  Target, 
  Trophy, 
  Settings, 
  Flame,
  Sparkles,
  Rocket
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getScoreLevel } from '../../utils/calculations';

interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const { data, activeTab, setActiveTab, todayStr, setIsSetupWizardOpen } = useApp();
  const challenge = data.challenge || {};
  const isPlanning = challenge.status === 'planning';
  const currentDay = challenge.currentDay || 1;
  const totalDays = challenge.totalDurationDays || 90;
  const daysLeft = Math.max(0, totalDays - currentDay);
  const pctComplete = Math.min(100, Math.round((currentDay / totalDays) * 100));

  const todayScore = data.dayScores?.[todayStr] || 0;
  const scoreMeta = getScoreLevel(todayScore);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects & Tasks', icon: FolderKanban },
    { id: 'routines', label: 'Daily Routines', icon: SunMedium },
    { id: 'weekly', label: 'Weekly Schedule', icon: Calendar },
    { id: 'habits', label: 'Habits & Scores', icon: CheckSquare },
    { id: 'timer', label: 'Time Tracker', icon: Timer, badge: data.activeTimer?.isRunning ? 'LIVE' : null },
    { id: 'timeline', label: 'Daily Timeline', icon: Clock },
    { id: 'calendar', label: '90-Day Calendar', icon: CalendarDays },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'journal', label: 'Daily Reflection', icon: BookOpen },
    { id: 'goals', label: 'Goals & Targets', icon: Target },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.25rem 0.5rem' }}>
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
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Life Operating System</p>
        </div>
      </div>

      {/* Challenge Progress Card or Planning Mode Card */}
      {isPlanning ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(99, 102, 241, 0.08))',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🛠️ SPRINT SETUP
            </span>
            <span className="badge badge-warning" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>Planning</span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', lineHeight: 1.3 }}>
            Plan daily routines & weekly gym/meetings before launch.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsSetupWizardOpen(true)}
            style={{ width: '100%', fontSize: '0.72rem', padding: '0.35rem 0.5rem', gap: '0.3rem' }}
          >
            <Rocket size={12} />
            <span>Launch Sprint Guide</span>
          </button>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.05))',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.9rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DAY {currentDay} / {totalDays}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-light)' }}>
              {pctComplete}%
            </span>
          </div>
          <div className="progress-bar-container" style={{ height: '6px', marginBottom: '0.5rem' }}>
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${pctComplete}%`, 
                background: 'linear-gradient(90deg, var(--primary), #8b5cf6)' 
              }} 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>{daysLeft} Days Left</span>
            <span style={{ color: 'var(--cat-spiritual)', fontWeight: 600 }}>🟢 Active</span>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div className="nav-label">Core Modules</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                if (setIsMobileOpen) setIsMobileOpen(false);
              }}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.4)'
                }}>
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer User Pill */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            {data.profile?.name?.[0] || 'A'}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{data.profile?.name || 'User'}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>12 Day Streak 🔥</div>
          </div>
        </div>
        <div className={`badge ${scoreMeta.badgeClass}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
          {todayScore} pts
        </div>
      </div>
    </aside>
  );
};
