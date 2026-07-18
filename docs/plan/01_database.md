# 01 — Database Design & Setup

## Mục tiêu

Khởi tạo PostgreSQL schema, migration, và seed data phục vụ toàn bộ hệ thống.

---

## Stack

- **ORM**: Prisma (dùng trong NestJS)
- **Database**: PostgreSQL 16
- **Migration**: `prisma migrate dev`
- **Seed**: `prisma db seed`

---

## Tasks

### TASK-DB-01 — Cài đặt Prisma

- [ ] Cài `@prisma/client`, `prisma` vào NestJS project
- [ ] Khởi tạo `prisma/schema.prisma`
- [ ] Cấu hình `DATABASE_URL` trong `.env`

---

### TASK-DB-02 — Schema: User

**Spec**: Quản lý tài khoản nhân viên bán hàng và Sales Manager.

```prisma
model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String
  fullName     String
  role         UserRole   @default(SALES)
  createdAt    DateTime   @default(now())

  leads        Lead[]
  tasks        SalesTask[]
}

enum UserRole {
  SALES
  MANAGER
  ADMIN
}
```

**Acceptance**:

- [ ] Migration chạy thành công
- [ ] Unique constraint trên `email`

---

### TASK-DB-03 — Schema: Customer

**Spec**: Lưu hồ sơ khách hàng — nguồn dữ liệu chính cho Lead Scoring.

```prisma
model Customer {
  id             String   @id @default(uuid())
  fullName       String
  email          String?  @unique
  phone          String?
  age            Int?
  gender         String?
  occupation     String?
  income         Float?
  city           String?
  salaryAccount  Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  products       CustomerProduct[]
  interactions   CustomerInteraction[]
  leads          Lead[]
}
```

**Acceptance**:

- [ ] CRUD hoạt động qua NestJS
- [ ] Seed ít nhất 20 customers mẫu

---

### TASK-DB-04 — Schema: CustomerProduct

**Spec**: Sản phẩm khách hàng đang sở hữu — dùng để tính cross-selling features.

```prisma
model CustomerProduct {
  id          String   @id @default(uuid())
  customerId  String
  productType ProductType
  openedDate  DateTime?
  status      String   @default("ACTIVE")

  customer    Customer @relation(fields: [customerId], references: [id])
}

enum ProductType {
  LOAN
  SAVING
  CREDIT_CARD
  INSURANCE
  INVESTMENT
}
```

---

### TASK-DB-05 — Schema: CustomerInteraction

**Spec**: Lịch sử tương tác — **bảng quan trọng nhất** cho Lead Scoring features.

```prisma
model CustomerInteraction {
  id              String          @id @default(uuid())
  customerId      String
  interactionType InteractionType
  occurredAt      DateTime        @default(now())
  metadata        Json?

  customer        Customer @relation(fields: [customerId], references: [id])
}

enum InteractionType {
  EMAIL_OPEN
  EMAIL_CLICK
  CALL
  BRANCH_VISIT
  WEBSITE_VISIT
  APP_LOGIN
  LOAN_INQUIRY
}
```

**Acceptance**:

- [ ] Seed interactions cho từng customer (5–15 interactions/customer)
- [ ] `metadata` dạng JSONB (ví dụ: `{ "page": "/credit-card", "duration": 180 }`)

---

### TASK-DB-06 — Schema: Lead

**Spec**: Cơ hội bán hàng — trung tâm của toàn bộ hệ thống.

```prisma
model Lead {
  id                String     @id @default(uuid())
  customerId        String
  assignedTo        String?
  interestedProduct String?
  status            LeadStatus @default(NEW)
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  customer          Customer   @relation(fields: [customerId], references: [id])
  assignedUser      User?      @relation(fields: [assignedTo], references: [id])
  scores            LeadScore[]
  recommendations   ProductRecommendation[]
  actions           Recommendation[]
  tasks             SalesTask[]
  generatedContents GeneratedContent[]
}

enum LeadStatus {
  NEW
  QUALIFIED
  CONTACTED
  PROPOSAL
  NEGOTIATION
  WON
  LOST
}
```

