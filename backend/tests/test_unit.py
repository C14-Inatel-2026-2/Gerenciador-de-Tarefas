from unittest.mock import MagicMock
from app.database import Base
from fastapi import HTTPException
from app import auth, models, schemas

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

    def test_metadados_alembic_possuem_tabelas_users_e_tasks(self):
        tabelas = set(Base.metadata.tables.keys())
        assert "users" in tabelas
        assert "tasks" in tabelas

    def test_hash_e_verificacao_de_senha(self):
        senha_hash = auth.hash_password("minha_senha_123")
        assert senha_hash != "minha_senha_123"
        assert auth.verify_password("minha_senha_123", senha_hash) is True
        assert auth.verify_password("senha_errada", senha_hash) is False

    def test_criacao_e_decodificacao_de_token_jwt(self):
        token = auth.create_access_token({"sub": "joao@inatel.br", "user_id": 7})
        payload = auth.decode_access_token(token)
        assert payload["sub"] == "joao@inatel.br"
        assert payload["user_id"] == 7
        assert "exp" in payload
        
    def test_decodificar_token_jwt_invalido_lanca_401(self):
        with pytest.raises(HTTPException) as exc:
            auth.decode_access_token("token.invalido.123")
        assert exc.value.status_code == 401

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

    def test_listar_tarefas_com_filtros_status_e_prioridade_mock(self):
        mock_db = MagicMock(spec=Session)
        query_mock = mock_db.query.return_value
        filter_status_mock = query_mock.filter.return_value
        filter_priority_mock = filter_status_mock.filter.return_value
        tarefa_esperada = models.Task(
            id=1,
            title="Tarefa Filtrada",
            status=models.TaskStatus.pendente,
            priority=models.TaskPriority.alta,
        )
        filter_priority_mock.all.return_value = [tarefa_esperada]

        resultado = tasks.list_tasks(
            status=models.TaskStatus.pendente,
            priority=models.TaskPriority.alta,
            db=mock_db,
        )

        assert resultado == [tarefa_esperada]
        query_mock.filter.assert_called_once()
        filter_status_mock.filter.assert_called_once()