"""Seed super admin

Revision ID: 22751ca8aea4
Revises: 854d9cd33539
Create Date: 2026-02-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from passlib.context import CryptContext

# revision identifiers, used by Alembic.
revision: str = '22751ca8aea4'
down_revision: Union[str, None] = '854d9cd33539'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def upgrade() -> None:
    # Hash the password
    hashed_pw = pwd_context.hash('Geemeth@32#')
    
    # Insert super admin using raw SQL
    op.execute(f"""
        INSERT INTO users (email, full_name, hashed_password, role, is_active, is_verified, created_at, updated_at)
        VALUES ('geemeth@gmail.com', 'Geemeth', '{hashed_pw}', 'admin', true, true, NOW(), NOW())
    """)


def downgrade() -> None:
    # Remove super admin
    op.execute("DELETE FROM users WHERE email = 'geemeth@gmail.com'")
