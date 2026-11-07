'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  SunMedium, 
  Clock, 
  CalendarDays, 
  Trophy, 
  BookOpen
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const MobileNavBar: React.FC = () => {
  const { activeTab, setActiveTab, triggerSound } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Today', icon: LayoutDashboard },
    { id: 'routines', label: 'Routines', icon: SunMedium },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'calendar', label: '90-Day', icon: CalendarDays },
    { id: 'journal', label: 'Review', icon: BookOpen },
    { id: 'achievements', label: 'Badges', icon: Trophy }
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
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {isActive && <span className="mobile-nav-dot" />}
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

