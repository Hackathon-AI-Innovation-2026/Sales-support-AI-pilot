# Phase 2 — Backend API (NestJS)

> **Mục tiêu:** Hoàn thiện toàn bộ REST API — CRUD, business logic, điều phối ML/AI services — chuẩn bị cho Frontend tích hợp.

---

## Tổng quan

| Thông tin   | Chi tiết              |
| ----------- | --------------------- |
| Thứ tự      | Phase 2 (sau Phase 1) |
| Độ phức tạp | 🟡 Trung bình         |
| Phụ thuộc   | Phase 1 (DB ready)    |
| Unblock     | Phase 5 (Frontend)    |
| Service     | `apps/api` — NestJS   |

**Trạng thái hiện tại:**

- ✅ `AuthModule` — JWT login/refresh
- ✅ `UsersModule` — CRUD user
- ✅ `CustomersModule` — danh sách + chi tiết customer
- ⬜ `LeadsModule`, `LeadScoringModule`, `RecommendationModule`, `AiModule`, `TasksModule`, `DashboardModule`

---

## TASK-BE-01: Project Setup ✅ (đã hoàn thành)

**Checklist:**

- [x] `ConfigModule` — biến môi trường, validation
- [x] `DatabaseModule` — Prisma Client injection
- [x] `MailModule` — email infrastructure
- [x] `StorageModule` — file storage
- [x] `AuthModule` — JWT access token + refresh token
- [x] `Guards` — `JwtAuthGuard`, `RolesGuard`
- [x] `Strategies` — `JwtStrategy`, `LocalStrategy`
- [x] Global Exception Filter
- [x] CORS configuration
- [x] Request logging

---

## TASK-BE-02: Customers Module (hoàn thiện)

**Trạng thái:** Đã có một phần, cần bổ sung thêm endpoints.

**Endpoints cần bổ sung:**

- [x] `GET /customers/:id/interactions` — lịch sử tương tác có pagination
- [x] `GET /customers/:id/leads` — danh sách leads của khách hàng

**Checklist:**

- [x] Response shape chuẩn (pagination metadata)
- [x] Filter interactions theo `interactionType`
- [x] Sort interactions theo `occurredAt DESC`

---

## TASK-BE-03: Leads Module

**Mô tả:** Quản lý lead — đại diện cho cơ hội bán hàng.

**Endpoints:**

```
GET    /leads              — Danh sách leads (filter: status, assignedTo, score range)
POST   /leads              — Tạo lead mới từ customer
GET    /leads/:id          — Chi tiết lead (kèm score, recommendation, tasks, content)
PUT    /leads/:id          — Cập nhật status / assignedTo / interestedProduct
DELETE /leads/:id          — Soft delete (cập nhật deletedAt)
```

**Checklist:**

- [x] `leads.module.ts`, `leads.controller.ts`, `leads.service.ts`
- [x] DTO: `CreateLeadDto`, `UpdateLeadDto`, `LeadQueryDto`
- [x] Filter: `status`, `assignedTo`, `minScore`, `maxScore`
- [x] Sort: `score DESC`, `createdAt DESC`
- [x] Pagination
- [x] Populate relations: `customer`, `latestScore`, `latestRecommendation`, `tasks`
- [x] Guard: loại bỏ role-based access restriction theo yêu cầu

---

## TASK-BE-04: Lead Scoring Module (ML Orchestration)

**Mô tả:** NestJS đóng vai trò orchestrator — lấy data, gọi ML Service, lưu kết quả.

**Endpoints:**

```
POST /leads/:id/score    — Trigger scoring cho một lead
GET  /leads/:id/scores   — Lịch sử điểm (tất cả predictions)
GET  /leads/:id/score    — Điểm mới nhất
```

**Flow:**

```
POST /leads/:id/score
  ↓
Lấy Customer profile từ DB
  ↓
Lấy CustomerInteraction → đếm counts (emailOpen, websiteVisit, loanInquiry, ...)
  ↓
Lấy CustomerProduct → flags (hasSaving, hasCreditCard, hasInsurance)
  ↓
Build feature vector:
  {
    income, age, salaryAccount,
    emailOpenCount, emailClickCount,
    websiteVisitCount, loanInquiryCount,
    branchVisitCount, callCount,
    hasSaving, hasCreditCard, hasInsurance
  }
  ↓
POST http://ml-service/predict  (feature vector)
  ↓
Nhận: { score, probability, topFeatures }
  ↓
Lưu LeadScore vào PostgreSQL
  ↓
Return LeadScore
```

**Checklist:**

- [x] `lead-scoring.module.ts`, `lead-scoring.service.ts` — HTTP client gọi ML Service
- [x] Feature engineering logic trong `lead-scoring.service.ts`
- [x] Config: `ML_SERVICE_URL` từ env
- [x] Error handling: ML Service timeout / unavailable → trả lỗi rõ ràng
- [x] Lưu `topFeatures` dạng JSON

---

## TASK-BE-05: Recommendation Module

**Mô tả:** Product Recommendation dùng Rule Engine + Next Best Action qua AI Service.

**Endpoints:**

```
POST /leads/:id/recommend-product    — Chạy Rule Engine → ProductRecommendation
POST /leads/:id/next-best-action     — Gọi AI Service → Recommendation
GET  /leads/:id/recommendations      — Lấy toàn bộ (product + action)
```

**Rule Engine — Product Recommendation:**

```
if income > 30_000_000 AND !hasCreditCard:
  → SHB Visa Platinum (confidence: 0.9)

if loanInquiryCount >= 2 AND income > 15_000_000:
  → Home Loan / Personal Loan (confidence: 0.85)

if hasSaving AND age >= 30 AND income > 20_000_000:
  → Investment Fund (confidence: 0.75)

if !hasSaving:
  → Savings Account (confidence: 0.7)

if age < 30 AND !hasCreditCard:
  → SHB Visa Classic (confidence: 0.65)
```

