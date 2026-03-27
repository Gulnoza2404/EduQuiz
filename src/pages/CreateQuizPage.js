import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';

const empty = () => ({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ title: '', description: '', category: '', difficulty: '', timeLimit: 30 });
  const [questions, setQuestions] = useState([empty()]);

  const CATEGORIES = [t.catGeneral, t.catScience, t.catHistory, t.catTech, t.catSport, t.catMusic, t.catCinema];
  const DIFFICULTIES = [t.diffEasy, t.diffMedium, t.diffHard];

  const setMt = (k, v) => setMeta(m => ({ ...m, [k]: v }));
  const setQ = (qi, k, v) => setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, [k]: v } : q));
  const setOpt = (qi, oi, v) => setQuestions(qs => qs.map((q, i) => {
    if (i !== qi) return q;
    const opts = [...q.options]; opts[oi] = v; return { ...q, options: opts };
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!meta.title.trim()) { toast.error(t.titleRequired); return; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) { toast.error(`${i + 1}${t.questionEmpty}`); return; }
      if (q.options.some(o => !o.trim())) { toast.error(`${i + 1}${t.optionsRequired}`); return; }
    }
    setLoading(true);
    try {
      const { data } = await api.post('/quiz/create', { ...meta, questions });
      toast.success('Quiz yaratildi! 🎉');
      navigate(`/play/${data.quiz.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato yuz berdi');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-enter" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', marginBottom: 6 }}>{t.createQuizTitle}</h1>
        <p style={{ color: 'var(--text2)', marginBottom: 36 }}>{t.createQuizSubtitle}</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, marginBottom: 20 }}>{t.quizInfo}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">{t.titleLabel}</label>
                <input className="input" placeholder={t.titlePlaceholder} value={meta.title} onChange={e => setMt('title', e.target.value)} />
              </div>
              <div>
                <label className="label">{t.descLabel}</label>
                <textarea className="input" placeholder={t.descPlaceholder} value={meta.description} onChange={e => setMt('description', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                <div>
                  <label className="label">{t.categoryLabel}</label>
                  <select className="input" value={meta.category || CATEGORIES[0]} onChange={e => setMt('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{t.difficultyLabel}</label>
                  <select className="input" value={meta.difficulty || DIFFICULTIES[0]} onChange={e => setMt('difficulty', e.target.value)}>
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{t.timeLimitLabel}</label>
                  <input type="number" className="input" min={5} max={120} value={meta.timeLimit} onChange={e => setMt('timeLimit', Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>

          {questions.map((q, qi) => (
            <div key={qi} className="card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: 16 }}>{qi + 1}{t.questionNum}</h3>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
                  if (questions.length === 1) { toast.error(t.minOneQuestion); return; }
                  setQuestions(qs => qs.filter((_, i) => i !== qi));
                }} style={{ color: 'var(--red)' }}>
                  <FiTrash2 size={14} /> {t.deleteQuestion}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">{t.questionLabel}</label>
                  <input className="input" placeholder={t.questionPlaceholder} value={q.question} onChange={e => setQ(qi, 'question', e.target.value)} />
                </div>
                <div>
                  <label className="label">{t.optionsLabel}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {q.options.map((opt, oi) => (
                      <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button type="button" onClick={() => setQ(qi, 'correctAnswer', oi)} style={{
                          width: 28, height: 28, borderRadius: '50%', border: '2px solid',
                          borderColor: q.correctAnswer === oi ? 'var(--green)' : 'var(--border)',
                          background: q.correctAnswer === oi ? 'var(--green)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: q.correctAnswer === oi ? '#fff' : 'var(--border)',
                          flexShrink: 0, transition: 'all .15s',
                        }}>
                          {q.correctAnswer === oi && <FiCheck size={13} />}
                        </button>
                        <input className="input" placeholder={`${oi + 1}-variant`} value={opt}
                          onChange={e => setOpt(qi, oi, e.target.value)}
                          style={{ borderColor: q.correctAnswer === oi ? 'var(--green)' : undefined }} />
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
                    ✓ {q.correctAnswer + 1}-variant {t.correctMark}
                  </p>
                </div>
                <div>
                  <label className="label">{t.explanationLabel}</label>
                  <input className="input" placeholder={t.explanationPlaceholder} value={q.explanation} onChange={e => setQ(qi, 'explanation', e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-secondary" onClick={() => setQuestions(qs => [...qs, empty()])} style={{ alignSelf: 'flex-start' }}>
            <FiPlus size={16} /> {t.addQuestion}
          </button>

          <div style={{ display: 'flex', gap: 12, paddingBottom: 40 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> {t.saving}</> : t.publish}
            </button>
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate('/quizzes')}>{t.cancelBtn}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
