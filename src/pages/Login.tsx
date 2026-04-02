import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [signupForm, setSignupForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        identifier: loginForm.identifier,
        password: loginForm.password,
      });
      login(res.data.token, res.data.user);
      navigate('/home');
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
      setError(data?.message || data?.error || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (signupForm.password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    if (signupForm.password !== signupForm.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/signin', {
        username: signupForm.username,
        email: signupForm.email,
        password: signupForm.password,
      });
      setSuccess('Compte créé ! Tu peux maintenant te connecter.');
      setTab('login');
      setSignupForm({ username: '', email: '', password: '', confirm: '' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; error?: string }; status?: number }; message?: string };
      const data = axiosErr?.response?.data;
      const status = axiosErr?.response?.status;
      if (!axiosErr?.response) {
        setError('Impossible de joindre le serveur. Vérifie que l\'API tourne sur localhost:8000.');
      } else {
        setError(`[${status}] ${data?.message || data?.error || JSON.stringify(data) || "Erreur lors de l'inscription."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-in">
        <div className="auth-logo">
          <div className="brand-logo large">BC</div>
          <h1 className="auth-title">BeatCube</h1>
          <p className="auth-subtitle">Le jeu de rythme ultime</p>
        </div>

        <div className="tab-bar">
          <button
            className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
          >
            Connexion
          </button>
          <button
            className={`tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}
          >
            Inscription
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email ou nom d'utilisateur</label>
              <input
                className="neon-input"
                type="text"
                placeholder="exemple@email.com"
                value={loginForm.identifier}
                onChange={e => setLoginForm(f => ({ ...f, identifier: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                className="neon-input"
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn-neon-cyan w-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="auth-form">
            <div className="form-group">
              <label>Nom d'utilisateur</label>
              <input
                className="neon-input"
                type="text"
                placeholder="MonPseudo"
                value={signupForm.username}
                onChange={e => setSignupForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                className="neon-input"
                type="email"
                placeholder="exemple@email.com"
                value={signupForm.email}
                onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                className="neon-input"
                type="password"
                placeholder="Min. 6 caractères"
                value={signupForm.password}
                onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                className="neon-input"
                type="password"
                placeholder="••••••••"
                value={signupForm.confirm}
                onChange={e => setSignupForm(f => ({ ...f, confirm: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn-neon-cyan w-full" disabled={loading}>
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
