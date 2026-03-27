import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { FiUsers, FiBookOpen, FiAward, FiTrash2, FiShield, FiUser } from 'react-icons/fi';

export default function AdminDashboard() {
  const { t } = useLang();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/users'), api.get('/admin/quizzes')])
      .then(([s, u, q]) => { setStats(s.data); setUsers(u.data.users); setQuizzes(q.data.quizzes); })
      .catch(() => toast.error("Ma'lumotlarni yuklashda xato"))
      .finally(() => setLoading(false));
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm(t.confirmDeleteUser)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(us => us.filter(u => u.id !== id));
      toast.success("Foydalanuvchi o'chirildi");
    } catch (err) { toast.error(err.response?.data?.message || 'Xato'); }
  };

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: newRole });
      setUsers(us => us.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      toast.success(`Rol yangilandi: ${newRole}`);
    } catch { toast.error('Rolni yangilashda xato'); }
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm(t.confirmDeleteQuiz)) return;
    try {
      await api.delete(`/quiz/${id}`);
      setQuizzes(qs => qs.filter(q => q.id !== id));
      toast.success("Quiz o'chirildi");
    } catch { toast.error('Xato'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  const tabs = [
    { key: 'overview', label: t.tabOverview },
    { key: 'users', label: t.tabUsers },
    { key: 'quizzes', label: t.tabQuizzes },
  ];

  return (
    <div className="page-enter" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <FiShield size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 28 }}>{t.adminTitle}</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>{t.adminSubtitle}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--border)' }}>
          {tabs.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{
              padding: '10px 20px', background: 'none', border: 'none',
              color: tab === tb.key ? 'var(--accent)' : 'var(--text2)', fontWeight: tab === tb.key ? 600 : 400,
              borderBottom: `2px solid ${tab === tb.key ? 'var(--accent)' : 'transparent'}`,
              cursor: 'pointer', fontSize: 15, marginBottom: -1,
            }}>{tb.label}</button>
          ))}
        </div>

        {tab === 'overview' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 36 }}>
              {[
                { icon: <FiUsers size={22} />, label: t.users, value: stats.totalUsers, color: 'var(--blue)' },
                { icon: <FiBookOpen size={22} />, label: t.quizzesCount, value: stats.totalQuizzes, color: 'var(--accent)' },
                { icon: <FiAward size={22} />, label: t.games, value: stats.totalPlays, color: 'var(--green)' },
              ].map(s => (
                <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Syne,sans-serif' }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
            {stats.topScores?.length > 0 && (
              <>
                <h2 style={{ fontSize: 20, marginBottom: 16 }}>{t.topScores}</h2>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                        {['#', t.colUser, 'Quiz', t.colScore].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topScores.map((s, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: i === 0 ? 'var(--accent)' : 'var(--text2)' }}>#{i + 1}</td>
                          <td style={{ padding: '12px 16px' }}>{s.username}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text2)', fontSize: 13 }}>{s.quizTitle}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--green)' }}>{s.score}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div>
            <p style={{ color: 'var(--text2)', marginBottom: 16, fontSize: 14 }}>{users.length} {t.usersCount}</p>
            <div className="card" style={{ padding: 0, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                    {[t.colUser, t.colEmail, t.colPassword, t.colRole, t.colDate, t.colActions].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                            {u.username?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500 }}>{u.username}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text2)', fontSize: 13 }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <code style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--bg3)', padding: '3px 6px', borderRadius: 4, maxWidth: 160, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.password?.slice(0, 28)}…
                        </code>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-accent' : 'badge-blue'}`}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text2)', fontSize: 13 }}>
                        {new Date(u.createdAt).toLocaleDateString('uz')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => toggleRole(u)}>
                            {u.role === 'admin' ? <FiUser size={13} /> : <FiShield size={13} />}
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => deleteUser(u.id)} style={{ color: 'var(--red)' }}>
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'quizzes' && (
          <div>
            <p style={{ color: 'var(--text2)', marginBottom: 16, fontSize: 14 }}>{quizzes.length} {t.quizzesCountLabel}</p>
            <div className="card" style={{ padding: 0, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                    {[t.colTitle, t.colAuthor, t.colQuestions, t.colPlays, t.colDate, t.colActions].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map(q => (
                    <tr key={q.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{q.title}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text2)', fontSize: 13 }}>{q.createdByUsername}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text2)' }}>{q.questions?.length}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text2)' }}>{q.plays}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text2)', fontSize: 13 }}>{new Date(q.createdAt).toLocaleDateString('uz')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => deleteQuiz(q.id)} style={{ color: 'var(--red)' }}>
                          <FiTrash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
