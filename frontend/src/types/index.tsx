export type StatusTarefa = 'pendente' | 'em_andamento' | 'concluida';
export type PrioridadeTarefa = 'baixa' | 'media' | 'alta';

export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: StatusTarefa;
  prioridade: PrioridadeTarefa;
  dataVencimento?: string;
}