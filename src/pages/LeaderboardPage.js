import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useLang } from '../context/LanguageContext';
import { FiTarget, FiPlay } from 'react-icons/fi';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const { t } = useLang();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard/global')
      .then(({ data }) => setLeaders(data.leaders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container" style={{ maxWidth: 680 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 8 }}>{t.globalRating}</h1>
          <p style={{ color: 'var(--text2)' }}>{t.bestPlayers}</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : leaders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>😴</div>
            <p>{t.noPlayers}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leaders.map((player, i) => (
              <div key={player.id} className="card" style={{
                padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 14,
                border: i === 0 ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: i === 0 ? 'var(--accent-light)' : 'var(--surface)',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: i < 3 ? 'var(--accent)' : 'var(--bg3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: i < 3 ? 20 : 14, fontWeight: 700,
                  color: i < 3 ? '#fff' : 'var(--text2)',
                }}>
                  {i < 3 ? MEDALS[i] : `#${i + 1}`}
                </div>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                  {player.username?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{player.username}</div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><FiPlay size={11} /> {player.quizzesPlayed} {t.gamesPlayed}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiTarget size={15} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne,sans-serif', color: i === 0 ? 'var(--accent)' : 'var(--text)' }}>
                      {player.totalScore}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{t.totalScore}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
