# Gerenciador de Tarefas

Projeto acadêmico do grupo **C14 — Inatel — 2026/2**, desenvolvido ao longo da disciplina de Engenharia de Software. É uma aplicação web para organização pessoal de tarefas, em formato de quadro (estilo Kanban/Trello): o usuário acessa com login, visualiza suas tarefas em um painel e pode criar, editar, mover entre status e excluir cada uma delas.

O projeto é dividido em duas partes que se comunicam por HTTP:

- **Backend** (`backend/`): API REST em Python, com FastAPI e SQLAlchemy, responsável pelas regras de negócio e persistência dos dados.
- **Frontend** (`frontend/`): interface web em React e TypeScript, responsável pela experiência do usuário e consumo da API.

Repositório: [C14-Inatel-2026-2/Gerenciador-de-Tarefas](https://github.com/C14-Inatel-2026-2/Gerenciador-de-Tarefas)

## Arquitetura e tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Banco de dados | PostgreSQL (hospedado no Supabase), com SQLite como alternativa local |
| Testes | Pytest + pytest-cov (backend), Vitest + Testing Library (frontend) |
| CI/CD | Jenkins |

Instruções detalhadas de instalação e execução de cada parte estão nos respectivos READMEs: [`backend/`](backend) e [`frontend/README.md`](frontend/README.md).

## Requisitos Funcionais

| Código | Descrição |
| --- | --- |
| RF01 | O sistema deve permitir que o usuário faça login informando e-mail e senha. |
| RF02 | O sistema deve impedir o acesso ao painel de tarefas sem uma sessão válida, redirecionando para a tela de login. |
| RF03 | O sistema deve exibir, em um painel, todas as tarefas cadastradas. |
| RF04 | O sistema deve permitir criar uma nova tarefa informando título (obrigatório), descrição e prioridade. |
| RF05 | O sistema deve permitir consultar uma tarefa específica a partir do seu identificador. |
| RF06 | O sistema deve permitir editar título, descrição, prioridade e status de uma tarefa existente. |
| RF07 | O sistema deve permitir excluir uma tarefa existente. |
| RF08 | O sistema deve classificar cada tarefa por prioridade: baixa, média ou alta. |
| RF09 | O sistema deve classificar cada tarefa por status: pendente, em andamento ou concluída. |
| RF10 | O sistema deve informar ao usuário quando uma operação falhar (ex: erro ao carregar ou salvar tarefas), permitindo nova tentativa. |

## Requisitos Não Funcionais

| Código | Descrição |
| --- | --- |
| RNF01 | **Segurança:** credenciais e strings de conexão não devem ser versionadas no repositório; devem ser fornecidas por variáveis de ambiente (`.env`). |
| RNF02 | **Segurança:** senhas de usuário devem ser armazenadas com hash, nunca em texto plano. |
| RNF03 | **Portabilidade:** o backend deve funcionar tanto com SQLite (ambiente local, padrão) quanto com PostgreSQL (produção/Supabase), configurável via variável de ambiente, sem alteração de código. |
| RNF04 | **Usabilidade:** a interface deve fornecer indicação visual de carregamento e mensagens claras de erro durante operações assíncronas. |
| RNF05 | **Manutenibilidade:** as regras de negócio principais devem possuir testes automatizados (unitários e de integração), com relatório de cobertura gerado. |
| RNF06 | **Integração contínua:** mudanças no código devem ser validadas automaticamente por um pipeline de CI (build e testes) antes da integração à branch principal. |
| RNF07 | **Compatibilidade:** a interface deve ser responsiva e funcionar nos principais navegadores modernos (Chrome, Firefox, Edge). |
| RNF08 | **Desempenho:** operações simples da API (criar, buscar, excluir uma tarefa) devem responder em menos de 1 segundo em condições normais de uso. |

## Equipe

Grupo C14 — Inatel — 2026/2.

- Fernando Faluxis
- Igor Cauvilla
- João Pedro Moreira
- Hiago Marques
