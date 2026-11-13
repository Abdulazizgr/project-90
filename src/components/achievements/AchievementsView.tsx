'use client';

import React from 'react';
import { Trophy, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';

export const AchievementsView = () => {
  const { data, triggerSound } = useApp();
  const achievements = data.achievements || [];

  const unlockedCount = achievements.filter((a: any) => a.unlocked).length;
  const totalCount = achievements.length || 9;
  const pct = Math.round((unlockedCount / totalCount) * 100);

  const handleCelebrate = () => {
    triggerSound('level-up');
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
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.75rem',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.6rem' }}>🏆</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Routine Mastery & Focus Badges</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '580px' }}>
              Unlock discipline badges by building daily routine streaks, balancing your focus pillars, and conquering your personal management sprint.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleCelebrate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <Sparkles size={16} />
            <span>Celebrate Progress</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.45rem' }}>
            <span>UNLOCKED: {unlockedCount} / {totalCount} BADGES</span>
            <span style={{ color: 'var(--primary-light)' }}>{pct}% COMPLETE</span>
          </div>
          <div style={{
            height: '10px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}>
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, var(--primary-light))',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
        gap: '1rem'
      }}>
        {achievements.map((ach: any) => {
          const isUnlocked = ach.unlocked;

          return (
            <div
              key={ach.id}
              className="card"
              style={{
                padding: '1.25rem',
                border: isUnlocked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                background: isUnlocked
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(99, 102, 241, 0.05))'
                  : 'var(--bg-card)',
                opacity: isUnlocked ? 1 : 0.72,
                position: 'relative',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                transition: 'transform var(--transition-fast)'
              }}
            >
              {/* Badge Icon */}
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: isUnlocked ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--bg-input)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                flexShrink: 0,
                boxShadow: isUnlocked ? '0 8px 20px rgba(16, 185, 129, 0.35)' : 'none'
              }}>
                {ach.icon || '🏆'}
              </div>

              {/* Badge Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: isUnlocked ? '#10b981' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {ach.category || 'Discipline'}
                  </span>
                  {isUnlocked ? (
                    <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', gap: '0.2rem' }}>
                      <CheckCircle2 size={11} /> Unlocked
                    </span>
                  ) : (
                    <span className="badge badge-secondary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', gap: '0.2rem' }}>
                      <Lock size={11} /> In Progress
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {ach.title}
                </h4>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.35, marginBottom: '0.65rem' }}>
                  {ach.description}
                </p>

                {/* Progress Tag */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: isUnlocked ? '#10b981' : 'var(--text-secondary)',
                  background: 'var(--bg-input)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <span>Progress: {ach.progress || (isUnlocked ? 'Completed' : '0%')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
