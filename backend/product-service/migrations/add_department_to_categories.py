"""Add department field to categories

Revision ID: add_department_to_categories
Revises: 
Create Date: 2026-02-01

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_department_to_categories'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add department column with default value 'Others'
    op.add_column('categories', sa.Column('department', sa.String(), nullable=False, server_default='Others'))
    
    # Optional: Update existing categories based on their names (customize as needed)
    # Example: If category name contains 'Women', set to 'Womenswear'
    # op.execute("""
    #     UPDATE categories 
    #     SET department = CASE
    #         WHEN LOWER(name) LIKE '%women%' OR LOWER(name) LIKE '%ladies%' THEN 'Womenswear'
    #         WHEN LOWER(name) LIKE '%men%' OR LOWER(name) LIKE '%male%' THEN 'Menswear'
    #         WHEN LOWER(name) LIKE '%kid%' OR LOWER(name) LIKE '%child%' THEN 'Kidswear'
    #         ELSE 'Others'
    #     END
    # """)


def downgrade():
    # Remove department column
    op.drop_column('categories', 'department')
