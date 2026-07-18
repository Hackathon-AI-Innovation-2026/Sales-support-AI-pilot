# 04 — AI Service (FastAPI + LangChain + Gemini)

## Mục tiêu
Xây dựng service AI lớn nhất: xử lý RAG (Retrieval-Augmented Generation), sinh email, sales pitch, call script, chatbot và giải thích lead score bằng ngôn ngữ tự nhiên.

---

## Stack
- **Framework**: FastAPI
- **LLM**: Google Gemini 1.5 Flash (primary) / OpenAI GPT-4o (fallback)
- **RAG Framework**: LangChain / LlamaIndex
- **Vector DB**: Qdrant
- **Embedding**: `text-embedding-004` (Google) / `text-embedding-3-small` (OpenAI)
- **Port**: 8002

---

## Cấu trúc thư mục

```
ai-service/
├── app/
│   ├── main.py
│   ├── routers/
│   │   ├── chat.py
│   │   ├── email.py
│   │   ├── pitch.py
│   │   ├── action.py
│   │   └── explain.py
│   ├── services/
│   │   ├── llm_service.py         ← LLM provider (Gemini/OpenAI)
│   │   ├── rag_service.py         ← Qdrant retrieval
│   │   ├── embedding_service.py   ← Text → Vector
│   │   ├── prompt_service.py      ← Build prompts
│   │   ├── chat_service.py        ← Chat với context
│   │   ├── email_service.py
│   │   ├── pitch_service.py
│   │   └── action_service.py
│   ├── schemas/
│   │   ├── chat.py
│   │   ├── email.py
│   │   ├── pitch.py
│   │   └── common.py
│   ├── knowledge/
│   │   ├── ingest.py              ← Script nhập knowledge vào Qdrant
│   │   └── data/
│   │       ├── products.json
│   │       ├── faq.json
│   │       ├── policy.json
│   │       ├── promotions.json
│   │       └── sales_guideline.md
│   └── config.py
├── requirements.txt
└── Dockerfile
```

---

## Tasks

### TASK-AI-01 — Project Setup

- [ ] Khởi tạo FastAPI project
- [ ] `requirements.txt`:
  ```
  fastapi
  uvicorn
  langchain
  langchain-google-genai
  langchain-openai
  langchain-qdrant
  qdrant-client
  google-generativeai
  openai
  python-dotenv
  pydantic
  ```
- [ ] `config.py`: load GEMINI_API_KEY, OPENAI_API_KEY, QDRANT_URL
- [ ] Health check endpoint

---

### TASK-AI-02 — LLM Provider

**Spec**: Abstraction layer cho phép switch giữa Gemini và OpenAI.

```python
# services/llm_service.py
class LLMService:
    def __init__(self, provider: str = "gemini"):
        if provider == "gemini":
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                temperature=0.7,
            )
        else:
            self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

    async def generate(self, prompt: str) -> str:
        response = await self.llm.ainvoke(prompt)
        return response.content
```

- [ ] Implement `LLMService` với Gemini làm default
- [ ] Config qua env var `LLM_PROVIDER=gemini`
- [ ] Retry logic: retry 2 lần nếu gặp rate limit (exponential backoff)
- [ ] Timeout: 30 giây

---

### TASK-AI-03 — Embedding Service

```python
# services/embedding_service.py
class EmbeddingService:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004"
        )

    async def embed_text(self, text: str) -> List[float]:
        return await self.embeddings.aembed_query(text)

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return await self.embeddings.aembed_documents(texts)
```

---

### TASK-AI-04 — Qdrant Setup & Knowledge Ingestion

**Spec**: Tạo các collections và nạp tài liệu sản phẩm, FAQ vào Qdrant.

#### Collections

| Collection | Mô tả | Số documents |
|---|---|---|
| `product_catalog` | Thông tin chi tiết sản phẩm SHB | ~20 docs |
| `faq` | Câu hỏi thường gặp | ~50 docs |
| `banking_policy` | Chính sách tín dụng, điều kiện | ~30 docs |
| `promotions` | Chương trình khuyến mãi hiện tại | ~10 docs |
| `sales_guideline` | Quy trình bán hàng | ~15 docs |

#### Cấu trúc document

```json
{
  "id": "uuid",
  "content": "Thẻ SHB Visa Platinum dành cho...",
  "metadata": {
    "title": "SHB Visa Platinum",
    "category": "Credit Card",
    "source": "product_catalog"
  }
}
```

#### Ingest Script

