import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';
import { FiSun, FiMoon, FiMenu, FiX, FiLogOut, FiUser, FiShield, FiGlobe } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { lang, changeLang, t, languages } = useLang();
  const [menu, setMenu] = useState(false);
  const [drop, setDrop] = useState(false);
  const [langDrop, setLangDrop] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const langRef = useRef(null);

  const active = (p) => location.pathname === p;

  const links = [
    { to: '/', label: t.home },
    { to: '/quizzes', label: t.quizzes },
    { to: '/leaderboard', label: t.leaderboard },
    ...(user ? [{ to: '/create', label: t.createQuiz }] : []),
  ];

  const handleLogout = () => { logout(); setDrop(false); navigate('/login'); };

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLang = languages[lang];

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 24 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 800 }}>Q</span>
          <span>Edu<span style={{ color: 'var(--accent)' }}></span>Quiz</span>
        </Link>

        <div style={{ display: 'flex', gap: 4, flex: 1 }} className="desktop-nav">
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: active(l.to) ? 'var(--accent)' : 'var(--text2)',
              background: active(l.to) ? 'var(--accent-light)' : 'transparent',
            }}>{l.label}</Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>

          {/* Language Switcher */}
          <div ref={langRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setLangDrop(d => !d)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 36, padding: '0 10px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--bg3)',
                color: 'var(--text2)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              <FiGlobe size={15} />
              <span className="hide-mobile">{currentLang.flag} {currentLang.name}</span>
              <span className="show-mobile-only" style={{ fontSize: 16 }}>{currentLang.flag}</span>
            </button>

            {langDrop && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 6, minWidth: 160,
                boxShadow: 'var(--shadow-lg)', zIndex: 200,
              }}>
                {Object.values(languages).map(l => (
                  <button
                    key={l.code}
                    onClick={() => { changeLang(l.code); setLangDrop(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '9px 12px', borderRadius: 8,
                      border: 'none', background: lang === l.code ? 'var(--accent-light)' : 'transparent',
                      color: lang === l.code ? 'var(--accent)' : 'var(--text)',
                      fontSize: 14, fontWeight: lang === l.code ? 600 : 400,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{l.flag}</span>
                    <span>{l.name}</span>
                    {lang === l.code && (
                      <span style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={toggle} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
            {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDrop(d => !d)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <span className="hide-mobile">{user.username}</span>
              </button>
              {drop && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 8, minWidth: 180, boxShadow: 'var(--shadow-lg)', zIndex: 200 }}>
                  <Link to="/profile" onClick={() => setDrop(false)} className="drop-item">
                    <FiUser size={14} /> {t.profile}
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setDrop(false)} className="drop-item" style={{ color: 'var(--accent)' }}>
                      <FiShield size={14} /> {t.admin}
                    </Link>
                  )}
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '6px 0' }} />
                  <button onClick={handleLogout} className="drop-item" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'var(--red)' }}>
                    <FiLogOut size={14} /> {t.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-ghost btn-sm">{t.login}</Link>
              <Link to="/register" className="btn btn-primary btn-sm">{t.register}</Link>
            </div>
          )}

          <button className="mobile-btn" onClick={() => setMenu(m => !m)} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg3)', display: 'none', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
            {menu ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>

      {menu && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px 24px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenu(false)} style={{
              padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: active(l.to) ? 'var(--accent)' : 'var(--text2)',
              background: active(l.to) ? 'var(--accent-light)' : 'transparent',
            }}>{l.label}</Link>
          ))}
          <div style={{ padding: '8px 14px 4px', fontSize: 12, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Til / Язык / Language</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 14px' }}>
            {Object.values(languages).map(l => (
              <button
                key={l.code}
                onClick={() => { changeLang(l.code); setMenu(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 20,
                  border: `1px solid ${lang === l.code ? 'var(--accent)' : 'var(--border)'}`,
                  background: lang === l.code ? 'var(--accent-light)' : 'var(--bg3)',
                  color: lang === l.code ? 'var(--accent)' : 'var(--text)',
                  fontSize: 13, fontWeight: lang === l.code ? 600 : 400, cursor: 'pointer',
                }}
              >
                <span>{l.flag}</span> {l.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .drop-item { display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;color:var(--text);font-size:14px;cursor:pointer;transition:background .15s; }
        .drop-item:hover { background:var(--bg3); }
        .show-mobile-only { display: none; }
        @media(max-width:768px){
          .desktop-nav{display:none!important}
          .mobile-btn{display:flex!important}
          .hide-mobile{display:none}
          .show-mobile-only{display:inline}
        }
      `}</style>
    </nav>
  );
}
