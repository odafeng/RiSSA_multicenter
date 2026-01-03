from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
import pandas as pd
import json
import io
import os
import hashlib
from pathlib import Path

from .. import models, schemas
from ..database import get_db
from ..services import validation

router = APIRouter(
    prefix="/projects",
    tags=["upload"],
    responses={404: {"description": "Not found"}},
)

# Directory to store EDA reports
REPORTS_DIR = Path(__file__).parent.parent / "reports"
REPORTS_DIR.mkdir(exist_ok=True)

def generate_eda_report(df: pd.DataFrame, submission_id: int) -> str:
    """Generate EDA report using ydata-profiling and return the file path."""
    try:
        from ydata_profiling import ProfileReport
        
        report_filename = f"eda_report_{submission_id}.html"
        report_path = REPORTS_DIR / report_filename
        
        # Generate minimal report for performance
        profile = ProfileReport(
            df, 
            title=f"EDA Report - Submission {submission_id}",
            minimal=True,
            explorative=True
        )
        profile.to_file(report_path)
        
        return f"/api/reports/{report_filename}"
    except Exception as e:
        print(f"EDA report generation failed: {e}")
        return None

@router.post("/{project_id}/submissions")
async def upload_submission(
    project_id: int, 
    center_name: str = Form(...),
    uploader_name: str = Form(None),
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    # 1. Check Project
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="找不到專案")

    # 2. Get Active Schema
    schema = db.query(models.Schema).filter(models.Schema.project_id == project_id).order_by(desc(models.Schema.version)).first()
    if not schema:
        raise HTTPException(status_code=400, detail="PI 尚未設定此專案的 Schema，請先聯繫 PI 設定欄位格式。")

    # 3. Read File
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="格式錯誤: 只允許上傳 CSV 檔案 (.csv)")
    
    contents = await file.read()
    file_size = len(contents)
    
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"無法讀取 CSV 檔案，請確認編碼或格式: {str(e)}")

    # Calculate file stats
    file_stats = {
        "file_size_bytes": file_size,
        "file_size_kb": round(file_size / 1024, 2),
        "row_count": len(df),
        "column_count": len(df.columns),
        "column_names": df.columns.tolist()
    }

    # 4. Sensitive Data Check
    sensitive_cols = validation.check_sensitive_data(df)
    if sensitive_cols:
        raise HTTPException(status_code=400, detail=f"上傳拒絕: 偵測到敏感個資欄位 ({', '.join(sensitive_cols)})。請移除後再試。")

    # 5. Schema Validation
    is_valid, report = validation.validate_dataframe(df, schema.structure)
    
    status = "validated" if is_valid else "rejected"
    if not is_valid:
        error_details = []
        if 'errors' in report:
             error_details = report['errors']
        
        detail_msg = "資料驗證失敗:\\n" + "\\n".join(error_details)
        raise HTTPException(status_code=400, detail=detail_msg)

    # 6. Check for existing submission from this center
    existing_submission = db.query(models.Submission).filter(
        models.Submission.project_id == project_id,
        models.Submission.center_name == center_name
    ).first()

    if existing_submission:
        db.delete(existing_submission)
        db.commit()

    # 7. Save Submission
    data_json = df.to_dict(orient="records")
    
    submission = models.Submission(
        project_id=project_id,
        center_name=center_name,
        uploader_name=uploader_name,
        filename=file.filename,
        status=status,
        validation_report=report,
        data=data_json
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    # 8. Generate EDA Report (async in background would be better, but keeping it simple)
    eda_report_url = generate_eda_report(df, submission.id)
    
    # Return response with file stats
    return {
        "id": submission.id,
        "project_id": submission.project_id,
        "center_name": submission.center_name,
        "uploader_name": submission.uploader_name,
        "filename": submission.filename,
        "upload_date": submission.upload_date,
        "status": submission.status,
        "validation_report": submission.validation_report,
        "file_stats": file_stats,
        "eda_report_url": eda_report_url
    }

@router.get("/reports/{filename}")
async def get_eda_report(filename: str):
    """Serve EDA report HTML file."""
    report_path = REPORTS_DIR / filename
    if not report_path.exists():
        raise HTTPException(status_code=404, detail="報告不存在")
    return FileResponse(report_path, media_type="text/html")

