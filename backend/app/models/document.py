"""
Document Model

SQLAlchemy ORM model for document management.
"""

from sqlalchemy import String, DateTime, Integer, ForeignKey, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone

from app.db.base import TimeStampedModel


class Document(TimeStampedModel):
    """
    Document model for storing and managing documents.

    Attributes:
        id: Unique document identifier
        asset_id: Optional foreign key to asset
        file_name: Original file name
        file_type: File type (pdf, image, document, etc.)
        file_size: File size in bytes
        s3_url: URL to file in cloud storage (S3, etc.)
        uploaded_by: User ID who uploaded
        uploaded_date: Upload date
        description: Document description
        tags: JSON array of tags for organization
        is_deleted: Soft delete flag
        created_by: User ID who created the record
        asset: Relationship to Asset model
    """

    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    asset_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("assets.id"),
        nullable=True,
        index=True,
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    file_size: Mapped[int] = mapped_column(Integer, nullable=True)  # bytes
    s3_url: Mapped[str] = mapped_column(String(1024), nullable=True)
    uploaded_by: Mapped[str] = mapped_column(String(36), nullable=True)
    uploaded_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    description: Mapped[str] = mapped_column(String(1024), nullable=True)
    tags: Mapped[list] = mapped_column(JSON, default=[], nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_by: Mapped[str] = mapped_column(String(36), nullable=True)

    # Relationships
    asset: Mapped["Asset"] = relationship("Asset", back_populates="documents")

    def __repr__(self) -> str:
        return f"<Document(id={self.id}, file_name={self.file_name})>"
