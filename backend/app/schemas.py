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
    owner_id: Optional[int] = None

    @field_validator("title")
    @classmethod
    def validate_title_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("O título da tarefa não pode estar em branco")
        return value


class TaskCreate(TaskBase):
    """Campos aceitos na criação de uma tarefa (POST)."""
    pass


class TaskUpdate(BaseModel):
    """Campos aceitos na atualização de uma tarefa (PUT/PATCH)."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    owner_id: Optional[int] = None

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

    model_config = ConfigDict(from_attributes=True)