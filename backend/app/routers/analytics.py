from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.analytics_service import analytics_service
from app.routers.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("", response_model=Dict[str, Any])
def get_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return analytics_service.get_dashboard_analytics(db, current_user.id)
