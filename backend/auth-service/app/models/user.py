from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    # 1️⃣ Primary identifier
    id = Column(Integer, primary_key=True, index=True)

    # 2️⃣ Authentication
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # 3️⃣ Basic profile
    full_name = Column(String, nullable=True)

    # 4️⃣ Authorization
    role = Column(String, default="CUSTOMER", nullable=False)

    # 5️⃣ Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # 6️⃣ Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
