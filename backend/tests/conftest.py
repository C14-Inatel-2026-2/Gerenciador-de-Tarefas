import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app import auth, models
from app.main import app
from app.database import Base, get_db

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Troca o banco real pelo banco de teste durante os testes."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function", autouse=True)
def setup_database():
    """Cria as tabelas antes de cada teste e apaga tudo depois,
    garantindo que um teste não interfira no outro."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture()
def client():
    """Cliente autenticado padrão para os testes das rotas protegidas."""
    db = TestingSessionLocal()
    default_user = models.User(
        nome="Usuário Autenticado",
        email="auth@inatel.br",
        senha=auth.hash_password("senha123"),
    )
    db.add(default_user)
    db.commit()
    db.refresh(default_user)
    token = auth.create_access_token({"sub": default_user.email, "user_id": default_user.id})
    db.close()
    test_client = TestClient(app)
    test_client.headers["Authorization"] = f"Bearer {token}"
    return test_client
@pytest.fixture()
def unauthenticated_client():
    """Cliente sem token de autenticação para testar rotas públicas (/auth) e bloqueio 401."""
    return TestClient(app)
