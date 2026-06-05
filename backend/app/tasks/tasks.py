import logging
from typing import Optional
from app.tasks.celery_app import celery
from app.database import SessionLocal
from app.models.user import User
from app.services.comment_service import comment_service
from app.services.ollama_service import ollama_service

logger = logging.getLogger(__name__)

@celery.task(name="app.tasks.pull_model_async")
def pull_model_async(model_name: str):
    """Asynchronously pulls an Ollama model from the public library"""
    logger.info(f"Asynchronous task started: Pulling model {model_name}")
    success = ollama_service.pull_model(model_name)
    if success:
        logger.info(f"Asynchronous task completed: Model {model_name} pulled successfully.")
        return True
    else:
        logger.error(f"Asynchronous task failed: Model {model_name} could not be pulled.")
        return False

@celery.task(name="app.tasks.bulk_generate_task")
def bulk_generate_task(
    user_id: int,
    platform: str,
    content_text: str,
    comment_style: str,
    persona_id: Optional[int],
    generate_count: int,
    comment_length: str
):
    """Executes bulk generations in the background to avoid timeouts on large batches"""
    logger.info(f"Asynchronous task started: Bulk generation of {generate_count} comments for User {user_id}")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"User {user_id} not found.")
            return False
            
        for i in range(generate_count):
            temp = 0.6 + (i * 0.05) % 0.5
            var_prompt = f"{content_text} (Variation #{i+1})"
            
            comment_service.generate_comment(
                db=db,
                user=user,
                platform=platform,
                content_text=var_prompt,
                comment_style=comment_style,
                persona_id=persona_id,
                temperature=temp,
                comment_length=comment_length
            )
            
        logger.info(f"Asynchronous task completed: Generated {generate_count} comments successfully.")
        return True
    except Exception as e:
        logger.error(f"Error during async bulk generation: {e}")
        return False
    finally:
        db.close()
