from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from typing import Dict, Any, Optional

from app.core.config import settings
from app.db.deps import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def get_current_user_payload(
    token: Optional[str] = Depends(oauth2_scheme),
    access_token: Optional[str] = Cookie(None)
) -> Dict[str, Any]:
    # Use cookie if header is missing
    final_token = token or access_token
    
    if not final_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
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
        return payload
    except JWTError:
        raise credentials_exception

def require_admin(payload: Dict[str, Any] = Depends(get_current_user_payload)) -> Dict[str, Any]:
    role = payload.get("role")
    if role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return payload
