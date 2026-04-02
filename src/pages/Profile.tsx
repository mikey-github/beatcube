import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import type { Score, Success, UserSuccess } from '../types';

interface Stats {
  totalScore: number;
  numberOfGame: number;
  averageAccuracy: number;
  fullCombos: number;
}

function calculateLevel(score: number): number {
  if (score >= 1000000) return 50;
  if (score >= 500000) return 40;
  if (score >= 200000) return 30;
  if (score >= 100000) return 20;
  if (score >= 50000) return 15;
  if (score >= 20000) return 10;
  if (score >= 5000) return 5;
  return 1;
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isAdmin } = useAuth();
  const [tab, setTab] = useState<'scores' | 'stats' | 'achievements'>('scores');
  const [stats, setStats] = useState<Stats>({ totalScore: 0, numberOfGame: 0, averageAccuracy: 0, fullCombos: 0 });
  const [scores, setScores] = useState<Score[]>([]);
  const [allSuccesses, setAllSuccesses] = useState<Success[]>([]);
  const [userSuccesses, setUserSuccesses] = useState<UserSuccess[]>([]);
  const [profileUser, setProfileUser] = useState<{ username: string; email: string; createdAt: string; roles: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.id === Number(id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      api.get(`/games/total-score/${id}`),
      api.get(`/games/number-of-games/${id}`),
      api.get(`/games/average-accuracy/${id}`),
      api.get(`/games/number-full-combo/${id}`),
      api.get(`/games/best-scores/${id}`),
      api.get('/all-successes'),
      api.get(`/user/success/${id}`),
    ])
      .then(([scoreRes, gamesRes, accRes, fcRes, bestRes, allSuccRes, userSuccRes]) => {
        setStats({
          totalScore: scoreRes.data.totalScore ?? 0,
          numberOfGame: gamesRes.data.numberOfGame ?? 0,
          averageAccuracy: accRes.data.averageAccuracy ?? 0,
          fullCombos: fcRes.data.nomberFullCombo ?? 0,
        });
        setScores(bestRes.data.scores ?? []);
        setAllSuccesses(allSuccRes.data.successes ?? []);
        setUserSuccesses(userSuccRes.data.successes ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    if (isOwnProfile && currentUser) {
      setProfileUser({
        username: currentUser.username,
        email: currentUser.email,
        createdAt: currentUser.createdAt,
        roles: currentUser.roles,
      });
    }
  }, [id]);

  const unlockedIds = new Set(userSuccesses.map(us => us.success.id));
  const unlockedCount = unlockedIds.size;
  const level = calculateLevel(stats.totalScore);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR');

  if (loading) return <div className="page-loading">Chargement...</div>;

  const displayUser = profileUser ?? currentUser;

  return (
    <div className="profile-page slide-in">
      <div className="profile-header">
        <div className="profile-avatar">
          {displayUser?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="profile-info">
          <div className="profile-name-row">
            <h1 className="profile-username">{displayUser?.username}</h1>
            {isAdmin && <span className="badge badge-admin">Admin</span>}
            {isOwnProfile && <span className="badge badge-you">C'est vous</span>}
            <span className="badge badge-member">Membre</span>
          </div>
          <p className="profile-email">{displayUser?.email}</p>
          <p className="profile-date">
            Membre depuis le {displayUser?.createdAt ? formatDate(displayUser.createdAt) : '—'}
          </p>
          <div className="profile-level">Niveau {level}</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value neon-cyan">{stats.totalScore.toLocaleString()}</div>
          <div className="stat-label">Points totaux</div>
        </div>
        <div className="stat-card">
          <div className="stat-value neon-pink">{stats.numberOfGame}</div>
          <div className="stat-label">Parties jouées</div>
        </div>
        <div className="stat-card">
          <div className="stat-value neon-cyan">{stats.averageAccuracy.toFixed(1)}%</div>
          <div className="stat-label">Précision moyenne</div>
        </div>
        <div className="stat-card">
          <div className="stat-value neon-pink">{stats.fullCombos}</div>
          <div className="stat-label">Full Combos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value neon-cyan">{unlockedCount}/{allSuccesses.length}</div>
          <div className="stat-label">Achievements</div>
        </div>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'scores' ? 'active' : ''}`} onClick={() => setTab('scores')}>Scores</button>
        <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>Statistiques</button>
        <button className={`tab-btn ${tab === 'achievements' ? 'active' : ''}`} onClick={() => setTab('achievements')}>Achievements</button>
      </div>

      <div className="tab-content">
        {tab === 'scores' && (
          <div className="scores-list">
            <h2>Top 5 Meilleurs Scores</h2>
            {scores.length === 0 ? (
              <p className="empty-msg">Aucun score enregistré.</p>
            ) : (
              scores.slice(0, 5).map((s, i) => (
                <div key={i} className="score-row">
                  <span className={`rank-badge rank-${i + 1}`}>#{i + 1}</span>
                  <span className="score-music">{s.musique?.name ?? 'Inconnu'}</span>
                  <span className="score-value neon-cyan">{s.score.toLocaleString()} pts</span>
                  <span className="score-date">{formatDate(s.playedAt)}</span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'stats' && (
          <div className="stats-detail">
            <h2>Statistiques globales</h2>
            <div className="stat-row">
              <span>Score total</span>
              <span className="neon-cyan">{stats.totalScore.toLocaleString()}</span>
            </div>
            <div className="stat-row">
              <span>Parties jouées</span>
              <span className="neon-cyan">{stats.numberOfGame}</span>
            </div>
            <div className="stat-row">
              <span>Précision moyenne</span>
              <span className="neon-cyan">{stats.averageAccuracy.toFixed(2)}%</span>
            </div>
            <div className="stat-row">
              <span>Full Combos</span>
              <span className="neon-cyan">{stats.fullCombos}</span>
            </div>
            <div className="stat-row">
              <span>Niveau</span>
              <span className="neon-cyan">{level}</span>
            </div>
            <div className="achievement-progress">
              <div className="progress-label">
                <span>Achievements débloqués</span>
                <span>{unlockedCount} / {allSuccesses.length}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: allSuccesses.length ? `${(unlockedCount / allSuccesses.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'achievements' && (
          <div className="achievements-grid">
            {allSuccesses.map(ach => {
              const unlocked = unlockedIds.has(ach.id);
              const userSucc = userSuccesses.find(us => us.success.id === ach.id);
              return (
                <div key={ach.id} className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}>
                  <div className="ach-icon">{unlocked ? '🏆' : '🔒'}</div>
                  <div className="ach-info">
                    <div className="ach-name">{ach.name}</div>
                    <div className="ach-desc">{ach.description}</div>
                    {unlocked && userSucc && (
                      <div className="ach-date">Débloqué le {formatDate(userSucc.obtained_at)}</div>
                    )}
                  </div>
                </div>
              );
            })}
            {allSuccesses.length === 0 && <p className="empty-msg">Aucun achievement disponible.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
