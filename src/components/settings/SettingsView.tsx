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
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView = () => {
  const { 
    data, 
    updateProfile, 
    updateChallenge, 
    toggleTheme, 
    toggleSound, 
    addCategory, 
    addProject, 
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
  const [timezone, setTimezone] = useState(profile.timezone || 'Asia/Riyadh (GMT+3)');
  const [challengeName, setChallengeName] = useState(challenge.name || 'PROJECT 90: Master Life Sprint');
  const [challengeStatus, setChallengeStatus] = useState(challenge.status || 'active');

  // Category modal states
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🎯');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  // New project state
  const [selectedCatForProj, setSelectedCatForProj] = useState(categories[0]?.id || 'career');
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      challengeGoal: goal.trim(),
      timezone
    });
    updateChallenge({
      name: challengeName.trim(),
      status: challengeStatus
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      icon: newCatIcon || '🎯',
      color: newCatColor,
      description: 'Custom life category'
    });
    setNewCatName('');
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    addProject(selectedCatForProj, {
      name: newProjName.trim(),
      description: newProjDesc.trim()
    });
    setNewProjName('');
    setNewProjDesc('');
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        handleImport(text);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to parse JSON backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

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
              <span style={{ fontSize: '1.4rem' }}>⚙️</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Settings & Customization</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '580px' }}>
              Configure your profile, 90-day challenge parameters, themes, sound effects, and backup data.
            </p>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* User Profile & Challenge Config */}
        <div className="card">
          <div className="card-header">
            <div>
              <h4 className="card-title">
                <span>👤</span>
                <span>Profile & 90-Day Challenge</span>
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Personalize your sprint identity and targets
              </p>
            </div>
            {saveSuccess && (
              <span className="badge badge-excellent">
                <CheckCircle2 size={12} />
                <span>Saved</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">User Name *</label>
              <input
                type="text"
                className="form-input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sprint Name</label>
              <input
                type="text"
                className="form-input"
                value={challengeName}
                onChange={(e) => setChallengeName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">90-Day Challenge Goal / Mantra</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <input
                  type="text"
                  className="form-input"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Challenge Status</label>
                <select
                  className="form-select"
                  value={challengeStatus}
                  onChange={(e) => setChallengeStatus(e.target.value)}
                >
                  <option value="active">🟢 Active</option>
                  <option value="paused">⏸️ Paused</option>
                  <option value="completed">✅ Completed</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Save Profile Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Preferences & Theme */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Theme & Sound Preferences */}
          <div className="card">
            <h4 className="card-title" style={{ marginBottom: '1rem' }}>
              <span>🎨</span>
              <span>Appearance & Feedback</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Theme toggle row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Color Theme</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Current: {profile.theme === 'light' ? 'Light Mode' : 'Dark Obsidian'}
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={toggleTheme} style={{ gap: '0.4rem' }}>
                  {profile.theme === 'light' ? <Moon size={15} /> : <Sun size={15} color="#f59e0b" />}
                  <span>Toggle to {profile.theme === 'light' ? 'Dark' : 'Light'}</span>
                </button>
              </div>

              {/* Sound effects toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Web Audio Sound Effects</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Uplifting chimes on completing habits and stopping timer
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={toggleSound} style={{ gap: '0.4rem' }}>
                  {profile.soundEnabled !== false ? <Volume2 size={15} color="var(--primary-light)" /> : <VolumeX size={15} color="var(--text-muted)" />}
                  <span>{profile.soundEnabled !== false ? 'Enabled' : 'Muted'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Backup & Data Management */}
          <div className="card">
            <h4 className="card-title" style={{ marginBottom: '1rem' }}>
              <span>💾</span>
              <span>Data Backup & Sync</span>
            </h4>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              All progress is persisted securely in your local browser storage. Export a JSON backup to transfer between devices.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Export */}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleExport}
                style={{ gap: '0.4rem' }}
              >
                <Download size={15} />
                <span>Export JSON Backup</span>
              </button>

              {/* Import */}
              <label className="btn btn-secondary btn-sm" style={{ gap: '0.4rem', cursor: 'pointer' }}>
                <Upload size={15} />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  style={{ display: 'none' }}
                />
              </label>

              {/* Wipe & Reset to Scratch */}
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to wipe all data from scratch? This will reset your database and local state to Day 1 with 0 logs.')) {
                    if (clearAllDataToScratch) {
                      clearAllDataToScratch();
                    } else if (handleReset) {
                      handleReset();
                    }
                  }
                }}
                style={{ gap: '0.4rem', marginLeft: 'auto' }}
              >
                <RotateCcw size={15} />
                <span>Wipe & Reset All Data to Scratch (Day 1)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
