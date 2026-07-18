# Sales Support AI Copilot — Project Plan

## Tổng quan dự án

**Hackathon:** SHB AI Innovation 2026  
**Hệ thống:** Sales Support AI Copilot — hỗ trợ nhân viên kinh doanh với Lead Scoring (ML), Product Recommendation (Rule Engine), Next Best Action (Rule + LLM), AI Copilot (RAG + LLM), và Dashboard quản lý pipeline.

**Tech Stack:**
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js + shadcn/ui + Tailwind CSS |
| Backend | NestJS + Prisma |
| ML Service | FastAPI + LightGBM |
| AI Service | FastAPI + LangChain + Gemini |
| Database | PostgreSQL |
| Vector DB | Qdrant |
| Deployment | Docker Compose |

---

## Trạng thái hiện tại

| Component | Trạng thái | Ghi chú |
|-----------|-----------|---------|
| Prisma Schema | ✅ Hoàn chỉnh | 9 bảng core |
| NestJS Setup | ✅ Hoàn chỉnh | Auth, Users, Customers |
| Qdrant Seed Data | ✅ Sẵn sàng | 6 CSV files + import script |
| Docker Compose | ✅ Có sẵn | Cần bổ sung thêm services |
| ML Service | ⬜ Chưa bắt đầu | |
| AI Service | ⬜ Chỉ có seed/ | |
| Frontend | ⬜ Mới có root layout | |

---

## Phases

| # | Phase | File | Tasks | Độ phức tạp | Phụ thuộc |
|---|-------|------|-------|-------------|-----------|
| 1 | Infrastructure & Foundation | [phase-1-infrastructure.md](./phase-1-infrastructure.md) | 4 | 🟢 Thấp | — |
| 2 | Backend API (NestJS) | [phase-2-backend.md](./phase-2-backend.md) | 8 | 🟡 Trung bình | Phase 1 |
| 3 | ML Service (FastAPI + LightGBM) | [phase-3-ml-service.md](./phase-3-ml-service.md) | 4 | 🟡 Trung bình | Phase 1 |
| 4 | AI Service (FastAPI + Gemini) | [phase-4-ai-service.md](./phase-4-ai-service.md) | 7 | 🔴 Cao | Phase 1 |
| 5 | Frontend (Next.js) | [phase-5-frontend.md](./phase-5-frontend.md) | 8 | 🟡 Trung bình | Phase 1 + 2 |
| 6 | Integration & Polish | [phase-6-integration.md](./phase-6-integration.md) | 5 | 🟡 Trung bình | Tất cả phases |

---

## Dependency Map

```
[Phase 1: Infrastructure]
         │
         ├──────────────────┬────────────────────┐
         ▼                  ▼                    ▼
[Phase 2: Backend]  [Phase 3: ML]      [Phase 4: AI]
         │                  │                    │
         ▼                  └─────────┬──────────┘
[Phase 5: Frontend]                   │
         │                            │
         └──────────────┬─────────────┘
                        ▼
              [Phase 6: Integration]
```

**Ghi chú:** Phase 3 và Phase 4 chạy **song song** với nhau — độc lập hoàn toàn.

---

## Thứ tự thực hiện đề xuất

```
Ngày 1:
  [Buổi sáng]  Phase 1: Infrastructure (2-3 giờ)
  [Buổi sáng]  Phase 2: TASK-BE-03 Leads Module
  [Buổi chiều] Phase 2: TASK-BE-04 Lead Scoring + TASK-BE-05 Recommendation
  [Buổi tối]   Phase 3: ML Service setup + training

Ngày 2:
  [Buổi sáng]  Phase 3: Predict API
  [Buổi sáng]  Phase 4: AI Service setup + RAG
  [Buổi chiều] Phase 4: Email + Pitch + NBA + Chat endpoints
  [Buổi tối]   Phase 2: TASK-BE-06 AI Module + TASK-BE-07 Tasks + TASK-BE-08 Dashboard

Ngày 3:
  [Buổi sáng]  Phase 5: Design System + Auth + Dashboard
  [Buổi chiều] Phase 5: Leads List + Lead Detail + AI Copilot Panel
  [Buổi tối]   Phase 5: Customers + Tasks + Polish

Ngày 4 (Demo day):
  [Buổi sáng]  Phase 6: Integration Test + Bug fixes
  [Buổi chiều] Phase 6: Docker Compose + Demo preparation
  [Buổi tối]   Rehearsal demo
```

---

## Task IDs tổng hợp

**Phase 1 — Infrastructure**
- `TASK-INF-01` Docker Compose
- `TASK-INF-02` Prisma Migration
- `TASK-INF-03` Seed PostgreSQL
- `TASK-INF-04` Import Qdrant

**Phase 2 — Backend**
- `TASK-BE-01` Project Setup ✅
- `TASK-BE-02` Customers Module (bổ sung)
- `TASK-BE-03` Leads Module
- `TASK-BE-04` Lead Scoring Module
- `TASK-BE-05` Recommendation Module
- `TASK-BE-06` AI Module
- `TASK-BE-07` Tasks Module
- `TASK-BE-08` Dashboard Module

**Phase 3 — ML Service**
- `TASK-ML-01` Project Setup
- `TASK-ML-02` Model Training
- `TASK-ML-03` Feature Processing
- `TASK-ML-04` Predict API

**Phase 4 — AI Service**
- `TASK-AI-01` Project Setup
- `TASK-AI-02` RAG Service
- `TASK-AI-03` Prompt Builder
- `TASK-AI-04` LLM Provider
- `TASK-AI-05` Email Generator
- `TASK-AI-06` Next Best Action
- `TASK-AI-07` Chat API

**Phase 5 — Frontend**
- `TASK-FE-01` Design System & Layout
- `TASK-FE-02` Authentication
- `TASK-FE-03` Dashboard Page
- `TASK-FE-04` Leads List Page
- `TASK-FE-05` Lead Detail Page
- `TASK-FE-06` AI Copilot Panel
- `TASK-FE-07` Customers Page
- `TASK-FE-08` Tasks Page

**Phase 6 — Integration**
- `TASK-INT-01` E2E Integration Test
- `TASK-INT-02` Error Handling
- `TASK-INT-03` Performance
- `TASK-INT-04` Docker Compose Full Stack
- `TASK-INT-05` Demo Preparation
