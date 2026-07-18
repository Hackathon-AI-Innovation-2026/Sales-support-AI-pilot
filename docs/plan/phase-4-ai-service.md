# Phase 4 — AI Service (FastAPI + LangChain + Gemini)

> **Mục tiêu:** Xây dựng RAG pipeline hoàn chỉnh — Email/Pitch generator, Next Best Action, Chat assistant — sử dụng Qdrant knowledge base và Gemini LLM.

---

## Tổng quan

| Thông tin | Chi tiết |
|-----------|----------|
| Thứ tự | Phase 4 (song song với Phase 3) |
| Độ phức tạp | 🔴 Cao |
| Phụ thuộc | Phase 1 (Qdrant ready với knowledge base) |
| Unblock | Phase 2 TASK-BE-05/BE-06, Phase 6 |
| Service | `apps/sale-ai-service` — FastAPI + LangChain + Gemini |

**Nguyên tắc thiết kế:**
- AI Service **không** truy cập PostgreSQL — nhận toàn bộ context từ NestJS
- Mỗi request đều qua **RAG pipeline**: Retrieve → Build Prompt → LLM → Response
- **Rule Engine** quyết định action, **LLM** chỉ giải thích và sinh nội dung

---

## TASK-AI-01: Project Setup

**Mô tả:** Khởi tạo cấu trúc FastAPI service với các dependencies cần thiết.

**Cấu trúc thư mục:**
```
apps/sale-ai-service/
├── app/
│   ├── main.py              — FastAPI entry point
│   ├── config.py            — Settings (API keys, Qdrant URL, ...)
│   ├── rag/
│   │   ├── embedding.py     — EmbeddingService (Gemini/OpenAI)
│   │   ├── qdrant_client.py — QdrantService (search, retrieve)
│   │   └── retriever.py     — RAGRetriever (orchestrate embed + search)
│   ├── prompt/
│   │   ├── builder.py       — PromptBuilder
│   │   └── templates.py     — Prompt templates (email, pitch, chat, nba)
│   ├── llm/
│   │   └── provider.py      — LLMProvider (Gemini / OpenAI adapter)
│   ├── routes/
│   │   ├── email.py         — /generate-email
│   │   ├── pitch.py         — /generate-pitch
│   │   ├── chat.py          — /chat
│   │   └── nba.py           — /next-best-action
│   └── schemas/
│       └── *.py             — Pydantic models
├── seed/                    ✅ (đã có)
│   ├── *.csv
│   └── import_to_qdrant.py
├── requirements.txt
├── Dockerfile
└── .env
```

**Checklist:**
- [ ] Khởi tạo cấu trúc thư mục
- [ ] `requirements.txt`:
  ```
  fastapi
  uvicorn
  langchain
  langchain-google-genai
  langchain-openai
  qdrant-client
  google-generativeai
  python-dotenv
  pydantic-settings
  httpx
  ```
- [ ] `main.py` — FastAPI app với CORS, lifespan
- [ ] `config.py` — load từ `.env`: `GEMINI_API_KEY`, `QDRANT_URL`, `OPENAI_API_KEY`
- [ ] `GET /health` endpoint
- [ ] `Dockerfile`

---

## TASK-AI-02: RAG Service

**Mô tả:** Lớp core — nhận câu query, embed, search Qdrant, trả về documents liên quan.

### EmbeddingService (`app/rag/embedding.py`)
```python
class EmbeddingService:
    def embed(self, text: str) -> list[float]:
        # Dùng Gemini text-embedding-004
        # hoặc OpenAI text-embedding-3-small
        ...
```

### QdrantService (`app/rag/qdrant_client.py`)
```python
class QdrantService:
    def search(
        self,
        collection: str,
        query_vector: list[float],
        top_k: int = 5,
        filter: dict | None = None
    ) -> list[Document]:
        ...
```

**Collections và khi nào dùng:**
| Collection | Dùng cho |
|-----------|---------|
| `product_catalog` | Email, Pitch, NBA, Chat |
| `faq` | Chat, Pitch |
| `banking_policy` | Chat |
| `promotions` | Email, Pitch |
| `competitor_info` | Chat (khi hỏi so sánh) |
| `sales_guideline` | Pitch, NBA |

