import time
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from redis import Redis
from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.persona import Persona
from app.models.history import CommentHistory

router = APIRouter(tags=["health"])

@router.get("/health")
def get_health(db: Session = Depends(get_db)):
    """Simple shallow health check verifying database connectivity."""
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        db_ok = False
        db_err = str(e)

    if not db_ok:
        raise HTTPException(
            status_code=503,
            detail={"status": "unhealthy", "database": f"error: {db_err}"}
        )

    return {
        "status": "healthy",
        "timestamp": time.time(),
        "database": "connected"
    }

@router.get("/ready")
def get_ready(db: Session = Depends(get_db)):
    """Deep readiness check of DB, optional Redis, and Ollama connections."""
    # 1. DB ping
    db_ok = False
    db_err = None
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        db_ok = False
        db_err = str(e)

    # 2. Redis ping (optional status reporting)
    redis_ok = False
    redis_status = "unconfigured"
    if settings.REDIS_URL:
        try:
            r = Redis.from_url(settings.REDIS_URL, socket_timeout=1)
            r.ping()
            redis_ok = True
            redis_status = "connected"
        except Exception as e:
            redis_ok = False
            redis_status = f"offline: {str(e)}"

    # 3. Ollama server check (optional status reporting)
    ollama_status = "offline"
    try:
        response = httpx.get(f"{settings.OLLAMA_URL}/api/tags", timeout=1.0)
        if response.status_code == 200:
            ollama_status = "online"
    except Exception:
        ollama_status = "offline"

    if not db_ok:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unready",
                "database": f"unhealthy: {db_err}",
                "redis": redis_status,
                "ollama": ollama_status
            }
        )

    return {
        "status": "ready",
        "database": "healthy",
        "redis": redis_status,
        "ollama": ollama_status,
        "groq_configured": settings.GROQ_API_KEY is not None
    }

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    """Exposes simple JSON application usage statistics and metrics."""
    try:
        user_count = db.query(User).count()
        persona_count = db.query(Persona).count()
        total_generations = db.query(CommentHistory).count()
        comments_count = db.query(CommentHistory).filter(CommentHistory.comment_type == "comment").count()
        replies_count = db.query(CommentHistory).filter(CommentHistory.comment_type == "reply").count()

        return {
            "total_users": user_count,
            "total_personas": persona_count,
            "total_generations": total_generations,
            "comments_generated": comments_count,
            "replies_generated": replies_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to gather metrics: {str(e)}")
