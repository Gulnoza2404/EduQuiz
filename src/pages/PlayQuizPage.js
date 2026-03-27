import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { FiClock, FiCheck, FiX, FiArrowRight } from 'react-icons/fi';

export default function PlayQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const [phase, setPhase] = useState('loading');
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const timerRef = useRef(null);
  const answersRef = useRef([]);
  const selectedRef = useRef(null);

  useEffect(() => {
    api.get(`/quiz/${id}`)
      .then(({ data }) => { setQuiz(data.quiz); setPhase('ready'); })
      .catch(() => { toast.error('Quiz topilmadi'); navigate('/quizzes'); });
  }, [id, navigate]);

  const submitQuiz = useCallback(async (finalAnswers) => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    try {
      const { data } = await api.post('/quiz/play', { quizId: id, answers: finalAnswers, timeTaken });
      setResults(data);
      api.get(`/leaderboard/quiz/${id}`).then(({ data: lb }) => setLeaderboard(lb.scores));
      setPhase('results');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Yuborishda xato');
    } finally { setSubmitting(false); }
  }, [id, startTime]);

  const nextQuestion = useCallback((sel) => {
    clearInterval(timerRef.current);
    const finalSel = sel !== undefined ? sel : selectedRef.current;
    const newAnswers = [...answersRef.current, finalSel !== null ? finalSel : -1];
    answersRef.current = newAnswers;
    setAnswers(newAnswers);
    setSelected(null);
    selectedRef.current = null;
    if (newAnswers.length < quiz.questions.length) {
      setCurrent(c => c + 1);
      setTimeLeft(quiz.timeLimit);
    } else {
      submitQuiz(newAnswers);
    }
  }, [quiz, submitQuiz]);

  useEffect(() => {
    if (phase !== 'playing') return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(tt => {
        if (tt <= 1) { clearInterval(timerRef.current); nextQuestion(-1); return 0; }
        return tt - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, current]); // eslint-disable-line

  const startQuiz = () => {
    answersRef.current = [];
    selectedRef.current = null;
    setAnswers([]);
    setCurrent(0);
    setSelected(null);
    setTimeLeft(quiz.timeLimit);
    setStartTime(Date.now());
    setResults(null);
    setPhase('playing');
  };

  const handleSelect = (oi) => { setSelected(oi); selectedRef.current = oi; };

  if (phase === 'loading') return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  if (phase === 'ready' && quiz) return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div className="card" style={{ maxWidth: 480, width: '100%', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
        <h1 style={{ fontSize: 26, marginBottom: 10 }}>{quiz.title}</h1>
        {quiz.description && <p style={{ color: 'var(--text2)', marginBottom: 20, lineHeight: 1.6 }}>{quiz.description}</p>}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          <span className="badge badge-blue">📝 {quiz.questions?.length} {t.questionOf}</span>
          <span className="badge badge-accent">⏱ {quiz.timeLimit}s / {t.questionOf}</span>
          <span className="badge badge-green">{quiz.difficulty}</span>
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={startQuiz}>
          {t.startBtn} <FiArrowRight size={18} />
        </button>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/quizzes')}>
          {t.backBtn}
        </button>
      </div>
    </div>
  );

  if (phase === 'playing' && quiz) {
    const q = quiz.questions[current];
    const timerColor = timeLeft <= 5 ? 'var(--red)' : timeLeft <= 10 ? '#f59e0b' : 'var(--green)';
    const timerPct = (timeLeft / quiz.timeLimit) * 100;
    const progressPct = (current / quiz.questions.length) * 100;

    return (
      <div className="page-enter" style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: 'var(--text2)' }}>{current + 1} / {quiz.questions.length} {t.questionOf}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700, color: timerColor }}>
              <FiClock size={18} /> {timeLeft}s
            </div>
          </div>
          <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, marginBottom: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width .3s' }} />
          </div>
          <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, marginBottom: 28, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${timerPct}%`, background: timerColor, borderRadius: 2, transition: 'width 1s linear, background .3s' }} />
          </div>
          <div className="card" style={{ padding: 28, marginBottom: 16 }}>
            <h2 style={{ fontSize: 'clamp(17px, 2.5vw, 22px)', lineHeight: 1.5 }}>{q.question}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map((opt, oi) => (
              <button key={oi} onClick={() => handleSelect(oi)} style={{
                padding: '16px 20px', borderRadius: 'var(--radius-sm)', textAlign: 'left',
                border: `2px solid ${selected === oi ? 'var(--accent)' : 'var(--border)'}`,
                background: selected === oi ? 'var(--accent-light)' : 'var(--surface)',
                color: selected === oi ? 'var(--accent)' : 'var(--text)',
                fontSize: 15, fontWeight: selected === oi ? 500 : 400,
                transition: 'all .15s', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', border: `2px solid ${selected === oi ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                  background: selected === oi ? 'var(--accent)' : 'transparent',
                  color: selected === oi ? '#fff' : 'var(--text3)',
                }}>
                  {['A', 'B', 'C', 'D'][oi]}
                </span>
                {opt}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }}
            onClick={() => nextQuestion(selected)} disabled={submitting}>
            {submitting ? <span className="spinner" style={{ width: 18, height: 18 }} /> :
              current + 1 === quiz.questions.length ? t.finish : t.nextQuestion}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'results' && results) {
    const pct = results.score;
    const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 60 ? '👍' : pct >= 40 ? '💪' : '📚';

    return (
      <div className="page-enter" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 64px)' }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <div className="card" style={{ padding: 40, textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>{emoji}</div>
            <h1 style={{ fontSize: 30, marginBottom: 6 }}>{t.quizFinished}</h1>
            <p style={{ color: 'var(--text2)', marginBottom: 24 }}>{t.yourScore}</p>
            <div style={{
              width: 120, height: 120, borderRadius: '50%', margin: '0 auto 24px',
              background: `conic-gradient(var(--accent) ${pct * 3.6}deg, var(--bg3) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 98, height: 98, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Syne,sans-serif', color: 'var(--accent)' }}>{pct}%</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{results.correctAnswers}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{t.correct}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>{results.totalQuestions - results.correctAnswers}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{t.wrong}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{results.totalQuestions}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{t.total}</div>
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: 20, marginBottom: 16 }}>{t.reviewAnswers}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {results.results.map((r, i) => (
              <div key={i} className="card" style={{ padding: 18, borderLeft: `4px solid ${r.isCorrect ? 'var(--green)' : 'var(--red)'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: r.isCorrect ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    {r.isCorrect ? <FiCheck size={13} /> : <FiX size={13} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, marginBottom: 6, fontSize: 14 }}>S{i + 1}: {r.question}</p>
                    {r.selectedAnswer !== -1 && !r.isCorrect && (
                      <p style={{ fontSize: 13, color: 'var(--red)' }}>✗ {t.yourAnswer} <strong>{r.options[r.selectedAnswer]}</strong></p>
                    )}
                    {r.selectedAnswer === -1 && <p style={{ fontSize: 13, color: 'var(--text3)' }}>{t.timeUp}</p>}
                    <p style={{ fontSize: 13, color: 'var(--green)' }}>✓ {t.correctAnswer} <strong>{r.options[r.correctAnswer]}</strong></p>
                    {r.explanation && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4, fontStyle: 'italic' }}>💡 {r.explanation}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {leaderboard.length > 0 && (
            <>
              <h2 style={{ fontSize: 20, marginBottom: 12 }}>{t.topResults}</h2>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
                {leaderboard.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderBottom: i < leaderboard.length - 1 ? '1px solid var(--border)' : 'none', background: i === 0 ? 'var(--accent-light)' : 'transparent' }}>
                    <span style={{ fontWeight: 700, color: i === 0 ? 'var(--accent)' : 'var(--text3)', width: 24 }}>#{i + 1}</span>
                    <span style={{ flex: 1, fontWeight: 500 }}>{s.username}</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{s.score}%</span>
                    <span style={{ fontSize: 13, color: 'var(--text3)' }}>{s.correctAnswers}/{s.totalQuestions}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingBottom: 40 }}>
            <button className="btn btn-primary" onClick={startQuiz}>{t.replay}</button>
            <Link to="/quizzes" className="btn btn-secondary">{t.quizList}</Link>
            <Link to="/leaderboard" className="btn btn-ghost">{t.globalLeaderboard}</Link>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
