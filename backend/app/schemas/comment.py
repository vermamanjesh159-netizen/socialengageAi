from typing import List, Optional
from pydantic import BaseModel, Field

class CommentGenerateRequest(BaseModel):
    platform: str = Field(..., description="Target platform (e.g. LinkedIn, Twitter/X, YouTube, etc.)")
    content_text: str = Field(..., min_length=1, description="Content text of the post to reply to")
    content_url: Optional[str] = Field(None, description="Optional URL of the post")
    comment_style: str = Field("Friendly", description="Tone style of the comment")
    persona_id: Optional[int] = Field(None, description="Optional ID of the persona to use")
    temperature: float = Field(0.8, ge=0.0, le=2.0)
    generate_count: int = Field(1, ge=1, le=100)
    comment_length: str = Field("medium", description="Length control: short, medium, long")
    comment_type: str = Field("comment", description="Generation type: comment, caption, bio, hashtags")

class CommentResponse(BaseModel):
    id: Optional[int] = None
    text: str
    platform: str
    style: str
    comment_type: str = "comment"
    humanization_score: int
    spam_detected: bool
    duplicate_detected: bool
    quality_rating: int
    generation_time_ms: int

class BulkCommentGenerateRequest(BaseModel):
    platform: str
    content_text: str
    comment_style: str = "Friendly"
    persona_id: Optional[int] = None
    generate_count: int = Field(10, ge=1, le=100)
    comment_length: str = "medium"
    comment_type: str = "comment"

class BulkCommentResponse(BaseModel):
    comments: List[CommentResponse]

class ReplyGenerateRequest(BaseModel):
    platform: str = Field(..., description="Target platform")
    original_comment: str = Field(..., min_length=1, description="The comment to reply to")
    reply_style: str = Field("friendly", description="Reply tone style")
    persona_id: Optional[int] = None
    temperature: float = 0.7
    comment_length: str = "short"
