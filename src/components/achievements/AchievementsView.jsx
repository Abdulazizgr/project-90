import React from 'react';
import { Trophy, Award, Lock, Sparkles, CheckCircle2, Flame, Star, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

export const AchievementsView = () => {
  const { data, triggerSound } = useApp();
  const achievements = data.achievements || [];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const pct = Math.round((unlockedCount / totalCount) * 100);

  const handleCelebrate = () => {
    triggerSound('fanfare');
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="page-container">
      {/* Top Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.9), rgba(15, 23, 42, 0.9))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🏆</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Achievements & Mastery Badges</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '580px' }}>
              Unlock milestone badges by maintaining streaks, logging deep work, and conquering your 90-day transformation sprint.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleCelebrate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Sparkles size={16} />
            <span>Celebrate Progress</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <span>UNLOCKED: {unlockedCount} / {totalCount} BADGES</span>
            <span style={{ color: 'var(--primary-light)' }}>{pct}% COMPLETE</span>
          </div>
          <div className="progress-bar-container" style={{ height: '10px' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #f59e0b, #ec4899, #6366f1)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid-3">
        {achievements.map((ach) => {
          const isUnlocked = !!ach.unlocked;

          return (
            <div
              key={ach.id}
              className="card"
              style={{
                border: isUnlocked ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid var(--border-color)',
                background: isUnlocked ? 'linear-gradient(135deg, var(--bg-card), rgba(234, 179, 8, 0.05))' : 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Top Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: isUnlocked ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(249, 115, 22, 0.2))' : 'var(--bg-surface)',
                  border: isUnlocked ? '2px solid #eab308' : '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(0.5)'
                }}>
                  {ach.icon}
                </div>

                {isUnlocked ? (
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <CheckCircle2 size={12} />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="badge" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                    <Lock size={12} />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {ach.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '1rem' }}>
                  {ach.description}
                </p>
              </div>

              {/* Status footer */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.75rem', color: isUnlocked ? 'var(--score-excellent)' : 'var(--text-muted)', fontWeight: 600 }}>
                {isUnlocked ? `✨ Unlocked at ${ach.unlockedAt || 'Sprint Start'}` : `Progress: ${ach.progress || 'In Progress'}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
