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

## Instalação e execução local

Pré-requisitos: [Node.js e npm](https://nodejs.org/) para o frontend e [Python](https://www.python.org/downloads/) para o backend.

### Backend

No PowerShell, a partir da raiz do repositório, crie e ative o ambiente virtual, instale as dependências e inicie a API:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Com o backend em execução, a API estará disponível em `http://localhost:8000` e a documentação interativa do Swagger em `http://localhost:8000/docs`. Por padrão, os dados são armazenados em SQLite no arquivo `backend/tasks.db`. Para usar outro banco, configure a variável de ambiente `DATABASE_URL` antes de iniciar a API.

### Frontend

Abra outro terminal na raiz do repositório e instale as dependências e inicie o servidor de desenvolvimento:

```powershell
cd frontend
npm i
npm run dev
```

O Vite exibirá no terminal o endereço local da interface, normalmente `http://localhost:5173`. Mantenha o backend e o frontend em execução ao mesmo tempo para usar as operações de tarefas.

Consulte o [README do frontend](frontend/README.md) para detalhes adicionais de configuração, integração e scripts disponíveis.

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

## Histórias de Usuário

| Código | História de Usuário | Prioridade | Status | Rastreabilidade |
| :---: | :--- | :---: | :---: | :--- |
| **US1** | Como usuário, quero cadastrar tarefas com título, descrição e prioridade para organizar minhas atividades. | Alta | Entregue | `POST /tasks/` ([backend/app/routers/tasks.py](backend/app/routers/tasks.py)) · testes `test_create_task_success`, `test_create_task_uses_default_priority_and_status` |
| **US2** | Como usuário, quero visualizar minhas tarefas em um painel para acompanhar minhas atividades. | Alta | Entregue | `GET /tasks/` + [frontend/src/pages/Home.tsx](frontend/src/pages/Home.tsx) · testes `test_list_tasks_returns_all`, `Home.test.tsx` |
| **US3** | Como usuário, quero entrar no sistema com e-mail e senha para que apenas eu acesse o meu painel de tarefas. | Alta | Entregue | PR #32 (`POST /auth/login`, backend) e PR #38 (integração real no frontend) · testes `test_auth.py`, `login.entrar.test.tsx` |
| **US4** | Como usuário, quero excluir tarefas que não preciso mais para manter meu painel organizado. | Alta | Entregue | `DELETE /tasks/{id}` · testes `test_delete_task_success`, `test_delete_task_not_found` |
| **US5** | Como usuário, quero editar os detalhes e o status das minhas tarefas para mantê-las atualizadas conforme o meu progresso no quadro Kanban. | Alta | Entregue | `PATCH /tasks/{id}` · testes `test_update_task_patch_success`, `test_update_task_blank_title_fails` |
| **US6** | Como integrador do sistema, eu quero consultar uma tarefa específica pelo seu identificador, para que eu possa construir funcionalidades que dependam de uma tarefa isolada (ex: tela de detalhes). | Média | Entregue | `GET /tasks/{id}` (commit `13acd6d`) · testes `test_get_task_success`, `test_get_task_not_found` |
| **US7** | Como usuário, quero ser informado caso ocorra uma falha ao carregar as tarefas e ter a opção de tentar novamente, para que eu saiba se houve um problema de conexão e possa recarregar minhas tarefas sem sair do painel. | Baixa | Entregue | PR #8 (Igor) · [frontend/src/pages/Home.tsx](frontend/src/pages/Home.tsx) (botão "Tentar novamente") · `Home.test.tsx` |

Critérios de aceite detalhados (Given/When/Then) de cada história:

<details>
<summary>US1 — Cadastrar tarefas</summary>

**1.** Dado que estou no painel, quando informo um título e confirmo, então a tarefa é criada e aparece no painel com status "pendente".<br>
**2.** Dado que não informei prioridade, quando salvo a tarefa, então ela recebe a prioridade "média" por padrão.<br>
**3.** Dado que deixei o título vazio, quando tento salvar, então o sistema rejeita o cadastro e informa que o título é obrigatório.<br>
**4.** Dado que escolhi a prioridade "alta", quando salvo a tarefa, então ela é exibida com a prioridade "alta".
</details>

<details>
<summary>US2 — Visualizar tarefas no painel</summary>

**1.** Dado que existem tarefas cadastradas, quando abro o painel, então todas elas são exibidas agrupadas por status (pendente, em andamento, concluída).<br>
**2.** Dado que cada tarefa é exibida, então vejo seu título, descrição e prioridade.<br>
**3.** Dado que ainda não há tarefas, quando abro o painel, então vejo uma mensagem indicando que não há tarefas cadastradas.<br>
**4.** Dado que as tarefas estão sendo carregadas, então vejo um indicador de carregamento.
</details>

<details>
<summary>US3 — Login</summary>

**1.** Dado que informei e-mail e senha corretos, quando confirmo o login, então sou levado ao painel de tarefas.<br>
**2.** Dado que informei e-mail ou senha incorretos, quando confirmo o login, então vejo uma mensagem de erro e permaneço na tela de login.<br>
**3.** Dado que não estou autenticado, quando tento abrir o painel diretamente, então sou redirecionado para a tela de login.<br>
**4.** Dado que o e-mail ou a senha estão em branco, quando tento entrar, então o sistema não envia o login e avisa que os campos são obrigatórios.
</details>

<details>
<summary>US4 — Excluir tarefas</summary>

**1.** Dado que existe uma tarefa no painel, quando clico em excluir, então a tarefa é removida do painel e do banco de dados.<br>
**2.** Dado que excluí uma tarefa, quando atualizo a página, então a tarefa não reaparece.<br>
**3.** Dado que a tarefa já foi excluída (por exemplo, em outra aba), quando tento excluí-la novamente, então o sistema informa que a tarefa não foi encontrada, sem quebrar a tela.<br>
**4.** Dado que a exclusão falhou, então a tarefa continua no painel e vejo uma mensagem de erro.
</details>

<details>
<summary>US5 — Editar detalhes e status</summary>

**1.** Dado que clico em editar uma tarefa, quando altero seu título, descrição ou prioridade e salvo, então as novas informações são atualizadas instantaneamente no painel.<br>
**2.** Dado que estou no painel, quando altero o status de uma tarefa (ex: movendo de "pendente" para "em andamento"), então a mudança é persistida no banco e ela muda de coluna.<br>
**3.** Dado que tento salvar uma edição apagando completamente o título, então o sistema deve bloquear a ação e exibir uma mensagem exigindo o preenchimento.<br>
**4.** Dado que ocorre um erro de conexão ao tentar salvar a edição, então o sistema exibe um alerta de falha e permite que o usuário tente novamente.
</details>

<details>
<summary>US6 — Consultar tarefa por id</summary>

**1.** Dado um id existente, a requisição retorna os dados completos da tarefa.<br>
**2.** Dado um id inexistente, a requisição retorna erro 404 com mensagem clara.
</details>

<details>
<summary>US7 — Aviso de falha e nova tentativa</summary>

**1.** Dado que ocorreu uma falha de comunicação ao buscar as tarefas, quando o painel termina de tentar carregar, então vejo uma mensagem clara informando que não foi possível carregar as tarefas.<br>
**2.** Dado que a mensagem de erro está visível, quando clico em "Tentar novamente", então o sistema dispara uma nova tentativa e exibe o indicador de carregamento.<br>
**3.** Dado que a nova tentativa obteve sucesso, quando os dados são retornados, então a mensagem de erro desaparece e minhas tarefas são exibidas no painel.<br>
**4.** Dado que a nova tentativa falhou novamente, quando a requisição encerra com erro, então a mensagem de erro continua visível permitindo nova tentativa.
</details>

## Metodologia de Desenvolvimento

O grupo adotou um **Kanban informal via Trello** (board "Gerenciador de tarefas"), em vez de Scrum com sprints fechadas. Essa escolha refletiu como o time já trabalhava antes mesmo da disciplina formalizar o processo: sem reuniões de planejamento marcadas, com entrada de tarefas no quadro conforme iam surgindo.

- **Ferramentas:** Trello para o board de tarefas (listas "A fazer - Backend", "A fazer - Frontend", "User Story", entre outras), GitHub (issues/PRs) para o código, Jenkins para CI.
- **Papéis:** sem papéis formais (não teve PO, Scrum Master ou QA dedicado) — divisão **natural por área**: Fernando e João Pedro concentraram o backend; Igor e Hiago concentraram o frontend. O merge dos PRs, no entanto, era feito por **outro integrante**, não por quem abriu — ver code review na Dinâmica de Desenvolvimento abaixo.
- **Cadência:** sem sprints de duração fixa. O ritmo foi guiado pelas datas de entrega da disciplina (Entrega 4 → CI/CD, Entrega 5 → agilidade/requisitos, Entrega de Refactoring, Entrega Final → autenticação/FK, NP2 → esta etapa). Comunicação entre os integrantes aconteceu **pontualmente**, quando havia algum bloqueio técnico ou decisão que exigia alinhamento (ex: combinar quem ficava com autenticação e quem ficava com filtros/Alembic antes da Entrega Final) — não houve daily nem reunião semanal fixa.
- **Definição de Pronto (DoD):** uma tarefa era considerada pronta quando: o código estava numa branch própria, tinha teste automatizado cobrindo o comportamento, passava no pipeline Jenkins, e tinha sido integrado à `main` via Pull Request.
- **Definição de Preparado (DoR):** não foi usada formalmente — não houve uma etapa de "refinamento" separada antes de uma tarefa entrar em desenvolvimento. O card do Trello com uma frase descrevendo o que fazer já era suficiente para começar.
- **Métricas simples:** ao longo de ~11 semanas (26/08 a 12/11), o repositório teve 40 Pull Requests mergeados — uma média de aproximadamente 3 a 4 PRs por semana, concentrados perto de cada data de entrega da disciplina.

## Dinâmica de Desenvolvimento

### Divisão de tarefas e decisões técnicas

A divisão seguiu a especialização de cada integrante (backend/frontend), mas sem rigidez: por exemplo, a autenticação (etapa estruturante, que mexe nas duas pontas) ficou combinada explicitamente entre Fernando e João Pedro antes de começar, exatamente pra evitar dois integrantes implementando a mesma coisa em paralelo sem saber. Decisões técnicas com impacto maior (plataforma de deploy, biblioteca de hash de senha, formato de token) foram tomadas por quem estava implementando aquela parte, não por consenso do grupo inteiro — refletindo o processo informal descrito acima.

### Fluxo de branches, commits e code review

Uma branch por pessoa (`Fernando`, `Igor`, `joao-pedro`), mais branches específicas por funcionalidade quando necessário (ex: `Fernando-autenticacao`, `feature-Frontend`), integradas na `main` via Pull Request. Mensagens de commit seguem o padrão *Conventional Commits* (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`).

O code review foi, na prática, cruzado: de 40 PRs mergeados, **35 (87,5%) foram mergeados por um integrante diferente de quem abriu** (conferido comparando autor vs. quem clicou em "Merge" via `gh pr list`). Só os 5 primeiros PRs do projeto foram self-merge, antes dessa prática se firmar como hábito do grupo.

### Conflitos e bloqueios encontrados

- **Conflito de merge na autenticação:** duas implementações de autenticação (JWT com bcrypt, e outra com hash próprio) foram desenvolvidas em paralelo por integrantes diferentes, sem que um soubesse do outro — o merge entre os dois PRs não gerou conflito textual no Git, mas deixou o backend com dois sistemas de login incompatíveis coexistindo, incluindo uma regressão de segurança (um usuário logado passou a ver tarefas de todo mundo). Só foi detectado rodando a suíte de testes direto na branch principal depois do merge, e corrigido num PR de hotfix dedicado.
- **Restrição de acesso ao repositório no Render:** o serviço de deploy não enxergava o repositório do grupo por padrão, por uma configuração de permissão a nível de organização no GitHub — precisou de um administrador da organização pra liberar.
- **Bug de roteamento só percebido em produção:** o frontend publicado devolvia erro 404 ao recarregar a página em qualquer rota diferente da inicial — um comportamento que só aparece com o app hospedado como site estático, não durante o desenvolvimento local.
- **Arquivo de teste corrompido:** um arquivo de testes foi sobrescrito no meio de uma sessão de trabalho, provavelmente por edição concorrente no mesmo diretório por mais de um processo/sessão ao mesmo tempo — resolvido reescrevendo o arquivo do zero.

### Lições aprendidas

- **Combinar escopo antes de começar a codar evita retrabalho:** nos casos em que duas pessoas combinaram antecipadamente quem fazia o quê (ex: autenticação vs. filtros/Alembic), não houve conflito de funcionalidade duplicada. Já a autenticação, desenvolvida sem esse alinhamento prévio entre dois integrantes, foi exatamente onde ocorreu o maior conflito do projeto.
- **"Sem conflito no Git" não significa "merge correto":** o pior bug do projeto (dois sistemas de autenticação coexistindo) nunca apareceu como conflito de merge — só foi descoberto rodando a suíte de testes completa depois do merge, na branch principal. Da próxima vez, vale tornar isso um passo explícito do processo, não uma verificação eventual.
- **Testar fora do "caminho feliz" de desenvolvimento local revela bugs que só existem em produção:** tanto o bug de CORS quanto o de roteamento do frontend só existiam no ambiente publicado — nenhum dos dois aparecia rodando a aplicação localmente.
- **Merge feito por outra pessoa não é o mesmo que revisão profunda do conteúdo:** mesmo com o hábito de pedir pra um colega clicar em "Merge" (não o próprio autor), o PR com a segunda implementação de autenticação foi mergeado sem que ninguém percebesse que já existia uma autenticação diferente em `main` — o clique em "Merge" por outra pessoa não substitui ler o diff com atenção, principalmente quando a mudança mexe em algo tão estruturante quanto autenticação.

## Refactorings

| Quem | Smell | Refactoring aplicado | Por quê | PR |
| --- | --- | --- | --- | --- |
| Fernando Faluxis | Lógica de busca + 404 duplicada em `get_task`, `update_task` e `delete_task` (`backend/app/routers/tasks.py`) | Extract Function: criada `get_task_or_404(task_id, db)`, chamada pelas três rotas | Reduz 3 blocos idênticos de 3 linhas para 1 chamada, centralizando a mensagem de erro numa constante (`TASK_NOT_FOUND_DETAIL`) e facilitando manutenção futura | _(preencher após abrir o PR)_ |
| Fernando Faluxis | Configuração de conexão (URL padrão do SQLite e `connect_args`) solta no escopo do módulo em `backend/app/database.py` | Extract Function: criadas `get_database_url()` e `get_connect_args(database_url)` | Isola a decisão de qual banco usar e quais argumentos de conexão aplicar, tornando a lógica testável isoladamente (ver `test_get_connect_args_sqlite_vs_postgres`) sem precisar instanciar uma engine real | _(preencher após abrir o PR)_ |

## Equipe

Grupo C14 — Inatel — 2026/2.

- Fernando Faluxis
- Igor Henrique
- João Pedro Moreira
- Hiago Marques
