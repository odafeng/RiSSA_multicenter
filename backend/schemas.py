from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class SchemaBase(BaseModel):
    structure: Dict[str, Any]

class SchemaCreate(SchemaBase):
    pass

class SchemaResponse(SchemaBase):
    id: int
    project_id: int
    version: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    download_password: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    schemas: List[SchemaResponse] = []

    class Config:
        from_attributes = True

class FileStats(BaseModel):
    file_size_bytes: int
    file_size_kb: float
    row_count: int
    column_count: int
    column_names: List[str]

class SubmissionBase(BaseModel):
    center_name: str
    uploader_name: Optional[str] = None
    filename: str

class SubmissionResponse(SubmissionBase):
    id: int
    project_id: int
    upload_date: datetime
    status: str
    validation_report: Optional[Dict[str, Any]] = None
    file_stats: Optional[FileStats] = None
    eda_report_url: Optional[str] = None

    class Config:
        from_attributes = True
