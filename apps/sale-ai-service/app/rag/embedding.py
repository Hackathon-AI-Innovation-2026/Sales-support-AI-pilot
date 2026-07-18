import os
from app.config import settings

class EmbeddingService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        if self.provider == "gemini":
            from google import genai
            if not settings.GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY is not set. Please configure it in .env")
            
            self.client = genai.Client(
                api_key=settings.GEMINI_API_KEY,
                http_options={"api_version": "v1"}
            )
            # Clean up the model name (remove "models/" prefix if present)
            self.model = settings.EMBEDDING_MODEL
            if self.model.startswith("models/"):
                self.model = self.model.replace("models/", "")
                
        elif self.provider == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY is not set. Please configure it in .env")
            self.model = settings.EMBEDDING_MODEL
        else:
            raise ValueError(f"Unsupported LLM provider: {settings.LLM_PROVIDER}")

    def embed(self, text: str) -> list[float]:
        if not text:
            return [0.0] * settings.EMBEDDING_DIMENSION

        if self.provider == "gemini":
            from google.genai import types
            
            # Map default or empty models to text-embedding-004
            model_name = self.model
            if not model_name:
                model_name = "text-embedding-004"
                
            response = self.client.models.embed_content(
                model=model_name,
                contents=text,
                config=types.EmbedContentConfig(
                    task_type="RETRIEVAL_QUERY",
                ),
            )
            
            if response.embeddings:
                return response.embeddings[0].values
            elif hasattr(response, 'embedding') and response.embedding:
                return response.embedding.values
            else:
                raise ValueError("No embeddings returned from Gemini API")
                
        elif self.provider == "openai":
            import httpx
            headers = {
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            url = "https://api.openai.com/v1/embeddings"
            payload = {
                "input": text,
                "model": self.model
            }
            # For OpenAI text-embedding-3 models, we can specify dimensions
            if "text-embedding-3" in self.model:
                payload["dimensions"] = settings.EMBEDDING_DIMENSION
                
            response = httpx.post(url, json=payload, headers=headers, timeout=15.0)
            response.raise_for_status()
            data = response.json()
            return data["data"][0]["embedding"]
