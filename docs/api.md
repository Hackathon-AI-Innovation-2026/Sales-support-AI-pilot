Đối với hackathon, mình sẽ thiết kế API theo hướng **Backend for Frontend (BFF)**. Nghĩa là **Frontend chỉ gọi NestJS**, còn NestJS sẽ điều phối ML Service và AI Service. Frontend **không gọi trực tiếp FastAPI**.

Kiến trúc API:

```text
Next.js
   │
   │ HTTPS REST
   ▼
NestJS API
   ├── PostgreSQL
   ├── ML Service (HTTP)
   └── AI Service (HTTP)
```

---

# 1. Giao thức

| Thành phần                    | Giao thức        |
| ----------------------------- | ---------------- |
| Web → API                     | HTTPS REST       |
| API → ML Service              | HTTP REST (JSON) |
| API → AI Service              | HTTP REST (JSON) |
| AI Service → Qdrant           | Qdrant Client    |
| ML Service                    | LightGBM/Pickle  |
| AI Service → LLM              | SDK/API          |
| Dashboard realtime (optional) | WebSocket        |

REST là đủ cho hackathon. Chỉ dùng WebSocket nếu muốn dashboard cập nhật realtime hoặc chatbot streaming.

---

# 2. Authentication API

```
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/profile
```

Response

```json
{
    "accessToken": "...",
    "user": {
        "id": "...",
        "name": "Nguyen Van A"
    }
}
```

---

# 3. Customer API

## Danh sách khách hàng

```
GET /customers
```

Query

```
?page=1
&limit=20
&search=Nguyen
```

---

## Chi tiết khách hàng

```
GET /customers/:customerId
```

Response

```json
{
    "customer": {},
    "products": [],
    "interactions": [],
    "lead": {}
}
```

---

## Tạo khách hàng

```
POST /customers
```

---

## Cập nhật

```
PATCH /customers/:customerId
```

---

# 4. Customer Interaction API

```
GET  /customers/:id/interactions

POST /customers/:id/interactions
```

Ví dụ

```json
{
    "type": "WEBSITE_VISIT",
    "metadata": {
        "page": "loan"
    }
}
```

---

# 5. Lead API

## Danh sách Lead

```
GET /leads
```

Filter

```
status

priority

score

product
```

---

## Chi tiết Lead

```
GET /leads/:leadId
```

---

## Update Pipeline

```
PATCH /leads/:leadId/status
```

Ví dụ

```json
{
    "status": "NEGOTIATION"
}
```

---

# 6. Lead Scoring API

NestJS gọi ML Service.

Frontend chỉ gọi NestJS.

## Trigger Predict

```
POST /leads/:leadId/score
```

NestJS

↓

ML Service

↓

Save PostgreSQL

↓

Return

```json
{
    "score": 91,
    "probability": 0.88
}
```

---

## Xem lịch sử

```
GET /leads/:leadId/score
```

---

# 7. Product Recommendation

```
GET /leads/:leadId/recommendation/product
```

Response

```json
{
    "product": "Visa Platinum",
    "confidence": 0.91,
    "reason": "High income"
}
```

---

# 8. Next Best Action

```
GET /leads/:leadId/recommendation/action
```

Response

```json
{
    "action": "CALL",
    "priority": "HIGH",
    "reason": "Customer visited Loan page."
}
```

---

# 9. AI Copilot

## Generate Email

```
POST /ai/email
```

Body

```json
{
    "leadId": "..."
}
```

Response

```json
{
    "content": "..."
}
```

---

## Generate Pitch

```
POST /ai/pitch
```

---

## Generate Call Script

```
POST /ai/call-script
```

---

## Chat

```
POST /ai/chat
```

```json
{
    "conversationId": "...",
    "message": "Khách này nên tư vấn gì?"
}
```

---

## Explain Lead Score

```
POST /ai/explain-score
```

Response

```json
{
    "explanation": "Lead score cao vì..."
}
```

Đây là endpoint rất đáng làm vì giúp giải thích kết quả ML bằng ngôn ngữ tự nhiên.

---

# 10. Dashboard API

```
GET /dashboard
```

Response

```json
{
    "funnel": {},
    "hotLeads": [],
    "forecast": {},
    "conversionRate": {}
}
```

---

## Hot Leads

```
GET /dashboard/hot-leads
```

---

## Sales Funnel

```
GET /dashboard/funnel
```

---

## Revenue Forecast

```
GET /dashboard/revenue-forecast
```

---

# 11. Sales Task

```
GET /tasks

GET /tasks/today

POST /tasks

PATCH /tasks/:id

DELETE /tasks/:id
```

---

# 12. Generated Content

```
GET /generated-contents

GET /generated-contents/:id
```

---

# 13. AI Service Internal API

Frontend **không bao giờ gọi**.

NestJS gọi.

---

## Generate Email

```
POST /generate-email
```

Request

```json
{
    "customer": {},
    "leadScore": 91,
    "recommendation": {}
}
```

---

## Chat

```
POST /chat
```

---

## Generate Pitch

```
POST /generate-pitch
```

---

## Generate Next Best Action

```
POST /next-best-action
```

---

## Explain Score

```
POST /explain-score
```

---

# 14. ML Service Internal API

## Predict

```
POST /predict
```

Request

```json
{
    "age": 30,
    "income": 35000000,
    "websiteVisit": 7,
    "emailOpen": 4
}
```

Response

```json
{
    "score": 91,
    "probability": 0.88,
    "topFeatures": []
}
```

---

## Batch Predict

```
POST /batch-predict
```

Dashboard có thể dùng endpoint này để chấm điểm nhiều Lead cùng lúc.

---

## Model Info

```
GET /model-info
```

---

# 15. Nếu mở rộng Chatbot

## Conversation

```
GET /conversations

POST /conversations
```

---

## Message

```
GET /conversations/:id/messages

POST /conversations/:id/messages
```

---

## Daily Summary

```
GET /daily-summary/today

POST /daily-summary/generate
```

---

# Kiến trúc API tổng thể

```text
Frontend
│
├── /auth/*
├── /customers/*
├── /leads/*
├── /tasks/*
├── /dashboard/*
└── /ai/*
         │
         ▼
      NestJS
         │
    ┌────┴────┐
    ▼         ▼
ML Service  AI Service
    │         │
 POST /predict
          POST /generate-email
          POST /generate-pitch
          POST /chat
          POST /next-best-action
          POST /explain-score
```

## Một số đề xuất để API "chuẩn" hơn

Thay vì các endpoint như:

- `/leads/:id/score`
- `/leads/:id/recommendation/product`
- `/leads/:id/recommendation/action`

có thể thiết kế một endpoint tổng hợp:

```
GET /leads/:leadId/insights
```

Response:

```json
{
    "leadScore": {
        "score": 91,
        "conversionProbability": 0.88
    },
    "productRecommendation": {
        "product": "SHB Visa Platinum",
        "confidence": 0.91
    },
    "nextBestAction": {
        "action": "CALL",
        "priority": "HIGH"
    }
}
```

Frontend chỉ cần **một request** để hiển thị toàn bộ khu vực "AI Insights" trên màn hình chi tiết Lead. Điều này giảm số lượng request, đơn giản hóa UI và thể hiện rõ vai trò của NestJS như một **Backend for Frontend** điều phối ML và AI Service.
