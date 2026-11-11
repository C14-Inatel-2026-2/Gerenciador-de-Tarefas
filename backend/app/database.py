import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DEFAULT_DATABASE_URL = "sqlite:///./tasks.db"


def get_database_url() -> str:
    """Retorna a URL de conexão configurada no ambiente ou o SQLite padrão."""
    return os.environ.get("DATABASE_URL", DEFAULT_DATABASE_URL)


def get_connect_args(database_url: str) -> dict:
    """Retorna argumentos extras de conexão necessários apenas para o SQLite."""
    if database_url.startswith("sqlite"):
        return {"check_same_thread": False}
    return {}


SQLALCHEMY_DATABASE_URL = get_database_url()

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=get_connect_args(SQLALCHEMY_DATABASE_URL),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependência do FastAPI: abre uma sessão de banco e garante que ela
    seja fechada no final da requisição."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
