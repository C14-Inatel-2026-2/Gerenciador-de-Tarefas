from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas, security
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

EMAIL_EM_USO_DETAIL = "E-mail já cadastrado"
CREDENCIAIS_INVALIDAS_DETAIL = "E-mail ou senha incorretos"


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Cria um novo usuário, salvando a senha como hash bcrypt (nunca em texto puro)."""
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=EMAIL_EM_USO_DETAIL)

    db_user = models.User(
        nome=user.nome,
        email=user.email,
        senha=security.hash_password(user.senha),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Valida e-mail/senha e devolve um token JWT para uso nas rotas protegidas."""
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not security.verify_password(credentials.senha, user.senha):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=CREDENCIAIS_INVALIDAS_DETAIL)

    access_token = security.create_access_token(user.id)
    return schemas.Token(access_token=access_token)
