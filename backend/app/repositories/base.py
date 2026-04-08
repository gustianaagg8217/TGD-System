"""
Base Repository

Generic CRUD repository pattern for SQLAlchemy models.
Provides common database operations for all repositories.
"""

from typing import Generic, Type, TypeVar, List, Optional, Any, Dict

from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session
from sqlalchemy.sql import Select

from app.core.exceptions import ResourceNotFoundException, DuplicateResourceException

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")


class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Base repository class providing generic CRUD operations.

    Example:
        class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
            def __init__(self, db: Session):
                super().__init__(User, db)
    """

    def __init__(self, model: Type[ModelType], db: Session):
        """
        Initialize repository.

        Args:
            model: SQLAlchemy model class
            db: Database session
        """
        self.model = model
        self.db = db

    # ===== CREATE =====

    def create(self, obj_in: CreateSchemaType, **kwargs) -> ModelType:
        """
        Create a new database record.

        Args:
            obj_in: Schema object with create data
            **kwargs: Additional fields to set

        Returns:
            ModelType: Created database object

        Raises:
            DuplicateResourceException: If unique constraint violated
        """
        try:
            db_obj = self.model(**obj_in.model_dump(), **kwargs)
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except Exception as e:
            self.db.rollback()
            if "unique" in str(e).lower():
                raise DuplicateResourceException(
                    resource_type=self.model.__name__,
                    field="unique_constraint",
                    value="unique_value",
                )
            raise

    def create_many(self, obj_list: List[CreateSchemaType]) -> List[ModelType]:
        """
        Create multiple database records.

        Args:
            obj_list: List of schema objects

        Returns:
            List[ModelType]: List of created objects
        """
        db_objs = [self.model(**obj.model_dump()) for obj in obj_list]
        self.db.add_all(db_objs)
        self.db.commit()
        return db_objs

    # ===== READ =====

    def get_by_id(self, obj_id: Any) -> Optional[ModelType]:
        """
        Get single record by ID.

        Args:
            obj_id: Record ID

        Returns:
            Optional[ModelType]: Database object or None
        """
        return self.db.query(self.model).filter(self.model.id == obj_id).first()

    def get_by_id_or_404(self, obj_id: Any) -> ModelType:
        """
        Get single record by ID or raise 404.

        Args:
            obj_id: Record ID

        Returns:
            ModelType: Database object

        Raises:
            ResourceNotFoundException: If record not found
        """
        obj = self.get_by_id(obj_id)
        if not obj:
            raise ResourceNotFoundException(
                resource_type=self.model.__name__,
                resource_id=str(obj_id),
            )
        return obj

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        order_by: Optional[str] = None,
    ) -> tuple[List[ModelType], int]:
        """
        Get all records with pagination.

        Args:
            skip: Number of records to skip
            limit: Maximum records to return
            order_by: Field to order by (e.g., 'id', '-created_at')

        Returns:
            Tuple[List[ModelType], int]: List of records and total count
        """
        query = self.db.query(self.model)

        # Count total before pagination
        total = query.count()

        # Apply ordering
        if order_by:
            if order_by.startswith("-"):
                field = getattr(self.model, order_by[1:], None)
                if field is not None:
                    query = query.order_by(field.desc())
            else:
                field = getattr(self.model, order_by, None)
                if field is not None:
                    query = query.order_by(field)

        # Apply pagination
        records = query.offset(skip).limit(limit).all()
        return records, total

    def get_one(self, **filters) -> Optional[ModelType]:
        """
        Get single record by filters.

        Args:
            **filters: Filter conditions

        Returns:
            Optional[ModelType]: Database object or None
        """
        return self.db.query(self.model).filter_by(**filters).first()

    def get_by_field(
        self,
        field_name: str,
        value: Any,
    ) -> Optional[ModelType]:
        """
        Get record by specific field value.

        Args:
            field_name: Field name to filter by
            value: Field value

        Returns:
            Optional[ModelType]: Database object or None
        """
        field = getattr(self.model, field_name, None)
        if field is None:
            return None
        return self.db.query(self.model).filter(field == value).first()

    def count(self, **filters) -> int:
        """
        Count records matching filters.

        Args:
            **filters: Filter conditions

        Returns:
            int: Record count
        """
        return self.db.query(self.model).filter_by(**filters).count()

    # ===== UPDATE =====

    def update(self, obj: ModelType, obj_in: UpdateSchemaType) -> ModelType:
        """
        Update a database record.

        Args:
            obj: Database object to update
            obj_in: Schema with updated data

        Returns:
            ModelType: Updated database object
        """
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(obj, field):
                setattr(obj, field, value)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update_by_id(self, obj_id: Any, obj_in: UpdateSchemaType) -> ModelType:
        """
        Update record by ID.

        Args:
            obj_id: Record ID
            obj_in: Schema with updated data

        Returns:
            ModelType: Updated object

        Raises:
            ResourceNotFoundException: If record not found
        """
        obj = self.get_by_id_or_404(obj_id)
        return self.update(obj, obj_in)

    # ===== DELETE =====

    def delete(self, obj: ModelType) -> ModelType:
        """
        Delete a database record.

        Args:
            obj: Database object to delete

        Returns:
            ModelType: Deleted object
        """
        self.db.delete(obj)
        self.db.commit()
        return obj

    def delete_by_id(self, obj_id: Any) -> ModelType:
        """
        Delete record by ID.

        Args:
            obj_id: Record ID

        Returns:
            ModelType: Deleted object

        Raises:
            ResourceNotFoundException: If record not found
        """
        obj = self.get_by_id_or_404(obj_id)
        return self.delete(obj)

    def soft_delete(self, obj: ModelType) -> ModelType:
        """
        Soft delete (mark as deleted) a database record.
        Requires is_deleted field on model.

        Args:
            obj: Database object to soft delete

        Returns:
            ModelType: Soft deleted object
        """
        if hasattr(obj, "is_deleted"):
            obj.is_deleted = True
            self.db.add(obj)
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def soft_delete_by_id(self, obj_id: Any) -> ModelType:
        """
        Soft delete by ID.

        Args:
            obj_id: Record ID

        Returns:
            ModelType: Soft deleted object
        """
        obj = self.get_by_id_or_404(obj_id)
        return self.soft_delete(obj)

    # ===== BULK OPERATIONS =====

    def delete_many(self, ids: List[Any]) -> int:
        """
        Delete multiple records by IDs.

        Args:
            ids: List of record IDs

        Returns:
            int: Number of deleted records
        """
        count = self.db.query(self.model).filter(self.model.id.in_(ids)).delete()
        self.db.commit()
        return count

    # ===== FILTERING & SEARCH =====

    def filter(
        self,
        skip: int = 0,
        limit: int = 100,
        order_by: Optional[str] = None,
        **filters,
    ) -> tuple[List[ModelType], int]:
        """
        Get records matching filters with pagination.

        Args:
            skip: Number to skip
            limit: Max records
            order_by: Sort field
            **filters: Filter conditions

        Returns:
            Tuple[List[ModelType], int]: Records and total count
        """
        query = self.db.query(self.model)

        # Apply filters
        for key, value in filters.items():
            if value is not None and hasattr(self.model, key):
                field = getattr(self.model, key)
                query = query.filter(field == value)

        total = query.count()

        # Apply ordering
        if order_by:
            if order_by.startswith("-"):
                field = getattr(self.model, order_by[1:], None)
                if field:
                    query = query.order_by(field.desc())
            else:
                field = getattr(self.model, order_by, None)
                if field:
                    query = query.order_by(field)

        records = query.offset(skip).limit(limit).all()
        return records, total

    def search(
        self,
        search_fields: List[str],
        query_str: str,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[List[ModelType], int]:
        """
        Search records by multiple fields.

        Args:
            search_fields: List of field names to search in
            query_str: Search query string
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[ModelType], int]: Records and total count
        """
        query = self.db.query(self.model)

        # Build OR filter for search fields
        search_filters = []
        for field_name in search_fields:
            if hasattr(self.model, field_name):
                field = getattr(self.model, field_name)
                search_filters.append(field.ilike(f"%{query_str}%"))

        if search_filters:
            query = query.filter(or_(*search_filters))

        total = query.count()
        records = query.offset(skip).limit(limit).all()
        return records, total
