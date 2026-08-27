from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import tasks

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gerenciador de Tarefas - API",
    description="API do projeto de Engenharia de Software",
    version="0.1.0",
)

# Libera o frontend (React, em outra porta) para consumir a API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "API do Gerenciador de Tarefas no ar"}