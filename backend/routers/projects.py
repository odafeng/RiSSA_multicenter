from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import models, schemas
from database import get_db

router = APIRouter(
    prefix="/projects",
    tags=["projects"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Project(name=project.name, description=project.description)
    db.add(db_project)
    try:
        db.commit()
        db.refresh(db_project)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="專案名稱已存在或建立失敗")
    return db_project

@router.get("/", response_model=List[schemas.ProjectResponse])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = db.query(models.Project).offset(skip).limit(limit).all()
    return projects

@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def read_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="找不到專案")
    return project

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="找不到專案")
    
    # Delete related submissions and schemas first (cascade)
    db.query(models.Submission).filter(models.Submission.project_id == project_id).delete()
    db.query(models.Schema).filter(models.Schema.project_id == project_id).delete()
    db.delete(project)
    db.commit()
    return {"message": "專案已刪除"}

@router.post("/{project_id}/schemas/", response_model=schemas.SchemaResponse)
def create_schema(project_id: int, schema: schemas.SchemaCreate, db: Session = Depends(get_db)):
    # Check if project exists
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="找不到專案")
    
    # Get latest version to increment
    last_schema = db.query(models.Schema).filter(models.Schema.project_id == project_id).order_by(desc(models.Schema.version)).first()
    new_version = 1
    if last_schema:
        new_version = last_schema.version + 1
    
    db_schema = models.Schema(project_id=project_id, structure=schema.structure, version=new_version)
    db.add(db_schema)
    db.commit()
    db.refresh(db_schema)
    return db_schema

@router.get("/{project_id}/schemas/latest", response_model=schemas.SchemaResponse)
def get_latest_schema(project_id: int, db: Session = Depends(get_db)):
    schema = db.query(models.Schema).filter(models.Schema.project_id == project_id).order_by(desc(models.Schema.version)).first()
    if not schema:
        raise HTTPException(status_code=404, detail="尚未為此專案建立 Schema")
    return schema

@router.get("/{project_id}/submissions", response_model=List[schemas.SubmissionResponse])
def read_project_submissions(project_id: int, db: Session = Depends(get_db)):
    # Check project exists
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="找不到專案")
    
    submissions = db.query(models.Submission).filter(models.Submission.project_id == project_id).all()
    return submissions

from fastapi.responses import StreamingResponse
import io
import pandas as pd

@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(project_id: int, updates: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="找不到專案")
    
    if updates.name:
        project.name = updates.name
    if updates.download_password:
        project.download_password = updates.download_password
    
    db.commit()
    db.refresh(project)
    return project

@router.post("/{project_id}/download")
def download_project_data(project_id: int, password: str = Form(...), db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="找不到專案")
    
    if project.download_password != password:
        raise HTTPException(status_code=403, detail="密碼錯誤，拒絕下載。")
    
    submissions = db.query(models.Submission).filter(
        models.Submission.project_id == project_id,
        models.Submission.status == "validated"
    ).all()
    
    if not submissions:
        raise HTTPException(status_code=400, detail="目前無有效資料可供下載。")

    # Merge Logic
    data_frames = []
    for sub in submissions:
        if sub.data:
            # Reconstruct DF from JSON
            df = pd.DataFrame(sub.data)
            # Add metadata columns if needed, e.g., center_name
            df['_center_source'] = sub.center_name
            data_frames.append(df)
            
    if not data_frames:
         raise HTTPException(status_code=400, detail="資料解析失敗。")

    # Simple concat (outer join by default for pandas concat)
    # Aligning schemas: pandas handles this by adding NaNs for missing columns
    merged_df = pd.concat(data_frames, ignore_index=True)
    
    # Export to CSV
    stream = io.StringIO()
    merged_df.to_csv(stream, index=False)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=project_{project_id}_data.csv"
    return response
