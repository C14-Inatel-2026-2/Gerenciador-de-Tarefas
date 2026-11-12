import { useState } from 'react';
import { Check } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { saveSession, useSession } from '../auth/session';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const session = useSession();
  const [error, setError] = useState('');

  if (session) return <Navigate to="/dashboard" replace />;

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      saveSession({ email: email.trim() });
    } catch {
      setError('Não foi possível guardar a sessão. Permita o armazenamento no navegador e tente novamente.');
    }
  };

  return (
    <main className="login-shell">
      <div className="login-content">
        <div className="login-brand">
          <span className="brand-mark" aria-hidden="true"><Check size={17} strokeWidth={2.5} /></span>
          <h1>Gerenciador de Tarefas</h1>
        </div>

        <section className="login-panel">
          <h2 className="login-title">Acessar conta</h2>
          <p className="login-description">Entre para acessar suas tarefas.</p>

          <form onSubmit={handleLogin} className="login-form">
            {error && <p role="alert" className="form-error">{error}</p>}
            <div className="field-group">
              <label htmlFor="login-email" className="field-label">E-mail</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field-control"
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="login-password" className="field-label">Senha</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field-control"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="button-primary">Entrar</button>
          </form>
        </section>
      </div>
    </main>
  );
}
