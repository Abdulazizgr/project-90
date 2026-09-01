import React from 'react';
import { Calendar, Flame, Star, Trophy, Sparkles, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getScoreLevel } from '../../utils/calculations';

export const Calendar90View = () => {
  const { data, setActiveModal, setModalData, todayStr } = useApp();

  const challenge = data.challenge || {};
  const startDateStr = challenge.startDate || todayStr;
  const currentDay = challenge.currentDay || 12;
  const totalDays = challenge.totalDurationDays || 90;
  const dayScores = data.dayScores || {};

  // Build the 90 days array
  const startDate = new Date(startDateStr);
  const daysArray = [];

  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + (i - 1));
    const dateStr = d.toISOString().split('T')[0];

    const isPast = i < currentDay;
    const isToday = i === currentDay;
    const isFuture = i > currentDay;

    let score = dayScores[dateStr];
    if (score === undefined && isToday) {
      score = dayScores[todayStr] || 78;
    }

    let status = 'future';
    if (isPast || isToday) {
      if (score >= 90) status = 'excellent';
      else if (score >= 70) status = 'good';
      else if (score >= 50) status = 'average';
      else status = 'poor';
    }

    daysArray.push({
      dayNumber: i,
      dateStr,
      isPast,
      isToday,
      isFuture,
      score: score || 0,
      status
    });
  }

  const handleDayClick = (day) => {
    setModalData(day);
    setActiveModal('day_detail');
  };

  const getStatusColor = (status, isToday) => {
    if (status === 'excellent') return '#10b981';
    if (status === 'good') return '#3b82f6';
    if (status === 'average') return '#eab308';
    if (status === 'poor') return '#ef4444';
    return 'rgba(255, 255, 255, 0.08)'; // future
  };

  const getStatusBg = (status, isToday) => {
    if (status === 'excellent') return 'rgba(16, 185, 129, 0.15)';
    if (status === 'good') return 'rgba(59, 130, 246, 0.15)';
    if (status === 'average') return 'rgba(234, 179, 8, 0.15)';
    if (status === 'poor') return 'rgba(239, 68, 68, 0.15)';
    return 'var(--bg-card)';
  };

  // Stats
  const completedDaysCount = daysArray.filter((d) => d.isPast || d.isToday).length;
  const excellentDaysCount = daysArray.filter((d) => d.status === 'excellent').length;
  const goodDaysCount = daysArray.filter((d) => d.status === 'good').length;

  return (
    <div className="page-container">
      {/* Header Deck */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.9), rgba(15, 23, 42, 0.9))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🗓️</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>90-Day Transformation Matrix</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>
              Click any day in the 90-day matrix to inspect completed habits, time tracked, scores, and journal reflections.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              <span>🟢 Excellent (90+)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
              <span>🔵 Good (70-89)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }} />
              <span>🟡 Average (50-69)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <span>⚪ Future</span>
            </div>
          </div>
        </div>

        {/* Challenge Summary Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ background: 'var(--bg-surface)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Challenge Progress</div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-light)' }}>
              Day {currentDay} / 90 ({Math.round((currentDay / 90) * 100)}%)
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Streak Status</div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f97316' }}>
              🔥 12 Days (Active)
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Excellent Days</div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--score-excellent)' }}>
              {excellentDaysCount} Days (🟢 90+)
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Good Days</div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--score-good)' }}>
              {goodDaysCount} Days (🔵 70-89)
            </div>
          </div>
        </div>
      </div>

      {/* 90-Day Matrix Grid (10 columns x 9 rows or 7-day weeks) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Complete 90-Day Grid</h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Click any cell to open day inspection report
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
          gap: '0.75rem'
        }}>
          {daysArray.map((day) => {
            const isSelectedToday = day.isToday;
            const borderColor = isSelectedToday ? 'var(--primary-light)' : getStatusColor(day.status);
            const bgColor = getStatusBg(day.status);

            return (
              <div
                key={day.dayNumber}
                onClick={() => handleDayClick(day)}
                style={{
                  background: bgColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all var(--transition-fast)',
                  position: 'relative',
                  boxShadow: isSelectedToday ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                  e.currentTarget.style.zIndex = '5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.zIndex = '1';
                }}
              >
                {/* Today Pill */}
                {isSelectedToday && (
                  <div style={{
                    position: 'absolute',
                    top: '-7px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.4rem',
                    borderRadius: 'var(--radius-full)',
                    lineHeight: 1
                  }}>
                    TODAY
                  </div>
                )}

                <div className="mono" style={{ fontSize: '1rem', fontWeight: 800, color: isSelectedToday ? 'var(--primary-light)' : 'var(--text-primary)' }}>
                  D{day.dayNumber}
                </div>

                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                  {day.dateStr.slice(5)}
                </div>

                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: day.isFuture ? 'var(--text-muted)' : getStatusColor(day.status)
                }}>
                  {day.isFuture ? '—' : `${day.score} pts`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
