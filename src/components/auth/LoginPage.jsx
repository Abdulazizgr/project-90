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
  Flame, 
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

export const LoginPage = ({ onLoginSuccess }) => {
  const { 
    data, 
    updateProfile, 
    toggleTheme, 
    triggerSound, 
    setIsAuthenticated, 
    loadDemoAccount, 
    loadCleanUserAccount 
  } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
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

  const handleStandardAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { data: resData, error } = await authClient.signUp.email({
          name: name.trim() || 'New User',
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
        setSuccessMsg('Account created! Welcome to your clean Day 1 transformation.');
        
        // Initialize 100% Clean User State
        if (loadCleanUserAccount) {
          await loadCleanUserAccount({ name: name.trim() || 'New User', email: email.trim() });
        }
        setTimeout(() => {
          completeLogin();
        }, 1000);
      } else {
        const { data: resData, error } = await authClient.signIn.email({
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

        if (email.trim() === 'abdulaziz@project90.com') {
          if (loadDemoAccount) await loadDemoAccount();
        }

        setTimeout(() => {
          completeLogin();
        }, 800);
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (mode === 'signup' && loadCleanUserAccount) {
        await loadCleanUserAccount({ name: name.trim() || 'New User', email: email.trim() });
      } else if (email.trim() === 'abdulaziz@project90.com' && loadDemoAccount) {
        await loadDemoAccount();
      }
      setSuccessMsg('Welcome!');
      setTimeout(() => {
        completeLogin();
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // 1-Click Demo login credentials
      setName('Abdulaziz');
      setEmail('abdulaziz@project90.com');
      setPassword('Project90DemoPass!');

      await authClient.signUp.email({
        name: 'Abdulaziz',
        email: 'abdulaziz@project90.com',
        password: 'Project90DemoPass!'
      }).catch(() => {
        return authClient.signIn.email({
          email: 'abdulaziz@project90.com',
          password: 'Project90DemoPass!'
        });
      });

      if (loadDemoAccount) {
        await loadDemoAccount();
      }

      triggerSound('fanfare');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      setSuccessMsg('Welcome back, Abdulaziz! Loading your Day 12 sprint...');
      setTimeout(() => {
        completeLogin();
      }, 900);
    } catch (e) {
      if (loadDemoAccount) await loadDemoAccount();
      completeLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const autofillDemoFields = () => {
    setEmail('abdulaziz@project90.com');
    setPassword('Project90DemoPass!');
    triggerSound('click');
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

      {/* Theme toggle in top corner */}
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
        maxWidth: '490px',
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
            width: '58px',
            height: '58px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.1rem',
            boxShadow: '0 8px 28px var(--primary-glow)'
          }}>
            <Sparkles size={30} color="#ffffff" />
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.4rem' }}>
            PROJECT <span style={{ color: 'var(--primary-light)' }}>90</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Build Your Life, One Day at a Time
          </p>

          {/* 5 Pillar Chips */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
            <span className="badge badge-spiritual" style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}>🕌 Spiritual</span>
            <span className="badge badge-digital" style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}>📱 Digital</span>
            <span className="badge badge-personal" style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}>👤 Personal</span>
            <span className="badge badge-health" style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}>💪 Health</span>
            <span className="badge badge-career" style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}>💻 Career</span>
          </div>
        </div>

        {/* Prominent 1-Click Demo Button */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16), rgba(139, 92, 246, 0.1))',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.75rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Zap size={14} />
            <span>Instant Demo Experience</span>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleQuickDemoLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '0.98rem',
              fontWeight: 800,
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 6px 20px var(--primary-glow)'
            }}
          >
            <span>⚡ Launch Demo Account (Abdulaziz)</span>
            <ArrowRight size={18} />
          </button>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.55rem' }}>
            Pre-loaded with Day 12 sprint, anti-burnout metrics, and MongoDB Atlas sync
          </div>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.35rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          fontWeight: 700
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span>Or Standard Login</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Sign In / Sign Up Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-input)', padding: '0.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, fontSize: '0.85rem' }}
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'signup' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, fontSize: '0.85rem' }}
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

        {/* Form */}
        <form onSubmit={handleStandardAuth}>
          {mode === 'signup' && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Abdulaziz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: 0 }}>Email Address</label>
              <button
                type="button"
                onClick={autofillDemoFields}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-light)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Auto-fill demo credentials
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                required
                placeholder="abdulaziz@project90.com"
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
            className="btn btn-secondary btn-lg"
            style={{ width: '100%', marginTop: '0.25rem', gap: '0.5rem', fontWeight: 700 }}
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
                <span>Create New Account</span>
              </>
            )}
          </button>
        </form>

        {/* Guest access footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.1rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              if (loadCleanUserAccount) {
                await loadCleanUserAccount({ name: 'Guest Explorer', email: 'guest_explorer' });
              }
              completeLogin();
            }}
            style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
          >
            Continue as Guest Explorer &rarr;
          </button>
        </div>
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
          <span>Sunday Sprint Reviews</span>
        </div>
      </div>
    </div>
  );
};

