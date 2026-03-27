import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.username || form.username.length < 3) e.username = t.usernameMin;
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = t.emailWrong;
    if (!form.password || form.password.length < 6) e.password = t.passwordMin;
    if (form.password !== form.confirm) e.confirm = t.passwordMismatch;
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success('Hisob yaratildi! Xush kelibsiz 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || "Ro'yxatdan o'tish xatosi");
    } finally { setLoading(false); }
  };

  const f = (key) => ({
    value: form[key],
    onChange: (e) => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })); },
  });

  return (
    <div className="page-enter" style={{
      minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px',
      background: 'linear-gradient(160deg, var(--bg) 60%, var(--accent-light) 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 800, fontFamily: 'Syne,sans-serif', marginBottom: 16 }}>Q</div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>{t.registerTitle}</h1>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>{t.registerSubtitle}</p>
        </div>
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'username', label: t.usernameLabel, type: 'text', placeholder: 'quizmaster', icon: <FiUser size={16} /> },
              { key: 'email', label: t.emailLabel, type: 'email', placeholder: 'siz@example.com', icon: <FiMail size={16} /> },
            ].map(({ key, label, type, placeholder, icon }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>{icon}</span>
                  <input type={type} className="input" placeholder={placeholder} style={{ paddingLeft: 40 }} {...f(key)} />
                </div>
                {errors[key] && <p className="error-msg">{errors[key]}</p>}
              </div>
            ))}
            {['password', 'confirm'].map((key) => (
              <div key={key}>
                <label className="label">{key === 'password' ? t.passwordLabel : t.confirmPasswordLabel}</label>
                <div style={{ position: 'relative' }}>
                  <FiLock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input type={showPwd ? 'text' : 'password'} className="input" placeholder="••••••••"
                    style={{ paddingLeft: 40, paddingRight: key === 'confirm' ? 44 : 16 }} {...f(key)} />
                  {key === 'confirm' && (
                    <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)' }}>
                      {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  )}
                </div>
                {errors[key] && <p className="error-msg">{errors[key]}</p>}
              </div>
            ))}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> {t.creating}</> : t.createAccountBtn}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text2)', fontSize: 14 }}>
          {t.hasAccount}{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>{t.loginLink}</Link>
        </p>
      </div>
    </div>
  );
}
