'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  X, 
  Trash2, 
  Target, 
  Filter 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';

const PRESET_ICONS = ['🏆', '🔥', '⚡', '🛡️', '🕌', '💼', '🧠', '🗣️', '💪', '🎯', '👑', '🌱', '⭐', '🚀'];

export const AchievementsView = () => {
  const { 
    data, 
    triggerSound, 
    addAchievement, 
    deleteAchievement, 
    confirmAction 
  } = useApp();

  const achievements = data.achievements || [];
  const categories = data.categories || [];

  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Achievement Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryId, setNewCategoryId] = useState(categories[0]?.id || '');
  const [newIcon, setNewIcon] = useState('🏆');
  const [newDesc, setNewDesc] = useState('');
  const [newTarget, setNewTarget] = useState(7);

  const unlockedCount = achievements.filter((a: any) => a.unlocked).length;
  const totalCount = achievements.length || 1;
  const pct = Math.round((unlockedCount / totalCount) * 100);

  const handleCelebrate = () => {
    triggerSound('level-up');
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  const handleCreateAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const selectedCat = categories.find((c: any) => c.id === newCategoryId);

    addAchievement({
      title: newTitle.trim(),
      description: newDesc.trim() || `Complete ${newTarget} sessions in ${selectedCat?.name || 'this category'}`,
      icon: newIcon || selectedCat?.icon || '🏆',
      category: selectedCat?.name || 'Custom',
      categoryId: newCategoryId || undefined,
      progress: `0 / ${newTarget} Sessions`
    });

    setNewTitle('');
    setNewDesc('');
    setNewTarget(7);
    setIsModalOpen(false);
  };

  // Filter achievements by category
  const filteredAchievements = achievements.filter((ach: any) => {
    if (activeCategoryTab === 'all') return true;

    if (activeCategoryTab === 'streaks') {
      return !ach.categoryId && ['Consistency', 'Discipline', 'Milestone', 'Balance'].includes(ach.category);
    }

    const cat = categories.find((c: any) => c.id === activeCategoryTab);
    if (!cat) return true;

    return (
      ach.categoryId === cat.id ||
      ach.id === `ach_cat_${cat.id}` ||
      ach.category?.toLowerCase() === cat.name?.toLowerCase() ||
      ach.title?.toLowerCase().includes(cat.name?.toLowerCase())
    );
  });

  return (
    <div className="page-container" style={{ paddingBottom: '5rem' }}>
      {/* Create Achievement Modal */}
      {isModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 8, 16, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '1.75rem',
              borderRadius: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.4rem' }}>🏅</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Create Focus Achievement</h3>
              </div>
              <button 
                type="button" 
                className="btn btn-ghost btn-icon" 
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAchievement}>
              {/* Badge Title */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Badge Title *
                </label>
                <input
                  type="text"
                  className="input"
                  required
                  placeholder="e.g. Arabic Reading Champion, RHIZAN Sprint Master"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Category & Target Count */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Focus Category *
                  </label>
                  <select
                    className="input"
                    value={newCategoryId}
                    onChange={(e) => {
                      setNewCategoryId(e.target.value);
                      const cat = categories.find((c: any) => c.id === e.target.value);
                      if (cat?.icon) setNewIcon(cat.icon);
                    }}
                    style={{ width: '100%' }}
                  >
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon || '🎯'} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Target Sessions *
                  </label>
                  <input
                    type="number"
                    className="input"
                    min={1}
                    max={100}
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Icon Selector */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Badge Icon
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {PRESET_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewIcon(ic)}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: newIcon === ic ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-input)',
                        border: newIcon === ic ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        cursor: 'pointer'
                      }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Unlocking Criteria Description
                </label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="e.g. Complete 7 focused speaking sessions and log time consistently"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              {/* Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 700 }}
                >
                  Create Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="card" style={{
        background: 'var(--bg-card-header)',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.6rem' }}>🏆</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Routine Mastery & Focus Badges</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '620px' }}>
              Unlock discipline badges by completing routines, logging time across every life pillar, and conquering your personal sprint milestones.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
            >
              <Plus size={15} />
              <span>Create Badge</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCelebrate}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
            >
              <Sparkles size={15} />
              <span>Celebrate</span>
            </button>
          </div>
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

      {/* Category Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.85rem',
        marginBottom: '1.25rem',
        scrollbarWidth: 'none'
      }}>
        <button
          type="button"
          onClick={() => setActiveCategoryTab('all')}
          className={`btn btn-sm ${activeCategoryTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap' }}
        >
          All Badges ({achievements.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveCategoryTab('streaks')}
          className={`btn btn-sm ${activeCategoryTab === 'streaks' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap' }}
        >
          🔥 General Streaks
        </button>

        {categories.map((cat: any) => {
          const catBadgesCount = achievements.filter((a: any) => 
            a.categoryId === cat.id || 
            a.id === `ach_cat_${cat.id}` || 
            a.category?.toLowerCase() === cat.name?.toLowerCase() ||
            a.title?.toLowerCase().includes(cat.name?.toLowerCase())
          ).length;

          const isActive = activeCategoryTab === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryTab(cat.id)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                fontWeight: 700, 
                fontSize: '0.78rem', 
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>{cat.icon || '🎯'}</span>
              <span>{cat.name} ({catBadgesCount})</span>
            </button>
          );
        })}
      </div>

      {/* Badges Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
        gap: '1rem'
      }}>
        {filteredAchievements.map((ach: any) => {
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
                opacity: isUnlocked ? 1 : 0.75,
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
                    {ach.category || 'Focus'}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {isUnlocked ? (
                      <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', gap: '0.2rem' }}>
                        <CheckCircle2 size={11} /> Unlocked
                      </span>
                    ) : (
                      <span className="badge badge-secondary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', gap: '0.2rem' }}>
                        <Lock size={11} /> In Progress
                      </span>
                    )}

                    {ach.isCustom && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => {
                          confirmAction({
                            title: 'Delete Achievement?',
                            message: `Are you sure you want to delete badge "${ach.title}"?`,
                            confirmText: 'Delete Badge',
                            variant: 'danger',
                            onConfirm: () => deleteAchievement(ach.id)
                          });
                        }}
                        style={{ color: '#ef4444', padding: '0.2rem' }}
                        title="Delete Custom Badge"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
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