### RAGRetriever (`app/rag/retriever.py`)
```python
class RAGRetriever:
    def retrieve_for_email(self, product_name: str) -> list[Document]:
        # Search product_catalog + promotions
        
    def retrieve_for_pitch(self, product_name: str) -> list[Document]:
        # Search product_catalog + sales_guideline + faq
        
    def retrieve_for_chat(self, query: str) -> list[Document]:
        # Search tất cả collections, merge và re-rank
        
    def retrieve_for_nba(self, context: str) -> list[Document]:
        # Search sales_guideline
```

**Checklist:**
- [ ] `EmbeddingService` với Gemini `text-embedding-004`
- [ ] `QdrantService` — connect, search với cosine similarity
- [ ] `RAGRetriever` — 4 specialized retrieval functions
- [ ] Format documents thành text block: `[Source: product_catalog]\n{content}`
- [ ] Top-K = 5 per collection, configurable

---

## TASK-AI-03: Prompt Builder

**Mô tả:** Xây dựng prompt có cấu trúc — inject customer context + RAG documents vào template.

### Templates (`app/prompt/templates.py`)

**Email Template:**
```
Bạn là chuyên gia tư vấn ngân hàng SHB. Hãy viết một email marketing cá nhân hóa bằng tiếng Việt.

THÔNG TIN KHÁCH HÀNG:
- Tên: {customer_name}
- Tuổi: {age}, Thu nhập: {income:,} VND/tháng
- Thành phố: {city}
- Sản phẩm quan tâm: {product_name}

ĐIỂM LEAD: {lead_score}/100 (Xác suất chuyển đổi: {probability:.0%})
LÝ DO TIỀM NĂNG: {top_features}

THÔNG TIN SẢN PHẨM VÀ KHUYẾN MÃI:
{retrieved_context}

YÊU CẦU:
- Tiêu đề hấp dẫn
- Nội dung thân thiện, chuyên nghiệp
- Nhấn mạnh lợi ích phù hợp với profile khách hàng
- Có call-to-action rõ ràng
- Độ dài: 150-250 từ

Trả về JSON:
{
  "subject": "...",
  "body": "..."
}
```

**Pitch Template:**
```
Bạn là sales expert SHB. Tạo sales pitch ngắn gọn cho cuộc gọi tư vấn.

KHÁCH HÀNG: {customer_name} | Score: {lead_score}/100
SẢN PHẨM ĐỀ XUẤT: {product_name} ({confidence:.0%} phù hợp)
LÝ DO: {product_reason}

THÔNG TIN TỪ KNOWLEDGE BASE:
{retrieved_context}

Tạo pitch 3-5 câu: mở đầu, giới thiệu sản phẩm, lợi ích chính, call-to-action.
```

**Chat Template:**
```
Bạn là AI Copilot hỗ trợ nhân viên bán hàng SHB.
Trả lời ngắn gọn, chính xác, thực tế.

CONTEXT KHÁCH HÀNG (nếu có):
{customer_context}

TÀI LIỆU THAM KHẢO:
{retrieved_context}

LỊCH SỬ HỘI THOẠI:
{conversation_history}

CÂU HỎI: {message}

Trả lời bằng tiếng Việt. Nếu không chắc, nói rõ.
```

**Next Best Action Template:**
```
Phân tích lead và đề xuất hành động tiếp theo.

LEAD SCORE: {lead_score}/100 (Probability: {probability:.0%})
TƯƠNG TÁC GẦN ĐÂY: {recent_interactions}
SẢN PHẨM QUAN TÂM: {interested_product}

QUY TRÌNH BÁN HÀNG:
{retrieved_context}

Hành động đã được xác định: {action} ({priority})
Hãy giải thích lý do và đề xuất nội dung cụ thể cho hành động này.

Trả về JSON:
{
  "action": "{action}",
  "priority": "{priority}",
  "reason": "...",
  "suggestedContent": "..."
}
```

**Checklist:**
- [ ] `templates.py` — 4 templates trên
- [ ] `builder.py` — `PromptBuilder.build_email_prompt()`, `build_pitch_prompt()`, `build_chat_prompt()`, `build_nba_prompt()`
- [ ] Xử lý context quá dài: truncate retrieved documents
- [ ] Sanitize customer data trước khi inject vào prompt

---

## TASK-AI-04: LLM Provider

**Mô tả:** Adapter để switch giữa Gemini và OpenAI.

