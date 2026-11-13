from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models import TaskPriority, TaskStatus

BLANK_TITLE_ERROR = "O título da tarefa não pode estar em branco"


def ensure_title_not_blank(value: Optional[str]) -> str:
    """Garante que o título informado não seja vazio nem contenha apenas espaços."""
    if value is None or not value.strip():
        raise ValueError(BLANK_TITLE_ERROR)
    return value


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)
    priority: TaskPriority = TaskPriority.media
    status: TaskStatus = TaskStatus.pendente
    due_date: Optional[datetime] = None

    @field_validator("title")
    @classmethod
    def validate_title_not_blank(cls, value: str) -> str:
        return ensure_title_not_blank(value)


class TaskCreate(TaskBase):
    @field_validator("due_date")
    @classmethod
    def validate_due_date_not_in_past(cls, value: Optional[datetime]) -> Optional[datetime]:
        if value is not None:
            hoje = datetime.now(value.tzinfo).date()
            if value.date() < hoje:
                raise ValueError("A data de vencimento não pode ser anterior à data atual")
        return value


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
        return ensure_title_not_blank(value)


class TaskOut(TaskBase):
    """O que a API devolve para o cliente."""
    id: int
    created_at: datetime
    owner_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    """Campos aceitos no cadastro de um novo usuário (POST /auth/register).

    max_length=72 porque o bcrypt ignora bytes além do 72º caractere da senha.
    """
    nome: str = Field(..., min_length=1, max_length=120)
    email: str = Field(..., min_length=3, max_length=255)
    senha: str = Field(..., min_length=6, max_length=72)


class UserLogin(BaseModel):
    """Credenciais aceitas no login (POST /auth/login)."""
    email: str = Field(..., min_length=3)
    senha: str = Field(..., min_length=1)


class UserOut(BaseModel):
    """Dados públicos do usuário devolvidos pela API (nunca a senha)."""
    id: int
    nome: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Resposta de autenticação contendo o token JWT."""
    access_token: str
    token_type: str = "bearer"