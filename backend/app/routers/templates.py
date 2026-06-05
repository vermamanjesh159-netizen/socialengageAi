from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.template import TemplateCreate, TemplateUpdate, TemplateOut
from app.services.template_service import template_service
from app.routers.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/templates", tags=["templates"])

@router.get("", response_model=List[TemplateOut])
def list_templates(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return template_service.get_user_templates(db, current_user.id)

@router.get("/{template_id}", response_model=TemplateOut)
def get_template(
    template_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    template = template_service.get_template(db, template_id, current_user.id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return template

@router.post("", response_model=TemplateOut, status_code=status.HTTP_201_CREATED)
def create_template(
    template_in: TemplateCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return template_service.create_template(db, template_in, current_user.id)

@router.put("/{template_id}", response_model=TemplateOut)
def update_template(
    template_id: int,
    template_in: TemplateUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    template = template_service.update_template(db, template_id, template_in, current_user.id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found or permission denied"
        )
    return template

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    success = template_service.delete_template(db, template_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found or permission denied"
        )
    return None
