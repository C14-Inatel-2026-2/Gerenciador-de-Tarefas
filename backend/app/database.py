from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Por enquanto usamos SQLite (arquivo local). Depois dá pra trocar
# para PostgreSQL só mudando essa URL.
SQLALCHEMY_DATABASE_URL = "sqlite:///./tasks.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # necessário só para SQLite
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
