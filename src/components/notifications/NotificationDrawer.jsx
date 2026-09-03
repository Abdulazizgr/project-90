import React, { useState } from 'react';
import { Bell, X, CheckCircle, Clock, Flame, Sparkles, BookOpen, Sun, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const { data, setActiveTab, setActiveModal, setModalData, todayStr } = useApp();
  const [browserPushEnabled, setBrowserPushEnabled] = useState(false);

  if (!isOpen) return null;

  const todayScore = data.dayScores?.[todayStr] || 0;
  const todayEntries = (data.timeEntries || []).filter((e) => e.date === todayStr);
  const totalMinutes = todayEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  // Dynamic context notifications
  const notifications = [
    {
      id: 'notif_1',
      type: 'routine',
      title: 'Morning Momentum Protocol',
      desc: 'Wake up at 5:00 AM, Fajr in congregation, and 5 pages Quran recitation.',
      time: '05:00 AM',
      icon: '🌅',
      actionLabel: 'Open Routines',
      action: () => { setActiveTab('routines'); onClose(); }
    },
    {
      id: 'notif_2',
      type: 'deepwork',
      title: 'RHIZAN Deep Work Milestone',
      desc: totalMinutes < 240 ? `Logged ${Math.round(totalMinutes/60)}h today. Hit 4h deep work target!` : 'Great job! 4+ hours clocked today.',
      time: '02:00 PM',
      icon: '💻',
      actionLabel: 'Open Timer',
      action: () => { setActiveTab('timer'); onClose(); }
    },
    {
      id: 'notif_3',
      type: 'reflection',
      title: 'Daily Evening Review & Reflection',
      desc: todayScore < 90 ? `Current Score is ${todayScore}/100. Complete your reflection for +10 pts to hit Excellent (90+)!` : 'Review complete for today!',
      time: '09:30 PM',
      icon: '📝',
      actionLabel: 'Open Journal',
      action: () => { setActiveTab('journal'); onClose(); }
    },
    {
      id: 'notif_4',
      type: 'streak',
      title: '12-Day Streak Active 🔥',
      desc: 'Keep up the momentum to conquer month 1 (30 Days Strong badge).',
      time: 'Daily',
      icon: '🏆',
      actionLabel: 'View Achievements',
      action: () => { setActiveTab('achievements'); onClose(); }
    }
  ];

  const handleRequestPush = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setBrowserPushEnabled(true);
          new Notification('PROJECT 90 Reminders Active', {
            body: 'You will receive intelligent daily routine & deep work nudges!',
            icon: '/favicon.ico'
          });
        }
      });
    } else {
      alert('Browser notifications not supported in this environment.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', padding: '1.75rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-light)'
            }}>
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Notification & Nudge Center</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Proactive discipline alerts</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Browser push permission banner */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem'
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Desktop Web Push Alerts</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Get notified for routines & Salah times</div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleRequestPush}
            style={{ fontSize: '0.75rem' }}
          >
            {browserPushEnabled ? 'Enabled ✅' : 'Enable'}
          </button>
        </div>

        {/* Notifications list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                transition: 'border-color var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{notif.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{notif.title}</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{notif.time}</span>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                {notif.desc}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={notif.action}
                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                >
                  {notif.actionLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
