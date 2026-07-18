# 06 — Deployment (Docker Compose)

## Mục tiêu
Đóng gói và chạy toàn bộ hệ thống bằng Docker Compose với một lệnh duy nhất.

---

## Services

| Service | Image | Port | Depends On |
|---|---|---|---|
| `postgres` | postgres:16-alpine | 5432 | — |
| `qdrant` | qdrant/qdrant:latest | 6333, 6334 | — |
| `backend` | ./backend | 4000 | postgres |
| `ml-service` | ./ml-service | 8001 | — |
| `ai-service` | ./ai-service | 8002 | qdrant |
| `frontend` | ./frontend | 3000 | backend |

---

## Tasks

### TASK-DEV-01 — Docker Compose File

```yaml
# docker-compose.yml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sales_copilot
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d sales_copilot"]
      interval: 10s
      timeout: 5s
      retries: 5

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://admin:${POSTGRES_PASSWORD}@postgres:5432/sales_copilot
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      ML_SERVICE_URL: http://ml-service:8001
      AI_SERVICE_URL: http://ai-service:8002
    depends_on:
      postgres:
        condition: service_healthy
    command: >
      sh -c "npx prisma migrate deploy && npx prisma db seed && node dist/main.js"

  ml-service:
    build: ./ml-service
    ports:
      - "8001:8001"
    volumes:
      - ./ml-service/app/models:/app/models

  ai-service:
    build: ./ai-service
    ports:
      - "8002:8002"
    environment:
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      QDRANT_URL: http://qdrant:6333
      LLM_PROVIDER: gemini
    depends_on:
      - qdrant

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
    depends_on:
      - backend

volumes:
  postgres_data:
  qdrant_data:
```

- [ ] Tạo `docker-compose.yml` tại root
- [ ] Test `docker compose up --build`

---

### TASK-DEV-02 — Environment Variables

```bash
# .env (root)
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key   # optional fallback
```

- [ ] Tạo `.env.example` với tất cả keys (không có giá trị thật)
- [ ] Thêm `.env` vào `.gitignore`

---

### TASK-DEV-03 — Dockerfile: Backend (NestJS)

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json .
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

---

### TASK-DEV-04 — Dockerfile: ML Service

```dockerfile
# ml-service/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

> **Note**: Model file `.pkl` phải được build trước khi tạo Docker image, hoặc mount qua volume.

---

### TASK-DEV-05 — Dockerfile: AI Service

```dockerfile
# ai-service/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8002
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
```

---

### TASK-DEV-06 — Dockerfile: Frontend (Next.js)

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
EXPOSE 3000
CMD ["npm", "start"]
```

---

### TASK-DEV-07 — Startup Script

```bash
#!/bin/bash
# scripts/start.sh

echo "🚀 Starting Sales Support AI Copilot..."

# 1. Train ML model nếu chưa có
if [ ! -f "ml-service/app/models/lead_score_model.pkl" ]; then
  echo "📊 Training ML model..."
  cd ml-service
  python training/generate_dataset.py
  python training/train_model.py
  cd ..
fi

# 2. Start all services
docker compose up --build -d

# 3. Wait for services to be ready
echo "⏳ Waiting for services..."
sleep 15

# 4. Ingest knowledge vào Qdrant
echo "📚 Ingesting knowledge base..."
docker compose exec ai-service python app/knowledge/ingest.py

echo "✅ All systems ready!"
echo "Frontend:   http://localhost:3000"
echo "Backend:    http://localhost:4000"
echo "ML Service: http://localhost:8001"
echo "AI Service: http://localhost:8002"
```

- [ ] Tạo `scripts/start.sh`
- [ ] Tạo `scripts/stop.sh` (`docker compose down`)
- [ ] Tạo `scripts/reset.sh` (`docker compose down -v` — xóa volumes)

---

### TASK-DEV-08 — Health Checks & Monitoring

| Endpoint | Mô tả |
|---|---|
| `GET localhost:4000/health` | Backend healthy |
| `GET localhost:8001/health` | ML Service healthy |
| `GET localhost:8002/health` | AI Service healthy |
| `GET localhost:6333/health` | Qdrant healthy |

- [ ] Tất cả services có `/health` endpoint
- [ ] Docker Compose healthcheck cho postgres và qdrant
- [ ] Backend healthcheck gọi ML + AI Service và báo cáo trạng thái

---

### TASK-DEV-09 — Repository Structure

```
sales-support-ai-copilot/          ← Root
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── scripts/
│   ├── start.sh
│   ├── stop.sh
│   └── reset.sh
├── docs/
│   ├── plan/                      ← Files này
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   └── summary.md
├── backend/                       ← NestJS
├── ml-service/                    ← FastAPI + LightGBM
├── ai-service/                    ← FastAPI + LangChain
└── frontend/                      ← Next.js
```

---

### TASK-DEV-10 — README.md

- [ ] Mô tả hệ thống
- [ ] Prerequisites: Docker, Docker Compose, Git
- [ ] Quick Start:
  ```bash
  git clone <repo>
  cp .env.example .env
  # Điền GEMINI_API_KEY vào .env
  bash scripts/start.sh
  ```
- [ ] Demo credentials: `sales@shb.vn / demo123`, `manager@shb.vn / demo123`
- [ ] Architecture diagram
- [ ] Feature list với screenshots (sau khi có UI)
