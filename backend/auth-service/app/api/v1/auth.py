from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Request
from sqlalchemy.orm import Session
from app.core.config import settings
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    UserLogin,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
    UserPasswordUpdate
)
from app.services.auth_service import (
    create_user,
    login_user,
    create_admin,
    update_user,
    delete_user,
    deactivate_user,
    activate_user,
    forgot_password,
    reset_password,
    update_password
)
from app.db.deps import get_db
from app.api.deps import require_admin, get_current_user
from app.models.user import User
from app.core.limiter import limiter


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
@limiter.limit("5/minute")
def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        user = create_user(db, user_in)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, payload: UserLogin, response: Response, db: Session = Depends(get_db)):
    if len(payload.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password is too long"
        )
    
    result = login_user(db, payload.email, payload.password)
    
    # Set HttpOnly cookies with path="/" for cross-service visibility
    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        httponly=True,
        max_age=settings.access_token_expire_minutes * 60,
        expires=settings.access_token_expire_minutes * 60,
        samesite="lax" if settings.env == "production" else "lax",
        secure=True if settings.env == "production" else False,
        path="/"
    )
    
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        expires=settings.refresh_token_expire_days * 24 * 60 * 60,
        samesite="lax" if settings.env == "production" else "lax",
        secure=True if settings.env == "production" else False,
        path="/"
    )
    
    return result

@router.post("/register-admin", response_model=UserResponse)
def register_admin(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return create_admin(db, payload)

@router.get("/me", response_model=UserResponse)
def get_me(current_user = Depends(get_current_user)):
    return current_user

@router.get("/verify-email", response_model=MessageResponse)
def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    """Verify user email using a token"""
    from app.core.security import verify_verification_token
    user_id = verify_verification_token(token)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_verified:
        return {"message": "Email already verified"}
    
    user.is_verified = True
    db.commit()
    
    return {"message": "Email verified successfully"}

@router.get("/users", response_model=list[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    """Get all users (SUPER_ADMIN only)"""
    from app.services.auth_service import get_all_admin_users
    return get_all_admin_users(db)

@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    """Delete a specific user by ID (SUPER_ADMIN only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return delete_user(db, user)

@router.patch("/users/{user_id}/deactivate", response_model=MessageResponse)
def deactivate_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    """Deactivate a specific user account (SUPER_ADMIN only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return deactivate_user(db, user)

@router.patch("/users/{user_id}/activate", response_model=MessageResponse)
def activate_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    """Activate a specific user account (SUPER_ADMIN only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return activate_user(db, user)

@router.post("/users/{user_id}/reset-password-request", response_model=MessageResponse)
def admin_reset_user_password(
    user_id: int,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    """Trigger a password reset email for a user (SUPER_ADMIN only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    from app.services.auth_service import request_user_password_reset
    return request_user_password_reset(db, user)

@router.delete("/delete", response_model=MessageResponse)
def delete_account(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return delete_user(db, current_user)

@router.patch("/deactivate", response_model=MessageResponse)
def deactivate_account(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return deactivate_user(db, current_user)

@router.patch("/activate", response_model=MessageResponse)
def activate_account(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return activate_user(db, current_user)

@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password_request(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    return forgot_password(db, payload.email)

@router.post("/reset-password", response_model=MessageResponse)
def reset_password_request(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    return reset_password(db, payload.token, payload.new_password)

@router.put("/edit", response_model=UserResponse)
def edit_details(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return update_user(db, current_user, payload)

@router.put("/update-password", response_model=MessageResponse)
def change_password(
    payload: UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if payload.new_password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )
    return update_password(db, current_user, payload.current_password, payload.new_password)

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    response: Response,
    refresh_token: str = Cookie(None),
    db: Session = Depends(get_db)
):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )
        
    from app.core.security import decode_refresh_token, create_access_token
    payload = decode_refresh_token(refresh_token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
        
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
        
    # Issue new access token
    new_access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role
        }
    )
    
    # Update cookie
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        max_age=settings.access_token_expire_minutes * 60,
        expires=settings.access_token_expire_minutes * 60,
        samesite="lax" if settings.env == "production" else "lax",
        secure=True if settings.env == "production" else False,
        path="/"
    )
    
    return {
        "access_token": new_access_token,
        "refresh_token": refresh_token,
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

@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out successfully"}