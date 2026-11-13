'use client';

import React, { useState } from 'react';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Clock, 
  SunMedium, 
  Info,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getDayKeyFromDateStr, isRoutineScheduledForDay } from '@/utils/calculations';

export const CalendarView: React.FC = () => {
  const { data, todayStr, setActiveModal, setModalData } = useApp();

  const challenge = data.challenge || {};
  const startDateStr = challenge.startDate || todayStr;
  const totalDays = challenge.totalDurationDays || 19;
  const dayScores = data.dayScores || {};
  const routines = data.routines || [];
  const tasks = data.tasks || [];
  const routineLogsHistory = data.routineLogsHistory || {};

  // Calendar view month state (Year and Month)
  const today = new Date(todayStr);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleGoToday = () => {
    const t = new Date(todayStr);
    setCurrentYear(t.getFullYear());
    setCurrentMonth(t.getMonth());
  };

  // Month display title
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthTitle = `${monthNames[currentMonth]} ${currentYear}`;

  // Days in current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Helper to determine challenge day number from date string
  const getChallengeDayNumber = (dateStr: string): number | null => {
    if (!startDateStr) return null;
    const start = new Date(startDateStr);
    const curr = new Date(dateStr);
    const diffTime = curr.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays >= 1 && diffDays <= totalDays) {
      return diffDays;
    }
    return null;
  };

  // Calculate day status for a specific date
  const getDayStatus = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayKey = getDayKeyFromDateStr(dateStr);
    const isSunday = dayKey === 'sun';
    const isFuture = dateStr > todayStr;
    const isToday = dateStr === todayStr;

    if (isFuture) {
      return {
        type: 'future',
        label: isSunday ? 'Rest Day' : 'Upcoming',
        color: 'var(--text-muted)',
        bg: 'transparent',
        badgeClass: 'badge-ghost',
        icon: isSunday ? '☕' : '⚪'
      };
    }

    if (isSunday) {
      return {
        type: 'rest',
        label: 'Rest Day',
        color: '#a855f7',
        bg: 'rgba(168, 85, 247, 0.1)',
        badgeClass: 'badge-purple',
        icon: '☕'
      };
    }

    const score = dayScores[dateStr] || 0;

    if (score >= 70) {
      return {
        type: 'completed',
        label: 'Completed',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.1)',
        badgeClass: 'badge-excellent',
        icon: '🟢'
      };
    } else if (score >= 40) {
      return {
        type: 'partial',
        label: 'Partial',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.1)',
        badgeClass: 'badge-average',
        icon: '🟡'
      };
    } else {
      return {
        type: 'missed',
        label: 'Missed',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.1)',
        badgeClass: 'badge-poor',
        icon: '🔴'
      };
    }
  };

  const handleOpenDay = (dateStr: string, dayNumber: number | null) => {
    setModalData({
      dateStr,
      dayNumber: dayNumber || 1
    });
    setActiveModal('day_detail');
  };

  // Summary statistics across challenge days
  let completedCount = 0;
  let partialCount = 0;
  let missedCount = 0;
  let restCount = 0;

  for (let i = 1; i <= totalDays; i++) {
    const s = new Date(startDateStr);
    s.setDate(s.getDate() + (i - 1));
    const dStr = s.toISOString().split('T')[0];
    if (dStr <= todayStr) {
      const status = getDayStatus(dStr);
      if (status.type === 'completed') completedCount++;
      else if (status.type === 'partial') partialCount++;
      else if (status.type === 'rest') restCount++;
      else if (status.type === 'missed') missedCount++;
    }
  }

  return (
    <div className="page-container" style={{ paddingBottom: '5rem' }}>
      {/* Top Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.25rem',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <CalendarDays size={22} color="var(--primary-light)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                Monthly Calendar & Activity Matrix
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Inspect your historical daily reviews, routines, tasks, and 24h category time records.
            </p>
          </div>

          {/* Month Switcher Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', maxWidth: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1, minWidth: 0 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm btn-icon"
                onClick={handlePrevMonth}
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <div style={{
                background: 'var(--bg-input)',
                padding: '0.35rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                fontSize: '0.82rem',
                flex: 1,
                minWidth: 0,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {monthTitle}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm btn-icon"
                onClick={handleNextMonth}
                title="Next Week"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleGoToday}
              style={{ fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}
            >
              Today
            </button>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginTop: '1.1rem',
          paddingTop: '0.9rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.75rem'
        }}>
          <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>STATUS:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            Completed (70%+)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
            Partial (40%-69%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
            Missed (&lt;40%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }} />
            Rest Day (Sunday)
          </span>
        </div>
      </div>

      {/* Monthly Calendar Grid */}
      <div className="card" style={{ padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
        {/* Days of Week Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          textAlign: 'center',
          fontWeight: 800,
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          paddingBottom: '0.65rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '0.65rem'
        }}>
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
            <span key={d} style={{ display: 'flex', justifyContent: 'center' }}>
              <span className="hide-mobile">{d}</span>
              <span className="show-mobile">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}</span>
            </span>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 'clamp(2px, 1vw, 6px)'
        }}>
          {/* Empty spacer cells before 1st of month */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty_${idx}`} style={{ minHeight: '75px', opacity: 0.2 }} />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const challengeDay = getChallengeDayNumber(dateStr);
            const status = getDayStatus(dateStr);
            const isToday = dateStr === todayStr;

            // Day's scheduled counts
            const dayKey = getDayKeyFromDateStr(dateStr);
            const dayRoutines = routines.filter((r: any) => isRoutineScheduledForDay(r, dayKey));
            const dayLogs = routineLogsHistory[dateStr] || {};
            const doneRoutines = dayRoutines.filter((r: any) => {
              const log = dayLogs[r.id];
              return log && (log.completed || log.status === 'done');
            }).length;

            const dayTasks = tasks.filter((t: any) => t.plannedDate === dateStr && t.status !== 'cancelled');
            const doneTasks = dayTasks.filter((t: any) => t.status === 'completed').length;

            return (
              <div
                key={dateStr}
                onClick={() => handleOpenDay(dateStr, challengeDay)}
                className="calendar-day-card"
                style={{
                  minHeight: '68px',
                  padding: '0.35rem clamp(2px, 0.6vw, 4px)',
                  borderRadius: 'var(--radius-md)',
                  background: isToday ? 'rgba(99, 102, 241, 0.12)' : status.bg || 'var(--bg-input)',
                  border: isToday 
                    ? '2px solid var(--primary-light)' 
                    : challengeDay 
                      ? `1px solid ${status.color}` 
                      : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.12s ease, border-color 0.12s ease'
                }}
              >
                {/* Day Header */}
                <div className="calendar-day-header">
                  <span
                    className="calendar-day-num"
                    style={{
                      fontWeight: isToday ? 900 : 700,
                      color: isToday ? 'var(--primary-light)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      wordBreak: 'keep-all',
                      lineHeight: 1
                    }}
                  >
                    {dayNum}
                  </span>

                  {challengeDay && (
                    <span 
                      className="calendar-sprint-badge"
                      style={{
                        whiteSpace: 'nowrap',
                        wordBreak: 'keep-all',
                        lineHeight: 1
                      }}
                    >
                      D{challengeDay}
                    </span>
                  )}
                </div>

                {/* Day Content Badges */}
                <div style={{ marginTop: '0.15rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: status.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem'
                  }}>
                    <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>{status.icon}</span>
                    <span className="hide-mobile" style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{status.label}</span>
                  </div>

                  {(dayRoutines.length > 0 || dayTasks.length > 0) && (
                    <div style={{
                      fontSize: '0.58rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      marginTop: '0.15rem',
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}>
                      {dayRoutines.length > 0 ? `${doneRoutines}/${dayRoutines.length}` : `${doneTasks}t`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Challenge Metrics Footer */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem'
      }}>
        <div className="card" style={{ padding: '0.75rem 1rem', borderLeft: '3px solid #10b981' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>COMPLETED DAYS</span>
          <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', marginTop: '0.1rem' }}>
            {completedCount} Days
          </div>
        </div>

        <div className="card" style={{ padding: '0.75rem 1rem', borderLeft: '3px solid #f59e0b' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>PARTIAL DAYS</span>
          <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.1rem' }}>
            {partialCount} Days
          </div>
        </div>

        <div className="card" style={{ padding: '0.75rem 1rem', borderLeft: '3px solid #a855f7' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>REST DAYS</span>
          <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#a855f7', marginTop: '0.1rem' }}>
            {restCount} Days
          </div>
        </div>

        <div className="card" style={{ padding: '0.75rem 1rem', borderLeft: '3px solid #ef4444' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>MISSED DAYS</span>
          <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ef4444', marginTop: '0.1rem' }}>
            {missedCount} Days
          </div>
        </div>
      </div>
    </div>
  );
};