---

### TASK-DB-07 — Schema: LeadScore

**Spec**: Lưu kết quả predict từ ML Service.

```prisma
model LeadScore {
  id                    String   @id @default(uuid())
  leadId                String
  score                 Float
  conversionProbability Float
  topFeatures           Json?
  predictedAt           DateTime @default(now())

  lead                  Lead     @relation(fields: [leadId], references: [id])
}
```

---

### TASK-DB-08 — Schema: ProductRecommendation

**Spec**: Đề xuất sản phẩm (Rule Engine).

```prisma
model ProductRecommendation {
  id          String   @id @default(uuid())
  leadId      String
  productName String
  confidence  Float
  reason      String?
  generatedAt DateTime @default(now())

  lead        Lead     @relation(fields: [leadId], references: [id])
}
```

---

### TASK-DB-09 — Schema: Recommendation (Next Best Action)

```prisma
model Recommendation {
  id          String           @id @default(uuid())
  leadId      String
  action      RecommendedAction
  priority    Priority
  reason      String?
  generatedAt DateTime         @default(now())

  lead        Lead             @relation(fields: [leadId], references: [id])
}

enum RecommendedAction {
  CALL
  EMAIL
  MEETING
  WAIT
}

enum Priority {
  HIGH
  MEDIUM
  LOW
}
```

---

### TASK-DB-10 — Schema: GeneratedContent

**Spec**: Lưu nội dung do AI sinh ra (email, pitch, call script).

```prisma
model GeneratedContent {
  id        String      @id @default(uuid())
  leadId    String
  type      ContentType
  prompt    String?
  content   String
  model     String?
  createdAt DateTime    @default(now())

  lead      Lead        @relation(fields: [leadId], references: [id])
}

enum ContentType {
  EMAIL
  PITCH
  CALL_SCRIPT
}
```

---

### TASK-DB-11 — Schema: SalesTask

```prisma
model SalesTask {
  id          String     @id @default(uuid())
  leadId      String
  assignedTo  String
  taskType    TaskType
  status      TaskStatus @default(TODO)
  dueDate     DateTime?
  completedAt DateTime?
  note        String?

  lead        Lead       @relation(fields: [leadId], references: [id])
  user        User       @relation(fields: [assignedTo], references: [id])
}

enum TaskType {
  CALL
  EMAIL
  MEETING
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
  FAILED
}
```

---

### TASK-DB-12 — Seed Data

**Spec**: Dữ liệu mẫu đủ để demo tất cả tính năng.

- [ ] 1 user MANAGER, 3 users SALES
- [ ] 30 customers (đa dạng: tuổi, nghề nghiệp, thu nhập)
- [ ] Mỗi customer có 2–5 `CustomerProduct` records
- [ ] Mỗi customer có 5–15 `CustomerInteraction` records (mix các loại)
- [ ] 20 leads từ customers trên
- [ ] `LeadScore` cho tất cả 20 leads
- [ ] `ProductRecommendation` cho tất cả leads
- [ ] `Recommendation` (next best action) cho tất cả leads
- [ ] 10 `GeneratedContent` (email mẫu)
- [ ] 15 `SalesTask`

---

### TASK-DB-13 — Index & Optimization

- [ ] Index `Lead.customerId`
- [ ] Index `LeadScore.leadId`
- [ ] Index `CustomerInteraction.customerId`
- [ ] Index `SalesTask.assignedTo`, `SalesTask.dueDate`

---

## ERD Tham chiếu

```
User ──────────────── Lead ──────────────── Customer
                        │                      │
           ┌────────────┼──────────────┐       ├── CustomerProduct
           │            │              │       └── CustomerInteraction
           ▼            ▼              ▼
       LeadScore  ProductRecom-   Recommendation
                  mendation
           │            │              │
           └─────────── Lead ──────────┘
                        │
           ┌────────────┴──────────┐
           ▼                       ▼
     SalesTask            GeneratedContent
```
