# Database Design Analysis

## 1. Mục tiêu thiết kế

Database được thiết kế theo các tiêu chí:

- Đáp ứng đầy đủ yêu cầu của đề bài:
    - Lead Scoring
    - AI Copilot
    - Dashboard
    - Next Best Action

- Đơn giản để hoàn thành trong thời gian Hackathon.
- Dễ mở rộng khi tích hợp với CRM thực tế.
- Tối ưu cho Machine Learning và Large Language Model (LLM).
- Phân tách rõ dữ liệu giao dịch và dữ liệu tri thức.

---

# 2. Kiến trúc dữ liệu

Hệ thống sử dụng **hai loại database**.

```text
                         Sales Support AI

                           Frontend
                               │
                          NestJS Backend
                               │
          ┌────────────────────┼────────────────────┐
          │                                         │
          ▼                                         ▼
    PostgreSQL                                 AI Service
 (Business Database)                               │
          │                                        │
          └────────────────────┬───────────────────┘
                               ▼
                           Qdrant
                     (Knowledge Base)
```

## PostgreSQL

Lưu trữ dữ liệu nghiệp vụ (Transactional Data):

- Customer
- Customer Product
- Customer Interaction
- Lead
- Lead Score
- Product Recommendation
- Next Best Action
- Sales Task
- AI Generated Content

## Qdrant

Lưu trữ tri thức phục vụ RAG:

- Product Catalog
- FAQ
- Banking Policy
- Promotions
- Competitor Information
- Sales Guideline
- (Mở rộng) Meeting Notes / Internal Documents

---

# 3. Thiết kế Database

## 3.1 Customer

Lưu thông tin hồ sơ khách hàng.

| Field          | Description           |
| -------------- | --------------------- |
| id             | UUID                  |
| full_name      | Họ tên                |
| email          | Email                 |
| phone          | Số điện thoại         |
| age            | Tuổi                  |
| gender         | Giới tính             |
| occupation     | Nghề nghiệp           |
| income         | Thu nhập              |
| city           | Khu vực               |
| salary_account | Có nhận lương qua SHB |
| created_at     | Ngày tạo              |

### Vai trò

Nguồn dữ liệu chính cho:

- Lead Scoring
- Customer Profile
- AI Personalization

---

## 3.2 CustomerProduct

Danh sách sản phẩm khách hàng đang sở hữu.

| Field        | Description                  |
| ------------ | ---------------------------- |
| id           | UUID                         |
| customer_id  | FK Customer                  |
| product_type | Loan, Saving, Credit Card... |
| opened_date  | Ngày mở                      |
| status       | Active / Closed              |

### Vai trò

ML sử dụng để đánh giá khả năng Cross-selling.

Ví dụ

```text
Saving = 1

Credit Card = 0

Insurance = 0
```

---

## 3.3 CustomerInteraction

Lưu toàn bộ lịch sử tương tác của khách hàng.

| Field            | Description             |
| ---------------- | ----------------------- |
| id               | UUID                    |
| customer_id      | FK Customer             |
| interaction_type | Email, Website, Call... |
| occurred_at      | Thời gian               |
| metadata         | JSONB                   |

Interaction Type

```text
EMAIL_OPEN

EMAIL_CLICK

CALL

BRANCH_VISIT

WEBSITE_VISIT

APP_LOGIN

LOAN_INQUIRY
```

Ví dụ

```json
{
    "duration": 180,
    "page": "/credit-card"
}
```

### Vai trò

Đây là bảng quan trọng nhất của Lead Scoring.

Từ bảng này sẽ sinh ra các feature như:

- Email Open Count
- Website Visit Count
- Loan Inquiry Count
- Branch Visit Count

---

## 3.4 Lead

Đại diện cho một cơ hội bán hàng.

Một Customer có thể phát sinh nhiều Lead ở các thời điểm khác nhau.

| Field              | Description       |
| ------------------ | ----------------- |
| id                 | UUID              |
| customer_id        | FK Customer       |
| interested_product | Sản phẩm quan tâm |
| status             | Pipeline Status   |
| created_at         | Thời gian tạo     |

Pipeline

