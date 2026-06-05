from typing import List, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.schemas.user import UserOut
from app.models.user import User
from app.models.history import CommentHistory
from app.services.ollama_service import ollama_service
from app.routers.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=List[UserOut])
def get_users_list(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.put("/users/{user_id}/plan", response_model=UserOut)
def change_user_plan_admin(
    user_id: int,
    plan: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    if plan not in ["Free", "Pro", "Business"]:
        raise HTTPException(status_code=400, detail="Invalid plan. Choose Free, Pro, or Business.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.plan = plan
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Admins cannot delete themselves")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return None

@router.get("/stats", response_model=Dict[str, Any])
def get_admin_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    # System users & plan breakdown
    total_users = db.query(User).count()
    free_users = db.query(User).filter(User.plan == "Free").count()
    pro_users = db.query(User).filter(User.plan == "Pro").count()
    biz_users = db.query(User).filter(User.plan == "Business").count()
    
    # Comments generated
    total_comments = db.query(CommentHistory).count()
    
    # Simulated SaaS Revenue calculation
    # Let's say Pro is $15/month and Business is $49/month
    revenue = (pro_users * 15) + (biz_users * 49)
    
    # Ollama status details
    ollama_status = "Online" if ollama_service.is_available() else "Offline"
    default_model = ollama_service.get_default_model()
    available_models = len(ollama_service.list_models())
    
    return {
        "users": {
            "total": total_users,
            "free": free_users,
            "pro": pro_users,
            "business": biz_users
        },
        "usage": {
            "total_comments_generated": total_comments
        },
        "revenue": {
            "estimated_monthly_recurring": revenue
        },
        "health": {
            "database": "Online",
            "ollama_server": ollama_status,
            "ollama_default_model": default_model,
            "ollama_models_count": available_models
        }
    }
