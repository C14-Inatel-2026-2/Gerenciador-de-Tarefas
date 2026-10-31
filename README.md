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

## Histórias de Usuário

| Código | História de Usuário | Critérios de aceite |
| :---: | :--- | :--- |
| **US1** | Como usuário, quero cadastrar tarefas com título, descrição e prioridade para organizar minhas atividades. | **1.** Dado que estou no painel, quando informo um título e confirmo, então a tarefa é criada e aparece no painel com status "pendente".<br><br>**2.** Dado que não informei prioridade, quando salvo a tarefa, então ela recebe a prioridade "média" por padrão.<br><br>**3.** Dado que deixei o título vazio, quando tento salvar, então o sistema rejeita o cadastro e informa que o título é obrigatório.<br><br>**4.** Dado que escolhi a prioridade "alta", quando salvo a tarefa, então ela é exibida com a prioridade "alta". |
| **US2** | Como usuário, quero visualizar minhas tarefas em um painel para acompanhar minhas atividades. | **1.** Dado que existem tarefas cadastradas, quando abro o painel, então todas elas são exibidas agrupadas por status (pendente, em andamento, concluída).<br><br>**2.** Dado que cada tarefa é exibida, então vejo seu título, descrição e prioridade.<br><br>**3.** Dado que ainda não há tarefas, quando abro o painel, então vejo uma mensagem indicando que não há tarefas cadastradas.<br><br>**4.** Dado que as tarefas estão sendo carregadas, então vejo um indicador de carregamento. |
| **US3** | Como usuário, quero entrar no sistema com e-mail e senha para que apenas eu acesse o meu painel de tarefas. | **1.** Dado que informei e-mail e senha corretos, quando confirmo o login, então sou levado ao painel de tarefas.<br><br>**2.** Dado que informei e-mail ou senha incorretos, quando confirmo o login, então vejo uma mensagem de erro e permaneço na tela de login.<br><br>**3.** Dado que não estou autenticado, quando tento abrir o painel diretamente, então sou redirecionado para a tela de login.<br><br>**4.** Dado que o e-mail ou a senha estão em branco, quando tento entrar, então o sistema não envia o login e avisa que os campos são obrigatórios. |
| **US4** | Como usuário, quero excluir tarefas que não preciso mais para manter meu painel organizado. | **1.** Dado que existe uma tarefa no painel, quando clico em excluir, então a tarefa é removida do painel e do banco de dados.<br><br>**2.** Dado que excluí uma tarefa, quando atualizo a página, então a tarefa não reaparece.<br><br>**3.** Dado que a tarefa já foi excluída (por exemplo, em outra aba), quando tento excluí-la novamente, então o sistema informa que a tarefa não foi encontrada, sem quebrar a tela.<br><br>**4.** Dado que a exclusão falhou, então a tarefa continua no painel e vejo uma mensagem de erro. |
| **US5** | Como usuário, quero editar os detalhes e o status das minhas tarefas para mantê-las atualizadas conforme o meu progresso no quadro Kanban. | **1.** Dado que clico em editar uma tarefa, quando altero seu título, descrição ou prioridade e salvo, então as novas informações são atualizadas instantaneamente no painel.<br><br>**2.** Dado que estou no painel, quando altero o status de uma tarefa (ex: movendo de "pendente" para "em andamento"), então a mudança é persistida no banco e ela muda de coluna.<br><br>**3.** Dado que tento salvar uma edição apagando completamente o título, então o sistema deve bloquear a ação e exibir uma mensagem exigindo o preenchimento.<br><br>**4.** Dado que ocorre um erro de conexão ao tentar salvar a edição, então o sistema exibe um alerta de falha e permite que o usuário tente novamente. |
| **US6** | Como integrador do sistema, eu quero consultar uma tarefa específica pelo seu identificador, para que eu possa construir funcionalidades que dependam de uma tarefa isolada (ex: tela de detalhes). | **1.** Dado um id existente, a requisição retorna os dados completos da tarefa.<br><br>**2.** Dado um id inexistente, a requisição retorna erro 404 com mensagem clara. |
| **US7** | Como usuário, quero ser informado caso ocorra uma falha ao carregar as tarefas e ter a opção de tentar novamente, para que eu saiba se houve um problema de conexão e possa recarregar minhas tarefas sem sair do painel. | **1.** Dado que ocorreu uma falha de comunicação ao buscar as tarefas, quando o painel termina de tentar carregar, então vejo uma mensagem clara informando que não foi possível carregar as tarefas.<br><br>**2.** Dado que a mensagem de erro está visível, quando clico em "Tentar novamente", então o sistema dispara uma nova tentativa e exibe o indicador de carregamento.<br><br>**3.** Dado que a nova tentativa obteve sucesso, quando os dados são retornados, então a mensagem de erro desaparece e minhas tarefas são exibidas no painel.<br><br>**4.** Dado que a nova tentativa falhou novamente, quando a requisição encerra com erro, então a mensagem de erro continua visível permitindo nova tentativa. |

## Equipe

Grupo C14 — Inatel — 2026/2.

- Fernando Faluxis
- Igor Henrique
- João Pedro Moreira
- Hiago Marques
