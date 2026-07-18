# Kiến trúc tổng thể

```text
                          ┌─────────────────────────┐
                          │        Next.js          │
                          │       Frontend          │
                          └────────────┬────────────┘
                                       │
                                 REST/WebSocket
                                       │
                          ┌────────────▼────────────┐
                          │         NestJS          │
                          │     Backend API         │
                          └───────┬────────┬────────┘
                                  │        │
                    HTTP          │        │ HTTP
                                  │        │
                    ┌─────────────▼───┐   ┌▼────────────────┐
                    │   ML Service    │   │   AI Service    │
                    │     FastAPI     │   │    FastAPI      │
                    └────────┬────────┘   └────────┬────────┘
                             │                     │
                             │                     │
                      PostgreSQL              Qdrant
                             │                     │
                             └─────────┬───────────┘
                                       │
                                 Product Docs
                                 FAQ / Policy
```

---

# Thành phần hệ thống

# 1. Frontend (Next.js)

Vai trò:

- Dashboard
- Danh sách Lead
- Chi tiết khách hàng
- AI Copilot
- Sales Task
- Funnel
- Revenue Forecast

Không chứa business logic.

---

# 2. Backend API (NestJS)

Đây là trung tâm điều phối.

Không chạy ML.

Không chạy LLM.

Nó chỉ:

- Authentication
- Authorization
- CRUD
- Dashboard
- Điều phối ML Service
- Điều phối AI Service

### Module đề xuất

```text
src

auth/

customer/

lead/

interaction/

recommendation/

dashboard/

task/

ai/

ml/

common/
```

---

## Auth Module

- Login
- JWT
- Role

---

## Customer Module

- CRUD Customer
- Customer Profile
- Customer Product

---

## Interaction Module

Quản lý

- Email Open
- Website Visit
- Loan Inquiry
- Call

---

## Lead Module

- CRUD Lead
- Pipeline
- Lead Status

---

## ML Module

Không train model.

Chỉ gọi

```
POST /predict
```

ML Service.

---

## AI Module

Không sinh email.

Chỉ gọi

```
POST /generate-email

POST /generate-pitch

POST /chat

POST /next-best-action
```

---

## Recommendation Module

Lưu

- Product Recommendation
- Next Best Action

---

## Dashboard Module

Aggregate dữ liệu

- Funnel

- Hot Leads

- Conversion

- Revenue

---

## Task Module

Quản lý

- Call

- Email

- Meeting

---

# 3. ML Service (FastAPI)

Đây là service độc lập.

Không truy cập trực tiếp PostgreSQL.

NestJS gửi Feature Vector.

Ví dụ

```json
{
    "income": 30000000,
    "websiteVisit": 5,
    "emailOpen": 2,
    "saving": 1
}
```

↓

LightGBM

↓

```json
{
    "score": 92,
    "probability": 0.89,
    "topFeatures": []
}
```

---

## Module

```
app/

predict/

feature/

model/
```

---

### API

```
POST /predict
```

```
POST /batch-predict
```

```
GET /model-info
```

---

# 4. AI Service (FastAPI)

Đây là service lớn nhất.

Nó gồm

```text
Chat

Email Generator

Pitch Generator

RAG

Prompt Builder
```

---

### API

```
POST /chat

POST /generate-email

POST /generate-pitch

POST /next-best-action
```

---

### Bên trong

```text
Request

↓

Retrieve Context

↓

Qdrant

↓

Prompt Builder

↓

Gemini/OpenAI

↓

Response
```

---

# Service nội bộ AI

Có thể chia thành

```text
ChatService

↓

RAGService

↓

EmbeddingService

↓

LLMProvider

↓

PromptService
```

---

# Qdrant

Collection

```text
product_catalog

faq

policy

promotion

competitor

sales_guideline
```

---

# PostgreSQL

Business Data

```text
Customer

Lead

Interaction

Recommendation

LeadScore

SalesTask
```

---

# Luồng Lead Scoring

```text
Customer

↓

Interaction

↓

NestJS

↓

Feature Engineering

↓

ML Service

↓

Lead Score

↓

PostgreSQL

↓

Frontend
```

---

# Luồng AI Email

```text
Frontend

↓

NestJS

↓

Customer

+

Lead Score

+

Recommendation

↓

AI Service

↓

Retrieve

↓

Qdrant

↓

LLM

↓

Email

↓

NestJS

↓

Frontend
```

---

# Luồng Chatbot

```text
Sales

↓

Chat

↓

NestJS

↓

AI Service

↓

Retrieve

↓

Qdrant

+

Conversation

↓

LLM

↓

Answer
```

---

# Nếu mở rộng AI Assistant

Thêm service

```
Scheduler
```

Nhiệm vụ

```
08:00

↓

Today's Summary

↓

AI

↓

Notification
```

và

```
18:00

↓

Daily Summary

↓

LLM

↓

Save Database
```

---

# Kiến trúc service cuối cùng

| Service                                       | Công nghệ                                      | Trách nhiệm                                                                          |
| --------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Web**                                       | Next.js                                        | Dashboard, Lead, AI Copilot, Sales Task                                              |
| **API Gateway / Backend**                     | NestJS                                         | Xác thực, CRUD, điều phối nghiệp vụ, tổng hợp dữ liệu dashboard, gọi ML & AI Service |
| **ML Service**                                | FastAPI + LightGBM                             | Feature engineering, Lead Scoring, Conversion Probability                            |
| **AI Service**                                | FastAPI + LangChain/LlamaIndex + Gemini/OpenAI | RAG, Email Generation, Sales Pitch, Next Best Action, Chat                           |
| **PostgreSQL**                                | Database                                       | Customer, Lead, Interaction, Recommendation, Task, AI Generated Content              |
| **Qdrant**                                    | Vector Database                                | Product Catalog, FAQ, Policy, Promotion, Competitor, Sales Guideline                 |
| **Object Storage (MinIO/S3)** _(khuyến nghị)_ | MinIO hoặc S3                                  | Lưu PDF catalog, tài liệu chính sách, tài liệu đào tạo trước khi indexing vào Qdrant |
