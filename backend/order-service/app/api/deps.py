from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.base import Base

# Reuse the Token URL from Auth Service? 
# For independent services, we just need to know where to validate or just decode if we share secret.
# We are sharing SECRET_KEY (in .env).
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"http://localhost:8000/api/v1/auth/login" # Just for swagger UI hint
)

def get_current_user(
    token: str = Depends(reusable_oauth2)
) -> dict:
    """
    Decodes the JWT token and returns user info.
    Does NOT check DB for user existence (stateless check) to save DB calls,
    or we can if we want strict consistency. 
    For Order Service, we just need user_id from token.
    """
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        # Auth Service token likely has "sub" as user_id or email.
        # Let's assume standard "sub" is user_id string (or int converted to string).
        
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        
        # We can also get other claims like 'role' if present
        return {"id": user_id_str, "details": payload}
        
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