```python
# knowledge/ingest.py
async def ingest_products():
    # 1. Load products.json
    # 2. Split thành chunks (500 tokens/chunk, overlap 50)
    # 3. Embed từng chunk
    # 4. Upsert vào Qdrant collection "product_catalog"

async def ingest_all():
    await ingest_products()
    await ingest_faq()
    await ingest_policy()
    await ingest_promotions()
    await ingest_sales_guideline()
```

- [ ] Tạo file `products.json` với ít nhất 10 sản phẩm SHB (thẻ, vay, tiết kiệm)
- [ ] Tạo file `faq.json` với ít nhất 30 câu hỏi
- [ ] Tạo `policy.json` với các điều kiện cấp tín dụng
- [ ] Script `ingest.py` chạy khi startup (nếu collection empty)

---

### TASK-AI-05 — RAG Service

```python
# services/rag_service.py
class RAGService:
    def __init__(self, qdrant_client, embedding_service):
        self.client = qdrant_client
        self.embedder = embedding_service

    async def retrieve(
        self,
        query: str,
        collections: List[str],
        top_k: int = 5
    ) -> List[Document]:
        query_vector = await self.embedder.embed_text(query)
        results = []
        for collection in collections:
            hits = self.client.search(
                collection_name=collection,
                query_vector=query_vector,
                limit=top_k,
                score_threshold=0.7,
            )
            results.extend(hits)
        # Sort by score, deduplicate
        return sorted(results, key=lambda x: x.score, reverse=True)[:top_k]
```

- [ ] Multi-collection search
- [ ] Score threshold: 0.7 (bỏ kết quả không liên quan)
- [ ] Deduplication theo content similarity

---

### TASK-AI-06 — Prompt Service

**Spec**: Build prompts chuẩn cho từng usecase.

```python
# services/prompt_service.py

SYSTEM_PROMPT_SALES_COPILOT = """
Bạn là AI Copilot hỗ trợ nhân viên bán hàng ngân hàng SHB.
Bạn có kiến thức về sản phẩm, chính sách và quy trình bán hàng của SHB.
Trả lời bằng tiếng Việt, ngắn gọn và thực tế.
"""

EMAIL_PROMPT_TEMPLATE = """
Viết email chuyên nghiệp bằng tiếng Việt để tư vấn sản phẩm cho khách hàng.

Thông tin khách hàng:
- Tên: {customer_name}
- Nghề nghiệp: {occupation}
- Thu nhập: {income}

Lead Score: {score}/100 (Xác suất chuyển đổi: {probability}%)

Sản phẩm đề xuất: {product_name}
Lý do: {reason}

Thông tin sản phẩm từ catalog:
{retrieved_context}

Yêu cầu:
- Tiêu đề email hấp dẫn
- Cá nhân hóa theo profile khách hàng
- Nêu rõ lợi ích sản phẩm phù hợp với nhu cầu
- CTA rõ ràng
- Không quá 300 từ
"""

PITCH_PROMPT_TEMPLATE = """..."""
CHAT_SYSTEM_PROMPT = """..."""
EXPLAIN_SCORE_PROMPT = """..."""
```

- [ ] Implement `PromptService` với các template trên
- [ ] Hỗ trợ `format()` để inject context

---

### TASK-AI-07 — Email Generation

#### Request Schema
```python
class GenerateEmailRequest(BaseModel):
    customer: CustomerContext     # name, age, income, occupation, city
    lead_score: LeadScoreContext  # score, probability, top_features
    recommendation: RecommendationContext  # product_name, confidence, reason
    language: str = "vi"          # "vi" | "en"
```

#### Flow
```
1. Build search query từ product_name + customer occupation
2. Retrieve context từ Qdrant (product_catalog + promotions)
3. Build email prompt với customer info + retrieved context
4. Call LLM
5. Return generated email
```

- [ ] `EmailService.generate(request) → str`
- [ ] Endpoint `POST /generate-email`
- [ ] Language support: tiếng Việt (default)

---

### TASK-AI-08 — Sales Pitch Generation

Tương tự Email nhưng format khác: ngắn hơn, focus vào key selling points cho cuộc gọi.

```python
# Format pitch:
# [Mở đầu] - Giới thiệu bản thân
# [Vấn đề] - Nhu cầu của khách
# [Giải pháp] - Sản phẩm SHB
# [Lợi ích] - 3 điểm nổi bật
# [CTA] - Đề xuất hành động tiếp theo
```

