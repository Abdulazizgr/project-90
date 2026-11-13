'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Layers, 
  Plus, 
  Trash2,
  Sparkles,
  Calendar,
  Clock,
  Flame,
  Target
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const SettingsView = () => {
  const { 
    data, 
    todayStr,
    updateProfile, 
    updateChallenge, 
    createNewChallenge,
    toggleTheme, 
    toggleSound, 
    addCategory, 
    deleteCategory, 
    handleExport, 
    handleImport, 
    handleReset,
    clearAllDataToScratch,
    loadCleanUserAccount 
  } = useApp();

  const profile = data.profile || {};
  const challenge = data.challenge || {};
  const categories = data.categories || [];

  const [name, setName] = useState(profile.name || 'Abdulaziz');
  const [goal, setGoal] = useState(profile.challengeGoal || '');
  const [timezone, setTimezone] = useState(profile.timezone || 'Africa/Addis_Ababa (GMT+3)');

  // Challenge Configuration states
  const [challengeName, setChallengeName] = useState(challenge.name || 'Apex OS');
  const [startDate, setStartDate] = useState(challenge.startDate || todayStr);
  const [durationDays, setDurationDays] = useState(challenge.totalDurationDays || 19);
  const [challengeStatus, setChallengeStatus] = useState(challenge.status || 'active');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [challengeSuccess, setChallengeSuccess] = useState(false);

  // New Category states
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🎯');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      challengeGoal: goal.trim(),
      timezone
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    updateChallenge({
      name: challengeName.trim(),
      startDate,
      totalDurationDays: Number(durationDays) || 19,
      status: challengeStatus as any
    });
    setChallengeSuccess(true);
    setTimeout(() => setChallengeSuccess(false), 2500);
  };

  const handleStartBrandNewChallenge = () => {
    if (confirm(`Start a brand new challenge "${challengeName}" starting ${startDate} for ${durationDays} days?`)) {
      createNewChallenge(challengeName.trim(), startDate, Number(durationDays) || 19);
      setChallengeSuccess(true);
      setTimeout(() => setChallengeSuccess(false), 2500);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      icon: newCatIcon || '🎯',
      color: newCatColor,
      description: 'Custom life focus category'
    });
    setNewCatName('');
  };

  const handleFileImport = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        handleImport(text);
        alert('Data imported successfully!');
      } catch (err: any) {
        alert('Failed to parse JSON backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Compute challenge end date preview
  const sDate = new Date(startDate || todayStr);
  const eDate = new Date(sDate);
  eDate.setDate(sDate.getDate() + ((Number(durationDays) || 19) - 1));
  const endDatePreview = eDate.toISOString().split('T')[0];

  return (
    <div className="page-container" style={{ paddingBottom: '5rem' }}>
      {/* Header Deck */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid var(--border-color)',
        marginBottom: '1.25rem',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Settings size={22} color="var(--primary-light)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Settings & Challenge Configuration</h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Configure your challenge duration, start date, profile, themes, and backup your personal management records.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
        {/* CHALLENGE CONFIGURATION (Configurable duration, start date, challenge name) */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Target size={18} color="var(--primary-light)" />
                <span>Challenge Configuration</span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Customize challenge name, start date, and length (19, 30, 90 days)
              </p>
            </div>
            {challengeSuccess && (
              <span className="badge badge-excellent" style={{ fontSize: '0.7rem' }}>
                <CheckCircle2 size={12} /> Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSaveChallenge}>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Challenge Name
              </label>
              <input
                type="text"
                className="input"
                value={challengeName}
                onChange={(e) => setChallengeName(e.target.value)}
                placeholder="e.g. Apex OS, Sprint Alpha, Daily Mastery"
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  className="input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Duration (Days)
                </label>
                <input
                  type="number"
                  className="input"
                  min={1}
                  max={365}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  required
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Quick Duration Buttons */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem' }}>
              {[19, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`btn btn-sm ${Number(durationDays) === d ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDurationDays(d)}
                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                >
                  {d} Days
                </button>
              ))}
            </div>

            <div style={{
              padding: '0.65rem 0.85rem',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Current: Day {challenge.currentDay || 1} of {durationDays}</span>
              <span>Ends: <strong style={{ color: 'var(--text-primary)' }}>{endDatePreview}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleStartBrandNewChallenge}
              >
                Reset to Day 1
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 700 }}
              >
                <Save size={14} /> Update Challenge
              </button>
            </div>
          </form>
        </div>

        {/* USER PROFILE */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>User Profile & Goal</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Personal identity and timezone</p>
            </div>
            {saveSuccess && (
              <span className="badge badge-excellent" style={{ fontSize: '0.7rem' }}>
                <CheckCircle2 size={12} /> Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile}>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                User Name *
              </label>
              <input
                type="text"
                className="input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Primary Goal / Purpose
              </label>
              <textarea
                className="input"
                rows={2}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Master daily discipline across spiritual, RHIZAN engineering, and physical health"
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                System Timezone
              </label>
              <input
                type="text"
                className="input"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                Configured for Africa/Addis_Ababa (East Africa Time, UTC+3)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                <Save size={14} /> Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* APPEARANCE & PREFERENCES */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Appearance & Sound</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.65rem 0.85rem',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>Theme Mode</strong>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                  Current: {data.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={toggleTheme}
                style={{ gap: '0.35rem' }}
              >
                {data.theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                <span>Toggle Theme</span>
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.65rem 0.85rem',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>Audio Feedback</strong>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                  Completion sound effects: {data.soundEnabled ? 'Enabled' : 'Muted'}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={toggleSound}
                style={{ gap: '0.35rem' }}
              >
                {data.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span>{data.soundEnabled ? 'Mute' : 'Enable'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* BACKUP & DATA MANAGEMENT */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Backup & Recovery</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleExport}
                style={{ flex: 1, gap: '0.35rem', fontWeight: 700 }}
              >
                <Download size={14} />
                <span>Export JSON Backup</span>
              </button>

              <label className="btn btn-secondary btn-sm" style={{ flex: 1, gap: '0.35rem', fontWeight: 700, cursor: 'pointer', margin: 0 }}>
                <Upload size={14} />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div style={{
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={loadCleanUserAccount}
                style={{ flex: 1, fontSize: '0.75rem' }}
              >
                Load Default Templates
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleReset}
                style={{ color: '#ef4444', fontSize: '0.75rem' }}
              >
                Reset Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
