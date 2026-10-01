# Gerenciador de Tarefas — Frontend

Interface web para organização de tarefas, desenvolvida como parte do projeto acadêmico da disciplina C14 do Inatel. A aplicação permite visualizar tarefas e oferece fluxos para criação, edição, alteração de status e exclusão, com comunicação com uma API em FastAPI.

## Tecnologias

| Tecnologia | Utilização |
| --- | --- |
| React | Construção da interface com componentes |
| TypeScript | Tipagem do código |
| Vite | Servidor de desenvolvimento e build |
| Tailwind CSS | Estilização da interface |
| React Router | Navegação e controle de acesso às páginas |
| Fetch API | Requisições HTTP ao backend |
| Vitest | Execução dos testes automatizados |
| Testing Library e jest-dom | Ferramentas para testes de componentes e verificações do DOM |
| jsdom | Ambiente de navegador para testes |
| ESLint | Análise estática do código |

## Funcionalidades

- Tela de acesso com campos de e-mail e senha.
- Armazenamento da sessão no `localStorage` e opção de sair.
- Redirecionamento para o login quando não há sessão válida no frontend.
- Painel com saudação baseada no e-mail informado.
- Listagem de tarefas em cartões, com prioridade, status e vencimento quando disponível.
- Formulário de criação com título, descrição e prioridade.
- Edição de título, descrição e prioridade.
- Alteração de status: pendente, em andamento ou concluída.
- Exclusão de tarefas.
- Indicadores de carregamento, mensagens de erro e nova tentativa de carregamento.
- Bloqueio de ações conflitantes durante a atualização ou exclusão de um cartão.

Os fluxos de interface estão implementados, mas seu funcionamento completo depende da disponibilidade dos endpoints descritos na seção de integração.

## Pré-requisitos

- Node.js em versão compatível com as dependências de `package-lock.json`.
- npm.
- Git, para clonar o repositório.
- Backend acessível em `http://localhost:8000` para as operações com tarefas.

Confira sua instalação:

```bash
node --version
npm --version
```

## Instalação e execução

Clone o projeto e entre na pasta do frontend:

```bash
git clone https://github.com/C14-Inatel-2026-2/Gerenciador-de-Tarefas.git
cd Gerenciador-de-Tarefas/frontend
```
instalar as dependências.
```
npm i
```
Instale as versões registradas no arquivo de lock:

```bash
npm ci
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Scripts disponíveis

Execute os comandos na pasta `frontend`.

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Verifica os tipos com TypeScript e gera o build em `dist/` |
| `npm run preview` | Disponibiliza uma prévia local do build |
| `npm run lint` | Executa o ESLint |
| `npm test` | Inicia o Vitest em modo de acompanhamento no ambiente local |
| `npm run test -- --run` | Executa a suíte de testes uma única vez |

Para visualizar o build localmente:

```bash
npm run build
npm run preview
```

## Organização do código

| Caminho | Responsabilidade |
| --- | --- |
| `src/App.tsx` | Definição das rotas da aplicação |
| `src/main.tsx` | Inicialização do React |
| `src/index.css` | Estilos globais |
| `src/auth/session.ts` | Persistência, leitura e limpeza da sessão |
| `src/components/ProtectedRoute.tsx` | Redirecionamento conforme a sessão |
| `src/components/TaskCard.tsx` | Exibição, edição e exclusão de uma tarefa |
| `src/pages/login.tsx` | Tela de acesso |
| `src/pages/Home.tsx` | Painel, carregamento e criação de tarefas |
| `src/services/tasks.ts` | Serviços HTTP e conversão dos dados da API |
| `src/services/task.test.ts` | Testes dos serviços e da conversão de tarefas |
| `src/types/index.tsx` | Tipos de tarefa, prioridade e status |
| `src/setupTests.ts` | Configuração inicial dos testes |
| `public/` | Arquivos estáticos |
| `vite.config.ts` | Configuração do Vite e do Vitest |

## Rotas da interface

| Rota | Comportamento |
| --- | --- |
| `/` | Exibe o login; com sessão válida, redireciona para `/dashboard` |
| `/dashboard` | Exibe o painel de tarefas; exige sessão no frontend |
| `/home` | Redireciona para `/dashboard`; exige sessão no frontend |

A sessão usa a chave `task-manager.session` no `localStorage`. O módulo `session.ts` fornece:

- `saveSession()`: salva a sessão e notifica a interface.
- `clearSession()`: remove a sessão e notifica a interface.
- `useSession()`: disponibiliza a sessão aos componentes e rejeita registros com estrutura inválida.

O redirecionamento de páginas organiza o fluxo da interface. Autenticação real e autorização das operações precisam ser implementadas e verificadas no backend.

## Integração com o backend

A URL está definida em `src/services/tasks.ts`:

```ts
export const TASKS_URL = 'http://localhost:8000/tasks/';
```

Para utilizar outro endereço, ajuste essa constante. Na implementação analisada, esse endereço ainda não é configurado por uma variável de ambiente.

O backend deve permitir a origem do frontend na configuração de CORS.

### Endpoints utilizados pelo frontend

| Método | Endpoint | Finalidade | Situação no backend da branch `Igor` analisada |
| --- | --- | --- | --- |
| `GET` | `/tasks/` | Listar todas as tarefas | Pendente |
| `POST` | `/tasks/` | Criar tarefa | Implementado |
| `PATCH` | `/tasks/{id}` | Editar campos ou alterar status | Pendente |
| `DELETE` | `/tasks/{id}` | Excluir tarefa | Implementado |

O backend também possui `GET /tasks/{id}` para buscar uma tarefa específica. Essa rota não substitui a listagem esperada pelo painel.

Enquanto `GET /tasks/` e `PATCH /tasks/{id}` não estiverem disponíveis, a listagem e a atualização não funcionarão integralmente. A tabela descreve o código consultado na branch `Igor` e deve ser atualizada conforme a integração evoluir.

### Formato dos dados

Exemplo de tarefa esperado pelo frontend:

```json
{
  "id": 1,
  "title": "Estudar testes unitários",
  "description": "Praticar testes com Vitest",
  "priority": "alta",
  "status": "pendente",
  "due_date": null
}
```

A função `toTarefa()` converte os campos da API para o modelo da interface:

| API | Frontend |
| --- | --- |
| `id` numérico | `id` como string |
| `title` | `titulo` |
| `description` | `descricao` |
| `priority` | `prioridade` |
| `status` | `status` |
| `due_date` | `dataVencimento`, formatada em `pt-BR` quando preenchida |

Prioridades aceitas: `baixa`, `media` e `alta`. Status aceitos: `pendente`, `em_andamento` e `concluida`.

Na criação, o frontend envia `title`, `description` e `priority`. Na edição, envia somente os campos a atualizar. O serviço de atualização espera receber a tarefa atualizada em JSON; o de exclusão aceita sucesso sem corpo, como uma resposta HTTP `204`.

## Testes automatizados

O Vitest está configurado em `vite.config.ts` com ambiente `jsdom` e arquivo inicial `src/setupTests.ts`.

Execute todos os testes:

```bash
npm run test -- --run
```

Execute apenas os testes dos serviços de tarefas:

```bash
npm run test -- --run src/services/task.test.ts
```

## Contexto acadêmico

Projeto do grupo **C14 — Inatel — 2026/2**.

Repositório: [C14-Inatel-2026-2/Gerenciador-de-Tarefas](https://github.com/C14-Inatel-2026-2/Gerenciador-de-Tarefas)
