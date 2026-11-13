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
  Settings
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const MobileNavBar: React.FC = () => {
  const { activeTab, setActiveTab, triggerSound } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my_day', label: 'My Day', icon: Clock },
    { id: 'routines', label: 'Routines', icon: SunMedium },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(item.id);
              triggerSound('click');
            }}
          >
            <div className="mobile-nav-icon-wrap">
              <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
              {isActive && <span className="mobile-nav-dot" />}
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
