from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from typing import Optional

from app.db.session import SessionLocal
from app.core.config import settings
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


from app.db.deps import get_db


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    access_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db),
) -> User:
    # Use cookie if token from header is missing
    final_token = token or access_token
    
    if not final_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        payload = jwt.decode(final_token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive account")

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
