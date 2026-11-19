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
  Wallet
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const MobileNavBar: React.FC = () => {
  const { activeTab, setActiveTab, triggerSound } = useApp();

  // 5 Core Mobile Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'routines', label: 'Routines', icon: SunMedium },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'finance', label: 'Money', icon: Wallet },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays }
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
            <div className={`mobile-nav-icon-wrap ${isActive ? 'active-icon-pill' : ''}`}>
              <Icon size={isActive ? 21 : 20} strokeWidth={isActive ? 2.5 : 1.8} />
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
