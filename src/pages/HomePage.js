import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { FiPlay, FiEdit3, FiArrowRight, FiZap } from 'react-icons/fi';

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLang();
  return (
    <div className="page-enter">
      <section style={{
        padding: '80px 24px 60px', textAlign: 'center',
        background: 'linear-gradient(160deg, var(--bg) 0%, var(--accent-light) 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'var(--accent)', opacity: 0.05, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'var(--accent2)', opacity: 0.07, pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <span className="badge badge-accent" style={{ marginBottom: 20, fontSize: 13 }}>
            <FiZap size={12} style={{ marginRight: 4 }} /> {t.freeBadge}
          </span>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)', marginBottom: 20, lineHeight: 1.1 }}>
            {t.heroTitle1}<br />
            <span style={{ color: 'var(--accent)' }}>{t.heroTitle2}</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text2)', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
            {t.heroDesc}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/quizzes" className="btn btn-primary btn-lg">
              <FiPlay size={18} /> {t.viewQuizzes}
            </Link>
            {user ? (
              <Link to="/create" className="btn btn-secondary btn-lg">
                <FiEdit3 size={18} /> {t.createQuizBtn}
              </Link>
            ) : (
              <Link to="/register" className="btn btn-secondary btn-lg">
                {t.registerNow} <FiArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: '70px 24px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 10 }}>{t.whyTitle}</h2>
            <p style={{ color: 'var(--text2)', fontSize: 16 }}>{t.whySubtitle}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { icon: '🧠', title: t.feature1Title, desc: t.feature1Desc },
              { icon: '⚡', title: t.feature2Title, desc: t.feature2Desc },
              { icon: '🏆', title: t.feature3Title, desc: t.feature3Desc },
              { icon: '📊', title: t.feature4Title, desc: t.feature4Desc },
            ].map(f => (
              <div key={f.title} className="card" style={{ padding: 28 }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!user && (
        <section style={{ padding: '0 24px 60px' }}>
          <div className="container">
            <div style={{ background: 'var(--accent)', borderRadius: 24, padding: '50px 40px', textAlign: 'center' }}>
              <h2 style={{ color: '#fff', fontSize: 'clamp(22px, 3vw, 34px)', marginBottom: 12 }}>
                {t.ctaTitle}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 28, fontSize: 16 }}>
                {t.ctaDesc}
              </p>
              <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--accent)' }}>
                {t.ctaBtn} <FiArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
