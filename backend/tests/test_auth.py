def test_register_success(client):
    """Deve criar um usuário e nunca devolver a senha na resposta."""
    response = client.post(
        "/auth/register",
        json={"nome": "Fernando", "email": "fernando@teste.com", "senha": "senha123"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "fernando@teste.com"
    assert "senha" not in data


def test_register_hashes_password(client):
    """A senha salva no banco não pode ser igual à senha em texto puro."""
    from conftest import TestingSessionLocal
    from app import models

    client.post(
        "/auth/register",
        json={"nome": "Fernando", "email": "hash@teste.com", "senha": "senha123"},
    )

    db = TestingSessionLocal()
    user = db.query(models.User).filter(models.User.email == "hash@teste.com").first()
    db.close()

    assert user.senha != "senha123"
    assert user.senha.startswith("$2b$")


def test_register_duplicate_email_fails(client):
    """Não deve permitir dois usuários com o mesmo e-mail."""
    payload = {"nome": "Fernando", "email": "duplicado@teste.com", "senha": "senha123"}
    client.post("/auth/register", json=payload)

    response = client.post("/auth/register", json=payload)

    assert response.status_code == 400


def test_login_success(client):
    """Login com credenciais corretas deve devolver um token JWT."""
    client.post(
        "/auth/register",
        json={"nome": "Fernando", "email": "login@teste.com", "senha": "senha123"},
    )

    response = client.post(
        "/auth/login", json={"email": "login@teste.com", "senha": "senha123"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password_fails(client):
    """Login com senha errada deve ser rejeitado com 401."""
    client.post(
        "/auth/register",
        json={"nome": "Fernando", "email": "senhaerrada@teste.com", "senha": "senha123"},
    )

    response = client.post(
        "/auth/login", json={"email": "senhaerrada@teste.com", "senha": "senhaerrada"}
    )

    assert response.status_code == 401


def test_login_nonexistent_email_fails(client):
    """Login com e-mail não cadastrado deve ser rejeitado com 401 (mesma
    mensagem de senha errada, para não revelar quais e-mails existem)."""
    response = client.post(
        "/auth/login", json={"email": "naoexiste@teste.com", "senha": "qualquer"}
    )

    assert response.status_code == 401


def test_protected_route_rejects_invalid_token(client):
    """Um token inválido/forjado deve ser rejeitado com 401."""
    response = client.get("/tasks/", headers={"Authorization": "Bearer token-invalido"})

    assert response.status_code == 401
