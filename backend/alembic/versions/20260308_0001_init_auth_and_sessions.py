"""Initial auth, uploaded files, and scan sessions tables."""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20260308_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("password_hash", sa.String(length=512), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "user_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("session_token", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(
        op.f("ix_user_sessions_session_token"),
        "user_sessions",
        ["session_token"],
        unique=True,
    )
    op.create_index(op.f("ix_user_sessions_user_id"), "user_sessions", ["user_id"], unique=False)

    op.create_table(
        "uploaded_files",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("owner_scope", sa.String(length=128), nullable=False),
        sa.Column("original_filename", sa.String(length=512), nullable=False),
        sa.Column("file_hash", sa.String(length=64), nullable=False),
        sa.Column("content", sa.LargeBinary(), nullable=False),
        sa.Column("extracted_text", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("owner_scope", "file_hash", name="uq_uploaded_file_owner_hash"),
    )
    op.create_index(
        op.f("ix_uploaded_files_file_hash"), "uploaded_files", ["file_hash"], unique=False
    )
    op.create_index(
        op.f("ix_uploaded_files_owner_scope"),
        "uploaded_files",
        ["owner_scope"],
        unique=False,
    )
    op.create_index(op.f("ix_uploaded_files_user_id"), "uploaded_files", ["user_id"], unique=False)

    op.create_table(
        "scan_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("uploaded_file_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("job_description", sa.Text(), nullable=False),
        sa.Column("match_score", sa.Float(), nullable=False),
        sa.Column("matched_skills_json", sa.Text(), nullable=False),
        sa.Column("missing_skills_json", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["uploaded_file_id"], ["uploaded_files.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index(
        op.f("ix_scan_sessions_uploaded_file_id"),
        "scan_sessions",
        ["uploaded_file_id"],
        unique=False,
    )
    op.create_index(op.f("ix_scan_sessions_user_id"), "scan_sessions", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_scan_sessions_user_id"), table_name="scan_sessions")
    op.drop_index(op.f("ix_scan_sessions_uploaded_file_id"), table_name="scan_sessions")
    op.drop_table("scan_sessions")

    op.drop_index(op.f("ix_uploaded_files_user_id"), table_name="uploaded_files")
    op.drop_index(op.f("ix_uploaded_files_owner_scope"), table_name="uploaded_files")
    op.drop_index(op.f("ix_uploaded_files_file_hash"), table_name="uploaded_files")
    op.drop_table("uploaded_files")

    op.drop_index(op.f("ix_user_sessions_user_id"), table_name="user_sessions")
    op.drop_index(op.f("ix_user_sessions_session_token"), table_name="user_sessions")
    op.drop_table("user_sessions")

    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
