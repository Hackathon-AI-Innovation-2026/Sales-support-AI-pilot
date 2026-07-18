# 02 — Backend API (NestJS)

## Mục tiêu

Xây dựng Backend API làm trung tâm điều phối (BFF pattern): xác thực, CRUD nghiệp vụ, gọi ML Service và AI Service.

---

## Stack

- **Framework**: NestJS 10
- **ORM**: Prisma
- **Auth**: JWT (access token + refresh token)
- **Validation**: class-validator, class-transformer
- **HTTP Client**: Axios / NestJS HttpModule
- **Port**: 3001

---

## Cấu trúc thư mục

```
src/
├── auth/
├── users/
├── customers/
├── interactions/
├── leads/
├── ml/
├── ai/
├── recommendations/
├── dashboard/
├── tasks/
├── generated-content/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
└── prisma/
```

---

## Tasks

### TASK-BE-01 — Project Setup

- [ ] Khởi tạo NestJS project: `npx @nestjs/cli new backend`
- [ ] Cài dependencies: `prisma`, `@prisma/client`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`, `@nestjs/axios`
- [ ] Cấu hình `ConfigModule` (load `.env`)
- [ ] Cấu hình global `ValidationPipe`
- [ ] Cấu hình global exception filter (trả về error format chuẩn)
- [ ] Setup `PrismaService` (singleton, onModuleInit connect)
- [ ] Cấu hình CORS cho Frontend (port 3000)

**Error Response Format**:

```json
{
    "statusCode": 400,
    "message": "Validation failed",
    "errors": ["email must be an email"],
    "timestamp": "2026-07-18T10:00:00Z"
}
```

---

### TASK-BE-02 — Auth Module

**Spec**: Đăng nhập JWT, bảo vệ routes, phân quyền theo Role.

#### Endpoints

| Method | Path            | Description                 | Auth |
| ------ | --------------- | --------------------------- | ---- |
| POST   | `/auth/login`   | Đăng nhập, trả về JWT       | ❌   |
| POST   | `/auth/refresh` | Refresh access token        | ❌   |
| POST   | `/auth/logout`  | Logout (invalidate token)   | ✅   |
| GET    | `/auth/profile` | Lấy thông tin user hiện tại | ✅   |

#### DTOs

```typescript
// LoginDto
{
    email: string;
    password: string;
}

// LoginResponse
{
    accessToken: string;
    refreshToken: string;
    user: {
        (id, name, role);
    }
}
```

#### Implementation Tasks

- [ ] `AuthModule`, `AuthService`, `AuthController`
- [ ] `JwtStrategy` (validate JWT, inject user vào request)
- [ ] `RolesGuard` (kiểm tra `UserRole`)
- [ ] `@Roles(UserRole.MANAGER)` decorator
- [ ] `@CurrentUser()` decorator (lấy user từ request)
- [ ] Bcrypt so sánh password
- [ ] Access token: 15 phút, Refresh token: 7 ngày

---

### TASK-BE-03 — Customer Module

**Spec**: CRUD khách hàng, tổng hợp thông tin profile.

#### Endpoints

| Method | Path             | Description                               | Auth    |
| ------ | ---------------- | ----------------------------------------- | ------- |
| GET    | `/customers`     | Danh sách (phân trang, search)            | ✅      |
| GET    | `/customers/:id` | Chi tiết + products + interactions + lead | ✅      |
| POST   | `/customers`     | Tạo khách hàng                            | ✅      |
| PATCH  | `/customers/:id` | Cập nhật                                  | ✅      |
| DELETE | `/customers/:id` | Xóa (soft delete hoặc hard)               | MANAGER |

#### Query Params (GET /customers)

```
?page=1&limit=20&search=Nguyen&city=HCM&minIncome=10000000
```

#### Response (GET /customers/:id)

```json
{
  "customer": { ...fields },
  "products": [...],
  "interactions": [...],
  "lead": { "id": "...", "status": "QUALIFIED", "score": 91 }
}
```

#### Implementation Tasks

- [ ] `CustomerModule`, `CustomerService`, `CustomerController`
- [ ] `CreateCustomerDto`, `UpdateCustomerDto` với validation
- [ ] Prisma query: `findMany` với pagination + search full-text
- [ ] Aggregate customer profile (include products, interactions, latest lead)

---

### TASK-BE-04 — Interaction Module

**Spec**: Ghi nhận hành vi của khách hàng — input cho Lead Scoring.

#### Endpoints

| Method | Path                          | Description            |
| ------ | ----------------------------- | ---------------------- |
| GET    | `/customers/:id/interactions` | Lấy lịch sử tương tác  |
| POST   | `/customers/:id/interactions` | Ghi nhận tương tác mới |

#### DTO

```typescript
// CreateInteractionDto
{
  interactionType: InteractionType; // EMAIL_OPEN | EMAIL_CLICK | CALL | ...
  occurredAt?: Date;
  metadata?: Record<string, any>;
}
```

- [ ] Validate `interactionType` bằng enum
- [ ] Lưu `metadata` dạng JSON

---

### TASK-BE-05 — Lead Module

**Spec**: Quản lý cơ hội bán hàng và pipeline.

#### Endpoints

| Method | Path                  | Description                                   |
| ------ | --------------------- | --------------------------------------------- |
| GET    | `/leads`              | Danh sách leads (filter, sort)                |
| GET    | `/leads/:id`          | Chi tiết lead                                 |
| POST   | `/leads`              | Tạo lead từ customer                          |
| PATCH  | `/leads/:id/status`   | Cập nhật pipeline status                      |
| GET    | `/leads/:id/insights` | **Tổng hợp**: score + recommendation + action |

#### Query Params (GET /leads)

```
?status=QUALIFIED&priority=HIGH&minScore=70&page=1&limit=20&sortBy=score&order=desc
```

#### Response (GET /leads/:id/insights)

```json
{
    "leadScore": {
        "score": 91,
        "conversionProbability": 0.88,
        "topFeatures": ["income", "website_visit", "loan_inquiry"]
    },
    "productRecommendation": {
        "productName": "SHB Visa Platinum",
        "confidence": 0.91,
        "reason": "Thu nhập > 30M, chưa có thẻ tín dụng"
    },
    "nextBestAction": {
        "action": "CALL",
        "priority": "HIGH",
        "reason": "Khách ghé trang Loan 3 lần trong tuần qua"
    }
}
```

#### Implementation Tasks

- [ ] `LeadModule`, `LeadService`, `LeadController`
- [ ] Filter + sort + pagination
- [ ] `GET /leads/:id/insights` — gọi đồng thời `LeadScore`, `ProductRecommendation`, `Recommendation` từ DB

---

### TASK-BE-06 — ML Module

**Spec**: Proxy call tới ML Service để chạy Lead Scoring.

#### Endpoints (NestJS — Frontend gọi)

| Method | Path                       | Description                |
| ------ | -------------------------- | -------------------------- |
| POST   | `/leads/:id/score`         | Trigger scoring cho 1 lead |
| POST   | `/leads/batch-score`       | Batch scoring nhiều leads  |
| GET    | `/leads/:id/score/history` | Lịch sử scoring            |

#### Internal Flow

```
POST /leads/:id/score
  → NestJS lấy Customer + Interactions từ DB
  → Feature Engineering (trong NestJS)
  → POST http://ml-service:8001/predict
  → Lưu LeadScore vào PostgreSQL
  → Return response
