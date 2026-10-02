from unittest.mock import MagicMock

import pytest
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import models, schemas
from app.routers import tasks

class TestesSemMock:

    def test_task_priority_possui_os_tres_niveis_corretos(self):
        niveis = [p.value for p in models.TaskPriority]
        
        assert len(niveis) == 3
        assert "baixa" in niveis
        assert "media" in niveis
        assert "alta" in niveis
        assert models.TaskPriority.alta == "alta"

    def test_criar_tarefa_com_data_de_vencimento_invalida_falha(self):
        with pytest.raises(ValidationError):
            schemas.TaskCreate(title="Tarefa com data ruim", due_date="not-a-date")

class TestesComMock:
    def test_deletar_tarefa_com_mock_sucesso(self):
        mock_db = MagicMock(spec=Session)
        tarefa_simulada = models.Task(id=5, title="Tarefa a remover")
        mock_db.query.return_value.filter.return_value.first.return_value = tarefa_simulada

        resultado = tasks.delete_task(task_id=5, db=mock_db)

        mock_db.delete.assert_called_once_with(tarefa_simulada)
        mock_db.commit.assert_called_once()
        assert resultado is None

    def test_criar_tarefa_propaga_erro_quando_commit_falha(self):
        mock_db = MagicMock(spec=Session)
        mock_db.commit.side_effect = Exception("Erro de conexão com o banco")
        nova_tarefa = schemas.TaskCreate(title="Tarefa que vai falhar ao salvar")

        with pytest.raises(Exception, match="Erro de conexão com o banco"):
            tasks.create_task(task=nova_tarefa, db=mock_db)

        mock_db.add.assert_called_once()