- [ ] `PitchService.generate(request) → str`
- [ ] Endpoint `POST /generate-pitch`
- [ ] Output: structured sections (JSON với các phần riêng biệt)

---

### TASK-AI-09 — Call Script Generation

```python
class GenerateCallScriptRequest(BaseModel):
    customer: CustomerContext
    lead_score: LeadScoreContext
    recommendation: RecommendationContext
    objections: List[str] = []  # Các câu hỏi/phản đối dự đoán
```

- [ ] Endpoint `POST /generate-call-script`
- [ ] Bao gồm phần xử lý objection (từ FAQ)

---

### TASK-AI-10 — Chat Service (AI Copilot)

**Spec**: Chatbot hỗ trợ nhân viên hỏi về sản phẩm, khách hàng, chính sách.

```python
class ChatRequest(BaseModel):
    conversation_id: Optional[str]
    message: str
    customer_context: Optional[CustomerContext]  # Context khách hàng đang xem

class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    sources: List[str]  # Tài liệu tham chiếu
```

#### Flow
```
1. Load conversation history (in-memory dict, keyed by conversation_id)
2. Retrieve context từ Qdrant (tất cả collections)
3. Build messages: [system, *history, user_message]
4. Call LLM với retrieved context
5. Append to history
6. Return answer + sources
```

- [ ] `ChatService` với in-memory conversation store (dict)
- [ ] Conversation history: giữ tối đa 10 turns
- [ ] Endpoint `POST /chat`
- [ ] Return `sources` (title của documents được dùng)

> **Note**: In-memory store phù hợp cho hackathon. Nếu mở rộng → lưu vào PostgreSQL.

---

### TASK-AI-11 — Explain Lead Score

**Spec**: Giải thích tại sao lead có score cao/thấp bằng ngôn ngữ tự nhiên.

```python
class ExplainScoreRequest(BaseModel):
    customer: CustomerContext
    lead_score: LeadScoreContext  # bao gồm top_features

class ExplainScoreResponse(BaseModel):
    explanation: str  # Giải thích ngắn gọn (~3 câu)
```

```
EXPLAIN_PROMPT = """
Khách hàng {name} có Lead Score {score}/100.
Các yếu tố ảnh hưởng chính: {top_features}.
Hãy giải thích ngắn gọn (2-3 câu) tại sao score này cao/thấp
và nhân viên nên làm gì tiếp theo.
Trả lời bằng tiếng Việt.
"""
```

- [ ] Endpoint `POST /explain-score`
- [ ] Không cần RAG (chỉ dùng LLM với prompt đơn giản)

---

### TASK-AI-12 — Next Best Action with LLM

**Spec**: Rule Engine quyết định action, LLM sinh lý do và nội dung.

```python
class NextBestActionRequest(BaseModel):
    customer: CustomerContext
    lead_score: LeadScoreContext
    recommendation: RecommendationContext
    action: str  # "CALL" | "EMAIL" | "MEETING" | "WAIT" (từ Rule Engine)

class NextBestActionResponse(BaseModel):
    action: str
    priority: str
    reason: str        # LLM giải thích lý do
    suggestion: str    # LLM gợi ý nội dung cụ thể (điều gì cần nói, hỏi gì)
```

- [ ] Endpoint `POST /next-best-action`
- [ ] LLM chỉ sinh `reason` và `suggestion`, không quyết định `action`

---

### TASK-AI-13 — Knowledge Data Files

Tạo sample data cho Qdrant ingestion:

- [ ] `products.json`: 10 sản phẩm SHB
  - SHB Visa Platinum (Credit Card)
  - SHB Home Loan
  - SHB Car Loan
  - SHB Personal Loan
  - SHB Savings Account (các loại)
  - SHB Term Deposit
  - SHB Business Loan
  - SHB Insurance (liên kết)
  - SHB Investment Fund
  - SHB Payroll Service

- [ ] `faq.json`: 30+ câu hỏi thường gặp
  - Điều kiện mở thẻ tín dụng?
  - Lãi suất vay mua nhà?
  - Thủ tục vay tiêu dùng?
  - ...

- [ ] `policy.json`: Chính sách
  - Điều kiện cấp tín dụng
  - Hạn mức tín dụng theo thu nhập
  - Thời hạn cho vay

- [ ] `promotions.json`: Khuyến mãi mẫu
  - Hoàn tiền 5% thẻ Platinum tháng 7
  - Lãi suất ưu đãi vay mua nhà

- [ ] `sales_guideline.md`: Quy trình tư vấn 3-5 trang