```

#### Feature Vector gửi tới ML Service

```json
{
    "age": 35,
    "income": 35000000,
    "salaryAccount": true,
    "hasCreditCard": false,
    "hasLoan": true,
    "hasSaving": true,
    "emailOpenCount": 4,
    "emailClickCount": 2,
    "websiteVisitCount": 7,
    "loanInquiryCount": 3,
    "branchVisitCount": 1,
    "callCount": 2,
    "daysSinceLastInteraction": 3
}
```

#### Implementation Tasks

- [ ] `MlModule`, `MlService` dùng `HttpService`
- [ ] `buildFeatureVector(customerId)` — aggregate từ DB
- [ ] Gọi `POST http://ml-service:8001/predict`
- [ ] Lưu kết quả vào `LeadScore`
- [ ] Handle timeout / error từ ML Service (fallback graceful)
- [ ] `POST /batch-score` — chấm điểm đồng thời tối đa 10 leads (`Promise.allSettled`)

---

### TASK-BE-07 — AI Module

**Spec**: Proxy call tới AI Service để sinh nội dung và chatbot.

#### Endpoints (NestJS — Frontend gọi)

| Method | Path                | Description                                  |
| ------ | ------------------- | -------------------------------------------- |
| POST   | `/ai/email`         | Sinh email từ lead                           |
| POST   | `/ai/pitch`         | Sinh sales pitch                             |
| POST   | `/ai/call-script`   | Sinh call script                             |
| POST   | `/ai/chat`          | Chat với AI Copilot                          |
| POST   | `/ai/explain-score` | Giải thích lead score bằng ngôn ngữ tự nhiên |

#### Internal Flow (ví dụ Generate Email)

```
POST /ai/email  { leadId }
  → Lấy Customer + LeadScore + ProductRecommendation từ DB
  → POST http://ai-service:8002/generate-email  { customer, leadScore, recommendation }
  → Lưu GeneratedContent vào PostgreSQL
  → Return content
```

#### Implementation Tasks

- [ ] `AiModule`, `AiService` dùng `HttpService`
- [ ] Build payload đầy đủ (customer + score + recommendation) trước khi gọi AI Service
- [ ] Lưu tất cả generated content vào `GeneratedContent` table
- [ ] Handle streaming response (optional — nếu dùng SSE/WebSocket)
- [ ] Endpoint `POST /ai/explain-score`: giải thích `topFeatures` bằng LLM

---

### TASK-BE-08 — Recommendation Module

**Spec**: Chạy Rule Engine để sinh Product Recommendation và Next Best Action.

