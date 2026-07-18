class QdrantService:
    def __init__(self):
        pass

    def search(
        self,
        collection: str,
        query_vector: list[float],
        top_k: int = 5,
        filter: dict | None = None
    ) -> list[dict]:
        # TODO: Implement searching in Qdrant
        return []
