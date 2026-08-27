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
