'use client';

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Layers, 
  Sparkles,
  SunMedium,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface CategoryManagerModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const PRESET_COLORS = [
  '#10b981', '#f59e0b', '#a855f7', '#f43f5e', '#06b6d4', 
  '#6366f1', '#3b82f6', '#ec4899', '#84cc16', '#14b8a6'
];

const PRESET_EMOJIS = [
  '🕌', '💪', '👤', '⚡', '📱', '📖', '🧠', '💼', '🎯', 
  '🏃', '🧘', '💧', '🥗', '💻', '🎨', '🌱', '☀️', '🌙'
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose }) => {
  const { 
    data, 
    addPillar, 
    updatePillar, 
    deletePillar,
    activeModal,
    setActiveModal,
    triggerSound
  } = useApp();

  const isModalOpen = isOpen || activeModal === 'pillar_modal' || activeModal === 'category_manager';

  const categories = data.categories || [];
  const routines = data.routines || [];

  const [isCreating, setIsCreating] = useState(false);
  const [editingPillarId, setEditingPillarId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#6366f1');
  const [description, setDescription] = useState('');

  if (!isModalOpen) return null;

  const handleClose = () => {
    if (onClose) onClose();
    setActiveModal(null);
    setIsCreating(false);
    setEditingPillarId(null);
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingPillarId(null);
    setName('');
    setIcon('🎯');
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setDescription('');
  };

  const handleStartEdit = (pillar: any) => {
    setEditingPillarId(pillar.id);
    setIsCreating(false);
    setName(pillar.name);
    setIcon(pillar.icon || '🎯');
    setColor(pillar.color || '#6366f1');
    setDescription(pillar.description || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPillarId) {
      updatePillar(editingPillarId, {
        name: name.trim(),
        icon,
        color,
        description: description.trim()
      });
      setEditingPillarId(null);
    } else {
      addPillar({
        name: name.trim(),
        icon,
        color,
        description: description.trim()
      });
      setIsCreating(false);
    }
  };

  const handleDelete = (pillarId: string, pillarName: string) => {
    const routineCount = routines.filter((r: any) => r.categoryId === pillarId).length;
    const msg = routineCount > 0
      ? `Delete "${pillarName}"? This will also remove the ${routineCount} routine(s) attached to it.`
      : `Delete focus pillar "${pillarName}"?`;

    if (confirm(msg)) {
      deletePillar(pillarId);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '620px',
          width: '92%',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-xl)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Layers size={20} color="var(--primary-light)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Manage Focus Pillars</h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Register the life dimensions and focus areas that matter to you
            </p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Add / Edit Form Card */}
        {(isCreating || editingPillarId) ? (
          <form 
            onSubmit={handleSave}
            style={{
              background: 'var(--bg-input)',
              border: `1px solid ${color}40`,
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>
              {editingPillarId ? 'Edit Focus Pillar' : 'Register New Focus Pillar'}
            </h4>

            {/* Name & Emoji */}
            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '0.65rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>Icon</label>
                <input
                  type="text"
                  className="form-control"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  style={{ textAlign: 'center', fontSize: '1.3rem', padding: '0.45rem' }}
                  maxLength={4}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>Pillar Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arabic & Quran, Fitness, Startup"
                  required
                />
              </div>
            </div>

            {/* Emoji Quick Picker */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                Quick Icons:
              </label>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {PRESET_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    style={{
                      background: icon === em ? 'var(--bg-surface)' : 'transparent',
                      border: icon === em ? '2px solid var(--primary-light)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.25rem 0.45rem',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                Theme Color:
              </label>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: c,
                      border: color === c ? '3px solid #ffffff' : 'none',
                      boxShadow: color === c ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>
                Description / Purpose
              </label>
              <input
                type="text"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is your long-term vision for this focus area?"
              />
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setIsCreating(false);
                  setEditingPillarId(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 700, padding: '0.45rem 1rem' }}
              >
                {editingPillarId ? 'Save Pillar' : 'Register Pillar'}
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleStartCreate}
            style={{
              width: '100%',
              marginBottom: '1.5rem',
              padding: '0.65rem',
              fontWeight: 700,
              gap: '0.4rem'
            }}
          >
            <Plus size={16} />
            <span>Register New Focus Pillar</span>
          </button>
        )}

        {/* List of Registered Pillars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Focus Pillars ({categories.length})
          </h4>

          {categories.map((pillar: any) => {
            const pillarRoutines = routines.filter((r: any) => r.categoryId === pillar.id);
            const pillarColor = pillar.color || '#6366f1';

            return (
              <div
                key={pillar.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-input)',
                  borderLeft: `4px solid ${pillarColor}`,
                  border: `1px solid var(--border-color)`,
                  borderLeftWidth: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: `${pillarColor}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    {pillar.icon || '🎯'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {pillar.name}
                    </h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {pillarRoutines.length} {pillarRoutines.length === 1 ? 'routine' : 'routines'} attached
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => handleStartEdit(pillar)}
                    title="Edit Pillar"
                    style={{ padding: '0.35rem' }}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => handleDelete(pillar.id, pillar.name)}
                    title="Delete Pillar"
                    style={{ padding: '0.35rem', color: '#ef4444' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
