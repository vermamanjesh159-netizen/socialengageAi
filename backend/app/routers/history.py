from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.history import HistoryOut
from app.services.history_service import history_service
from app.routers.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/history", tags=["history"])

@router.get("", response_model=List[HistoryOut])
def list_history(
    platform: Optional[str] = Query(None),
    persona_id: Optional[int] = Query(None),
    style: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    logs, _ = history_service.get_history(
        db=db,
        user_id=current_user.id,
        platform=platform,
        persona_id=persona_id,
        style=style,
        search=search,
        skip=skip,
        limit=limit
    )
    return logs

@router.delete("/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history_log(
    history_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    success = history_service.delete_history_log(db, history_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History log not found or permission denied"
        )
    return None

@router.get("/export/csv")
def export_csv(
    platform: Optional[str] = Query(None),
    persona_id: Optional[int] = Query(None),
    style: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    logs, _ = history_service.get_history(
        db=db,
        user_id=current_user.id,
        platform=platform,
        persona_id=persona_id,
        style=style,
        search=search,
        skip=0,
        limit=100000  # Export all matching entries
    )
    csv_content = history_service.export_csv(logs)
    
    filename = f"socialengage_export_{current_user.id}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/json")
def export_json(
    platform: Optional[str] = Query(None),
    persona_id: Optional[int] = Query(None),
    style: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    logs, _ = history_service.get_history(
        db=db,
        user_id=current_user.id,
        platform=platform,
        persona_id=persona_id,
        style=style,
        search=search,
        skip=0,
        limit=100000  # Export all matching entries
    )
    json_data = history_service.export_json(logs)
    return json_data
