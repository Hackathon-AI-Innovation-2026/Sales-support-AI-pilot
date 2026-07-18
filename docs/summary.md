# Sales Support AI Copilot

## Business Analysis & System Design

---

# 1. Giới thiệu

## 1.1 Bối cảnh

SHB sở hữu mạng lưới bán hàng rộng lớn với nhiều chi nhánh và đội ngũ tư vấn viên. Tuy nhiên, hiệu quả bán hàng phụ thuộc nhiều vào kinh nghiệm của từng nhân viên, dẫn đến:

- Khó xác định khách hàng tiềm năng.
- Tỷ lệ chuyển đổi chưa tối ưu.
- Chất lượng tư vấn không đồng đều.
- Mất nhiều thời gian chuẩn bị email và nội dung tư vấn.

Nhóm đề xuất hệ thống **Sales Support AI Copilot**, kết hợp Machine Learning và Large Language Model nhằm hỗ trợ toàn bộ quy trình bán hàng.

---

## 1.2 Mục tiêu

Hệ thống hướng tới các mục tiêu sau:

- Đánh giá khả năng chuyển đổi của từng khách hàng.
- Ưu tiên các khách hàng có giá trị cao.
- Đề xuất sản phẩm phù hợp.
- Gợi ý hành động tiếp theo cho nhân viên.
- Sinh email và nội dung tư vấn cá nhân hóa.
- Theo dõi hiệu quả bán hàng thông qua Dashboard.

---

# 2. Phân tích nghiệp vụ

## 2.1 Quy trình hiện tại (As-Is)

```text
Customer List

↓

Sales tự xem hồ sơ

↓

Sales tự đánh giá

↓

Sales tự chọn sản phẩm

↓

Sales tự viết Email

↓

Liên hệ khách hàng

↓

Theo dõi kết quả
```

### Vấn đề

- Phụ thuộc kinh nghiệm.
- Không có tiêu chuẩn đánh giá Lead.
- Tốn thời gian.
- Dễ bỏ lỡ khách hàng tiềm năng.

---

## 2.2 Quy trình đề xuất (To-Be)

```text
Customer

↓

Lead Scoring

↓

Product Recommendation

↓

Next Best Action

↓

AI Copilot

↓

Sales Interaction

↓

CRM Update
```

---

# 3. Phạm vi hệ thống

Hệ thống tập trung hỗ trợ nhân viên kinh doanh trong giai đoạn:

- Phân tích khách hàng.
- Chuẩn bị nội dung bán hàng.
- Theo dõi pipeline.

Không bao gồm:

- Core Banking.
- Giải ngân.
- Ký hợp đồng.
- Thanh toán.

---

# 4. Actor

## Sales

Có thể

- Xem Lead
- Xem Lead Score
- Xem gợi ý sản phẩm
- Sinh Email
- Sinh Pitch
- Chat với AI

---

## Sales Manager

Có thể

- Xem Dashboard
- Theo dõi Funnel
- Theo dõi Conversion
- Theo dõi Revenue Forecast

---

# 5. Functional Requirements

## FR1 Customer Management

- Danh sách khách hàng
- Chi tiết khách hàng
- Lịch sử tương tác

---

## FR2 Lead Scoring

Input

- Customer Profile
- Interaction
- Historical Data

Output

- Lead Score
- Conversion Probability
- Feature Importance

---

## FR3 Product Recommendation

Input

- Customer Profile
- Lead Score

Output

- Recommended Product
- Confidence
- Reason

---

## FR4 Next Best Action

Ví dụ

- Call Today
- Send Email
- Schedule Meeting
- Wait 3 Days

---

## FR5 AI Copilot

Cho phép

- Generate Email
- Generate Sales Pitch
- Generate Call Script
- Chat with AI

Nguồn dữ liệu

- Product Catalog
- FAQ
- Promotion
- Internal Policy

---

