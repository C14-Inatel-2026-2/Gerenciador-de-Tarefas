import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados capturados para envio:', { email, password });
    

    navigate('/Home');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4">
      
      {/* Título do Projeto */}
      <h1 className="mb-8 text-center text-4xl font-extrabold text-blue-400">
        Gerenciador de Tarefas
      </h1>

      {/* Caixa de Login */}
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-xl border border-slate-700">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">
          Acessar Conta
        </h2>
        
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Campo de E-mail */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          {/* Campo de Senha */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Botão de Submit */}
          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-center font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}