from typing import List, Dict, Any
from fastapi import APIRouter
from app.services.platform_service import platform_service

router = APIRouter(prefix="/platforms", tags=["platforms"])

@router.get("", response_model=List[Dict[str, Any]])
def list_platforms():
    return platform_service.get_supported_platforms()

@router.get("/{platform_name}", response_model=Dict[str, Any])
def get_platform_details(platform_name: str):
    return platform_service.get_platform_details(platform_name)
