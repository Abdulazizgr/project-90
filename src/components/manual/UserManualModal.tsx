import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Sunrise, 
  Sun, 
  Moon, 
  Clock, 
  CheckSquare, 
  CalendarDays, 
  BarChart3, 
  Target, 
  Trophy, 
  Database,
  Download,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface UserManualModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('daily_use_case');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', maxHeight: '90vh', padding: '2rem' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <BookOpen size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Apex OS — User Manual & Operational Blueprint</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Your complete guide to transforming life one day at a time
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Section Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', overflowX: 'auto' }}>
          <button
            className={`btn btn-sm ${activeSection === 'daily_use_case' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveSection('daily_use_case')}
          >
            🔥 Complete Daily Use Case
          </button>
          <button
            className={`btn btn-sm ${activeSection === 'modules' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveSection('modules')}
          >
            📱 Modules Guide
          </button>
          <button
            className={`btn btn-sm ${activeSection === 'shortcuts' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveSection('shortcuts')}
          >
            ⌨️ Keyboard Shortcuts
          </button>
        </div>

        {/* Content Body */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {activeSection === 'daily_use_case' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.05))',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem'
              }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--primary-light)' }}>
                  A Day in the Life with Apex OS
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Here is the exact step-by-step workflow followed every single day to guarantee peak discipline, deep focus, and an 🟢 <strong>Excellent (90+) Score</strong>.
                </p>
              </div>

              {/* Block 1: Morning */}
              <div className="card" style={{ borderLeft: '4px solid var(--cat-spiritual)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>🌅</span>
                  <h5 style={{ fontSize: '1rem', fontWeight: 800 }}>Phase 1: Morning Momentum (05:00 AM – 07:00 AM)</h5>
                </div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li><strong>05:00 AM Wakeup</strong>: Drink 500ml water, perform Wudu, pray Fajr in congregation.</li>
                  <li><strong>Recitation</strong>: Open <em>Quran</em> habit and recite 5 pages with reflection.</li>
                  <li><strong>Workout & Stretch</strong>: 35-min calisthenics / gym session + cold shower.</li>
                  <li><strong>Log in App</strong>: Go to Dashboard &rarr; click <em>"Launch Guided Routine"</em> on Morning Routine &rarr; click through steps &rarr; click <em>"Log to Timeline & Close"</em>.</li>
                  <li><span className="badge badge-excellent" style={{ fontSize: '0.7rem' }}>Result: +30 Points earned before 7:00 AM!</span></li>
                </ul>
              </div>

              {/* Block 2: Workday */}
              <div className="card" style={{ borderLeft: '4px solid var(--cat-career)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>☀️</span>
                  <h5 style={{ fontSize: '1rem', fontWeight: 800 }}>Phase 2: High-Impact Deep Work (08:30 AM – 05:00 PM)</h5>
                </div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li><strong>Start Focus Session</strong>: In the bottom Clockify bar, enter your task name, select your category/project, and click <strong>Start</strong> (or toggle 25m/50m Pomodoro).</li>
                  <li><strong>Digital Discipline</strong>: Put your phone in another room or on Do Not Disturb.</li>
                  <li><strong>Salah / Mindful Breaks</strong>: Keep an eye on the Topbar Salah countdown for prayer times and breaks.</li>
                  <li><strong>Stop & Log</strong>: Click <strong>Stop</strong> when taking a break. Time entry is instantly saved to your database and charted in Analytics.</li>
                  <li><span className="badge badge-excellent" style={{ fontSize: '0.7rem' }}>Result: 4+ Hours of verified deep work logged!</span></li>
                </ul>
              </div>

              {/* Block 3: Evening */}
              <div className="card" style={{ borderLeft: '4px solid var(--cat-personal)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>🌙</span>
                  <h5 style={{ fontSize: '1rem', fontWeight: 800 }}>Phase 3: Evening Reflection & Wind-down (07:30 PM – 10:00 PM)</h5>
                </div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li><strong>Maghrib & Isha</strong>: Pray on time (log mosque attendance or reason if delayed), family dinner with zero phone scrolling.</li>
                  <li><strong>Reading Routine</strong>: Read 20 pages of non-fiction book &rarr; mark complete in Routines.</li>
                  <li><strong>5-Pillar Evening Self-Evaluation</strong>: Open <em>Daily Reflection</em> tab &rarr; evaluate each of your 5 life categories (0–100) with auto-suggest baseline support:
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.2rem' }}>
                      <li>Spiritual (Prayers on time in mosque, Quran recitation)</li>
                      <li>Digital Discipline (Screen time limits, phone docking)</li>
                      <li>Personal Mastery (Reading, family presence, mindset)</li>
                      <li>Health & Energy (Gym/workout, hydration, sleep)</li>
                      <li>Career Execution (Deep work sprints, high-impact deliverables)</li>
                    </ul>
                  </li>
                  <li><strong>Answer 4 Evening Questions</strong>:
                    <ol style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                      <li><em>What did I do well today?</em></li>
                      <li><em>What did I fail to do?</em></li>
                      <li><em>What distracted me?</em></li>
                      <li><em>What will I improve tomorrow?</em></li>
                    </ol>
                  </li>
                  <li><strong>Save & Celebrate</strong>: Click <strong>Save Reflection & 5-Pillar Scores</strong> &rarr; Calculates your overall day score as the pure average of all 5 categories, triggering celebration when reaching <strong>90+ 🟢 Excellent</strong>!</li>
                  <li><strong>Lights Out</strong>: Dock phone in the living room at 09:45 PM; sleep by 10:15 PM.</li>
                </ul>
              </div>

              {/* Block 4: Weekly Review */}
              <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>📋</span>
                  <h5 style={{ fontSize: '1rem', fontWeight: 800 }}>Phase 4: Weekly Sprint Review (Sunday Evening)</h5>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Press <kbd>Ctrl + K</kbd> &rarr; select <em>"Launch Weekly Sprint Review"</em> &rarr; inspect 7-day average score, deep work hours, best &amp; weakest category &rarr; answer the 3 sprint questions to calibrate the upcoming week.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'modules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div className="card">
                <h5 style={{ fontWeight: 800, color: 'var(--primary-light)', marginBottom: '0.3rem' }}>⏱️ Clockify-Style Time Tracker</h5>
                <p style={{ color: 'var(--text-secondary)' }}>Tracks second-precision time entries. Switch between standard Stopwatch count-up and 25m/50m Pomodoro countdowns. Filter history by category and export clean CSV spreadsheets anytime.</p>
              </div>
              <div className="card">
                <h5 style={{ fontWeight: 800, color: 'var(--cat-spiritual)', marginBottom: '0.3rem' }}>⚡ Actionable Routines & 5-Pillar Evaluation</h5>
                <p style={{ color: 'var(--text-secondary)' }}>Routines are actionable tasks scheduled for daily or selected days (e.g. Gym 3 days/week, Deep Work 5 days/week). Log on-time vs late, mosque attendance, and reasons for missed or partial tasks. In the evening, evaluate each of the 5 categories (0-100) with the overall day score computed as the average.</p>
              </div>
              <div className="card">
                <h5 style={{ fontWeight: 800, color: 'var(--cat-career)', marginBottom: '0.3rem' }}>🗓️ Monthly Calendar & Weekly Schedule</h5>
                <p style={{ color: 'var(--text-secondary)' }}>Visual sprint heatmap and weekly schedule that automatically syncs your routines for each day alongside custom tasks and events.</p>
              </div>
              <div className="card">
                <h5 style={{ fontWeight: 800, color: 'var(--cat-personal)', marginBottom: '0.3rem' }}>💾 MongoDB Atlas & Better Auth Sync</h5>
                <p style={{ color: 'var(--text-secondary)' }}>All data is synchronized live with your MongoDB Atlas cluster. Sign in to sync across devices or export offline JSON backups from Settings.</p>
              </div>
            </div>
          )}

          {activeSection === 'shortcuts' && (
            <div className="card">
              <h5 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem' }}>Global Keyboard Shortcuts</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <span>Open Command Palette</span>
                  <kbd>Ctrl + K</kbd>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <span>Quick Start / Stop Timer</span>
                  <kbd>Alt + T</kbd>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <span>Toggle Color Theme</span>
                  <kbd>Alt + M</kbd>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <span>Close Active Modal</span>
                  <kbd>ESC</kbd>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