```text
NEW

QUALIFIED

CONTACTED

PROPOSAL

NEGOTIATION

WON

LOST
```

### Vai trò

Dashboard Funnel sẽ được xây dựng từ bảng này.

---

## 3.5 LeadScore

Lưu kết quả dự đoán từ ML.

| Field                  | Description       |
| ---------------------- | ----------------- |
| id                     | UUID              |
| lead_id                | FK Lead           |
| score                  | 0-100             |
| conversion_probability | 0-1               |
| top_features           | JSONB             |
| predicted_at           | Thời gian dự đoán |

Ví dụ

```json
{
    "score": 91,
    "probability": 0.87,
    "top_features": ["Income", "Website Visit", "Loan Inquiry"]
}
```

### Vai trò

- Hiển thị trên Dashboard.
- AI Copilot giải thích lý do Lead Score.
- Theo dõi lịch sử dự đoán của nhiều phiên bản model.

---

## 3.6 ProductRecommendation

Đề xuất sản phẩm phù hợp.

| Field        | Description  |
| ------------ | ------------ |
| id           | UUID         |
| lead_id      | FK Lead      |
| product_name | Tên sản phẩm |
| confidence   | Độ tin cậy   |
| reason       | Giải thích   |
| generated_at | Thời gian    |

Ví dụ

```text
Visa Platinum

Confidence: 92%

Reason:
Income >30M
No existing credit card
```

Có thể sinh bằng:

- Rule Engine
- ML Model

---

## 3.7 Recommendation

Lưu Next Best Action.

| Field        | Description                   |
| ------------ | ----------------------------- |
| id           | UUID                          |
| lead_id      | FK Lead                       |
| action       | CALL / EMAIL / MEETING / WAIT |
| priority     | HIGH / MEDIUM / LOW           |
| reason       | Giải thích                    |
| generated_at | Thời gian                     |

Ví dụ

```text
Action

CALL

Reason

Customer visited Loan page 3 times.
```

---

## 3.8 GeneratedContent

Lưu toàn bộ nội dung do AI sinh ra.

| Field      | Description                 |
| ---------- | --------------------------- |
| id         | UUID                        |
| lead_id    | FK Lead                     |
| type       | EMAIL / PITCH / CALL_SCRIPT |
| prompt     | Prompt                      |
| content    | Nội dung                    |
| model      | Gemini/OpenAI               |
| created_at | Thời gian                   |

### Vai trò

Cho phép:

- Xem lịch sử.
- Chỉnh sửa trước khi gửi.
- Demo AI Copilot.

---

## 3.9 SalesTask

Theo dõi công việc của nhân viên.

| Field        | Description            |
| ------------ | ---------------------- |
| id           | UUID                   |
| lead_id      | FK Lead                |
| assigned_to  | Sales User             |
| task_type    | CALL / EMAIL / MEETING |
| status       | TODO / DONE / FAILED   |
| due_date     | Hạn xử lý              |
| completed_at | Hoàn thành             |

Ví dụ

```text
Call Customer A

Due: 14:00 Today
```

---

# 4. Knowledge Base (Qdrant)

Qdrant chỉ lưu tri thức phục vụ AI, không lưu dữ liệu giao dịch.

## Collection: Product Catalog

Thông tin chi tiết về sản phẩm.

Ví dụ

```json
{
    "title": "SHB Visa Platinum",
    "content": "...",
    "category": "Credit Card"
}
```

---

## Collection: FAQ

Các câu hỏi thường gặp.

Ví dụ

```json
{
    "question": "Điều kiện mở thẻ",
    "answer": "..."
}
```

---

## Collection: Banking Policy

Quy định nội bộ.

Ví dụ

- Điều kiện cấp tín dụng.
- Điều kiện mở thẻ.
- Chính sách lãi suất.

---

## Collection: Promotion

Các chương trình khuyến mãi.

Ví dụ

- Summer Campaign
- Cashback Program

---

## Collection: Competitor Information

Thông tin sản phẩm ngân hàng khác.

Ví dụ

- VPBank Diamond
- Techcombank Visa Infinite

AI có thể sử dụng để hỗ trợ sales khi khách hàng yêu cầu so sánh.

