from qdrant_client import QdrantClient
from app.config import settings

class QdrantService:
    def __init__(self):
        self.client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY
        )

    def search(
        self,
        collection: str,
        query_vector: list[float],
        top_k: int = 5,
        filter_query: any = None
    ) -> list[dict]:
        """
        Search for similar vectors in Qdrant DB.
        """
        results = self.client.search(
            collection_name=collection,
            query_vector=query_vector,
            limit=top_k,
            query_filter=filter_query
        )
        
        return [
            {
                "id": item.id,
                "score": item.score,
                "payload": item.payload or {}
            }
            for item in results
        ]
