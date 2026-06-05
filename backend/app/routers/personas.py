from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.persona import PersonaCreate, PersonaUpdate, PersonaOut
from app.services.persona_service import persona_service
from app.routers.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/personas", tags=["personas"])

@router.get("", response_model=List[PersonaOut])
def list_personas(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return persona_service.get_user_personas(db, current_user.id)

@router.get("/{persona_id}", response_model=PersonaOut)
def get_persona(
    persona_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    persona = persona_service.get_persona(db, persona_id, current_user.id)
    if not persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Persona not found"
        )
    return persona

@router.post("", response_model=PersonaOut, status_code=status.HTTP_201_CREATED)
def create_persona(
    persona_in: PersonaCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return persona_service.create_persona(db, persona_in, current_user.id)

@router.put("/{persona_id}", response_model=PersonaOut)
def update_persona(
    persona_id: int,
    persona_in: PersonaUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    persona = persona_service.update_persona(db, persona_id, persona_in, current_user.id)
    if not persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Persona not found or permission denied"
        )
    return persona

@router.delete("/{persona_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_persona(
    persona_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    success = persona_service.delete_persona(db, persona_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Persona not found or permission denied"
        )
    return None
