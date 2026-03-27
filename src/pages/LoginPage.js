import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = t.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t.emailInvalid;
    if (!form.password) e.password = t.passwordRequired;
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Xush kelibsiz! 👋');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kirish muvaffaqiyatsiz');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-enter" style={{
      minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px',
      background: 'linear-gradient(160deg, var(--bg) 60%, var(--accent-light) 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 800, fontFamily: 'Syne,sans-serif', marginBottom: 16 }}>Q</div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>{t.loginTitle}</h1>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>{t.loginSubtitle}</p>
        </div>
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="label">{t.emailLabel}</label>
              <div style={{ position: 'relative' }}>
                <FiMail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input type="email" className="input" placeholder="siz@example.com" style={{ paddingLeft: 40 }}
                  value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })); }} />
              </div>
              {errors.email && <p className="error-msg">{errors.email}</p>}
            </div>
            <div>
              <label className="label">{t.passwordLabel}</label>
              <div style={{ position: 'relative' }}>
                <FiLock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input type={showPwd ? 'text' : 'password'} className="input" placeholder="••••••••" style={{ paddingLeft: 40, paddingRight: 44 }}
                  value={form.password} onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })); }} />
                <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)' }}>
                  {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-msg">{errors.password}</p>}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> {t.loggingIn}</> : t.loginBtn}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text2)', fontSize: 14 }}>
          {t.noAccount}{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 500 }}>{t.registerLink}</Link>
        </p>
      </div>
    </div>
  );
}
