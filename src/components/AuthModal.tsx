import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, CheckCircle2, AlertCircle, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../services/useAuth';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalReason,
    closeAuthModal,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
  } = useAuth();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (tab === 'signup') {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: unknown) {
      console.error(err);
      const authErr = err as { code?: string; message?: string };
      const code = authErr?.code || '';
      if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Incorrect email or password. Please try again.');
      } else if (code === 'auth/user-not-found') {
        setError('No account found with this email. Please create one.');
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (code === 'auth/popup-closed-by-user') {
        setError('Sign in popup closed. Please try again.');
      } else {
        setError(authErr?.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      const authErr = err as { code?: string; message?: string };
      if (authErr?.code !== 'auth/popup-closed-by-user') {
        setError(authErr?.message || 'Google sign-in was interrupted. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signInAsGuest();
    } catch (err: unknown) {
      console.error(err);
      setError('Guest sign-in failed. You can sign in with email or Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div className="modal-content auth-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeAuthModal} title="Close">
          <X size={20} />
        </button>

        <div className="auth-modal-header">
          <div className="auth-icon-badge">
            <Sparkles size={24} />
          </div>
          <h2 className="auth-title">
            {tab === 'signin' ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <p className="auth-subtitle">
            {authModalReason || 'Save and sync your German vocabulary progress to Firebase Firestore across all your devices.'}
          </p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Google Sign In */}
        <button
          type="button"
          className="google-auth-btn"
          onClick={handleGoogle}
          disabled={isSubmitting}
        >
          <svg className="google-svg" viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="auth-divider">
          <span>or with email</span>
        </div>

        {/* Tab switch */}
        <div className="auth-tab-switch">
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'signin' ? 'active' : ''}`}
            onClick={() => { setTab('signin'); setError(null); }}
          >
            <LogIn size={15} /> Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError(null); }}
          >
            <UserPlus size={15} /> Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <div className="auth-input-wrapper">
              <Mail size={18} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="auth-input"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="auth-input"
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Processing...'
            ) : tab === 'signin' ? (
              <>
                <LogIn size={18} /> Sign In
              </>
            ) : (
              <>
                <CheckCircle2 size={18} /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-options">
          <button
            type="button"
            className="guest-login-btn"
            onClick={handleGuest}
            disabled={isSubmitting}
          >
            <ShieldCheck size={16} /> Continue as Guest (Offline & Local)
          </button>
        </div>
      </div>
    </div>
  );
};
