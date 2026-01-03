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
        raise HTTPException(status_code=400, detail="Project name already exists or error creating project")
    return db_project

@router.get("/", response_model=List[schemas.ProjectResponse])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = db.query(models.Project).offset(skip).limit(limit).all()
    return projects

@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def read_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/{project_id}/schemas/", response_model=schemas.SchemaResponse)
def create_schema(project_id: int, schema: schemas.SchemaCreate, db: Session = Depends(get_db)):
    # Check if project exists
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
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
        raise HTTPException(status_code=404, detail="No schema found for this project")
    return schema

@router.get("/{project_id}/submissions", response_model=List[schemas.SubmissionResponse])
def read_project_submissions(project_id: int, db: Session = Depends(get_db)):
    # Check project exists
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    submissions = db.query(models.Submission).filter(models.Submission.project_id == project_id).all()
    return submissions

from fastapi.responses import StreamingResponse
import io
import pandas as pd

@router.post("/{project_id}/download")
def download_project_data(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
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
            df = pd.DataFrame(sub.data)
            df['_center_source'] = sub.center_name
            data_frames.append(df)
            
    if not data_frames:
         raise HTTPException(status_code=400, detail="資料解析失敗。")

    merged_df = pd.concat(data_frames, ignore_index=True)
    
    # Export to CSV
    stream = io.StringIO()
    merged_df.to_csv(stream, index=False)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=project_{project_id}_data.csv"
    return response
