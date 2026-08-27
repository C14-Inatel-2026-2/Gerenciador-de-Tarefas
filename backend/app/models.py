import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func

from app.database import Base


class TaskPriority(str, enum.Enum):
    baixa = "baixa"
    media = "media"
    alta = "alta"


class TaskStatus(str, enum.Enum):
    pendente = "pendente"
    em_andamento = "em_andamento"
    concluida = "concluida"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(120), nullable=False)
    description = Column(String(500), nullable=True)
    priority = Column(Enum(TaskPriority), default=TaskPriority.media, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.pendente, nullable=False)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
