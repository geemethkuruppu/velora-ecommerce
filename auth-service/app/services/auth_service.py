from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password
from fastapi import HTTPException, status
from app.core.security import create_access_token
from app.core.config import settings
from app.core.security import verify_password
from app.models.user import User



def create_user(db: Session, user_in: UserCreate) -> User:
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )


    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role="CUSTOMER",
        is_active=True,
        is_verified=False,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def login_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()

    # 1️⃣ Invalid credentials
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # 2️⃣ Account inactive
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # 3️⃣ Create JWT (JWT = identity proof, not user profile)
    token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role
        },
        expires_minutes=settings.access_token_expire_minutes
    )

    # 4️⃣ Return token + SAFE user info
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified
        }
    }

def create_admin(db: Session, user_in: UserCreate) -> User:
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role="ADMIN",
        is_active=True,
        is_verified=False,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate verification token
    from app.core.security import create_verification_token
    token = create_verification_token(user.id)

    # Send verification email
    from app.services.email_service import send_verification_email
    send_verification_email(user.email, token, user.full_name)

    return user

def get_all_admin_users(db: Session) -> list[User]:
    """Get all users (ADMIN, SUPER_ADMIN, and CUSTOMER)"""
    users = db.query(User).all()
    return users

def deactivate_user(db: Session, user: User):
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account already deactivated"
        )

    user.is_active = False
    db.commit()

    return {"message": "Account deactivated successfully"}

def activate_user(db: Session, user: User):
    if user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account already active"
        )

    user.is_active = True
    db.commit()

    return {"message": "Account activated successfully"}

def update_user(db: Session, user: User, user_in: UserUpdate) -> User:
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user: User):
    db.delete(user)
    db.commit()
    return {"message": "Account deleted permanently"}

def forgot_password(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal if user exists for security, just say email sent
        return {"message": "If this email is registered, a reset link has been sent."}

    from app.core.security import create_reset_token
    token = create_reset_token(user.id)
    
    from app.services.email_service import send_password_reset_email
    send_password_reset_email(user.email, token, user.full_name)
    
    return {"message": "Password reset link sent successfully"}

def request_user_password_reset(db: Session, user: User):
    """Triggered by Admin for another user"""
    from app.core.security import create_reset_token
    token = create_reset_token(user.id)
    
    from app.services.email_service import send_password_reset_email
    send_password_reset_email(user.email, token, user.full_name)
    
    return {"message": f"Password reset link sent to {user.email}"}

def reset_password(db: Session, token: str, new_password: str):
    from app.core.security import verify_reset_token
    user_id = verify_reset_token(token)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.hashed_password = hash_password(new_password)
    db.commit()
    
    return {"message": "Password reset successfully"}

def update_password(db: Session, user: User, current_password: str, new_password: str):
    if not verify_password(current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    user.hashed_password = hash_password(new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}