#### Rule Engine — Product Recommendation

```typescript
function recommendProduct(customer, products, interactions): ProductRecommendation {
    if (customer.income > 30_000_000 && !hasProduct(products, "CREDIT_CARD")) {
        return { product: "SHB Visa Platinum", confidence: 0.92 };
    }
    if (hasInteraction(interactions, "LOAN_INQUIRY") && !hasProduct(products, "LOAN")) {
        return { product: "SHB Home Loan", confidence: 0.85 };
    }
    if (!hasProduct(products, "SAVING")) {
        return { product: "SHB Saving Account", confidence: 0.7 };
    }
    // ...more rules
}
```

#### Rule Engine — Next Best Action

```typescript
function recommendAction(leadScore, daysSinceLastInteraction, recentInteractions): Recommendation {
    if (leadScore.score >= 80) return { action: "CALL", priority: "HIGH" };
    if (leadScore.score >= 60) return { action: "EMAIL", priority: "MEDIUM" };
    if (daysSinceLastInteraction > 14) return { action: "EMAIL", priority: "LOW" };
    return { action: "WAIT", priority: "LOW" };
}
```

#### Endpoints

| Method | Path                        | Description                             |
| ------ | --------------------------- | --------------------------------------- |
| POST   | `/leads/:id/recommend`      | Chạy cả product + action recommendation |
| GET    | `/leads/:id/recommendation` | Lấy recommendation hiện tại             |

#### Implementation Tasks

- [ ] `RecommendationModule`, `RecommendationService`
- [ ] Implement Rule Engine Product Recommendation (≥ 5 rules)
- [ ] Implement Rule Engine Next Best Action (kết hợp score + behavior)
- [ ] Lưu kết quả vào `ProductRecommendation` và `Recommendation`

---

### TASK-BE-09 — Dashboard Module

**Spec**: Aggregate data cho Sales Manager.

#### Endpoints

| Method | Path                          | Description             | Role    |
| ------ | ----------------------------- | ----------------------- | ------- |
| GET    | `/dashboard`                  | Tổng hợp toàn bộ        | MANAGER |
| GET    | `/dashboard/funnel`           | Sales Funnel theo stage | MANAGER |
| GET    | `/dashboard/hot-leads`        | Top leads theo score    | ✅      |
| GET    | `/dashboard/revenue-forecast` | Dự báo doanh thu        | MANAGER |
| GET    | `/dashboard/conversion-rate`  | Tỷ lệ chuyển đổi        | MANAGER |

#### Response (GET /dashboard)

```json
{
    "totalLeads": 145,
    "hotLeads": 23,
    "todayTasks": 8,
    "conversionRate": 0.24,
    "funnel": {
        "NEW": 30,
        "QUALIFIED": 25,
        "CONTACTED": 40,
        "PROPOSAL": 20,
        "NEGOTIATION": 15,
        "WON": 10,
        "LOST": 5
    },
    "revenueForcast": { "thisMonth": 500000000, "nextMonth": 650000000 }
}
```

#### Implementation Tasks

- [ ] `DashboardModule`, `DashboardService`
- [ ] Query Lead count by status (Funnel)
- [ ] Query top leads (sort by score DESC, limit 10)
- [ ] Revenue Forecast: WON leads × estimated product value
- [ ] Conversion Rate: WON / (WON + LOST)

---

### TASK-BE-10 — Task Module

**Spec**: Quản lý công việc của nhân viên bán hàng.

#### Endpoints

| Method | Path           | Description                    |
| ------ | -------------- | ------------------------------ |
| GET    | `/tasks`       | Tất cả tasks của user hiện tại |
| GET    | `/tasks/today` | Tasks hôm nay                  |
| POST   | `/tasks`       | Tạo task mới                   |
| PATCH  | `/tasks/:id`   | Cập nhật status, note          |
| DELETE | `/tasks/:id`   | Xóa task                       |

- [ ] Filter tasks theo `assignedTo = currentUser.id`
- [ ] `GET /tasks/today`: `dueDate` trong ngày hiện tại

---

### TASK-BE-11 — Generated Content Module

| Method | Path                      | Description              |
| ------ | ------------------------- | ------------------------ |
| GET    | `/generated-contents`     | Lịch sử nội dung đã sinh |
| GET    | `/generated-contents/:id` | Chi tiết 1 nội dung      |
| DELETE | `/generated-contents/:id` | Xóa                      |

- [ ] Filter by `leadId`, `type` (EMAIL/PITCH/CALL_SCRIPT)

---

### TASK-BE-12 — Common Infrastructure

- [ ] **Global Exception Filter**: Format error response chuẩn
- [ ] **Request Logging Interceptor**: Log method, path, duration, status
- [ ] **Transform Interceptor**: Wrap response trong `{ data, meta }`
- [ ] **Pagination DTO**: `{ page, limit, total, data[] }`
- [ ] **Swagger**: Setup `@nestjs/swagger`, document tất cả endpoints
- [ ] **Health Check**: `GET /health` trả về `{ status: "ok" }`
