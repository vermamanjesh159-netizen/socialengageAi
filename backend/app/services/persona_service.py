from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.persona import Persona
from app.schemas.persona import PersonaCreate, PersonaUpdate

class PersonaService:
    def get_persona(self, db: Session, persona_id: int, user_id: int) -> Optional[Persona]:
        return db.query(Persona).filter(Persona.id == persona_id, Persona.user_id == user_id).first()

    def get_user_personas(self, db: Session, user_id: int) -> List[Persona]:
        return db.query(Persona).filter(Persona.user_id == user_id).all()

    def create_persona(self, db: Session, persona_in: PersonaCreate, user_id: int) -> Persona:
        persona = Persona(
            user_id=user_id,
            name=persona_in.name,
            interests=persona_in.interests,
            traits=persona_in.traits
        )
        db.add(persona)
        db.commit()
        db.refresh(persona)
        return persona

    def update_persona(self, db: Session, persona_id: int, persona_in: PersonaUpdate, user_id: int) -> Optional[Persona]:
        persona = self.get_persona(db, persona_id, user_id)
        if not persona:
            return None
        
        update_data = persona_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(persona, field, value)
            
        db.commit()
        db.refresh(persona)
        return persona

    def delete_persona(self, db: Session, persona_id: int, user_id: int) -> bool:
        persona = self.get_persona(db, persona_id, user_id)
        if not persona:
            return False
        db.delete(persona)
        db.commit()
        return True

    def build_personality_prompt(self, persona: Optional[Persona]) -> str:
        """Build comprehensive personality context from persona fields"""
        if not persona:
            return ""

        prompt_parts = []
        
        if persona.interests:
            prompt_parts.append(f"Interests: {', '.join(persona.interests)}")
            
        if persona.traits:
            prompt_parts.append(f"Traits: {', '.join(persona.traits)}")
            
        if prompt_parts:
            personality_context = f"The comment author is a '{persona.name}' with the following qualities:\n"
            personality_context += ". ".join(prompt_parts) + ".\n"
            personality_context += "Weave these interests and traits naturally into the generated text to make it sound highly authentic and personalized."
            return personality_context
            
        return ""

persona_service = PersonaService()
