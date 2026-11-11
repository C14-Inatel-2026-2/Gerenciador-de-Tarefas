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
