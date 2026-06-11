import requests
import logging
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self, ollama_url: Optional[str] = None):
        self.ollama_url = ollama_url or settings.OLLAMA_URL
        self._default_model = settings.DEFAULT_OLLAMA_MODEL
        self._cached_available = None
        self._last_checked = 0

    def get_default_model(self) -> str:
        return self._default_model

    def set_default_model(self, model_name: str) -> None:
        self._default_model = model_name

    def is_available(self) -> bool:
        """Check if Ollama service is running (cached for 10 seconds to optimize latency and logs)"""
        import time
        now = time.time()
        if self._cached_available is not None and (now - self._last_checked) < 10:
            return self._cached_available
            
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=2)
            self._cached_available = response.status_code == 200
        except Exception:
            self._cached_available = False
            
        self._last_checked = now
        return self._cached_available

    def check_model_availability(self, model_name: str) -> bool:
        """Check if a specific model is available locally"""
        if not self.is_available():
            return False
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=2)
            if response.status_code == 200:
                models = response.json().get("models", [])
                return any(model.get("name") == model_name or model.get("name") == f"{model_name}:latest" for model in models)
            return False
        except Exception:
            return False

    def list_models(self) -> List[Dict[str, Any]]:
        """List local models with metadata"""
        if not self.is_available():
            return []
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=2)
            if response.status_code == 200:
                raw_models = response.json().get("models", [])
                models = []
                for model in raw_models:
                    details = model.get("details", {})
                    # Format last_updated to string
                    last_updated = model.get("modified_at", "")
                    if isinstance(last_updated, str) and last_updated:
                        # Extract date
                        last_updated = last_updated.split(".")[0].replace("T", " ")
                    
                    models.append({
                        "name": model.get("name"),
                        "size": model.get("size", 0),
                        "parameters": details.get("parameter_size", "unknown"),
                        "last_updated": last_updated
                    })
                return models
            return []
        except Exception as e:
            logger.error(f"Error listing Ollama models: {e}")
            return []

    def pull_model(self, model_name: str) -> bool:
        """Pull a model from the Ollama library"""
        if not self.is_available():
            logger.error("Ollama server is unavailable. Cannot pull model.")
            return False
        try:
            logger.info(f"Pulling model: {model_name}")
            response = requests.post(
                f"{self.ollama_url}/api/pull",
                json={"name": model_name, "stream": False},
                timeout=600  # Pulling can take a while
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Error pulling model {model_name}: {e}")
            return False

    def delete_model(self, model_name: str) -> bool:
        """Delete a local model"""
        if not self.is_available():
            logger.error("Ollama server is unavailable. Cannot delete model.")
            return False
        try:
            logger.info(f"Deleting model: {model_name}")
            response = requests.delete(
                f"{self.ollama_url}/api/delete",
                json={"name": model_name},
                timeout=10
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Error deleting model {model_name}: {e}")
            return False

# Global Singleton
ollama_service = OllamaService()
