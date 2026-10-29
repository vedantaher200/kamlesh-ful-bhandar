import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Flower, Lock, Key, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [adminKey, setAdminKey] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedKey = adminKey.trim();
    if (!trimmedKey || !password) {
      setError('Please provide both the Admin Key and Password.');
      return;
    }

    setLoading(true);

    try {
      await login(trimmedKey, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid admin key or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-dark)', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '3rem 2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-icon" style={{ margin: '0 auto 1rem', width: 48, height: 48 }}>
            <Flower size={28} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
            Admin Portal
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Kamlesh Ful Bhandar Secure Management Console
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="adminKey" style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
              Admin Key
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1.5px solid var(--color-cream-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', background: 'var(--color-cream)' }}>
              <Key size={18} color="var(--color-text-muted)" />
              <input
                id="adminKey"
                name="adminKey"
                type="text"
                required
                autoComplete="username"
                placeholder="Enter your admin access key"
                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.95rem' }}
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="adminPassword" style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
              Password
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1.5px solid var(--color-cream-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', background: 'var(--color-cream)' }}>
              <Lock size={18} color="var(--color-text-muted)" />
              <input
                id="adminPassword"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter your admin password"
                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.95rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                id="togglePasswordVisibility"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem', color: 'var(--color-text-muted)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="adminLoginSubmit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginBottom: '1.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600 }}>
            <ArrowLeft size={16} />
            <span>Return to Customer Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
