from app.rag.embedding import EmbeddingService
from app.rag.qdrant_client import QdrantService
from app.schemas.rag import Document
from app.config import settings

class RAGRetriever:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.qdrant_service = QdrantService()

    def _format_payload(self, collection: str, payload: dict) -> str:
        parts = []
        if collection == "product_catalog":
            title = payload.get("title", "")
            content = payload.get("content", "")
            tags = payload.get("tags", "")
            if title: parts.append(f"Sản phẩm: {title}")
            if content: parts.append(f"Chi tiết: {content}")
            if tags: parts.append(f"Tags: {tags}")
        elif collection == "faq":
            question = payload.get("question", "")
            answer = payload.get("answer", "")
            tags = payload.get("tags", "")
            if question: parts.append(f"Hỏi: {question}")
            if answer: parts.append(f"Đáp: {answer}")
            if tags: parts.append(f"Tags: {tags}")
        elif collection == "banking_policy":
            title = payload.get("title", "")
            content = payload.get("content", "")
            tags = payload.get("tags", "")
            if title: parts.append(f"Chính sách: {title}")
            if content: parts.append(f"Chi tiết: {content}")
            if tags: parts.append(f"Tags: {tags}")
        elif collection == "promotions":
            title = payload.get("title", "")
            content = payload.get("content", "")
            target = payload.get("target_segment", "")
            tags = payload.get("tags", "")
            if title: parts.append(f"Chương trình khuyến mãi: {title}")
            if content: parts.append(f"Nội dung: {content}")
            if target: parts.append(f"Đối tượng áp dụng: {target}")
            if tags: parts.append(f"Tags: {tags}")
        elif collection == "competitor_info":
            product = payload.get("product_name", "")
            content = payload.get("content", "")
            advantage = payload.get("shb_advantage", "")
            tags = payload.get("tags", "")
            if product: parts.append(f"Sản phẩm đối thủ: {product}")
            if content: parts.append(f"Mô tả: {content}")
            if advantage: parts.append(f"Ưu thế của SHB: {advantage}")
            if tags: parts.append(f"Tags: {tags}")
        elif collection == "sales_guideline":
            title = payload.get("title", "")
            scenario = payload.get("scenario", "")
            steps = payload.get("guideline_steps", "")
            tips = payload.get("tips", "")
            tags = payload.get("tags", "")
            if title: parts.append(f"Hướng dẫn bán hàng: {title}")
            if scenario: parts.append(f"Tình huống: {scenario}")
            if steps: parts.append(f"Các bước thực hiện: {steps}")
            if tips: parts.append(f"Lời khuyên: {tips}")
            if tags: parts.append(f"Tags: {tags}")
        else:
            for k, v in payload.items():
                parts.append(f"{k}: {v}")
        
        return "\n".join(parts)

    def _retrieve_collection(self, collection: str, query: str, top_k: int) -> list[Document]:
        try:
            # Embed the query
            query_vector = self.embedding_service.embed(query)
            
            # Search Qdrant
            results = self.qdrant_service.search(collection, query_vector, top_k=top_k)
            
            documents = []
            for item in results:
                content = self._format_payload(collection, item["payload"])
                formatted_content = f"[Source: {collection}]\n{content}"
                documents.append(Document(
                    content=formatted_content,
                    source=collection,
                    payload=item["payload"],
                    score=item["score"]
                ))
            return documents
        except Exception as e:
            # Return empty list if collection not found or connection fails to ensure robustness
            print(f"Error retrieving from collection '{collection}': {e}")
            return []

    def retrieve_for_email(self, product_name: str, top_k: int = None) -> list[Document]:
        k = top_k or settings.DEFAULT_TOP_K
        # Search product_catalog + promotions
        docs = []
        docs.extend(self._retrieve_collection("product_catalog", product_name, k))
        docs.extend(self._retrieve_collection("promotions", product_name, k))
        # Sort combined results by score descending
        docs.sort(key=lambda d: d.score, reverse=True)
        return docs

    def retrieve_for_pitch(self, product_name: str, top_k: int = None) -> list[Document]:
        k = top_k or settings.DEFAULT_TOP_K
        # Search product_catalog + sales_guideline + faq
        docs = []
        docs.extend(self._retrieve_collection("product_catalog", product_name, k))
        docs.extend(self._retrieve_collection("sales_guideline", product_name, k))
        docs.extend(self._retrieve_collection("faq", product_name, k))
        docs.sort(key=lambda d: d.score, reverse=True)
        return docs

    def retrieve_for_chat(self, query: str, top_k: int = None) -> list[Document]:
        k = top_k or settings.DEFAULT_TOP_K
        collections = ["product_catalog", "faq", "banking_policy", "promotions", "competitor_info", "sales_guideline"]
        docs = []
        for col in collections:
            docs.extend(self._retrieve_collection(col, query, k))
        # Merge and sort all by score
        docs.sort(key=lambda d: d.score, reverse=True)
        return docs

    def retrieve_for_nba(self, context: str, top_k: int = None) -> list[Document]:
        k = top_k or settings.DEFAULT_TOP_K
        # Search sales_guideline
        return self._retrieve_collection("sales_guideline", context, k)
