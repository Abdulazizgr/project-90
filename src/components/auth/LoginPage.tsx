import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  LogIn, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Scale, 
  Calendar,
  Sun,
  Moon,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { authClient } from '@/lib/auth-client';
import { useApp } from '@/context/AppContext';

export const LoginPage = ({ onLoginSuccess }: { onLoginSuccess?: () => void }) => {
  const { 
    data, 
    toggleTheme, 
    triggerSound, 
    setIsAuthenticated, 
    loadCleanUserAccount 
  } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const currentTheme = data.profile?.theme || 'dark';

  const completeLogin = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('p90_logged_in', 'true');
    }
    if (setIsAuthenticated) setIsAuthenticated(true);
    if (onLoginSuccess) onLoginSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await (authClient as any).signUp.email({
          name: name.trim() || 'User',
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          setErrorMsg(error.message || 'Registration failed. Please try again.');
          setIsLoading(false);
          return;
        }

        triggerSound('fanfare');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setSuccessMsg('Account created successfully! Welcome to Day 1.');
        
        if (loadCleanUserAccount) {
          await loadCleanUserAccount({ name: name.trim() || 'User', email: email.trim() });
        }
        setTimeout(() => {
          completeLogin();
        }, 800);
      } else {
        const { error } = await (authClient as any).signIn.email({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          setErrorMsg(error.message || 'Invalid email or password.');
          setIsLoading(false);
          return;
        }

        triggerSound('habit-complete');
        setSuccessMsg('Signed in successfully! Loading your dashboard...');

        setTimeout(() => {
          completeLogin();
        }, 600);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      // Seamless local fallback if offline or DB syncing
      if (mode === 'signup' && loadCleanUserAccount) {
        await loadCleanUserAccount({ name: name.trim() || 'User', email: email.trim() });
      } else if (loadCleanUserAccount) {
        await loadCleanUserAccount({ name: email.split('@')[0] || 'User', email: email.trim() });
      }
      setSuccessMsg('Welcome to Day 1!');
      setTimeout(() => {
        completeLogin();
      }, 700);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestEntry = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (loadCleanUserAccount) {
        await loadCleanUserAccount({ name: 'Guest User', email: 'guest_user' });
      }
      triggerSound('fanfare');
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
      setSuccessMsg('Welcome! Starting clean Day 1 experience...');
      setTimeout(() => {
        completeLogin();
      }, 600);
    } catch (e) {
      completeLogin();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.18) 0%, var(--bg-app) 70%)',
      padding: '2.5rem 1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background decoration */}
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
      <div style={{ position: 'absolute', top: '20px', right: '24px', zIndex: 10 }}>
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {currentTheme === 'dark' ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#6366f1" />}
        </button>
      </div>

      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem 2.25rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.35), 0 0 40px rgba(99, 102, 241, 0.1)',
        position: 'relative',
        zIndex: 1,
        animation: 'scaleUp 0.3s ease'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 24px var(--primary-glow)'
          }}>
            <Sparkles size={28} color="#ffffff" />
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.4rem' }}>
            PROJECT <span style={{ color: 'var(--primary-light)' }}>90</span>
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Your 90-Day Life Operating System
          </p>

          {/* 5 Pillar Chips */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
            <span className="badge badge-spiritual" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>🕌 Spiritual</span>
            <span className="badge badge-digital" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>📱 Digital</span>
            <span className="badge badge-personal" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>👤 Personal</span>
            <span className="badge badge-health" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>💪 Health</span>
            <span className="badge badge-career" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>💻 Career</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-input)', padding: '0.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, fontSize: '0.85rem', fontWeight: 700 }}
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'signup' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, fontSize: '0.85rem', fontWeight: 700 }}
            onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Create Account
          </button>
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
            fontSize: '0.82rem',
            marginBottom: '1rem'
          }}>
            <AlertCircle size={16} />
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
            fontSize: '0.82rem',
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Standard Auth Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
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
                  padding: '4px'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.25rem', gap: '0.5rem', fontWeight: 800 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn size={18} />
                <span>Sign In to Dashboard</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Day 1 Account</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          margin: '1.35rem 0',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          fontWeight: 700
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span>Or Quick Access</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Guest Access Option */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleGuestEntry}
          disabled={isLoading}
          style={{
            width: '100%',
            gap: '0.5rem',
            padding: '0.75rem',
            fontSize: '0.88rem',
            fontWeight: 700
          }}
        >
          <Zap size={16} color="var(--primary-light)" />
          <span>Continue as Guest (Start Fresh Day 1)</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Feature Pillars Highlights Bar */}
      <div style={{
        marginTop: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Scale size={15} color="var(--primary-light)" />
          <span>Anti-Burnout Balance Engine</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={15} color="#10b981" />
          <span>Clockify Time Tracker</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Calendar size={15} color="#f59e0b" />
          <span>90-Day Sprint Roadmaps</span>
        </div>
      </div>
    </div>
  );
};
