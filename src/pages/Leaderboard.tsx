import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import type { LeaderboardEntry } from '../types';

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

function getDifficultyLabel(score: number): string {
  if (score >= 1000000) return 'EXPERT+';
  if (score >= 500000) return 'EXPERT';
  if (score >= 200000) return 'HARD';
  if (score >= 100000) return 'NORMAL';
  return 'EASY';
}

function getDifficultyClass(score: number): string {
  if (score >= 1000000) return 'diff-expert-plus';
  if (score >= 500000) return 'diff-expert';
  if (score >= 200000) return 'diff-hard';
  if (score >= 100000) return 'diff-normal';
  return 'diff-easy';
}

export default function Leaderboard() {
  const { user: currentUser } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate] = useState(new Date().toLocaleTimeString('fr-FR'));

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/games/leaderboard');
        setEntries(res.data.leaderboard ?? []);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const userRank = entries.findIndex(e => e.id === currentUser?.id) + 1;
  const currentUserEntry = entries.find(e => e.id === currentUser?.id);

  return (
    <div className="leaderboard-page slide-in">
      <div className="leaderboard-header">
        <h1 className="page-title">🏆 Classement Global</h1>
        <div className="lb-stats-bar">
          <div className="lb-stat">
            <span className="lb-stat-value neon-cyan">{entries.length}</span>
            <span className="lb-stat-label">Joueurs</span>
          </div>
          <div className="lb-stat">
            <span className="lb-stat-value neon-pink">
              {entries.reduce((s, e) => s + e.numberOfGame, 0)}
            </span>
            <span className="lb-stat-label">Parties jouées</span>
          </div>
          <div className="lb-stat">
            <span className="lb-stat-value neon-cyan">
              {entries.length
                ? Math.round(entries.reduce((s, e) => s + e.totalScore, 0) / entries.length).toLocaleString()
                : 0}
            </span>
            <span className="lb-stat-label">Score moyen</span>
          </div>
          <div className="lb-stat">
            <span className="lb-stat-value neon-pink">{lastUpdate}</span>
            <span className="lb-stat-label">Mis à jour</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Chargement du classement...</div>
      ) : (
        <>
          <div className="lb-table-wrap">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Joueur</th>
                  <th>Score total</th>
                  <th>Précision</th>
                  <th>Difficulté</th>
                  <th>Parties</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 100).map((entry, i) => {
                  const rank = i + 1;
                  const isMe = entry.id === currentUser?.id;
                  return (
                    <tr key={entry.id} className={isMe ? 'row-me' : ''}>
                      <td>
                        <span className={`rank-badge rank-${rank <= 3 ? rank : 'default'}`}>
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                        </span>
                      </td>
                      <td>
                        <Link to={`/profil/${entry.id}`} className="lb-player">
                          <span className="lb-username">{entry.username}</span>
                          <span className="lb-level">Niv. {calculateLevel(entry.totalScore)}</span>
                          {entry.fullCombos > 0 && (
                            <span className="badge-fc">FC×{entry.fullCombos}</span>
                          )}
                        </Link>
                      </td>
                      <td className="neon-cyan fw-bold">{entry.totalScore.toLocaleString()}</td>
                      <td>{entry.averageAccuracy.toFixed(1)}%</td>
                      <td>
                        <span className={`diff-badge ${getDifficultyClass(entry.totalScore)}`}>
                          {getDifficultyLabel(entry.totalScore)}
                        </span>
                      </td>
                      <td>{entry.numberOfGame}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {currentUserEntry && userRank > 0 && (
            <div className="lb-my-rank">
              <span>Votre classement :</span>
              <span className="neon-pink fw-bold">#{userRank}</span>
              <span className="neon-cyan">{currentUserEntry.totalScore.toLocaleString()} pts</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
