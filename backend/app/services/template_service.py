from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.template import Template
from app.schemas.template import TemplateCreate, TemplateUpdate

class TemplateService:
    def get_template(self, db: Session, template_id: int, user_id: int) -> Optional[Template]:
        return db.query(Template).filter(Template.id == template_id, Template.user_id == user_id).first()

    def get_user_templates(self, db: Session, user_id: int) -> List[Template]:
        templates = db.query(Template).filter(Template.user_id == user_id).all()
        # Seed default templates if empty
        if not templates:
            self.seed_default_templates(db, user_id)
            templates = db.query(Template).filter(Template.user_id == user_id).all()
        return templates

    def create_template(self, db: Session, template_in: TemplateCreate, user_id: int) -> Template:
        template = Template(
            user_id=user_id,
            name=template_in.name,
            description=template_in.description,
            platform=template_in.platform,
            style=template_in.style,
            content=template_in.content
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        return template

    def update_template(self, db: Session, template_id: int, template_in: TemplateUpdate, user_id: int) -> Optional[Template]:
        template = self.get_template(db, template_id, user_id)
        if not template:
            return None
        
        update_data = template_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(template, field, value)
            
        db.commit()
        db.refresh(template)
        return template

    def delete_template(self, db: Session, template_id: int, user_id: int) -> bool:
        template = self.get_template(db, template_id, user_id)
        if not template:
            return False
        db.delete(template)
        db.commit()
        return True

    def seed_default_templates(self, db: Session, user_id: int) -> None:
        """Seed default high-quality templates for a user"""
        defaults = [
            {
                "name": "LinkedIn Growth",
                "description": "Professional thought leadership builder template",
                "platform": "LinkedIn",
                "style": "Professional",
                "content": "This is a great point. In my experience, scaling operations requires a balance between technology adoption and alignment across the team. Thanks for sharing this perspective!"
            },
            {
                "name": "Startup Founder",
                "description": "Founder-oriented inquiry/thought template",
                "platform": "LinkedIn",
                "style": "Expert",
                "content": "Spot on. As a founder, solving this exact bottleneck was one of our biggest hurdles in the early days. How did you structure the transition?"
            },
            {
                "name": "Tech Influencer",
                "description": "Engaging feedback on latest technologies",
                "platform": "Twitter/X",
                "style": "Expert",
                "content": "This is exactly where the industry is heading. Lightweight and efficient tools are beating bloated suites every day now. Exciting times ahead!"
            },
            {
                "name": "Marketer",
                "description": "Engaging marketing feedback",
                "platform": "Facebook",
                "style": "Friendly",
                "content": "Love the creativity behind this campaign! Testing different channels is key, but the emotional hook here is what really sells it. Great job!"
            },
            {
                "name": "Sales Professional",
                "description": "Relationship building and consultative feedback",
                "platform": "LinkedIn",
                "style": "Supportive",
                "content": "Very valuable insight. Focus on solving real customer pain points first, rather than pitching the features, is what separates high-performers from the rest."
            },
            {
                "name": "Developer",
                "description": "Technical problem solver template",
                "platform": "Reddit",
                "style": "Technical",
                "content": "Interesting approach. Have you compared the performance of this setup against standard connection pooling under high loads? Typically, resource contention can become a bottleneck here."
            },
            {
                "name": "Fitness Coach",
                "description": "High energy motivational response",
                "platform": "Instagram",
                "style": "Motivational",
                "content": "Consistency beats intensity every single time! Love to see this dedication. Keep pushing forward and staying focused on the daily habits!"
            },
            {
                "name": "Investor",
                "description": "Macro-level business evaluation",
                "platform": "Quora",
                "style": "Expert",
                "content": "From an investment thesis standpoint, the addressable market size is secondary to unit economics and distribution advantages in this sector. Compelling insight."
            }
        ]
        
        for item in defaults:
            template = Template(
                user_id=user_id,
                name=item["name"],
                description=item["description"],
                platform=item["platform"],
                style=item["style"],
                content=item["content"]
            )
            db.add(template)
        db.commit()

template_service = TemplateService()
