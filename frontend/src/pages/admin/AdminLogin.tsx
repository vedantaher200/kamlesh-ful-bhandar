import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Flower, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@kamleshfulbhandar.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
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
            Kamlesh Ful Bhandar Management Console
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
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
              Email Address
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1.5px solid var(--color-cream-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', background: 'var(--color-cream)' }}>
              <Mail size={18} color="var(--color-text-muted)" />
              <input
                type="email"
                required
                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
              Password
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1.5px solid var(--color-cream-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', background: 'var(--color-cream)' }}>
              <Lock size={18} color="var(--color-text-muted)" />
              <input
                type="password"
                required
                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
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
