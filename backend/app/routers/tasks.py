from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db
router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
    dependencies=[Depends(get_current_user)],
)

router = APIRouter(prefix="/tasks", tags=["tasks"])

TASK_NOT_FOUND_DETAIL = "Tarefa não encontrada"


def get_task_or_404(task_id: int, db: Session) -> models.Task:
    """Busca uma tarefa pelo id ou lança HTTPException 404 caso não exista."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=TASK_NOT_FOUND_DETAIL)
    return task


@router.post("/", response_model=schemas.TaskOut, status_code=201)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    """Cria uma nova tarefa."""
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Busca uma tarefa pelo id."""
    return get_task_or_404(task_id, db)


@router.patch("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
):
    """Atualiza parcialmente uma tarefa existente pelo id."""
    task = get_task_or_404(task_id, db)

    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Remove uma tarefa pelo id."""
    task = get_task_or_404(task_id, db)

    db.delete(task)
    db.commit()
    return None

@router.get("/", response_model=list[schemas.TaskOut])
def list_tasks(
    status: Optional[models.TaskStatus] = None,
    priority: Optional[models.TaskPriority] = None,
    db: Session = Depends(get_db),
):
    """Lista todas as tarefas cadastradas, com filtros opcionais de status e prioridade."""
    query = db.query(models.Task)
    if status is not None:
        query = query.filter(models.Task.status == status)
    if priority is not None:
        query = query.filter(models.Task.priority == priority)
    return query.all()