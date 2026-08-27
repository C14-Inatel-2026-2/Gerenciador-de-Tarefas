import { TaskCard } from '../components/TaskCard';
import type { Tarefa } from '../types';

const tarefasMock: Tarefa[] = [
  {
    id: '1',
    titulo: 'Estruturar repositório e frontend',
    descricao: 'Configurar Vite, React, TS e Tailwind CSS v4.',
    status: 'concluida',
    prioridade: 'alta',
    dataVencimento: '2026-08-27',
  },
  {
    id: '2',
    titulo: 'Criar modelo do FastAPI',
    descricao: 'Montar o schema Pydantic e a rota inicial do backend.',
    status: 'pendente',
    prioridade: 'media',
  },
  {
    id: '3',
    titulo: 'Revisar material da faculdade',
    status: 'em_andamento',
    prioridade: 'baixa',
  }
];

export function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-white">Meu Dashboard</h1>
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
            + Nova Tarefa
          </button>
        </header>

        {/* Grid para exibir os cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {tarefasMock.map((tarefa) => (
            <TaskCard key={tarefa.id} tarefa={tarefa} />
          ))}
        </div>
      </div>
    </div>
  );
}