---

## Collection: Sales Guideline

Quy trình bán hàng.

Ví dụ

```text
Khách hàng quan tâm Home Loan

↓

Ưu tiên hỏi:

- Thu nhập

- Giá trị tài sản

- Mục đích vay
```

Giúp AI Copilot tư vấn theo đúng quy trình nghiệp vụ.

---

# 5. Luồng dữ liệu

## Lead Scoring

```text
Customer
        │
CustomerProduct
        │
CustomerInteraction
        │
        ▼
Feature Engineering
        │
        ▼
LightGBM
        │
        ▼
LeadScore
        │
        ▼
Save PostgreSQL
```

---

## AI Copilot

```text
Customer
        │
LeadScore
        │
Recommendation
        │
Product Recommendation
        │
Retrieve Knowledge
        │
        ▼
Qdrant
        │
        ▼
LLM
        │
        ▼
Generated Email / Pitch / Call Script
```

---

## Dashboard

```text
Lead
        │
LeadScore
        │
SalesTask
        │
        ▼
Dashboard

• Sales Funnel
• Hot Leads
• Conversion Rate
• Revenue Forecast
```

---

# 6. ERD tổng thể

```text
                    Customer
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
CustomerProduct   CustomerInteraction   Lead
                                           │
                  ┌────────────────────────┼────────────────────────┐
                  ▼                        ▼                        ▼
             LeadScore         ProductRecommendation      Recommendation
                                                              │
                                   ┌──────────────────────────┼────────────────────┐
                                   ▼                          ▼                    ▼
                             SalesTask               GeneratedContent         (Future)
```

---

# 7. Mở rộng trong tương lai – AI Sales Assistant

Nếu có thêm **AI Chatbot** hỗ trợ nhân viên bán hàng, database có thể mở rộng mà **không cần thay đổi các bảng hiện tại**.

Chỉ cần bổ sung các bảng sau:

## Conversation

Quản lý mỗi phiên hội thoại.

```text
Conversation

id

sales_id

title

created_at
```

---

## Message

Lưu lịch sử chat.

```text
Message

id

conversation_id

role

content

created_at
```

---

## DailySummary

AI tự động tổng hợp công việc cuối ngày.

```text
DailySummary

id

sales_id

date

summary
```

Ví dụ:

- Đã gọi 8 khách hàng.
- Chốt thành công 2 Lead.
- Còn 3 Lead cần follow-up.

---

## SalesMemory

Lưu ghi chú dài hạn của nhân viên bán hàng.

```text
SalesMemory

id

sales_id

lead_id

type

content
```

Ví dụ

```text
Khách A chỉ nghe điện sau 17h.

Khách B thích liên hệ qua Zalo.
```

AI Assistant sẽ sử dụng các ghi chú này để đưa ra gợi ý cá nhân hóa.

---

## Meeting Notes (Qdrant)

Có thể embedding:

- Meeting Notes
- Call Notes
- Customer Notes

Ví dụ:

Sales hỏi:

> "Khách hàng A hôm trước trao đổi gì?"

AI sẽ:

```text
Question

↓

Semantic Search (Qdrant)

↓

Meeting Note

↓

LLM

↓

Answer
```

---

# 8. Kết luận

Thiết kế này phân tách dữ liệu thành hai nhóm rõ ràng:

- **PostgreSQL** chịu trách nhiệm lưu trữ dữ liệu nghiệp vụ và giao dịch, phục vụ CRM, Dashboard và Machine Learning.
- **Qdrant** đóng vai trò Knowledge Base cho AI Copilot, giúp LLM truy xuất đúng tài liệu trước khi sinh nội dung hoặc trả lời câu hỏi.

Kiến trúc hiện tại chỉ gồm **9 bảng cốt lõi**, đủ đáp ứng toàn bộ yêu cầu của đề bài và có thể hoàn thiện trong phạm vi một hackathon. Đồng thời, hệ thống vẫn có khả năng mở rộng dễ dàng để bổ sung **AI Sales Assistant**, chatbot hỗ trợ công việc hằng ngày của nhân viên bán hàng mà không cần thay đổi mô hình dữ liệu hiện có.
