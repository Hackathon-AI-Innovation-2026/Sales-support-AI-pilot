# 📌 Task Tracker — Sales Support AI Copilot

> Cập nhật tiến độ tại đây. `[ ]` = chưa làm, `[/]` = đang làm, `[x]` = xong.

---

## Phase 1 — Infrastructure

### Database [`01_database.md`](./01_database.md)
- [ ] TASK-DB-01 Cài đặt Prisma
- [ ] TASK-DB-02 Schema: User
- [ ] TASK-DB-03 Schema: Customer
- [ ] TASK-DB-04 Schema: CustomerProduct
- [ ] TASK-DB-05 Schema: CustomerInteraction
- [ ] TASK-DB-06 Schema: Lead
- [ ] TASK-DB-07 Schema: LeadScore
- [ ] TASK-DB-08 Schema: ProductRecommendation
- [ ] TASK-DB-09 Schema: Recommendation (Next Best Action)
- [ ] TASK-DB-10 Schema: GeneratedContent
- [ ] TASK-DB-11 Schema: SalesTask
- [ ] TASK-DB-12 Seed Data
- [ ] TASK-DB-13 Index & Optimization

### Deployment [`06_deployment.md`](./06_deployment.md)
- [ ] TASK-DEV-01 Docker Compose File
- [ ] TASK-DEV-02 Environment Variables & .env.example
- [ ] TASK-DEV-03 Dockerfile: Backend
- [ ] TASK-DEV-04 Dockerfile: ML Service
- [ ] TASK-DEV-05 Dockerfile: AI Service
- [ ] TASK-DEV-06 Dockerfile: Frontend
- [ ] TASK-DEV-07 Startup Script
- [ ] TASK-DEV-09 Repository Structure
- [ ] TASK-DEV-10 README.md

---

## Phase 2 — Backend Core

### NestJS [`02_backend.md`](./02_backend.md)
- [ ] TASK-BE-01 Project Setup (NestJS + Prisma + Config)
- [ ] TASK-BE-02 Auth Module (Login, JWT, Roles)
- [ ] TASK-BE-03 Customer Module (CRUD + Profile)
- [ ] TASK-BE-04 Interaction Module
- [ ] TASK-BE-05 Lead Module + GET /leads/:id/insights
- [ ] TASK-BE-12 Common Infrastructure (Filter, Logging, Swagger)

---

## Phase 3 — ML Service

### FastAPI + LightGBM [`03_ml_service.md`](./03_ml_service.md)
- [ ] TASK-ML-01 Project Setup
- [ ] TASK-ML-02 Feature Set Definition
- [ ] TASK-ML-03 Request/Response Schema
- [ ] TASK-ML-04 Generate Synthetic Dataset
- [ ] TASK-ML-05 Train LightGBM Model
- [ ] TASK-ML-06 Prediction Service
- [ ] TASK-ML-07 API Endpoints (/predict, /batch-predict, /model-info)
- [ ] TASK-ML-08 Error Handling
- [ ] TASK-ML-09 Testing

---

## Phase 4 — AI Service

### FastAPI + LangChain [`04_ai_service.md`](./04_ai_service.md)
- [ ] TASK-AI-01 Project Setup
- [ ] TASK-AI-02 LLM Provider (Gemini / OpenAI)
- [ ] TASK-AI-03 Embedding Service
- [ ] TASK-AI-04 Qdrant Setup & Knowledge Ingestion
- [ ] TASK-AI-05 RAG Service
- [ ] TASK-AI-06 Prompt Service (templates)
- [ ] TASK-AI-07 Email Generation
- [ ] TASK-AI-08 Sales Pitch Generation
- [ ] TASK-AI-09 Call Script Generation
- [ ] TASK-AI-10 Chat Service (AI Copilot)
- [ ] TASK-AI-11 Explain Lead Score
- [ ] TASK-AI-12 Next Best Action with LLM
- [ ] TASK-AI-13 Knowledge Data Files (products, faq, policy...)

---

## Phase 5 — Backend Integration

### NestJS — ML & AI Integration
- [ ] TASK-BE-06 ML Module (proxy + feature engineering)
- [ ] TASK-BE-07 AI Module (proxy + save generated content)
- [ ] TASK-BE-08 Recommendation Module (Rule Engine)
- [ ] TASK-BE-09 Dashboard Module
- [ ] TASK-BE-10 Task Module
- [ ] TASK-BE-11 Generated Content Module

---

## Phase 6 — Frontend

### Next.js [`05_frontend.md`](./05_frontend.md)
- [ ] TASK-FE-01 Project Setup (Next.js + shadcn + React Query)
- [ ] TASK-FE-02 Authentication (Login page + JWT)
- [ ] TASK-FE-03 Layout (Sidebar + Header)
- [ ] TASK-FE-04 Dashboard Page (metrics, funnel, hot leads)
- [ ] TASK-FE-05 Lead List Page (table + filters)
- [ ] TASK-FE-06 Lead Detail Page ⭐ (AI Insights + Generate content)
- [ ] TASK-FE-07 Customer List & Detail
- [ ] TASK-FE-08 AI Copilot Chat Page ⭐
- [ ] TASK-FE-09 Tasks Page
- [ ] TASK-FE-10 Common Components & UX
- [ ] TASK-FE-11 API Integration Layer

---

## Phase 7 — Polish & Demo

- [ ] TASK-DEV-08 Health Checks & Monitoring
- [ ] End-to-end test toàn bộ luồng (Login → Lead → Generate Email → Chat)
- [ ] Kiểm tra seed data đủ và hợp lý
- [ ] Demo script (kịch bản demo cho ban giám khảo)
- [ ] Screenshots cho README

---

## Thống kê

| Phase | Tổng tasks | Hoàn thành | % |
|---|---|---|---|
| Phase 1 — Infrastructure | 22 | 0 | 0% |
| Phase 2 — Backend Core | 6 | 0 | 0% |
| Phase 3 — ML Service | 9 | 0 | 0% |
| Phase 4 — AI Service | 13 | 0 | 0% |
| Phase 5 — Backend Integration | 6 | 0 | 0% |
| Phase 6 — Frontend | 11 | 0 | 0% |
| Phase 7 — Polish | 5 | 0 | 0% |
| **Tổng** | **72** | **0** | **0%** |
