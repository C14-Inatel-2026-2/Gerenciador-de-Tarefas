def test_create_task_with_owner_id(client):
    """Deve relacionar a tarefa a um usuario existente via owner_id."""
    from app import models
    from conftest import TestingSessionLocal

    db = TestingSessionLocal()
    user = models.User(nome="Teste", email="teste@exemplo.com", senha="hash-fake")
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()

    payload = {"title": "Tarefa com dono", "owner_id": user.id}

    response = client.post("/tasks/", json=payload)

    assert response.status_code == 201
    assert response.json()["owner_id"] == user.id


def test_create_task_without_owner_id_defaults_to_none(client):
    """Sem owner_id informado, a tarefa deve ser criada sem dono (None)."""
    response = client.post("/tasks/", json={"title": "Tarefa sem dono"})

    assert response.status_code == 201
    assert response.json()["owner_id"] is None


def test_create_task_success(client):
    """Deve criar uma tarefa e devolver os dados com id gerado."""
    payload = {
        "title": "Estudar Engenharia de Software",
        "description": "Revisar slides das aulas 1 a 5",
        "priority": "alta",
        "status": "pendente",
    }

    response = client.post("/tasks/", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["priority"] == "alta"
    assert data["status"] == "pendente"
    assert "id" in data
    assert "created_at" in data


def test_create_task_uses_default_priority_and_status(client):
    """Se priority/status não forem enviados, deve usar os valores padrão."""
    payload = {"title": "Tarefa simples"}

    response = client.post("/tasks/", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["priority"] == "media"
    assert data["status"] == "pendente"


def test_create_task_without_title_fails(client):
    """Título é obrigatório: sem ele, a API deve rejeitar (422)."""
    response = client.post("/tasks/", json={"description": "sem título"})

    assert response.status_code == 422


def test_get_task_success(client):
    """Deve buscar uma tarefa existente pelo id."""
    create_response = client.post("/tasks/", json={"title": "Tarefa para buscar"})
    task_id = create_response.json()["id"]

    response = client.get(f"/tasks/{task_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Tarefa para buscar"


def test_get_task_not_found(client):
    """Buscar um id que não existe deve retornar 404."""
    response = client.get("/tasks/9999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Tarefa não encontrada"


def test_delete_task_success(client):
    """Deve remover uma tarefa existente e retornar 204."""
    create_response = client.post("/tasks/", json={"title": "Tarefa para deletar"})
    task_id = create_response.json()["id"]

    delete_response = client.delete(f"/tasks/{task_id}")

    assert delete_response.status_code == 204


def test_delete_task_not_found(client):
    """Deletar um id que não existe deve retornar 404."""
    response = client.delete("/tasks/9999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Tarefa não encontrada"


def test_deleted_task_cannot_be_deleted_twice(client):
    """Depois de deletada, uma segunda tentativa deve falhar com 404."""
    create_response = client.post("/tasks/", json={"title": "Tarefa única"})
    task_id = create_response.json()["id"]

    first_delete = client.delete(f"/tasks/{task_id}")
    second_delete = client.delete(f"/tasks/{task_id}")

    assert first_delete.status_code == 204
    assert second_delete.status_code == 404

def test_list_tasks_returns_all(client):
    """Deve listar todas as tarefas quando nenhum filtro for enviado."""
    client.post("/tasks/", json={"title": "Tarefa 1", "priority": "baixa", "status": "pendente"})
    client.post("/tasks/", json={"title": "Tarefa 2", "priority": "alta", "status": "concluida"})

    response = client.get("/tasks/")

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_tasks_filter_by_status(client):
    """Deve filtrar as tarefas pelo status informado."""
    client.post("/tasks/", json={"title": "Pendente", "status": "pendente"})
    client.post("/tasks/", json={"title": "Concluída", "status": "concluida"})

    response = client.get("/tasks/?status=concluida")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Concluída"
    assert data[0]["status"] == "concluida"


def test_list_tasks_filter_by_priority(client):
    """Deve filtrar as tarefas pela prioridade informada."""
    client.post("/tasks/", json={"title": "Baixa", "priority": "baixa"})
    client.post("/tasks/", json={"title": "Alta", "priority": "alta"})

    response = client.get("/tasks/?priority=alta")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Alta"
    assert data[0]["priority"] == "alta"


def test_list_tasks_filter_by_status_and_priority(client):
    """Deve permitir combinar os filtros de status e prioridade."""
    client.post("/tasks/", json={"title": "Alvo", "status": "em_andamento", "priority": "alta"})
    client.post("/tasks/", json={"title": "Outra 1", "status": "em_andamento", "priority": "baixa"})
    client.post("/tasks/", json={"title": "Outra 2", "status": "pendente", "priority": "alta"})

    response = client.get("/tasks/?status=em_andamento&priority=alta")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Alvo"

def test_update_task_patch_success(client):
    """Deve atualizar parcialmente uma tarefa via PATCH."""
    created = client.post("/tasks/", json={"title": "Original", "priority": "baixa"}).json()

    response = client.patch(
        f"/tasks/{created['id']}",
        json={"status": "em_andamento", "priority": "alta"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Original"
    assert data["status"] == "em_andamento"
    assert data["priority"] == "alta"


def test_update_task_blank_title_fails(client):
    """Não deve permitir atualizar uma tarefa com título em branco (422)."""
    created = client.post("/tasks/", json={"title": "Valida"}).json()

    response = client.patch(f"/tasks/{created['id']}", json={"title": "   "})

    assert response.status_code == 422


def test_update_task_not_found(client):
    """Atualizar tarefa inexistente deve retornar 404."""
    response = client.patch("/tasks/9999", json={"title": "Inexistente"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Tarefa não encontrada"


def test_auth_register_and_login_success(unauthenticated_client):
    """Deve cadastrar um usuário, fazer login recebendo JWT e acessar rota protegida."""
    reg_response = unauthenticated_client.post(
        "/auth/register",
        json={"nome": "João Pedro", "email": "joao@inatel.br", "senha": "senha_segura"},
    )
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["email"] == "joao@inatel.br"
    assert "senha" not in user_data

    login_response = unauthenticated_client.post(
        "/auth/login",
        json={"email": "joao@inatel.br", "senha": "senha_segura"},
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_response = unauthenticated_client.get("/auth/me", headers=headers)
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "joao@inatel.br"

    tasks_response = unauthenticated_client.get("/tasks/", headers=headers)
    assert tasks_response.status_code == 200


def test_auth_register_duplicate_email_fails(unauthenticated_client):
    """Não deve permitir dois cadastros com o mesmo e-mail (400)."""
    payload = {"nome": "Usuário 1", "email": "duplicado@inatel.br", "senha": "1234"}
    first = unauthenticated_client.post("/auth/register", json=payload)
    second = unauthenticated_client.post("/auth/register", json=payload)

    assert first.status_code == 201
    assert second.status_code == 400
    assert second.json()["detail"] == "E-mail já cadastrado"


def test_auth_login_wrong_password_fails(unauthenticated_client):
    """Login com senha incorreta deve retornar 401."""
    unauthenticated_client.post(
        "/auth/register",
        json={"nome": "Usuário", "email": "user@inatel.br", "senha": "correta"},
    )

    response = unauthenticated_client.post(
        "/auth/login",
        json={"email": "user@inatel.br", "senha": "errada"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "E-mail ou senha incorretos"


def test_tasks_routes_require_authentication(unauthenticated_client):
    """Todas as rotas de tarefas devem retornar 401 quando acessadas sem token."""
    assert unauthenticated_client.get("/tasks/").status_code == 401
    assert unauthenticated_client.post("/tasks/", json={"title": "Bloqueada"}).status_code == 401
    assert unauthenticated_client.get("/tasks/1").status_code == 401
    assert unauthenticated_client.patch("/tasks/1", json={"title": "X"}).status_code == 401
    assert unauthenticated_client.delete("/tasks/1").status_code == 401


def test_tasks_routes_reject_invalid_token(unauthenticated_client):
    """Deve rejeitar requisições com token JWT inválido ou adulterado (401)."""
    headers = {"Authorization": "Bearer token.invalido.adulterado"}
    response = unauthenticated_client.get("/tasks/", headers=headers)

    assert response.status_code == 401
    assert response.json()["detail"] == "Token inválido ou expirado"