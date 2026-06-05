import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from redis import Redis
from app.database import get_db
from app.config import settings

router = APIRouter(tags=["health"])

@router.get("/health")
def get_health():
    """Simple shallow health check."""
    return {"status": "healthy", "timestamp": time.time()}

@router.get("/ready")
def get_ready(db: Session = Depends(get_db)):
    """Deep readiness check of DB and Redis."""
    # 1. DB ping
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        db_ok = False
        db_err = str(e)
        
    # 2. Redis ping
    redis_ok = False
    try:
        r = Redis.from_url(settings.REDIS_URL, socket_timeout=1)
        r.ping()
        redis_ok = True
    except Exception as e:
        redis_ok = False
        redis_err = str(e)
        
    if not db_ok or not redis_ok:
        details = {}
        if not db_ok:
            details["database"] = f"unhealthy: {db_err}"
        if not redis_ok:
            details["redis"] = f"unhealthy: {redis_err}"
        raise HTTPException(status_code=503, detail={"status": "unready", "details": details})
        
    return {"status": "ready", "database": "healthy", "redis": "healthy"}

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    """Exposes simple JSON application usage statistics."""
    from app.models.user import User
    from app.models.interview import InterviewSession
    
    try:
        user_count = db.query(User).count()
        session_count = db.query(InterviewSession).count()
        completed_sessions = db.query(InterviewSession).filter(InterviewSession.status == "completed").count()
        
        return {
            "total_users": user_count,
            "total_interviews": session_count,
            "completed_interviews": completed_sessions,
            "success_rate": round((completed_sessions / session_count * 100), 2) if session_count > 0 else 0.0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to gather metrics: {str(e)}")
