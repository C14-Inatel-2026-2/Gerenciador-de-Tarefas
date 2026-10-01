"""
Testes unitários para o backend do Gerenciador de Tarefas.

Entrega 3:
- Testes sem mock: validação de classes, métodos e schemas.
- Testes com mock: isolamento da sessão do banco de dados (Session).
- Casos de teste positivos e negativos.
"""

from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import models, schemas
from app.routers import tasks


# ============================================================================
# 1. TESTES SEM MOCK (Classes e Schemas)
# ============================================================================

class TestesSemMock:
    """Testes unitários sem mock testando classes e métodos."""

    def test_criar_tarefa_valores_padrao(self):
        """[Sem Mock - Positivo] Verifica valores padrão e o método model_dump."""
        # Arrange
        titulo = "Estudar Testes"
        descricao = "Praticar pytest"

        # Act
        tarefa = schemas.TaskCreate(title=titulo, description=descricao)
        dados = tarefa.model_dump()

        # Assert
        assert tarefa.title == titulo
        assert tarefa.description == descricao
        assert tarefa.priority == models.TaskPriority.media
        assert tarefa.status == models.TaskStatus.pendente
        assert dados["priority"] == models.TaskPriority.media

    def test_converter_tarefa_para_schema(self):
        """[Sem Mock - Positivo] Verifica o método model_validate ao converter do ORM."""
        # Arrange
        agora = datetime.now(timezone.utc)
        tarefa_orm = models.Task(
            id=10,
            title="Tarefa de Teste",
            description="Descrição teste",
            priority=models.TaskPriority.alta,
            status=models.TaskStatus.em_andamento,
            created_at=agora,
        )

        # Act
        tarefa_out = schemas.TaskOut.model_validate(tarefa_orm)

        # Assert
        assert tarefa_out.id == 10
        assert tarefa_out.title == "Tarefa de Teste"
        assert tarefa_out.priority == models.TaskPriority.alta
        assert tarefa_out.status == models.TaskStatus.em_andamento

    def test_criar_tarefa_prioridade_invalida_falha(self):
        """[Sem Mock - Negativo] Deve falhar com ValidationError se a prioridade for inválida."""
        # Arrange / Act / Assert
        with pytest.raises(ValidationError):
            schemas.TaskCreate(title="Tarefa Inválida", priority="invalida")

    def test_criar_tarefa_sem_titulo_falha(self):
        """[Sem Mock - Negativo] Deve falhar com ValidationError se faltar o título obrigatório."""
        # Arrange / Act / Assert
        with pytest.raises(ValidationError):
            schemas.TaskCreate(description="Sem título")


# ============================================================================
# 2. TESTES COM MOCK (Isolando a dependência do banco de dados)
# ============================================================================

class TestesComMock:
    """Testes unitários com mock isolando a dependência do banco (Session)."""

    def test_criar_tarefa_com_mock(self):
        """[Com Mock - Positivo] Cria tarefa usando sessão mockada."""
        # Arrange
        mock_db = MagicMock(spec=Session)
        nova_tarefa = schemas.TaskCreate(
            title="Tarefa Mockada",
            priority=models.TaskPriority.alta,
        )

        # Act
        resultado = tasks.create_task(task=nova_tarefa, db=mock_db)

        # Assert
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(resultado)
        assert resultado.title == "Tarefa Mockada"

    def test_buscar_tarefa_com_mock_sucesso(self):
        """[Com Mock - Positivo] Busca tarefa existente com retorno mockado."""
        # Arrange
        mock_db = MagicMock(spec=Session)
        tarefa_simulada = models.Task(id=1, title="Tarefa Encontrada")
        mock_db.query.return_value.filter.return_value.first.return_value = tarefa_simulada

        # Act
        resultado = tasks.get_task(task_id=1, db=mock_db)

        # Assert
        assert resultado == tarefa_simulada
        assert resultado.id == 1
        assert resultado.title == "Tarefa Encontrada"

    def test_buscar_tarefa_com_mock_nao_encontrada(self):
        """[Com Mock - Negativo] Deve lançar 404 quando a tarefa não existir."""
        # Arrange
        mock_db = MagicMock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            tasks.get_task(task_id=999, db=mock_db)

        assert exc.value.status_code == 404
        assert exc.value.detail == "Tarefa não encontrada"

    def test_deletar_tarefa_com_mock_nao_encontrada(self):
        """[Com Mock - Negativo] Deve lançar 404 e não chamar delete/commit se a tarefa não existir."""
        # Arrange
        mock_db = MagicMock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            tasks.delete_task(task_id=999, db=mock_db)

        assert exc.value.status_code == 404
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_not_called()
