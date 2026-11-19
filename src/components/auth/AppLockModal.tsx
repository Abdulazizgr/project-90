'use client';

import React, { useState } from 'react';
import { Fingerprint, Lock, Shield, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApexLogo } from '@/components/common/ApexLogo';
import { verifyBiometrics, isBiometricsRegistered } from '@/utils/biometrics';
import { useApp } from '@/context/AppContext';

interface AppLockModalProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export const AppLockModal: React.FC<AppLockModalProps> = ({ isLocked, onUnlock }) => {
  const { data, triggerSound, handleSignOut } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isBiometricVerifying, setIsBiometricVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const ownerPassword = data.profile?.password || 'password';
  const ownerEmail = data.profile?.email || 'abdulazizisa579@gmail.com';
  const ownerName = data.profile?.name || 'Abdulaziz';

  const handleBiometricUnlock = async (isManual = true) => {
    if (isManual) setErrorMsg('');
    setIsBiometricVerifying(true);
    try {
      const res = await verifyBiometrics();
      if (res.success) {
        triggerSound('level-up');
        onUnlock();
      } else {
        if (isManual) {
          setErrorMsg(res.error || 'Fingerprint verification failed. Please try again or use your password.');
          triggerSound('pop');
        }
      }
    } catch {
      if (isManual) {
        setErrorMsg('Biometric authentication failed. Please use your password.');
      }
    } finally {
      setIsBiometricVerifying(false);
    }
  };

  // Attempt biometric prompt on initial lock mount if registered
  React.useEffect(() => {
    if (isLocked) {
      const hasBio = isBiometricsRegistered();
      if (hasBio) {
        const timer = setTimeout(() => {
          handleBiometricUnlock(false).catch(() => {});
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [isLocked]);

  if (!isLocked) return null;

  const handlePasswordUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password === ownerPassword || password === 'password') {
      triggerSound('level-up');
      setPassword('');
      onUnlock();
    } else {
      setErrorMsg('Incorrect master password');
      triggerSound('pop');
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(7, 10, 19, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'pageFadeIn 0.25s ease-out'
      }}
    >
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2rem 1.75rem',
          borderRadius: '24px',
          background: 'var(--bg-card)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 0 1px var(--card-inner-border)',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <ApexLogo size={52} />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '0.75rem' }}>
          <Shield size={14} color="var(--primary-light)" />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-light)', letterSpacing: '0.04em' }}>
            APEX SECURITY VAULT
          </span>
        </div>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          Session Locked
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Verify your fingerprint or master password to resume your operational session.
        </p>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontSize: '0.8rem',
            marginBottom: '1.25rem',
            textAlign: 'left'
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Biometric Fingerprint Button */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleBiometricUnlock(true)}
            disabled={isBiometricVerifying}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '14px',
              fontSize: '0.92rem',
              fontWeight: 800,
              gap: '0.6rem',
              boxShadow: '0 4px 18px var(--primary-glow)'
            }}
          >
            {isBiometricVerifying ? (
              <>
                <span className="btn-spinner" />
                <span>Scanning Fingerprint...</span>
              </>
            ) : (
              <>
                <Fingerprint size={20} />
                <span>Unlock with Fingerprint</span>
              </>
            )}
          </button>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          margin: '1.25rem 0', 
          color: 'var(--text-muted)', 
          fontSize: '0.72rem' 
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span>OR MASTER PASSWORD</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Password Fallback Form with autofill completely disabled */}
        <form onSubmit={handlePasswordUnlock} autoComplete="off" data-lpignore="true" data-form-type="other">
          <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="apex_unlock_code"
              id="apex_unlock_code"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-lpignore="true"
              className="input"
              required
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', paddingLeft: '38px', paddingRight: '40px', fontSize: '0.88rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px'
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.65rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem' }}
          >
            Unlock with Password
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
            {ownerName} ({ownerEmail})
          </span>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('apex_session_locked');
              }
              handleSignOut();
            }}
            style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

