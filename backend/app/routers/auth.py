from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas, security
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

EMAIL_ALREADY_REGISTERED_DETAIL = "E-mail já cadastrado"
INVALID_CREDENTIALS_DETAIL = "E-mail ou senha incorretos"


def get_user_by_email(email: str, db: Session) -> Optional[models.User]:
    """Busca um usuário pelo e-mail no banco de dados."""
    return db.query(models.User).filter(models.User.email == email).first()


@router.post("/register", response_model=schemas.UserOut, status_code=201)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """Cadastra um novo usuário armazenando a senha com hash."""
    if get_user_by_email(user_in.email, db):
        raise HTTPException(status_code=400, detail=EMAIL_ALREADY_REGISTERED_DETAIL)

    db_user = models.User(
        nome=user_in.nome,
        email=user_in.email,
        senha=security.hash_password(user_in.senha),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=schemas.Token)
def login_user(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Autentica o usuário por e-mail e senha e retorna um token JWT."""
    user = get_user_by_email(credentials.email, db)
    if not user or not security.verify_password(credentials.senha, user.senha):
        raise HTTPException(status_code=401, detail=INVALID_CREDENTIALS_DETAIL)

    token = security.create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Retorna os dados do usuário atualmente autenticado."""
    return current_user
