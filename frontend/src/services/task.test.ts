import{describe, expect, it} from 'vitest';
import{toTarefa} from './tasks';
import type {ApiTask} from './tasks';

describe('toTarefa', ()=> {
    it('converte uma tarefa ad API para o formato do frontend', ()=>{
        const task : ApiTask = {
            id: 10,
            title: 'Estudar para prova',
            description: 'Revisar apostila',
            priority: 'alta',
            status: 'pendente',
            due_date: null
    };
        const resultado = toTarefa(task);
        expect(resultado).toEqual({
            id: '10',
            titulo: 'Estudar para prova',
            descricao: 'Revisar apostila',
            prioridade: 'alta',
            status: 'pendente',
            dataVencimento: undefined,
        })
});
    it('converte descrição nula em undefined', () => {
        const task: ApiTask = {
            id: 11,
            title: 'Revisar React',
            description: null,
            priority: 'media',
            status: 'pendente',
            due_date: null,
        };
        const resultado = toTarefa(task);
        expect(resultado.descricao).toBeUndefined();
    });
});