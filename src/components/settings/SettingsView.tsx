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
  Target,
  User,
  Shield,
  Palette,
  Calendar,
  Fingerprint,
  Lock,
  Wallet,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { registerBiometrics, checkBiometricSupport, isBiometricsRegistered } from '@/utils/biometrics';

export const SettingsView = () => {
  const { 
    data, 
    todayStr,
    updateProfile, 
    updateChallenge, 
    createNewChallenge,
    toggleTheme, 
    toggleSound, 
    handleExport, 
    handleImport, 
    handleReset,
    loadCleanUserAccount,
    confirmAction 
  } = useApp();

  const profile = data.profile || {};
  const challenge = data.challenge || {};

  const [name, setName] = useState(profile.name || 'Abdulaziz');
  const [email, setEmail] = useState(profile.email || 'abdulazizisa579@gmail.com');
  const [password, setPassword] = useState(profile.password || 'password');
  const [goal, setGoal] = useState(profile.challengeGoal || '');
  const [timezone, setTimezone] = useState(profile.timezone || 'Africa/Addis_Ababa (GMT+3)');
  const [currency, setCurrency] = useState(profile.currency || 'ETB');
  const [autoLockOnExit, setAutoLockOnExit] = useState(profile.autoLockOnExit !== false);

  const [isRegisteringBio, setIsRegisteringBio] = useState(false);
  const [bioStatusMsg, setBioStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  // Challenge Configuration states
  const [challengeName, setChallengeName] = useState(challenge.name || 'Apex OS');
  const [startDate, setStartDate] = useState(challenge.startDate || todayStr);
  const [durationDays, setDurationDays] = useState(
    challenge.totalDurationDays && Number(challenge.totalDurationDays) !== 19
      ? challenge.totalDurationDays
      : 90
  );
  const [challengeStatus, setChallengeStatus] = useState(challenge.status || 'active');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [challengeSuccess, setChallengeSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingChallenge, setIsSavingChallenge] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isSoundEnabled = data.profile?.soundEnabled !== false && data.soundEnabled !== false;

  const handleRegisterBiometrics = async () => {
    setIsRegisteringBio(true);
    setBioStatusMsg(null);
    try {
      const res = await registerBiometrics(name || email || 'Abdulaziz');
      if (res.success) {
        updateProfile({ biometricsEnabled: true });
        setBioStatusMsg({ text: 'Fingerprint enrolled successfully! You can now unlock using your fingerprint sensor.' });
      } else {
        setBioStatusMsg({ text: res.error || 'Failed to enroll biometric fingerprint. Please try again.', isError: true });
      }
    } catch (err: any) {
      setBioStatusMsg({ text: err.message || 'Biometric authentication was cancelled or unavailable.', isError: true });
    } finally {
      setIsRegisteringBio(false);
      setTimeout(() => setBioStatusMsg(null), 6000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await new Promise((r) => setTimeout(r, 200));
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      challengeGoal: goal.trim(),
      timezone,
      currency: currency.trim() || 'ETB',
      autoLockOnExit
    });
    setIsSavingProfile(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingChallenge(true);
    await new Promise((r) => setTimeout(r, 200));
    updateChallenge({
      name: challengeName.trim(),
      startDate,
      totalDurationDays: Number(durationDays) || 90,
      status: challengeStatus as any
    });
    setIsSavingChallenge(false);
    setChallengeSuccess(true);
    setTimeout(() => setChallengeSuccess(false), 2500);
  };

  const triggerResetToDay1 = () => {
    confirmAction({
      title: 'Reset Challenge to Day 1?',
      message: `Are you sure you want to restart "${challengeName}" to Day 1 (duration: ${durationDays} days starting ${startDate})? Your existing routine logs and completion history will be preserved.`,
      confirmText: 'Reset to Day 1',
      variant: 'warning',
      onConfirm: () => {
        createNewChallenge(challengeName.trim(), startDate, Number(durationDays) || 30);
        setChallengeSuccess(true);
        setTimeout(() => setChallengeSuccess(false), 2500);
      }
    });
  };

  const triggerLoadTemplates = () => {
    confirmAction({
      title: 'Load Default Templates?',
      message: 'This will restore the standard suite of daily routines, sample tasks, and core life categories. Any custom tasks you created will remain untouched.',
      confirmText: 'Load Templates',
      variant: 'primary',
      onConfirm: () => {
        loadCleanUserAccount();
      }
    });
  };

  const triggerResetAccount = () => {
    confirmAction({
      title: 'Permanently Reset Account?',
      message: 'CRITICAL WARNING: This will permanently wipe all your logged data, tasks, habits, daily reflections, and time entries. This action cannot be undone.',
      confirmText: 'Permanently Reset',
      variant: 'danger',
      onConfirm: () => {
        handleReset();
      }
    });
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
  eDate.setDate(sDate.getDate() + ((Number(durationDays) || 30) - 1));
  const endDatePreview = eDate.toISOString().split('T')[0];

  return (
    <div className="page-container" style={{ paddingBottom: '5rem' }}>
      {/* Header Deck */}
      <div className="card" style={{
        background: 'var(--bg-card-header)',
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
              Configure your challenge duration, start date, profile, themes, sound feedback, and backup your personal records.
            </p>
          </div>
        </div>
      </div>

      {/* ROW 1: Challenge Configuration (Full Row) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="card" style={{ padding: '1.35rem', borderLeft: '4px solid var(--primary-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Target size={19} color="var(--primary-light)" />
                <span>Challenge Configuration</span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Customize challenge title, start date, and length (30, 60, 90 days)
              </p>
            </div>
            {challengeSuccess && (
              <span className="badge badge-excellent" style={{ fontSize: '0.72rem' }}>
                <CheckCircle2 size={13} /> Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSaveChallenge}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
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

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Start Date
                </label>
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    className="input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.currentTarget as any).showPicker?.();
                      } catch {}
                    }}
                    required
                  />
                  <div className="date-input-icon">
                    <Calendar size={18} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
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

            {/* Quick Duration Buttons (30, 60, 90) & Live calculation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.15rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Quick Presets:
                </span>
                {[30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`btn btn-sm ${Number(durationDays) === d ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setDurationDays(d)}
                    style={{ fontSize: '0.74rem', padding: '0.28rem 0.75rem', fontWeight: 700 }}
                  >
                    {d} Days
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <span>Progress: <strong style={{ color: 'var(--text-primary)' }}>Day {challenge.currentDay || 1} of {durationDays}</strong></span>
                <span>Ends: <strong style={{ color: 'var(--primary-light)' }}>{endDatePreview}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={triggerResetToDay1}
                style={{ fontWeight: 600 }}
              >
                <RotateCcw size={14} /> Reset to Day 1
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isSavingChallenge}
                style={{ fontWeight: 700 }}
              >
                {isSavingChallenge ? (
                  <>
                    <span className="btn-spinner" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Update Challenge</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ROW 2: User Profile & Goal (Full Row) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <User size={19} color="var(--primary-light)" />
                <span>User Profile & Primary Mission</span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Personal credentials, target timezone, and central life purpose
              </p>
            </div>
            {saveSuccess && (
              <span className="badge badge-excellent" style={{ fontSize: '0.72rem' }}>
                <CheckCircle2 size={13} /> Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
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

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Owner Email / Login ID *
                </label>
                <input
                  type="email"
                  className="input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Login Password *
                </label>
                <input
                  type="text"
                  className="input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '1.15rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Primary Mission / Purpose
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

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  System Timezone
                </label>
                <input
                  type="text"
                  className="input"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  style={{ width: '100%', marginBottom: '0.25rem' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Configured for Africa/Addis_Ababa (East Africa Time, UTC+3)
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Primary Financial Currency
                </label>
                <input
                  type="text"
                  className="input"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="e.g. ETB, USD, EUR"
                  style={{ width: '100%', marginBottom: '0.25rem' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Used across Money & Expenses tracker
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.85rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSavingProfile}
                style={{ fontWeight: 800, width: '100%', maxWidth: '240px', justifyContent: 'center', padding: '0.65rem 1.25rem' }}
              >
                {isSavingProfile ? (
                  <>
                    <span className="btn-spinner" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ROW 3: Biometric Security & Hardware Vault */}
      <div className="card" style={{ padding: '1.35rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-primary)' }}>
                <Fingerprint size={20} color="var(--primary-light)" />
                <span>Biometric Security & Vault</span>
              </h3>
              <span 
                className="badge"
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '20px',
                  background: profile.biometricsEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                  color: profile.biometricsEnabled ? '#10b981' : 'var(--primary-light)',
                  border: profile.biometricsEnabled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)'
                }}
              >
                {profile.biometricsEnabled ? 'Biometrics Enrolled' : 'Sensor Ready'}
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              Hardware-backed fingerprint / Face ID verification and banking-grade session auto-lock
            </p>
          </div>
        </div>

        {bioStatusMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: bioStatusMsg.isError ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            color: bioStatusMsg.isError ? '#ef4444' : '#10b981',
            border: `1px solid ${bioStatusMsg.isError ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`
          }}>
            {bioStatusMsg.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{bioStatusMsg.text}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '0.85rem' }}>
          {/* Fingerprint Sensor Action */}
          <div className="settings-tile-stacked">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: profile.biometricsEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                color: profile.biometricsEnabled ? '#10b981' : 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Fingerprint size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                  Phone / PC Biometric Sensor
                </strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.35, display: 'block' }}>
                  WebAuthn (Android Fingerprint, iOS Face ID / Touch ID, Windows Hello)
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleRegisterBiometrics}
              disabled={isRegisteringBio}
              style={{ width: '100%', justifyContent: 'center', fontWeight: 700, padding: '0.55rem' }}
            >
              {isRegisteringBio ? (
                <>
                  <span className="btn-spinner" />
                  <span>Scanning Sensor...</span>
                </>
              ) : (
                <>
                  <Fingerprint size={15} color="var(--primary-light)" />
                  <span>{profile.biometricsEnabled ? 'Test / Re-enroll Biometrics' : 'Enroll Biometrics Now'}</span>
                </>
              )}
            </button>
          </div>

          {/* Auto Lock on App Exit Toggle */}
          <div className="settings-tile">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: autoLockOnExit ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: autoLockOnExit ? 'var(--primary-light)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Lock size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    Auto-Lock on App Exit
                  </strong>
                  <span className="badge" style={{
                    fontSize: '0.64rem',
                    padding: '0.12rem 0.45rem',
                    background: autoLockOnExit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                    color: autoLockOnExit ? '#10b981' : 'var(--text-muted)',
                    border: autoLockOnExit ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)'
                  }}>
                    {autoLockOnExit ? 'Active' : 'Off'}
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0', lineHeight: 1.35 }}>
                  Locks instantly when leaving or minimizing the app (Banking style)
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={autoLockOnExit}
              className={`toggle-switch ${autoLockOnExit ? 'active' : ''}`}
              onClick={() => {
                const nextVal = !autoLockOnExit;
                setAutoLockOnExit(nextVal);
                updateProfile({ autoLockOnExit: nextVal });
              }}
            >
              <span className="toggle-switch-thumb" />
            </button>
          </div>
        </div>
      </div>

      {/* ROW 4: Appearance & Sound + Backup & Recovery in One Row (2 Columns) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', 
        gap: '1.25rem', 
        alignItems: 'stretch' 
      }}>
        {/* Card 3: Appearance & Sound */}
        <div className="card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Palette size={19} color="var(--primary-light)" />
              <span>Appearance & Sound</span>
            </h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '1.15rem' }}>
              Theme customization and audio completion chimes
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Theme Mode Toggle */}
              <div className="settings-tile">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: data.theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: data.theme === 'dark' ? 'var(--primary-light)' : '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {data.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>Theme Mode</strong>
                      <span className="badge" style={{ fontSize: '0.64rem', background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                        {data.theme === 'dark' ? 'Dark' : 'Light'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                      Switch between dark & light themes
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.42rem 0.75rem',
                    borderRadius: '20px',
                    background: data.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  {data.theme === 'dark' ? (
                    <>
                      <Sun size={14} color="#f59e0b" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon size={14} color="var(--primary-light)" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              </div>

              {/* Audio Feedback Toggle */}
              <div className="settings-tile">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: isSoundEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: isSoundEnabled ? '#10b981' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>Audio Feedback</strong>
                      <span 
                        className="badge" 
                        style={{ 
                          fontSize: '0.64rem', 
                          fontWeight: 700,
                          padding: '0.12rem 0.45rem',
                          background: isSoundEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                          color: isSoundEnabled ? '#10b981' : 'var(--text-muted)',
                          border: isSoundEnabled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)'
                        }}
                      >
                        {isSoundEnabled ? 'On' : 'Muted'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                      Completion chimes & routine audio cues
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isSoundEnabled}
                  className={`toggle-switch ${isSoundEnabled ? 'active-success' : ''}`}
                  onClick={toggleSound}
                >
                  <span className="toggle-switch-thumb" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Backup & Recovery */}
        <div className="card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Shield size={19} color="var(--primary-light)" />
              <span>Backup & Recovery</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.15rem' }}>
              Export snapshots, restore backups, or reset your operational data
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    setIsExporting(true);
                    await new Promise((r) => setTimeout(r, 200));
                    handleExport();
                    setIsExporting(false);
                  }}
                  disabled={isExporting}
                  style={{ flex: 1, gap: '0.4rem', fontWeight: 700, minWidth: '135px' }}
                >
                  {isExporting ? (
                    <>
                      <span className="btn-spinner" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>Export Backup</span>
                    </>
                  )}
                </button>

                <label 
                  className="btn btn-secondary btn-sm" 
                  style={{ flex: 1, gap: '0.4rem', fontWeight: 700, cursor: 'pointer', margin: 0, minWidth: '135px' }}
                >
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
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
                gap: '0.6rem'
              }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={triggerLoadTemplates}
                  style={{ fontSize: '0.75rem', fontWeight: 600, width: '100%', justifyContent: 'center' }}
                >
                  Load Default Templates
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={triggerResetAccount}
                  style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, width: '100%', justifyContent: 'center' }}
                >
                  Reset Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
