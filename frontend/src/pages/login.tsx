import { useState } from 'react';
import { ArrowRight, Check, CircleCheck, Flag, LayoutGrid, LockKeyhole, Mail } from 'lucide-react';
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
          <span className="brand-mark" aria-hidden="true"><Check size={21} strokeWidth={2.6} /></span>
          <h1>Gerenciador de Tarefas</h1>
        </div>

        <section className="login-panel">
          <h2>Bem-vindo de volta</h2>
          <p className="login-description">Entre para acessar seu quadro de tarefas.</p>

          <form onSubmit={handleLogin} className="login-form">
            {error && <p role="alert" className="form-error">{error}</p>}
            <div className="field-group">
              <label htmlFor="login-email" className="field-label">E-mail</label>
              <div className="field-with-icon">
                <Mail size={17} aria-hidden="true" />
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
            </div>

            <div className="field-group">
              <label htmlFor="login-password" className="field-label">Senha</label>
              <div className="field-with-icon">
                <LockKeyhole size={17} aria-hidden="true" />
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
            </div>

            <button type="submit" className="button-primary login-submit">
              Entrar <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>
        </section>
      </div>

      <div className="login-showcase green-surface" aria-hidden="true">
        <div className="showcase-content">
          <div className="showcase-preview">
            <div className="preview-header">
              <LayoutGrid size={17} />
              <span>Minhas tarefas</span>
              <span className="preview-window-controls"><i /><i /><i /></span>
            </div>
            <div className="preview-grid">
              <div className="preview-card">
                <span className="priority-badge priority-alta"><Flag size={12} /> Alta</span>
                <strong>Planejar a semana</strong>
                <i /><i />
                <span className="preview-status">Em andamento</span>
              </div>
              <div className="preview-card">
                <span className="priority-badge priority-baixa"><Flag size={12} /> Baixa</span>
                <strong>Reunir os materiais</strong>
                <i /><i />
                <span className="preview-status">Concluída</span>
              </div>
            </div>
            <div className="preview-note"><CircleCheck size={19} /> Tarefa concluída</div>
          </div>
          <p className="showcase-title">Do planejamento à conclusão.</p>
          <p className="showcase-description">Acompanhe suas atividades e prioridades em um só lugar.</p>
        </div>
      </div>
    </main>
  );
}
