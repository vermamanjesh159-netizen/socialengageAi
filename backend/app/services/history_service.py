import csv
import io
import json
from datetime import datetime
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models.history import CommentHistory
from app.models.persona import Persona

class HistoryService:
    def get_history(
        self,
        db: Session,
        user_id: int,
        platform: Optional[str] = None,
        persona_id: Optional[int] = None,
        style: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> Tuple[List[CommentHistory], int]:
        """Fetch history logs with pagination, search, and platform/persona/style filters"""
        query = db.query(CommentHistory).filter(CommentHistory.user_id == user_id)
        
        if platform:
            query = query.filter(CommentHistory.platform == platform)
        if persona_id:
            query = query.filter(CommentHistory.persona_id == persona_id)
        if style:
            query = query.filter(CommentHistory.style == style)
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    CommentHistory.input_content.ilike(search_filter),
                    CommentHistory.output_content.ilike(search_filter)
                )
            )
            
        # Count total records matching filters
        total = query.count()
        
        # Paginate results
        logs = query.order_by(CommentHistory.created_at.desc()).offset(skip).limit(limit).all()
        return logs, total

    def create_history_log(
        self,
        db: Session,
        user_id: int,
        platform: str,
        input_content: str,
        output_content: str,
        style: str,
        comment_type: str = "comment",
        persona_id: Optional[int] = None,
        humanization_score: int = 85,
        spam_detected: bool = False,
        duplicate_detected: bool = False,
        quality_rating: int = 4,
        generation_time_ms: int = 0
    ) -> CommentHistory:
        """Create a new history entry"""
        log = CommentHistory(
            user_id=user_id,
            persona_id=persona_id,
            platform=platform,
            input_content=input_content,
            output_content=output_content,
            style=style,
            comment_type=comment_type,
            humanization_score=humanization_score,
            spam_detected=spam_detected,
            duplicate_detected=duplicate_detected,
            quality_rating=quality_rating,
            generation_time_ms=generation_time_ms
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    def delete_history_log(self, db: Session, history_id: int, user_id: int) -> bool:
        """Delete a log entry"""
        log = db.query(CommentHistory).filter(CommentHistory.id == history_id, CommentHistory.user_id == user_id).first()
        if not log:
            return False
        db.delete(log)
        db.commit()
        return True

    def export_csv(self, logs: List[CommentHistory]) -> str:
        """Export history to CSV string"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Headers
        writer.writerow([
            "ID", "Platform", "Comment Type", "Style", "Input Content",
            "Generated Content", "Humanization Score", "Spam Detected",
            "Duplicate Detected", "Quality Rating", "Generation Time (ms)", "Created At"
        ])
        
        for log in logs:
            writer.writerow([
                log.id,
                log.platform,
                log.comment_type,
                log.style,
                log.input_content,
                log.output_content,
                log.humanization_score,
                log.spam_detected,
                log.duplicate_detected,
                log.quality_rating,
                log.generation_time_ms,
                log.created_at.strftime("%Y-%m-%d %H:%M:%S")
            ])
            
        return output.getvalue()

    def export_json(self, logs: List[CommentHistory]) -> List[Dict[str, Any]]:
        """Export history to structured JSON dictionary list"""
        return [
            {
                "id": log.id,
                "platform": log.platform,
                "comment_type": log.comment_type,
                "style": log.style,
                "input_content": log.input_content,
                "output_content": log.output_content,
                "humanization_score": log.humanization_score,
                "spam_detected": log.spam_detected,
                "duplicate_detected": log.duplicate_detected,
                "quality_rating": log.quality_rating,
                "generation_time_ms": log.generation_time_ms,
                "created_at": log.created_at.isoformat()
            }
            for log in logs
        ]

history_service = HistoryService()
