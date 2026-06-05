from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.ollama import OllamaStatusResponse, OllamaPullRequest, OllamaDeleteRequest, OllamaDefaultRequest
from app.services.ollama_service import ollama_service
from app.routers.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/ollama", tags=["ollama"])

@router.get("/status", response_model=OllamaStatusResponse)
def get_ollama_status(current_user: User = Depends(get_current_active_user)):
    is_available = ollama_service.is_available()
    default_model = ollama_service.get_default_model()
    models = ollama_service.list_models()
    
    return OllamaStatusResponse(
        available=is_available,
        default_model=default_model,
        models=models
    )

@router.post("/pull")
def pull_model(
    req: OllamaPullRequest,
    current_user: User = Depends(get_current_active_user)
):
    # Only allow active users to pull models (takes resources)
    success = ollama_service.pull_model(req.model_name)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to pull model '{req.model_name}'. Check internet connectivity or the model name."
        )
    return {"message": f"Successfully pulled model '{req.model_name}'."}

@router.delete("/delete")
def delete_model(
    req: OllamaDeleteRequest,
    current_user: User = Depends(get_current_active_user)
):
    success = ollama_service.delete_model(req.model_name)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete model '{req.model_name}'."
        )
    return {"message": f"Successfully deleted model '{req.model_name}'."}

@router.post("/default")
def set_default_model(
    req: OllamaDefaultRequest,
    current_user: User = Depends(get_current_active_user)
):
    # Set default model
    ollama_service.set_default_model(req.model_name)
    return {"message": f"Default model set to '{req.model_name}'."}

from app.config import settings

@router.get("/groq-key")
def get_groq_key(current_user: User = Depends(get_current_active_user)):
    key = settings.GROQ_API_KEY
    if not key or "replace_me" in key:
        return {"configured": False, "key": ""}
    # Return last 4 chars for masking in UI
    last_four = key[-4:] if len(key) > 4 else ""
    return {"configured": True, "key": last_four}
