import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero slide-in">
        <h1 className="hero-title">
          Beat<span className="neon-cyan">Cube</span>
        </h1>
        <p className="hero-subtitle">Le jeu de rythme qui teste ta précision</p>
        <div className="hero-actions">
          <Link to={`/profil/${user?.id}`} className="btn-neon-cyan">
            Mon Profil
          </Link>
          <Link to="/leaderboard" className="btn-neon-outline">
            Leaderboard
          </Link>
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🎵</div>
          <h3>Rythme & Précision</h3>
          <p>Frappe les cubes au bon moment pour maximiser ton score.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏆</div>
          <h3>Compétition</h3>
          <p>Grimpe dans le classement mondial et prouve que tu es le meilleur.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎖️</div>
          <h3>Achievements</h3>
          <p>Débloque des succès en relevant des défis uniques.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎶</div>
          <h3>Communauté</h3>
          <p>Upload tes musiques et partage-les avec la communauté.</p>
        </div>
      </section>
    </div>
  );
}
