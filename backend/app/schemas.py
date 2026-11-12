from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models import TaskPriority, TaskStatus


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)
    priority: TaskPriority = TaskPriority.media
    status: TaskStatus = TaskStatus.pendente
    due_date: Optional[datetime] = None

    @field_validator("title")
    @classmethod
    def validate_title_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("O título da tarefa não pode estar em branco")
        return value


class TaskCreate(TaskBase):
    """Campos aceitos na criação de uma tarefa (POST).

    Não inclui `owner_id`: o dono da tarefa é sempre o usuário autenticado
    (extraído do token), nunca um valor enviado pelo cliente.
    """
    pass


class TaskUpdate(BaseModel):
    """Campos aceitos na atualização de uma tarefa (PUT/PATCH)."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None

    @field_validator("title")
    @classmethod
    def validate_title_not_blank(cls, value: Optional[str]) -> Optional[str]:
        if value is None or not value.strip():
            raise ValueError("O título da tarefa não pode estar em branco")
        return value


class TaskOut(TaskBase):
    """O que a API devolve para o cliente."""
    id: int
    created_at: datetime
    owner_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    """Campos aceitos no cadastro de um novo usuário."""
    nome: str = Field(..., min_length=1, max_length=120)
    email: str = Field(..., min_length=3, max_length=255)
    senha: str = Field(..., min_length=6, max_length=72)


class UserOut(BaseModel):
    """O que a API devolve para o cliente após cadastro (nunca a senha)."""
    id: int
    nome: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: str
    senha: str


    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    """Campos aceitos no cadastro de um usuário (POST /auth/register)."""
    nome: str = Field(..., min_length=1, max_length=120)
    email: str = Field(..., min_length=3, max_length=255)
    senha: str = Field(..., min_length=4, max_length=128)
class UserLogin(BaseModel):
    """Credenciais aceitas no login (POST /auth/login)."""
    email: str = Field(..., min_length=3)
    senha: str = Field(..., min_length=1)
class UserOut(BaseModel):
    """Dados públicos do usuário devolvidos pela API."""
    id: int
    nome: str
    email: str
    model_config = ConfigDict(from_attributes=True)
class Token(BaseModel):
    """Resposta de autenticação contendo o token JWT."""
    access_token: str
    token_type: str = "bearer"