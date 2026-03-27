import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlay, FiBookOpen, FiTarget } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { t } = useLang();
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [saving, setSaving] = useState(false);
  const [changePwd, setChangePwd] = useState(false);
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  useEffect(() => {
    api.get('/quiz/my')
      .then(({ data }) => setMyQuizzes(data.quizzes))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    if (!username.trim() || username.length < 3) { toast.error(t.usernameMin); return; }
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { username });
      updateUser(data.user);
      toast.success('Profil yangilandi!');
      setEditing(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Xato'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword.length < 6) { toast.error(t.passwordMin); return; }
    if (pwd.newPassword !== pwd.confirm) { toast.error(t.passwordMismatch); return; }
    try {
      await api.put('/auth/change-password', { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      toast.success('Parol yangilandi!');
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
      setChangePwd(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Xato'); }
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm(t.confirmDeleteQuiz)) return;
    try {
      await api.delete(`/quiz/${id}`);
      setMyQuizzes(qs => qs.filter(q => q.id !== id));
      toast.success("O'chirildi");
    } catch { toast.error('Xato'); }
  };

  return (
    <div className="page-enter" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', marginBottom: 28 }}>{t.myProfile}</h1>

        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 26, fontWeight: 800, fontFamily: 'Syne,sans-serif', flexShrink: 0 }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              {editing ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input className="input" value={username} onChange={e => setUsername(e.target.value)} style={{ maxWidth: 220 }} />
                  <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={saving}>
                    {saving ? t.saving : t.save}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setUsername(user.username); }}>{t.cancel}</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: 22 }}>{user?.username}</h2>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                    <FiEdit2 size={13} /> {t.editProfile}
                  </button>
                </div>
              )}
              <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>{user?.email}</p>
              {user?.role === 'admin' && <span className="badge badge-accent" style={{ marginTop: 8 }}>Admin</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
            {[
              { icon: <FiBookOpen size={15} />, label: t.created, value: myQuizzes.length },
              { icon: <FiPlay size={15} />, label: t.played, value: user?.quizzesPlayed || 0 },
              { icon: <FiTarget size={15} />, label: t.totalScoreLabel, value: user?.totalScore || 0 },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--accent)' }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: changePwd ? 18 : 0 }}>
            <h3 style={{ fontSize: 16 }}>{t.security}</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setChangePwd(c => !c)}>
              {changePwd ? t.cancelChange : t.changePassword}
            </button>
          </div>
          {changePwd && (
            <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'currentPassword', label: t.currentPassword, ph: '••••••••' },
                { key: 'newPassword', label: t.newPassword, ph: t.passwordMin },
                { key: 'confirm', label: t.confirmPassword, ph: '••••••••' },
              ].map(f => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input type="password" className="input" placeholder={f.ph}
                    value={pwd[f.key]} onChange={e => setPwd(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>{t.updateBtn}</button>
            </form>
          )}
        </div>

        <h2 style={{ fontSize: 20, marginBottom: 16 }}>{t.myQuizzes} ({myQuizzes.length})</h2>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : myQuizzes.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
            <p style={{ marginBottom: 16 }}>{t.noQuizYet}</p>
            <Link to="/create" className="btn btn-primary">{t.createFirst}</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 40 }}>
            {myQuizzes.map(q => (
              <div key={q.id} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 15, marginBottom: 4 }}>{q.title}</h4>
                  <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text3)' }}>
                    <span>{q.questions?.length} {t.questions}</span>
                    <span>▶ {q.plays} {t.times}</span>
                    <span>{q.difficulty}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/play/${q.id}`} className="btn btn-primary btn-sm"><FiPlay size={13} /> {t.play}</Link>
                  <Link to={`/edit/${q.id}`} className="btn btn-ghost btn-sm"><FiEdit2 size={13} /></Link>
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteQuiz(q.id)} style={{ color: 'var(--red)' }}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
