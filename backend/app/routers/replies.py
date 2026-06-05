from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.comment import ReplyGenerateRequest, CommentResponse
from app.services.comment_service import comment_service
from app.routers.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/replies", tags=["replies"])

@router.post("", response_model=CommentResponse)
def generate_reply(
    req: ReplyGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        reply = comment_service.generate_reply(
            db=db,
            user=current_user,
            platform=req.platform,
            original_comment=req.original_comment,
            reply_style=req.reply_style,
            persona_id=req.persona_id,
            temperature=req.temperature,
            comment_length=req.comment_length
        )
        return reply
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
