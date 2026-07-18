from pydantic import BaseModel

class Document(BaseModel):
    content: str      # Format-friendly string representation of the payload
    source: str       # Name of the Qdrant collection
    payload: dict     # Raw dictionary payload
    score: float      # Similarity score
