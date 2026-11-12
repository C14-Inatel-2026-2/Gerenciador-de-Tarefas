from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, tasks

app = FastAPI(
    title="Gerenciador de Tarefas - API",
    description="API do projeto de Engenharia de Software",
    version="0.1.0",
)

# Libera o frontend (React, em outra porta) para consumir a API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://gerenciador-de-tarefas-9mv4.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "API do Gerenciador de Tarefas no ar"}

app.include_router(auth.router)
app.include_router(tasks.router)