from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.comment import CommentGenerateRequest, CommentResponse, BulkCommentGenerateRequest, BulkCommentResponse, ReplyGenerateRequest
from app.services.comment_service import comment_service
from app.routers.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/comments", tags=["comments"])

@router.post("/generate", response_model=CommentResponse)
def generate_single_comment(
    req: CommentGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        comment = comment_service.generate_comment(
            db=db,
            user=current_user,
            platform=req.platform,
            content_text=req.content_text,
            comment_style=req.comment_style,
            persona_id=req.persona_id,
            temperature=req.temperature,
            comment_length=req.comment_length,
            content_url=req.content_url,
            comment_type=req.comment_type
        )
        return comment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/generate-bulk", response_model=BulkCommentResponse)
def generate_bulk_comments(
    req: BulkCommentGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check limit for the whole batch
    if not comment_service.check_saas_limit(db, current_user, req.generate_count):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"SaaS Plan Limit Exceeded! Generating {req.generate_count} comments exceeds your remaining monthly quota."
        )
        
    generated_comments = []
    seen_texts = set()
    
    # Generate bulk unique comments
    for i in range(req.generate_count):
        # Slightly alter temperature for variety
        temp = 0.6 + (i * 0.05) % 0.5
        
        try:
            # We add a slight variation hint to ensure they are unique
            var_prompt = f"{req.content_text} (Variation #{i+1})"
            
            comment = comment_service.generate_comment(
                db=db,
                user=current_user,
                platform=req.platform,
                content_text=var_prompt,
                comment_style=req.comment_style,
                persona_id=req.persona_id,
                temperature=temp,
                comment_length=req.comment_length,
                comment_type=req.comment_type
            )
            
            # Simple deduplication check in the current batch
            cleaned = "".join(comment["text"].lower().split())
            if cleaned not in seen_texts:
                seen_texts.add(cleaned)
                generated_comments.append(comment)
            else:
                # Regenerate once with a higher temperature
                comment = comment_service.generate_comment(
                    db=db,
                    user=current_user,
                    platform=req.platform,
                    content_text=req.content_text,
                    comment_style=req.comment_style,
                    persona_id=req.persona_id,
                    temperature=0.95,
                    comment_length=req.comment_length,
                    comment_type=req.comment_type
                )
                generated_comments.append(comment)
        except ValueError as e:
            # Reached a limit during generation
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Limit reached during bulk run: {str(e)}"
            )
            
    return BulkCommentResponse(comments=generated_comments)

@router.post("/reply", response_model=CommentResponse)
def generate_reply_comment(
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
