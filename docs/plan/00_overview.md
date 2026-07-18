# 📋 Sales Support AI Copilot — Implementation Plan

## Tổng quan hệ thống

| Service | Công nghệ | Trách nhiệm |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | Dashboard, Lead, AI Copilot, Sales Task |
| **Backend API** | NestJS + Prisma | Auth, CRUD, điều phối ML & AI Service |
| **ML Service** | FastAPI + LightGBM | Feature Engineering, Lead Scoring |
| **AI Service** | FastAPI + LangChain + Gemini | RAG, Email, Pitch, Chat, Next Best Action |
| **PostgreSQL** | v16 | Business Data |
| **Qdrant** | v1.x | Knowledge Base (RAG) |
| **Docker Compose** | — | Triển khai toàn bộ services |

---

## Danh sách file Plan

| File | Nội dung |
|---|---|
| [`01_database.md`](./01_database.md) | PostgreSQL schema, migrations, seed data |
| [`02_backend.md`](./02_backend.md) | NestJS modules, API endpoints, business logic |
| [`03_ml_service.md`](./03_ml_service.md) | FastAPI ML service, LightGBM, feature engineering |
| [`04_ai_service.md`](./04_ai_service.md) | FastAPI AI service, RAG, LLM integration |
| [`05_frontend.md`](./05_frontend.md) | Next.js pages, components, UI/UX |
| [`06_deployment.md`](./06_deployment.md) | Docker Compose, environment, infra |

---

## Kiến trúc tổng thể

```
Next.js (3000)
    │ REST
    ▼
NestJS API (4000)
    ├── PostgreSQL (5432)
    ├── ML Service (8001)  →  LightGBM model
    └── AI Service (8002)  →  Qdrant (6333) + Gemini/OpenAI
```

---

## Thứ tự triển khai đề xuất

```
Phase 1 — Infrastructure
  └── Docker Compose setup
  └── PostgreSQL + Migrations
  └── Qdrant setup

Phase 2 — Backend Core
  └── NestJS: Auth, Customer, Lead, Interaction

Phase 3 — ML Service
  └── FastAPI ML: Feature Engineering, LightGBM, /predict

Phase 4 — AI Service
  └── FastAPI AI: RAG ingestion, Email, Pitch, Chat

Phase 5 — Backend Integration
  └── NestJS: ML Module, AI Module, Dashboard, Task

Phase 6 — Frontend
  └── Next.js: Dashboard, Lead Detail, AI Copilot

Phase 7 — Polish & Demo
  └── Seed data, end-to-end test, demo script
```

---

## Quy ước chung

### Naming Convention
- **Database**: `snake_case` (bảng, cột)
- **Backend DTO/Entity**: `camelCase`
- **API Endpoint**: `kebab-case` (`/leads/:id/lead-score`)
- **Frontend component**: `PascalCase`

### Môi trường
- File `.env` cho từng service (xem `06_deployment.md`)
- Không hardcode secret, API key

### Git
- Branch: `feat/<service>/<feature>` (ví dụ: `feat/backend/lead-scoring`)
- Commit: `feat(backend): add lead scoring endpoint`
