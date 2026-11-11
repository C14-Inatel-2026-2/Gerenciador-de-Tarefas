"""
Testes unitários para o backend do Gerenciador de Tarefas.

Cobre:
- Testes sem mock: validação de schemas Pydantic e configuração de conexão do banco.
- Testes com mock: isolamento da sessão do banco de dados (Session) nas rotas de tarefas.
- Casos de teste positivos e negativos.
"""

from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import database, models, schemas
from app.routers import tasks


# ============================================================================
# 1. TESTES SEM MOCK (Schemas e Configuração de Conexão)
# ============================================================================

class TestSchemasEConfiguracaoSemMock:
    """Testes unitários sem mock testando classes de schema e funções utilitárias."""

    def test_criar_tarefa_valores_padrao(self):
        """[Sem Mock - Positivo] Verifica valores padrão e o método model_dump."""
        titulo = "Estudar Testes"
        descricao = "Praticar pytest"

        tarefa = schemas.TaskCreate(title=titulo, description=descricao)
        dados = tarefa.model_dump()

        assert tarefa.title == titulo
        assert tarefa.description == descricao
        assert tarefa.priority == models.TaskPriority.media
        assert tarefa.status == models.TaskStatus.pendente
        assert dados["priority"] == models.TaskPriority.media

    def test_converter_tarefa_para_schema(self):
        """[Sem Mock - Positivo] Verifica o método model_validate ao converter do ORM."""
        agora = datetime.now(timezone.utc)
        tarefa_orm = models.Task(
            id=10,
            title="Tarefa de Teste",
            description="Descrição teste",
            priority=models.TaskPriority.alta,
            status=models.TaskStatus.em_andamento,
            created_at=agora,
        )

        tarefa_out = schemas.TaskOut.model_validate(tarefa_orm)

        assert tarefa_out.id == 10
        assert tarefa_out.title == "Tarefa de Teste"
        assert tarefa_out.priority == models.TaskPriority.alta
        assert tarefa_out.status == models.TaskStatus.em_andamento

    def test_get_connect_args_sqlite_vs_postgres(self):
        """[Sem Mock - Positivo] Verifica configuração de connect_args por tipo de banco."""
        sqlite_args = database.get_connect_args("sqlite:///./tasks.db")
        postgres_args = database.get_connect_args("postgresql://user:pass@localhost/db")

        assert sqlite_args == {"check_same_thread": False}
        assert postgres_args == {}

    def test_criar_tarefa_prioridade_invalida_falha(self):
        """[Sem Mock - Negativo] Deve falhar com ValidationError se a prioridade for inválida."""
        with pytest.raises(ValidationError):
            schemas.TaskCreate(title="Tarefa Inválida", priority="invalida")

    def test_criar_tarefa_sem_titulo_falha(self):
        """[Sem Mock - Negativo] Deve falhar com ValidationError se faltar o título obrigatório."""
        with pytest.raises(ValidationError):
            schemas.TaskCreate(description="Sem título")


# ============================================================================
# 2. TESTES COM MOCK (Isolando a dependência do banco de dados nas rotas)
# ============================================================================

class TestRoutersTasksComMock:
    """Testes unitários com mock isolando a dependência do banco (Session)."""

    def test_buscar_tarefa_com_mock_sucesso(self):
        """[Com Mock - Positivo] Busca tarefa existente com retorno mockado."""
        mock_db = MagicMock(spec=Session)
        tarefa_simulada = models.Task(id=1, title="Tarefa Encontrada")
        mock_db.query.return_value.filter.return_value.first.return_value = tarefa_simulada

        resultado = tasks.get_task(task_id=1, db=mock_db)

        assert resultado == tarefa_simulada
        assert resultado.id == 1
        assert resultado.title == "Tarefa Encontrada"

    def test_atualizar_tarefa_parcial_com_mock_sucesso(self):
        """[Com Mock - Positivo] Atualiza apenas os campos enviados via PATCH usando mock."""
        mock_db = MagicMock(spec=Session)
        tarefa_existente = models.Task(
            id=2,
            title="Título Antigo",
            priority=models.TaskPriority.baixa,
            status=models.TaskStatus.pendente,
        )
        mock_db.query.return_value.filter.return_value.first.return_value = tarefa_existente
        atualizacao = schemas.TaskUpdate(status=models.TaskStatus.concluida)

        resultado = tasks.update_task(task_id=2, task_update=atualizacao, db=mock_db)

        assert resultado.status == models.TaskStatus.concluida
        assert resultado.title == "Título Antigo"
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(tarefa_existente)

    def test_buscar_tarefa_com_mock_nao_encontrada(self):
        """[Com Mock - Negativo] Deve lançar 404 com a constante padrão quando a tarefa não existir."""
        mock_db = MagicMock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = None

        with pytest.raises(HTTPException) as exc:
            tasks.get_task(task_id=999, db=mock_db)

        assert exc.value.status_code == 404
        assert exc.value.detail == tasks.TASK_NOT_FOUND_DETAIL

    def test_deletar_tarefa_com_mock_nao_encontrada(self):
        """[Com Mock - Negativo] Deve lançar 404 e não chamar delete/commit se a tarefa não existir."""
        mock_db = MagicMock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = None

        with pytest.raises(HTTPException) as exc:
            tasks.delete_task(task_id=999, db=mock_db)

        assert exc.value.status_code == 404
        assert exc.value.detail == tasks.TASK_NOT_FOUND_DETAIL
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_not_called()
