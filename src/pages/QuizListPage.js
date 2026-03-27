import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { FiSearch, FiPlay, FiEdit2, FiTrash2, FiClock, FiUser } from 'react-icons/fi';

const diffColor = { 'Oson': 'badge-green', "O'rta": 'badge-blue', 'Qiyin': 'badge-red', 'Easy': 'badge-green', 'Medium': 'badge-blue', 'Hard': 'badge-red', 'Лёгкий': 'badge-green', 'Средний': 'badge-blue', 'Сложный': 'badge-red', 'Осон': 'badge-green', 'Миёна': 'badge-blue', 'Душвор': 'badge-red', 'Оңай': 'badge-green', 'Орташа': 'badge-blue', 'Қиын': 'badge-red' };

export default function QuizListPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Hammasi');
  const [difficulty, setDifficulty] = useState('Hammasi');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const CATEGORIES = [t.catAll, t.catGeneral, t.catScience, t.catHistory, t.catTech, t.catSport, t.catMusic, t.catCinema];
  const DIFFICULTIES = [t.catAll, t.diffEasy, t.diffMedium, t.diffHard];

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category !== t.catAll) params.category = category;
      if (difficulty !== t.catAll) params.difficulty = difficulty;
      const { data } = await api.get('/quiz/list', { params });
      setQuizzes(data.quizzes);
      setPages(data.pages);
    } catch { toast.error('Quizlarni yuklashda xato'); }
    finally { setLoading(false); }
  }, [search, category, difficulty, page, t.catAll]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDeleteQuiz)) return;
    try {
      await api.delete(`/quiz/${id}`);
      toast.success("Quiz o'chirildi");
      fetchQuizzes();
    } catch { toast.error("O'chirishda xato"); }
  };

  return (
    <div className="page-enter" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', marginBottom: 6 }}>{t.quizzesTitle}</h1>
            <p style={{ color: 'var(--text2)' }}>{t.quizzesSubtitle}</p>
          </div>
          {user && <Link to="/create" className="btn btn-primary">{t.addQuiz}</Link>}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <FiSearch size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input type="text" className="input" placeholder={t.searchPlaceholder} style={{ paddingLeft: 40 }}
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input" style={{ width: 'auto', minWidth: 130 }} value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="input" style={{ width: 'auto', minWidth: 120 }} value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }}>
            {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text2)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ marginBottom: 8 }}>{t.noQuizFound}</h3>
            <p style={{ fontSize: 14 }}>{t.noQuizFoundDesc}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span className={`badge ${diffColor[quiz.difficulty] || 'badge-blue'}`}>{quiz.difficulty}</span>
                  <span className="badge badge-accent">{quiz.category}</span>
                </div>
                <h3 style={{ fontSize: 17, marginBottom: 8, flex: 1 }}>{quiz.title}</h3>
                {quiz.description && (
                  <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>
                    {quiz.description.length > 80 ? quiz.description.slice(0, 80) + '…' : quiz.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 14, fontSize: 13, color: 'var(--text3)', marginBottom: 16, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiUser size={12} /> {quiz.createdByUsername}</span>
                  <span>📝 {quiz.questions?.length} {t.questions}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={12} /> {quiz.timeLimit}s</span>
                  <span>▶ {quiz.plays} {t.times}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <Link to={`/play/${quiz.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <FiPlay size={14} /> {t.play}
                  </Link>
                  {user && (user.id === quiz.createdBy || user.role === 'admin') && (
                    <>
                      <Link to={`/edit/${quiz.id}`} className="btn btn-ghost btn-sm"><FiEdit2 size={14} /></Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(quiz.id)} style={{ color: 'var(--red)' }}>
                        <FiTrash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>{t.prev}</button>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>{t.next}</button>
          </div>
        )}
      </div>
    </div>
  );
}
