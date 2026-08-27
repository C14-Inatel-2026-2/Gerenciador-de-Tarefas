import { useState } from 'react';

export function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [titulo, setTitulo] = useState('');
  const [prioridade, setPrioridade] = useState('media');
  const [descricao, setDescricao] = useState('');

  const nomeUsuario = 'Igor';

  const handleAddTarefa = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nova tarefa capturada:', { titulo, prioridade, descricao });
    
    setTitulo('');
    setDescricao('');
    setPrioridade('media');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          {/* Título atualizado com o nome do usuário */}
          <h1 className="text-3xl font-extrabold text-white">Olá, {nomeUsuario}!</h1>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            + Nova Tarefa
          </button>
        </header>

        <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/30">
          <p className="text-slate-400">O quadro está limpo. Clique no botão acima para começar!</p>
        </div>
        
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
              <h2 className="mb-6 text-2xl font-bold text-white">Adicionar Nova Tarefa</h2>
              
              <form onSubmit={handleAddTarefa} className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Título da Tarefa
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: Estudar React"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Prioridade
                  </label>
                  <select
                    value={prioridade}
                    onChange={(e) => setPrioridade(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Descrição
                  </label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Detalhes adicionais da tarefa..."
                  />
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg px-4 py-2 font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}