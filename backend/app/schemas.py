from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models import TaskPriority, TaskStatus


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.media
    status: TaskStatus = TaskStatus.pendente
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    """Campos aceitos na criação de uma tarefa (POST)."""
    pass


class TaskOut(TaskBase):
    """O que a API devolve para o cliente."""
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)