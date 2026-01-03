from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
import pandas as pd
import json
import io

from .. import models, schemas
from ..database import get_db
from ..services import validation

router = APIRouter(
    prefix="/projects",
    tags=["upload"],
    responses={404: {"description": "Not found"}},
)

@router.post("/{project_id}/submissions", response_model=schemas.SubmissionResponse)
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
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"無法讀取 CSV 檔案，請確認編碼或格式: {str(e)}")

    # 4. Sensitive Data Check
    sensitive_cols = validation.check_sensitive_data(df)
    if sensitive_cols:
        raise HTTPException(status_code=400, detail=f"上傳拒絕: 偵測到敏感個資欄位 ({', '.join(sensitive_cols)})。請移除後再試。")

    # 5. Schema Validation
    is_valid, report = validation.validate_dataframe(df, schema.structure)
    
    status = "validated" if is_valid else "rejected"
    if not is_valid:
        # We might still want to reject it or save it with errors.
        # User requirement implies checking fields. We will reject if validation fails for now.
        # Parse report for better error message
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
        # Delete the old one so we can replace it (or we could update it)
        # Replacing is cleaner ID-wise for fresh starts, but updating ID keeps history if we tracked it.
        # Given requirement "overwrite", deleting old is fine or updating fields.
        # Let's delete and add new to ensure fresh state.
        db.delete(existing_submission)
        db.commit()

    # 7. Save Submission
    # Convert df to JSON to store
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
    
    return submission
