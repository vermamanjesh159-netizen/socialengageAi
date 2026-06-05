from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.history import CommentHistory
from app.models.persona import Persona
from app.services.ollama_service import ollama_service

class AnalyticsService:
    def get_dashboard_analytics(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Compile dashboard widgets and charts data for a specific user"""
        
        # 1. Total Counts
        total_comments = db.query(CommentHistory).filter(
            CommentHistory.user_id == user_id, 
            CommentHistory.comment_type == "comment"
        ).count()
        
        total_replies = db.query(CommentHistory).filter(
            CommentHistory.user_id == user_id, 
            CommentHistory.comment_type == "reply"
        ).count()
        
        active_personas_count = db.query(Persona).filter(Persona.user_id == user_id).count()
        
        # 2. Ollama Status
        ollama_online = ollama_service.is_available()
        ollama_status = "Online" if ollama_online else "Offline"
        
        # 3. Usage Trends (Daily for past 7 days)
        today = datetime.utcnow().date()
        daily_usage = []
        for i in range(6, -1, -1):
            date_val = today - timedelta(days=i)
            start_dt = datetime.combine(date_val, datetime.min.time())
            end_dt = datetime.combine(date_val, datetime.max.time())
            
            count = db.query(CommentHistory).filter(
                CommentHistory.user_id == user_id,
                CommentHistory.created_at >= start_dt,
                CommentHistory.created_at <= end_dt
            ).count()
            
            daily_usage.append({
                "date": date_val.strftime("%b %d"),
                "count": count
            })
            
        # 4. Weekly Usage (Past 4 weeks)
        weekly_usage = []
        for i in range(3, -1, -1):
            start_date = today - timedelta(weeks=i+1)
            end_date = today - timedelta(weeks=i)
            start_dt = datetime.combine(start_date, datetime.min.time())
            end_dt = datetime.combine(end_date, datetime.max.time())
            
            count = db.query(CommentHistory).filter(
                CommentHistory.user_id == user_id,
                CommentHistory.created_at >= start_dt,
                CommentHistory.created_at <= end_dt
            ).count()
            
            weekly_usage.append({
                "week": f"Wk -{i}" if i > 0 else "This Wk",
                "count": count
            })

        # 5. Platform Usage Breakdown
        platform_breakdown = db.query(
            CommentHistory.platform, func.count(CommentHistory.id)
        ).filter(
            CommentHistory.user_id == user_id
        ).group_by(CommentHistory.platform).all()
        
        platform_usage = [
            {"name": platform, "value": count} for platform, count in platform_breakdown
        ]
        
        # 6. Comment Types
        comment_types = [
            {"name": "Comments", "value": total_comments},
            {"name": "Replies", "value": total_replies}
        ]
        
        # 7. Persona Performance
        persona_breakdown = db.query(
            Persona.name, func.count(CommentHistory.id)
        ).join(
            CommentHistory, CommentHistory.persona_id == Persona.id
        ).filter(
            CommentHistory.user_id == user_id
        ).group_by(Persona.name).all()
        
        persona_performance = [
            {"name": name, "value": count} for name, count in persona_breakdown
        ]
        
        # 8. Meta Aggregations
        most_used_platform_res = db.query(
            CommentHistory.platform, func.count(CommentHistory.id)
        ).filter(
            CommentHistory.user_id == user_id
        ).group_by(CommentHistory.platform).order_by(func.count(CommentHistory.id).desc()).first()
        most_used_platform = most_used_platform_res[0] if most_used_platform_res else "None"
        
        most_used_persona_res = db.query(
            Persona.name, func.count(CommentHistory.id)
        ).join(
            CommentHistory, CommentHistory.persona_id == Persona.id
        ).filter(
            CommentHistory.user_id == user_id
        ).group_by(Persona.name).order_by(func.count(CommentHistory.id).desc()).first()
        most_used_persona = most_used_persona_res[0] if most_used_persona_res else "None"
        
        most_generated_style_res = db.query(
            CommentHistory.style, func.count(CommentHistory.id)
        ).filter(
            CommentHistory.user_id == user_id
        ).group_by(CommentHistory.style).order_by(func.count(CommentHistory.id).desc()).first()
        most_generated_style = most_generated_style_res[0] if most_generated_style_res else "None"
        
        # Average response length and generation latency
        avg_len_res = db.query(func.avg(func.length(CommentHistory.output_content))).filter(
            CommentHistory.user_id == user_id
        ).scalar()
        avg_response_length = int(avg_len_res) if avg_len_res else 0
        
        avg_time_res = db.query(func.avg(CommentHistory.generation_time_ms)).filter(
            CommentHistory.user_id == user_id
        ).scalar()
        avg_generation_time_ms = int(avg_time_res) if avg_time_res else 0
        
        return {
            "widgets": {
                "total_generated_comments": total_comments,
                "total_replies": total_replies,
                "active_personas": active_personas_count,
                "ollama_status": ollama_status,
                "most_used_platform": most_used_platform,
                "most_used_persona": most_used_persona,
                "most_generated_style": most_generated_style,
                "avg_response_length": avg_response_length,
                "avg_generation_time_ms": avg_generation_time_ms
            },
            "charts": {
                "daily_usage": daily_usage,
                "weekly_usage": weekly_usage,
                "platform_usage": platform_usage,
                "comment_types": comment_types,
                "persona_performance": persona_performance
            }
        }

analytics_service = AnalyticsService()