```python
class LLMProvider:
    def generate(self, prompt: str, max_tokens: int = 1000) -> str:
        # Gọi Gemini hoặc OpenAI tùy config
        
    async def stream(self, prompt: str) -> AsyncIterator[str]:
        # Streaming cho chat
```

**Checklist:**
- [ ] `llm/provider.py` hỗ trợ `GEMINI` và `OPENAI` provider
- [ ] Config: `LLM_PROVIDER=gemini` trong `.env`
- [ ] Gemini model: `gemini-1.5-flash` (fast) hoặc `gemini-1.5-pro` (quality)
- [ ] Parse JSON response từ LLM (với retry nếu JSON invalid)
- [ ] Error handling: rate limit, timeout, invalid response

---

## TASK-AI-05: Email Generator Endpoint

**Endpoint:** `POST /generate-email`

**Request:**
```json
{
  "customerName": "Nguyễn Văn A",
  "age": 35,
  "income": 30000000,
  "city": "Hà Nội",
  "leadScore": 87,
  "conversionProbability": 0.87,
  "recommendedProduct": "SHB Visa Platinum",
  "productReason": "Thu nhập cao, chưa có thẻ tín dụng",
  "topFeatures": ["loan_inquiry_count", "website_visit_count"]
}
```

**Response:**
```json
{
  "subject": "Ưu đãi đặc biệt dành riêng cho anh Nguyễn Văn A",
  "body": "...",
  "retrievedSources": ["product_catalog", "promotions"]
}
```

**Checklist:**
- [ ] Route `/generate-email` với Pydantic schema
- [ ] Gọi `RAGRetriever.retrieve_for_email(product_name)`
- [ ] Gọi `PromptBuilder.build_email_prompt(...)`
- [ ] Gọi `LLMProvider.generate(prompt)`
- [ ] Parse JSON từ LLM response
- [ ] Response time target: < 5 seconds

---

## TASK-AI-06: Next Best Action Endpoint

**Endpoint:** `POST /next-best-action`

**Rule Engine (Python):**
```python
def determine_action(lead_score: int, probability: float, interactions: dict) -> tuple[str, str]:
    if lead_score >= 80:
        return "CALL", "HIGH"
    elif lead_score >= 60 and interactions.get("loan_inquiry_count", 0) >= 2:
        return "EMAIL", "HIGH"
    elif lead_score >= 60:
        return "EMAIL", "MEDIUM"
    elif lead_score >= 40:
        return "MEETING", "MEDIUM"
    else:
        return "WAIT", "LOW"
```

**Checklist:**
- [ ] Rule Engine function `determine_action()`
- [ ] Route `/next-best-action` với schema
- [ ] RAG: retrieve sales_guideline
- [ ] Prompt Builder inject action vào template
- [ ] LLM giải thích + đề xuất `suggestedContent`
- [ ] Return: `{ action, priority, reason, suggestedContent }`

---

## TASK-AI-07: Chat Endpoint (Streaming)

**Endpoint:** `POST /chat`

**Request:**
```json
{
  "message": "Nên tư vấn sản phẩm gì cho khách có thu nhập 25 triệu?",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "customerContext": {
    "name": "Nguyễn Văn A",
    "leadScore": 87,
    "recommendedProduct": "SHB Visa Platinum"
  }
}
```

**Response (streaming SSE):**
```
data: {"token": "Với"}
data: {"token": " thu nhập"}
data: {"token": " 25 triệu..."}
data: [DONE]
```

**Checklist:**
- [ ] Route `/chat` với `StreamingResponse`
- [ ] RAG retrieve từ tất cả collections
- [ ] `LLMProvider.stream()` với async generator
- [ ] Server-Sent Events format
- [ ] Non-streaming fallback: `POST /chat/sync`
- [ ] History truncation: giữ tối đa 10 turns gần nhất

---

## Kết quả mong đợi sau Phase 4

```
✅ AI Service chạy trên port 8002
✅ POST /generate-email trả về email tiếng Việt chất lượng tốt
✅ POST /generate-pitch trả về pitch ngắn gọn
✅ POST /next-best-action trả về action + reason đúng logic
✅ POST /chat stream response đúng SSE format
✅ RAG retrieve đúng documents từ Qdrant
✅ Docker image build thành công
```
