from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
import re
from fastapi import HTTPException, status

from app.core.config import settings


pwd_context = CryptContext(
    schemes=["bcrypt"],
    bcrypt__rounds=12,
    deprecated="auto"
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # If the hash is invalid (e.g. plain text added via SQL), return False instead of crashing
        return False

def validate_password_strength(password: str) -> str:
    """
    Validates that a password meets complexity requirements.
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if len(password) > 128:
        raise ValueError("Password must be at most 128 characters long")
    
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one digit")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError("Password must contain at least one special character")
    
    return password

def create_access_token(data: dict, expires_minutes: int = None):
    if expires_minutes is None:
        expires_minutes = settings.access_token_expire_minutes
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow()
    })

    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )

def create_refresh_token(data: dict, expires_days: int = None):
    if expires_days is None:
        expires_days = settings.refresh_token_expire_days
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=expires_days)
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })

    return jwt.encode(
        to_encode,
        settings.refresh_secret_key,
        algorithm=settings.algorithm
    )

def decode_refresh_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token,
            settings.refresh_secret_key,
            algorithms=[settings.algorithm]
        )
        if payload.get("type") != "refresh":
            return None
        return payload
    except Exception:
        return None

def create_verification_token(user_id: int):
    expire = datetime.utcnow() + timedelta(hours=settings.verification_token_expire_hours)
    to_encode = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "verification"
    }
    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )

def verify_verification_token(token: str) -> int | None:
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        if payload.get("type") != "verification":
            return None
        return int(payload.get("sub"))
    except Exception:
        return None

def create_reset_token(user_id: int):
    expire = datetime.utcnow() + timedelta(hours=1) # 1 hour for password reset
    to_encode = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "reset"
    }
    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )

def verify_reset_token(token: str) -> int | None:
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        if payload.get("type") != "reset":
            return None
        return int(payload.get("sub"))
    except Exception:
        return None