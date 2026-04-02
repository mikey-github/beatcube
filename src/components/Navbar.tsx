import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', singer: '', year: '', file: null as File | null });
  const [uploadMsg, setUploadMsg] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) return;
    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('file', uploadForm.file);
    data.append('name', uploadForm.name);
    data.append('singer', uploadForm.singer);
    data.append('year', uploadForm.year);
    try {
      const res = await fetch('http://localhost:8000/api/musique/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      if (res.ok) {
        setUploadMsg('Musique uploadée avec succès !');
        setUploadForm({ name: '', singer: '', year: '', file: null });
      } else {
        setUploadMsg("Erreur lors de l'upload.");
      }
    } catch {
      setUploadMsg("Erreur réseau.");
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/home" className="navbar-brand">
            <div className="brand-logo">BC</div>
            <span className="brand-name">BeatCube</span>
          </Link>

          {user && (
            <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
              <Link to="/home" onClick={() => setMenuOpen(false)}>Accueil</Link>
              <Link to="/leaderboard" onClick={() => setMenuOpen(false)}>Leaderboard</Link>
              <Link to={`/profil/${user.id}`} onClick={() => setMenuOpen(false)}>Profil</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
              <button className="btn-neon-outline" onClick={() => { setUploadOpen(true); setMenuOpen(false); }}>
                + Upload
              </button>
              <button className="btn-neon-outline logout-btn" onClick={handleLogout}>
                Déconnexion
              </button>
            </div>
          )}

          {user && (
            <button className="burger" onClick={() => setMenuOpen(!menuOpen)}>
              <span /><span /><span />
            </button>
          )}
        </div>
      </nav>

      {uploadOpen && (
        <div className="modal-overlay" onClick={() => { setUploadOpen(false); setUploadMsg(''); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Upload une musique</h2>
            <form onSubmit={handleUpload} className="modal-form">
              <input
                className="neon-input"
                placeholder="Nom de la musique"
                value={uploadForm.name}
                onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className="neon-input"
                placeholder="Artiste"
                value={uploadForm.singer}
                onChange={e => setUploadForm(f => ({ ...f, singer: e.target.value }))}
                required
              />
              <input
                className="neon-input"
                placeholder="Année"
                value={uploadForm.year}
                onChange={e => setUploadForm(f => ({ ...f, year: e.target.value }))}
                required
              />
              <label className="file-label">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={e => setUploadForm(f => ({ ...f, file: e.target.files?.[0] ?? null }))}
                  required
                />
                {uploadForm.file ? uploadForm.file.name : 'Choisir un fichier audio'}
              </label>
              {uploadMsg && <p className={uploadMsg.includes('succès') ? 'msg-success' : 'msg-error'}>{uploadMsg}</p>}
              <div className="modal-actions">
                <button type="submit" className="btn-neon-cyan">Uploader</button>
                <button type="button" className="btn-neon-outline" onClick={() => { setUploadOpen(false); setUploadMsg(''); }}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
