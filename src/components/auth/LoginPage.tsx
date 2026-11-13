'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff,
  ShieldCheck,
  Clock,
  Calendar,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import { authClient } from '@/lib/auth-client';

export const LoginPage = ({ onLoginSuccess }: { onLoginSuccess?: () => void }) => {
  const { 
    data, 
    setData,
    toggleTheme, 
    triggerSound, 
    setIsAuthenticated 
  } = useApp();

  const [identifier, setIdentifier] = useState(data.profile?.email || 'abdulaziz');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const currentTheme = data.profile?.theme || 'dark';

  const completeLogin = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('p19_authenticated', 'true');
    }
    if (setIsAuthenticated) setIsAuthenticated(true);
    if (onLoginSuccess) onLoginSuccess();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your email or username');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try Better-Auth if identifier looks like an email
      let remoteSuccess = false;
      if (identifier.includes('@') && (authClient as any)?.signIn?.email) {
        try {
          const { error } = await (authClient as any).signIn.email({
            email: identifier.trim(),
            password: password.trim(),
          });
          if (!error) {
            remoteSuccess = true;
          }
        } catch (authErr) {
          console.debug('Better-auth remote check skipped, falling back to owner password:', authErr);
        }
      }

      // 2. Owner password verification
      // If the owner hasn't set a password yet, the first login password becomes the owner password!
      const currentStoredPassword = data.profile?.password;

      if (!currentStoredPassword) {
        // First-time password setup for owner
        setData((prev: any) => ({
          ...prev,
          profile: {
            ...prev.profile,
            email: identifier.trim(),
            password: password.trim()
          }
        }));
      } else if (!remoteSuccess && currentStoredPassword !== password.trim()) {
        setErrorMsg('Incorrect password. Access is restricted to the authorized owner only.');
        setIsLoading(false);
        triggerSound('pop');
        return;
      }

      triggerSound('level-up');
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      setSuccessMsg('Welcome back! Loading your dashboard...');

      setTimeout(() => {
        completeLogin();
      }, 500);
    } catch (err: any) {
      console.error('Sign in error:', err);
      // Fallback
      completeLogin();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.18) 0%, var(--bg-app) 70%)',
      padding: '1.5rem 1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '350px',
        background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.25), transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Theme toggle */}
      <div style={{ position: 'absolute', top: '16px', right: '18px', zIndex: 10 }}>
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{ padding: '0.4rem' }}
        >
          {currentTheme === 'dark' ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} color="#6366f1" />}
        </button>
      </div>

      <div style={{
        maxWidth: '430px',
        width: '100%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.25rem 2rem',
        boxShadow: '0 20px 45px rgba(0,0,0,0.4), 0 0 40px rgba(99, 102, 241, 0.12)',
        position: 'relative',
        zIndex: 1,
        animation: 'scaleUp 0.3s ease'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.9rem',
            boxShadow: '0 8px 24px var(--primary-glow)'
          }}>
            <Sparkles size={26} color="#ffffff" />
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.3rem' }}>
            Apex OS: Personal Management System
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Personal Management OS
          </p>

          <div style={{ marginTop: '0.65rem' }}>
            <span className="badge" style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary-light)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.65rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <ShieldCheck size={13} />
              <span>Private Owner Access • Daily Execution</span>
            </span>
          </div>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontSize: '0.8rem',
            marginBottom: '1rem'
          }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            fontSize: '0.8rem',
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSignIn}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Email or Username
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input"
                required
                placeholder="e.g. 0911000000 or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={{ width: '100%', paddingLeft: '38px', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.35rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '38px', paddingRight: '40px', fontSize: '0.9rem' }}
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
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              gap: '0.5rem',
              fontWeight: 800,
              fontSize: '0.92rem',
              padding: '0.75rem',
              justifyContent: 'center'
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn size={17} />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Feature Highlights Footer */}
      <div style={{
        marginTop: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={14} color="var(--primary-light)" />
          <span>24-Hour Time Tracker</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Layers size={14} color="#10b981" />
          <span>Daily Routines & Tasks</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Calendar size={14} color="#f59e0b" />
          <span>Monthly Calendar & Reports</span>
        </div>
      </div>
    </div>
  );
};