## FR6 Dashboard

Hiển thị

- Sales Funnel
- Hot Leads
- Revenue Forecast
- Lead Ranking
- Conversion Rate

---

# 6. Non-functional Requirements

- Response Time < 3 seconds
- API RESTful
- JWT Authentication
- Responsive UI
- Logging
- Docker Deployment

---

# 7. Business Flow

## Lead Analysis

```text
Customer

↓

Load Customer Profile

↓

Predict Lead Score

↓

Recommend Product

↓

Recommend Next Action

↓

Display Result
```

---

## Email Generation

```text
Sales

↓

Open Customer

↓

Generate Email

↓

Retrieve Product Knowledge

↓

LLM

↓

Generated Email
```

---

## Sales Copilot

```text
Sales Question

↓

Retrieve Context

↓

LLM

↓

Answer
```

---

# 8. System Flow

```text
Frontend

↓

NestJS API

↓

Get Customer

↓

ML Service

↓

Lead Score

↓

AI Service

↓

Generate Email

↓

Frontend
```

---

# 9. Machine Learning Flow

```text
Historical Dataset

↓

Feature Engineering

↓

LightGBM

↓

Lead Score

↓

Conversion Probability
```

---

# 10. AI Flow

```text
Customer Profile

+

Lead Score

+

Product Catalog

↓

RAG

↓

LLM

↓

Email

Pitch

Next Best Action
```

---

# 11. Module Design

## Frontend

- Dashboard
- Customer
- Lead
- Copilot

---

## Backend

- Auth
- Customer
- Lead
- Product
- Dashboard

---

## ML Service

- Predict
- Feature Engineering

---

## AI Service

- Chat
- Email
- Pitch
- RAG

---

# 12. Công nghệ

| Layer      | Technology              |
| ---------- | ----------------------- |
| Frontend   | Next.js                 |
| Backend    | NestJS                  |
| ML         | FastAPI + LightGBM      |
| AI         | FastAPI + Gemini/OpenAI |
| Database   | PostgreSQL              |
| Vector DB  | Qdrant                  |
| Deployment | Docker Compose          |

---

## Một số điều chỉnh mình đề xuất để phù hợp với hackathon

Có hai điểm nên thay đổi so với bài toán thực tế để giảm độ phức tạp nhưng vẫn thể hiện đầy đủ năng lực kỹ thuật:

### 1. Product Recommendation dùng Rule Engine

Thay vì xây dựng mô hình Recommendation riêng (cần nhiều dữ liệu), sử dụng tập luật đơn giản dựa trên:

- Độ tuổi.
- Thu nhập.
- Sản phẩm đang sở hữu.
- Nhu cầu thể hiện qua hành vi.

Ví dụ:

- Thu nhập > 30 triệu và chưa có thẻ tín dụng → Đề xuất thẻ Platinum.
- Có giao dịch tìm hiểu khoản vay → Đề xuất vay mua nhà hoặc vay tiêu dùng.

Điều này vừa dễ triển khai, vừa dễ giải thích với ban giám khảo.

### 2. Next Best Action kết hợp Rule + LLM

Không cần huấn luyện thêm một mô hình.

- Rule Engine quyết định hành động (`Call`, `Email`, `Meeting`, `Follow-up`).
- LLM giải thích lý do và sinh nội dung tương ứng.

Ví dụ:

```text
Lead Score: 92
Product: SHB Credit Card Platinum

Next Best Action:
- Call customer within 24 hours.
- Send personalized follow-up email.

Reason:
Customer recently viewed the credit card page twice and has a high monthly income.
```

Thiết kế này đáp ứng đầy đủ yêu cầu đề bài, giảm đáng kể khối lượng triển khai, đồng thời vẫn thể hiện rõ sự kết hợp giữa **Machine Learning**, **Rule Engine**, **RAG** và **LLM** trong một quy trình bán hàng hoàn chỉnh.
