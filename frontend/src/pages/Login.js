import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

 const fillDemo = (role) => {
    const creds = {
      admin:             { email: 'admin@college.com',      password: 'admin123'   },
      admission_officer: { email: 'officer@college.com',    password: 'officer123' },
      management:        { email: 'management@college.com', password: 'mgmt123'    },
    };
    setForm(creds[role]);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #0f766e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎓</div>
          <h1 style={{ fontSize: '1.5rem', color: '#1e3a8a', marginBottom: 4 }}>
            Admission CRM
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="you@college.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 28, borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginBottom: 10 }}>
            DEMO — Click to auto-fill credentials
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['admin', 'admission_officer', 'management'].map(role => (
              <button
                key={role}
                onClick={() => fillDemo(role)}
                style={{
                  padding: '5px 12px',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  color: '#374151',
                  fontWeight: 500,
                }}
              >
                {role === 'admin' ? '🔑 Admin' :
                 role === 'admission_officer' ? '📋 Officer' : '👁️ Management'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
