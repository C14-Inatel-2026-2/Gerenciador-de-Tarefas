from conftest import registrar_e_logar


def test_create_task_requires_auth(client):
    """Sem token, criar tarefa deve ser rejeitado com 401."""
    response = client.post("/tasks/", json={"title": "Tarefa sem login"})

    assert response.status_code == 401


def test_create_task_sets_owner_as_logged_user(client, auth_headers):
    """A tarefa criada deve ser automaticamente associada ao usuário logado."""
    response = client.post("/tasks/", json={"title": "Tarefa com dono"}, headers=auth_headers)

    assert response.status_code == 201
    assert response.json()["owner_id"] is not None


def test_create_task_ignores_owner_id_sent_by_client(client, auth_headers):
    """Mesmo se o cliente mandar um owner_id no corpo, deve ser ignorado:
    o dono é sempre o usuário autenticado pelo token."""
    response = client.post(
        "/tasks/",
        json={"title": "Tarefa com owner_id forjado", "owner_id": 9999},
        headers=auth_headers,
    )

    assert response.status_code == 201
    assert response.json()["owner_id"] != 9999


def test_create_task_success(client, auth_headers):
    """Deve criar uma tarefa e devolver os dados com id gerado."""
    payload = {
        "title": "Estudar Engenharia de Software",
        "description": "Revisar slides das aulas 1 a 5",
        "priority": "alta",
        "status": "pendente",
    }

    response = client.post("/tasks/", json=payload, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["priority"] == "alta"
    assert data["status"] == "pendente"
    assert "id" in data
    assert "created_at" in data


def test_create_task_uses_default_priority_and_status(client, auth_headers):
    """Se priority/status não forem enviados, deve usar os valores padrão."""
    payload = {"title": "Tarefa simples"}

    response = client.post("/tasks/", json=payload, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["priority"] == "media"
    assert data["status"] == "pendente"


def test_create_task_without_title_fails(client, auth_headers):
    """Título é obrigatório: sem ele, a API deve rejeitar (422)."""
    response = client.post("/tasks/", json={"description": "sem título"}, headers=auth_headers)

    assert response.status_code == 422


def test_get_task_success(client, auth_headers):
    """Deve buscar uma tarefa existente pelo id."""
    create_response = client.post("/tasks/", json={"title": "Tarefa para buscar"}, headers=auth_headers)
    task_id = create_response.json()["id"]

    response = client.get(f"/tasks/{task_id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Tarefa para buscar"


def test_get_task_not_found(client, auth_headers):
    """Buscar um id que não existe deve retornar 404."""
    response = client.get("/tasks/9999", headers=auth_headers)

    assert response.status_code == 404
    assert response.json()["detail"] == "Tarefa não encontrada"


def test_get_task_requires_auth(client):
    """Sem token, buscar tarefa deve ser rejeitado com 401."""
    response = client.get("/tasks/1")

    assert response.status_code == 401


def test_user_cannot_see_another_users_task(client):
    """Uma tarefa de um usuário não deve aparecer nem ser acessível por outro."""
    headers_dono = registrar_e_logar(client, email="dono@teste.com")
    headers_outro = registrar_e_logar(client, email="outro@teste.com")

    create_response = client.post(
        "/tasks/", json={"title": "Tarefa privada"}, headers=headers_dono
    )
    task_id = create_response.json()["id"]

    response_outro = client.get(f"/tasks/{task_id}", headers=headers_outro)
    lista_outro = client.get("/tasks/", headers=headers_outro)

    assert response_outro.status_code == 404
    assert all(task["id"] != task_id for task in lista_outro.json())


def test_list_tasks_returns_only_own_tasks(client):
    """A listagem deve devolver só as tarefas do usuário logado."""
    headers_a = registrar_e_logar(client, email="a@teste.com")
    headers_b = registrar_e_logar(client, email="b@teste.com")

    client.post("/tasks/", json={"title": "Tarefa do A"}, headers=headers_a)
    client.post("/tasks/", json={"title": "Tarefa do B 1"}, headers=headers_b)
    client.post("/tasks/", json={"title": "Tarefa do B 2"}, headers=headers_b)

    lista_a = client.get("/tasks/", headers=headers_a).json()
    lista_b = client.get("/tasks/", headers=headers_b).json()

    assert len(lista_a) == 1
    assert len(lista_b) == 2


def test_delete_task_success(client, auth_headers):
    """Deve remover uma tarefa existente e retornar 204."""
    create_response = client.post("/tasks/", json={"title": "Tarefa para deletar"}, headers=auth_headers)
    task_id = create_response.json()["id"]

    delete_response = client.delete(f"/tasks/{task_id}", headers=auth_headers)

    assert delete_response.status_code == 204


def test_delete_task_not_found(client, auth_headers):
    """Deletar um id que não existe deve retornar 404."""
    response = client.delete("/tasks/9999", headers=auth_headers)

    assert response.status_code == 404
    assert response.json()["detail"] == "Tarefa não encontrada"


def test_deleted_task_cannot_be_deleted_twice(client, auth_headers):
    """Depois de deletada, uma segunda tentativa deve falhar com 404."""
    create_response = client.post("/tasks/", json={"title": "Tarefa única"}, headers=auth_headers)
    task_id = create_response.json()["id"]

    first_delete = client.delete(f"/tasks/{task_id}", headers=auth_headers)
    second_delete = client.delete(f"/tasks/{task_id}", headers=auth_headers)

    assert first_delete.status_code == 204
    assert second_delete.status_code == 404

def test_list_tasks_returns_all(client, auth_headers):
    """Deve listar todas as tarefas do usuário logado quando nenhum filtro for enviado."""
    client.post("/tasks/", json={"title": "Tarefa 1", "priority": "baixa", "status": "pendente"}, headers=auth_headers)
    client.post("/tasks/", json={"title": "Tarefa 2", "priority": "alta", "status": "concluida"}, headers=auth_headers)

    response = client.get("/tasks/", headers=auth_headers)

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_tasks_filter_by_status(client, auth_headers):
    """Deve filtrar as tarefas pelo status informado."""
    client.post("/tasks/", json={"title": "Pendente", "status": "pendente"}, headers=auth_headers)
    client.post("/tasks/", json={"title": "Concluída", "status": "concluida"}, headers=auth_headers)

    response = client.get("/tasks/?status=concluida", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Concluída"
    assert data[0]["status"] == "concluida"


def test_list_tasks_filter_by_priority(client, auth_headers):
    """Deve filtrar as tarefas pela prioridade informada."""
    client.post("/tasks/", json={"title": "Baixa", "priority": "baixa"}, headers=auth_headers)
    client.post("/tasks/", json={"title": "Alta", "priority": "alta"}, headers=auth_headers)

    response = client.get("/tasks/?priority=alta", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Alta"
    assert data[0]["priority"] == "alta"


def test_list_tasks_filter_by_status_and_priority(client, auth_headers):
    """Deve permitir combinar os filtros de status e prioridade."""
    client.post("/tasks/", json={"title": "Alvo", "status": "em_andamento", "priority": "alta"}, headers=auth_headers)
    client.post("/tasks/", json={"title": "Outra 1", "status": "em_andamento", "priority": "baixa"}, headers=auth_headers)
    client.post("/tasks/", json={"title": "Outra 2", "status": "pendente", "priority": "alta"}, headers=auth_headers)

    response = client.get("/tasks/?status=em_andamento&priority=alta", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Alvo"

def test_update_task_patch_success(client, auth_headers):
    """Deve atualizar parcialmente uma tarefa via PATCH."""
    created = client.post("/tasks/", json={"title": "Original", "priority": "baixa"}, headers=auth_headers).json()

    response = client.patch(
        f"/tasks/{created['id']}",
        json={"status": "em_andamento", "priority": "alta"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Original"
    assert data["status"] == "em_andamento"
    assert data["priority"] == "alta"


def test_update_task_blank_title_fails(client, auth_headers):
    """Não deve permitir atualizar uma tarefa com título em branco (422)."""
    created = client.post("/tasks/", json={"title": "Valida"}, headers=auth_headers).json()

    response = client.patch(f"/tasks/{created['id']}", json={"title": "   "}, headers=auth_headers)

    assert response.status_code == 422


def test_update_task_not_found(client, auth_headers):
    """Atualizar tarefa inexistente deve retornar 404."""
    response = client.patch("/tasks/9999", json={"title": "Inexistente"}, headers=auth_headers)

    assert response.status_code == 404
    assert response.json()["detail"] == "Tarefa não encontrada"


def test_auth_register_and_login_success(client):
    """Deve cadastrar um usuário, fazer login recebendo JWT e acessar rota protegida."""
    reg_response = client.post(
        "/auth/register",
        json={"nome": "João Pedro", "email": "joao@inatel.br", "senha": "senha_segura"},
    )
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["email"] == "joao@inatel.br"
    assert "senha" not in user_data

    login_response = client.post(
        "/auth/login",
        json={"email": "joao@inatel.br", "senha": "senha_segura"},
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_response = client.get("/auth/me", headers=headers)
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "joao@inatel.br"

    tasks_response = client.get("/tasks/", headers=headers)
    assert tasks_response.status_code == 200


def test_auth_register_duplicate_email_fails(client):
    """Não deve permitir dois cadastros com o mesmo e-mail (400)."""
    payload = {"nome": "Usuário 1", "email": "duplicado@inatel.br", "senha": "123456"}
    first = client.post("/auth/register", json=payload)
    second = client.post("/auth/register", json=payload)

    assert first.status_code == 201
    assert second.status_code == 400
    assert second.json()["detail"] == "E-mail já cadastrado"


def test_auth_login_wrong_password_fails(client):
    """Login com senha incorreta deve retornar 401."""
    client.post(
        "/auth/register",
        json={"nome": "Usuário", "email": "user@inatel.br", "senha": "correta"},
    )

    response = client.post(
        "/auth/login",
        json={"email": "user@inatel.br", "senha": "errada"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "E-mail ou senha incorretos"


def test_tasks_routes_require_authentication(client):
    """Todas as rotas de tarefas devem retornar 401 quando acessadas sem token."""
    assert client.get("/tasks/").status_code == 401
    assert client.post("/tasks/", json={"title": "Bloqueada"}).status_code == 401
    assert client.get("/tasks/1").status_code == 401
    assert client.patch("/tasks/1", json={"title": "X"}).status_code == 401
    assert client.delete("/tasks/1").status_code == 401


def test_tasks_routes_reject_invalid_token(client):
    """Deve rejeitar requisições com token JWT inválido ou adulterado (401)."""
    headers = {"Authorization": "Bearer token.invalido.adulterado"}
    response = client.get("/tasks/", headers=headers)

    assert response.status_code == 401

def test_create_task_with_past_due_date_fails(client, auth_headers):
    """Não deve permitir criar uma tarefa com data de vencimento anterior à data atual (422)."""
    payload = {
        "title": "Tarefa no passado",
        "due_date": "2020-01-01T00:00:00",
    }
    response = client.post("/tasks/", json=payload, headers=auth_headers)
    assert response.status_code == 422