import { LogIn, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import FormMessage from '../components/FormMessage';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@example.com', password: '123456' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center bg-gradient-login px-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 -left-32 h-64 w-64 rounded-full bg-pine/10 blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 h-64 w-64 rounded-full bg-violet/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-ocean/5 blur-3xl" />

      <div className="w-full max-w-md animate-scaleIn">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-pine shadow-glow">
            <Sparkles size={24} className="text-surface" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Sun HomeStay</h1>
          <p className="mt-2 text-sm text-ink-dim">Đăng nhập để quản lý đặt phòng theo giờ</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-7 shadow-glass backdrop-blur-xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <FormMessage>{error}</FormMessage>

            <div>
              <label className="label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                className="field"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="Nhập email nhân viên"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="login-password">
                Mật khẩu
              </label>
              <input
                id="login-password"
                className="field"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              id="login-submit"
              className="primary-btn w-full justify-center !h-11 text-sm"
              disabled={submitting}
            >
              <LogIn size={17} />
              {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-ink-dim">
          Dành cho nhân viên nội bộ Sun HomeStay
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
