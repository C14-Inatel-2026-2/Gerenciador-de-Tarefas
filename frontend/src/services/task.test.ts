import{afterEach, describe, expect, it, vi} from 'vitest';
import{deleteTask, getTasks, TASKS_URL, toTarefa} from './tasks';
import type {ApiTask} from './tasks';

//Testes Unitários

describe('toTarefa', ()=> {
    it('converte uma tarefa da API para o formato do frontend', ()=>{
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

    it('preserva uma descrição vazia', () => {
        const task: ApiTask = {
            id: 13,
            title: 'Organizar materiais',
            description: '',
            priority: 'baixa',
            status: 'pendente',
            due_date: null,
        };

        const resultado = toTarefa(task);
        expect(resultado.descricao).toBe('');
});

    it('Formata a data de vencimento no padrão brasileiro',() =>{
        const task: ApiTask = {
            id: 12,
            title: 'Entregar trabalho',
            description: null,
            priority: 'alta',
            status: 'pendente',
            due_date: '2026-10-15T12:00:00',
        };
        const resultado = toTarefa(task);
        expect(resultado.dataVencimento).toBe('15/10/2026');
    })

    it('preserva os dados originais recebidos da API', () => {
    const task: ApiTask = {
        id: 14,
        title: 'Revisar exercícios',
        description: 'Capítulo 2',
        priority: 'media',
        status: 'em_andamento',
        due_date: null,
    };
    const original = { ...task };

    toTarefa(task);

    expect(task).toEqual(original);
});
});

// Testes mocks

describe('serviços de tarefas com mock', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('carrega e converte as tarefas retornadas pela API', async () => {
        const tarefasApi: ApiTask[] = [
            {
                id: 20,
                title: 'Estudar testes',
                description: 'Praticar mocks',
                priority: 'alta',
                status: 'pendente',
                due_date: null,
            },
        ];

        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify(tarefasApi), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }),
        );
        vi.stubGlobal('fetch', fetchMock);

        const controller = new AbortController();

        const resultado = await getTasks(controller.signal);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(TASKS_URL, {
            signal: controller.signal,
        });
        expect(resultado).toEqual([
            {
                id: '20',
                titulo: 'Estudar testes',
                descricao: 'Praticar mocks',
                prioridade: 'alta',
                status: 'pendente',
                dataVencimento: undefined,
            },
        ]);
    });

    it('lança um erro quando a API falha ao carregar tarefas', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(null, { status: 500 }),
        );
        vi.stubGlobal('fetch', fetchMock);

        const controller = new AbortController();

        await expect(
            getTasks(controller.signal),
        ).rejects.toThrow(
            'Não foi possível carregar as tarefas (HTTP 500).',
        );
    });

    it('exclui uma tarefa com sucesso sem exigir uma resposta JSON', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(null, { status: 204 }),
        );
        vi.stubGlobal('fetch', fetchMock);

        await expect(deleteTask('20')).resolves.toBeUndefined();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(`${TASKS_URL}20`, {
            method: 'DELETE',
        });
    });

    it('lança um erro quando a API falha ao excluir uma tarefa', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(null, { status: 404 }),
        );
        vi.stubGlobal('fetch', fetchMock);

        await expect(deleteTask('999')).rejects.toThrow(
            'Não foi possível excluir a tarefa (HTTP 404).',
        );
    });
});