**Next Best Action Flow:**

```
POST /leads/:id/next-best-action
  ↓
Lấy LeadScore + CustomerInteraction + Lead
  ↓
POST http://ai-service/next-best-action
  ↓
Nhận: { action, priority, reason, suggestedContent }
  ↓
Lưu Recommendation vào PostgreSQL
```

**Checklist:**

- [x] `recommendation.module.ts`, `recommendation.service.ts`
- [x] Rule Engine: hàm `applyProductRules(customer, products, interactions)`
- [x] HTTP client gọi AI Service `POST /next-best-action`
- [x] Config: `AI_SERVICE_URL` từ env

---

## TASK-BE-06: AI Module (AI Orchestration)

**Mô tả:** NestJS là proxy/orchestrator — lấy context từ DB, gọi AI Service, lưu kết quả.

**Endpoints:**

```
POST /ai/generate-email   — Sinh email cá nhân hóa
POST /ai/generate-pitch   — Sinh sales pitch
POST /ai/chat             — Chat với AI (forward + stream)
GET  /leads/:id/generated-content  — Lịch sử AI content
```

**Generate Email Flow:**

```
POST /ai/generate-email  { leadId }
  ↓
Lấy: Customer + LeadScore (mới nhất) + ProductRecommendation (mới nhất)
  ↓
POST http://ai-service/generate-email
  {
    customerName, income, age, city,
    leadScore, conversionProbability,
    recommendedProduct, productReason,
    topFeatures
  }
  ↓
Nhận: { subject, body }
  ↓
Lưu GeneratedContent (type: EMAIL) vào PostgreSQL
  ↓
Return content
```

**Chat Flow:**

```
POST /ai/chat  { message, leadId?, conversationHistory }
  ↓
Nếu có leadId: đính kèm customer context
  ↓
POST http://ai-service/chat (forward, hỗ trợ stream)
  ↓
Stream response về Frontend
```

**Checklist:**

- [x] `ai.module.ts`, `ai.service.ts`, `ai.controller.ts`
- [x] DTO: `GenerateEmailDto`, `GeneratePitchDto`, `ChatDto`
- [x] HTTP client với streaming support (SSE)
- [x] Lưu `GeneratedContent` sau mỗi generation
- [x] `GET /leads/:id/generated-content` với filter theo `type`

---

## TASK-BE-07: Sales Tasks Module

**Mô tả:** Quản lý công việc hàng ngày của nhân viên bán hàng.

**Endpoints:**

```
GET    /tasks          — Danh sách tasks (filter: status, dueDate, taskType)
POST   /tasks          — Tạo task mới
PUT    /tasks/:id      — Cập nhật status / completedAt / note
GET    /tasks/today    — Tasks có dueDate là hôm nay
GET    /tasks/:id      — Chi tiết task
```

**Checklist:**

- [x] `tasks.module.ts`, `tasks.controller.ts`, `tasks.service.ts`
- [x] DTO: `CreateTaskDto`, `UpdateTaskDto`, `TaskQueryDto`
- [x] Filter: `status` (TODO/IN_PROGRESS/DONE/FAILED), `dueDate`, `taskType`
- [x] Auto set `completedAt` khi status → DONE
- [x] Guard: Sales chỉ thấy tasks của mình (`assignedTo = currentUser.id`)

---

## TASK-BE-08: Dashboard Module

**Mô tả:** Aggregate dữ liệu cho Manager Dashboard.

**Endpoints:**

```
GET /dashboard/summary          — Tổng quan (total leads, won this month, active tasks)
GET /dashboard/funnel           — Số lead theo từng pipeline stage
GET /dashboard/hot-leads        — Top N leads có score cao nhất
GET /dashboard/conversion-rate  — Tỷ lệ WON/(WON+LOST) theo tháng
GET /dashboard/revenue-forecast — Forecast dựa trên leads đang NEGOTIATION
```

**Business Logic:**

```
funnel:
  { status: 'NEW', count: X }
  { status: 'QUALIFIED', count: X }
  ...

hot-leads:
  leads JOIN leadScore ORDER BY score DESC LIMIT 10

conversion-rate:
  WON / (WON + LOST) trong 30 ngày gần nhất

revenue-forecast:
  leads[status=NEGOTIATION] × averageProductValue × conversionProbability
```

**Checklist:**

- [x] `dashboard.module.ts`, `dashboard.controller.ts`, `dashboard.service.ts`
- [x] Guard: chỉ MANAGER và ADMIN được truy cập
- [x] Caching (optional): TTL 5 phút cho các aggregate queries
- [x] Response format phù hợp để render chart trực tiếp

---

## Cấu trúc thư mục dự kiến sau Phase 2

```
apps/api/src/modules/
├── auth/               ✅
├── users/              ✅
├── customers/          ✅ (bổ sung thêm)
├── leads/              ⬜ TASK-BE-03
├── ml/                 ⬜ TASK-BE-04
├── recommendation/     ⬜ TASK-BE-05
├── ai/                 ⬜ TASK-BE-06
├── tasks/              ⬜ TASK-BE-07
└── dashboard/          ⬜ TASK-BE-08
```

---

## Kết quả mong đợi sau Phase 2

```
✅ Toàn bộ REST API hoạt động
✅ Postman/Thunder Client có thể test tất cả endpoints
✅ Authentication + Authorization đúng theo role
✅ ML/AI Service được gọi đúng contract
✅ Frontend có thể tích hợp ngay
```
