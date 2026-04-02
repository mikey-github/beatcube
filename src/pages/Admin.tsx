import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import type { AdminUser, Upload } from '../types';

export default function Admin() {
  const { user: currentUser } = useAuth();
  const [players, setPlayers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [loading, setLoading] = useState(true);

  const [banModal, setBanModal] = useState<{ open: boolean; userId: number | null }>({ open: false, userId: null });
  const [banReason, setBanReason] = useState('');
  const [banDays, setBanDays] = useState('');

  const [uploadsModal, setUploadsModal] = useState<{ open: boolean; uploads: Upload[]; username: string }>({
    open: false, uploads: [], username: '',
  });
  const [profileModal, setProfileModal] = useState<{ open: boolean; player: AdminUser | null }>({ open: false, player: null });

  useEffect(() => {
    api.get('/utilisateur/allusers')
      .then(res => setPlayers(res.data.users ?? []))
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = players.filter(p => {
    const matchSearch = p.username.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (statusFilter === 'banned' ? p.isBanned : !p.isBanned);
    return matchSearch && matchStatus;
  });

  const activePlayers = players.filter(p => !p.isBanned).length;
  const bannedPlayers = players.filter(p => !!p.isBanned).length;

  const openUploads = async (player: AdminUser) => {
    try {
      const res = await api.get(`/musique/admin/uploadBy/${player.id}`);
      setUploadsModal({ open: true, uploads: res.data.uploads ?? [], username: player.username });
    } catch {
      setUploadsModal({ open: true, uploads: [], username: player.username });
    }
  };

  const handleBan = async () => {
    if (!banModal.userId || !currentUser) return;
    try {
      await api.post(`/utilisateur/ban/${banModal.userId}/admin/${currentUser.id}`, {
        reason: banReason,
        ...(banDays ? { days: Number(banDays) } : {}),
      });
      setPlayers(prev => prev.map(p => p.id === banModal.userId ? { ...p, isBanned: true, banReason } : p));
      setBanModal({ open: false, userId: null });
      setBanReason('');
      setBanDays('');
    } catch {
      alert('Erreur lors du bannissement.');
    }
  };

  const handleUnban = async (userId: number) => {
    try {
      await api.post(`/utilisateur/unban/${userId}`);
      setPlayers(prev => prev.map(p => p.id === userId ? { ...p, isBanned: false, banReason: undefined } : p));
    } catch {
      alert('Erreur lors du débannissement.');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR');

  return (
    <div className="admin-page slide-in">
      <h1 className="page-title">Panel Admin</h1>

      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-value neon-cyan">{activePlayers}</div>
          <div className="stat-label">Joueurs actifs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value neon-pink">{players.length}</div>
          <div className="stat-label">Total joueurs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ff4444' }}>{bannedPlayers}</div>
          <div className="stat-label">Bannis</div>
        </div>
      </div>

      <div className="admin-filters">
        <input
          className="neon-input"
          placeholder="Rechercher un joueur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-btns">
          {(['all', 'active', 'banned'] as const).map(f => (
            <button
              key={f}
              className={`filter-btn ${statusFilter === f ? 'active' : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Bannis'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Chargement...</div>
      ) : (
        <div className="admin-player-list">
          {filtered.map(player => (
            <div key={player.id} className={`admin-player-card ${player.isBanned ? 'banned' : ''}`}>
              <div className="player-card-info">
                <div className="player-avatar-sm">{player.username[0].toUpperCase()}</div>
                <div>
                  <div className="player-card-name">
                    {player.username}
                    {player.isBanned && <span className="badge badge-banned">Banni</span>}
                    {player.roles?.includes('ROLE_ADMIN') && <span className="badge badge-admin">Admin</span>}
                  </div>
                  <div className="player-card-email">{player.email}</div>
                  {player.isBanned && player.banReason && (
                    <div className="ban-reason">Raison : {player.banReason}</div>
                  )}
                </div>
              </div>
              <div className="player-card-actions">
                <button className="btn-sm btn-outline" onClick={() => openUploads(player)}>
                  📋 Uploads
                </button>
                <button className="btn-sm btn-outline" onClick={() => setProfileModal({ open: true, player })}>
                  👁️ Profil
                </button>
                {player.isBanned ? (
                  <button className="btn-sm btn-green" onClick={() => handleUnban(player.id)}>
                    ✓ Débannir
                  </button>
                ) : (
                  <button
                    className="btn-sm btn-red"
                    onClick={() => setBanModal({ open: true, userId: player.id })}
                    disabled={player.roles?.includes('ROLE_ADMIN')}
                  >
                    🚫 Bannir
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="empty-msg">Aucun joueur trouvé.</p>}
        </div>
      )}

      {/* Ban Modal */}
      {banModal.open && (
        <div className="modal-overlay" onClick={() => setBanModal({ open: false, userId: null })}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Bannir le joueur</h2>
            <div className="modal-form">
              <input
                className="neon-input"
                placeholder="Raison du bannissement"
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                required
              />
              <input
                className="neon-input"
                placeholder="Durée en jours (vide = définitif)"
                value={banDays}
                onChange={e => setBanDays(e.target.value)}
                type="number"
                min="1"
              />
              <div className="modal-actions">
                <button className="btn-neon-red" onClick={handleBan} disabled={!banReason}>
                  Confirmer le ban
                </button>
                <button className="btn-neon-outline" onClick={() => setBanModal({ open: false, userId: null })}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uploads Modal */}
      {uploadsModal.open && (
        <div className="modal-overlay" onClick={() => setUploadsModal({ open: false, uploads: [], username: '' })}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Uploads de {uploadsModal.username}</h2>
            {uploadsModal.uploads.length === 0 ? (
              <p className="empty-msg">Aucun upload.</p>
            ) : (
              <div className="uploads-list">
                {uploadsModal.uploads.map((u, i) => (
                  <div key={i} className="upload-row">
                    <div className="upload-info">
                      <span className="upload-name">{u.musique.name}</span>
                      <span className="upload-artist">{u.musique.singer}</span>
                    </div>
                    <span className="upload-date">{formatDate(u.uploadAt)}</span>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-neon-outline mt-4" onClick={() => setUploadsModal({ open: false, uploads: [], username: '' })}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileModal.open && profileModal.player && (
        <div className="modal-overlay" onClick={() => setProfileModal({ open: false, player: null })}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Profil de {profileModal.player.username}</h2>
            <div className="modal-profile-info">
              <div className="modal-profile-row"><span>Nom d'utilisateur</span><span>{profileModal.player.username}</span></div>
              <div className="modal-profile-row"><span>Email</span><span>{profileModal.player.email}</span></div>
              <div className="modal-profile-row">
                <span>Membre depuis</span>
                <span>{profileModal.player.createdAt ? formatDate(profileModal.player.createdAt) : '—'}</span>
              </div>
              <div className="modal-profile-row">
                <span>Statut</span>
                <span className={profileModal.player.isBanned ? 'neon-red' : 'neon-cyan'}>
                  {profileModal.player.isBanned ? 'Banni' : 'Actif'}
                </span>
              </div>
            </div>
            <button className="btn-neon-outline mt-4" onClick={() => setProfileModal({ open: false, player: null })}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
