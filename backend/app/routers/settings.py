from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas.settings import SettingsOut, SettingsUpdate
from app.services.ollama_service import ollama_service
from app.routers.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("", response_model=SettingsOut)
def get_settings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check database health
    db_health = "Online"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_health = "Offline"
        
    # Check Ollama server health
    ollama_health = "Online" if ollama_service.is_available() else "Offline"
    
    plan_limits = {
        "Free": 100,
        "Pro": 5000,
        "Business": 9999999
    }
    max_limit = plan_limits.get(current_user.plan, 100)
    
    return SettingsOut(
        default_model=ollama_service.get_default_model(),
        ollama_url=ollama_service.ollama_url,
        saas_plan=current_user.plan,
        comments_used=current_user.comments_used_this_month,
        max_comments=max_limit,
        system_health={
            "database": db_health,
            "ollama": ollama_health,
            "redis": "Online"  # Redis status is checked via health endpoint
        }
    )

@router.put("", response_model=SettingsOut)
def update_settings(
    req: SettingsUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if req.default_model:
        ollama_service.set_default_model(req.default_model)
    if req.ollama_url:
        ollama_service.ollama_url = req.ollama_url
    if req.saas_plan:
        if req.saas_plan in ["Free", "Pro", "Business"]:
            current_user.plan = req.saas_plan
            db.commit()
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid plan. Must be 'Free', 'Pro', or 'Business'."
            )
            
    return get_settings(current_user=current_user, db=db)
