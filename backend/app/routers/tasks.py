from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.auth import get_current_user
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
    dependencies=[Depends(get_current_user)],
)

TASK_NOT_FOUND_DETAIL = "Tarefa não encontrada"


def get_task_or_404(task_id: int, db: Session, current_user: models.User) -> models.Task:
    """Busca uma tarefa do usuário logado pelo id, ou lança 404 caso não exista
    (inclusive se a tarefa existir mas pertencer a outro usuário)."""
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.owner_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail=TASK_NOT_FOUND_DETAIL)
    return task


@router.post("/", response_model=schemas.TaskOut, status_code=201)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Cria uma nova tarefa, sempre associada ao usuário autenticado."""
    db_task = models.Task(**task.model_dump(), owner_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Busca uma tarefa do usuário autenticado pelo id."""
    return get_task_or_404(task_id, db, current_user)


@router.patch("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Atualiza parcialmente uma tarefa do usuário autenticado pelo id."""
    task = get_task_or_404(task_id, db, current_user)

    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Remove uma tarefa do usuário autenticado pelo id."""
    task = get_task_or_404(task_id, db, current_user)

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