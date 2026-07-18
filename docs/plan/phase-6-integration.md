# Phase 6 — Integration & Polish

> **Mục tiêu:** Kết nối toàn bộ services end-to-end, fix bugs, polish UI/UX, chuẩn bị Docker Compose full stack, sẵn sàng demo.

---

## Tổng quan

| Thông tin | Chi tiết |
|-----------|----------|
| Thứ tự | Phase 6 (cuối cùng) |
| Độ phức tạp | 🟡 Trung bình |
| Phụ thuộc | Phase 2 + Phase 3 + Phase 4 + Phase 5 |
| Unblock | Demo / Production |

---

## TASK-INT-01: End-to-End Integration Test

**Mô tả:** Chạy toàn bộ business flow từ đầu đến cuối, verify dữ liệu đi đúng qua từng service.

**Happy Path Flow:**
```
1. Login → Sales account
2. Vào Customers → chọn khách hàng
3. Create Lead → gán cho Sales
4. Lead Detail → click "Analyze" → POST /leads/:id/score
   ✓ NestJS lấy interactions từ DB
   ✓ Build feature vector
   ✓ Gọi ML Service POST /predict
   ✓ Lưu LeadScore vào DB
   ✓ UI hiển thị score + probability

5. Click "Recommend Product" → POST /leads/:id/recommend-product
   ✓ Rule Engine chạy
   ✓ Lưu ProductRecommendation vào DB
   ✓ UI hiển thị sản phẩm + reason

6. Click "Next Best Action" → POST /leads/:id/next-best-action
   ✓ NestJS gọi AI Service
   ✓ Rule Engine quyết định action
   ✓ LLM giải thích lý do
   ✓ Lưu Recommendation vào DB
   ✓ UI hiển thị action card

7. AI Copilot → Generate Email
   ✓ NestJS lấy customer + score + recommendation
   ✓ Gọi AI Service POST /generate-email
   ✓ AI Service RAG retrieve từ Qdrant
   ✓ LLM sinh email
   ✓ Lưu GeneratedContent vào DB
   ✓ UI hiển thị email có thể edit

8. AI Copilot → Chat
   ✓ SSE stream hoạt động
   ✓ RAG context đúng

9. Create Task → Mark Done
   ✓ Task status cập nhật
   ✓ Hiển thị trong Tasks page

10. Dashboard (Manager) → Verify metrics cập nhật
```

**Checklist:**
- [ ] Chạy toàn bộ flow trên môi trường local
- [ ] Verify mỗi bước: database record được tạo đúng
- [ ] Verify response time < 3 seconds (trừ AI generation)
- [ ] Test với ít nhất 3 customer profiles khác nhau
- [ ] Test role-based access: Sales không thấy Dashboard Manager

---

## TASK-INT-02: Error Handling & Edge Cases

**Mô tả:** Đảm bảo hệ thống graceful degrade khi có lỗi.

**Backend (NestJS):**
- [ ] Global HTTP Exception Filter — chuẩn hóa error response:
  ```json
  {
    "statusCode": 400,
    "message": "Validation failed",
    "error": "Bad Request",
    "timestamp": "2026-07-18T14:00:00Z"
  }
  ```
- [ ] Timeout handling khi ML Service không respond (5s timeout)
- [ ] Timeout handling khi AI Service không respond (30s timeout)
- [ ] Circuit breaker pattern: nếu ML/AI service down → trả fallback message rõ ràng
- [ ] Validate input DTO với class-validator

**Frontend:**
- [ ] Loading skeletons cho tất cả sections
- [ ] Error boundary: hiển thị "Có lỗi xảy ra, thử lại" thay vì crash
- [ ] Toast notifications:
  - ✅ Success: "Lead score đã được cập nhật"
  - ❌ Error: "Không thể kết nối ML Service"
  - ⏳ Loading: "Đang phân tích lead..."
- [ ] Retry button khi API call thất bại
- [ ] Empty states: "Chưa có leads nào" với CTA

---

## TASK-INT-03: Performance Optimization

**Mô tả:** Đảm bảo API response < 3s, UI mượt mà.

**Backend:**
- [ ] Database query optimization:
  - Verify indexes đã có trong Prisma schema (đã định nghĩa trong Phase 1)
  - Kiểm tra N+1 queries bằng Prisma logging
- [ ] Lead Score caching: nếu `predictedAt` < 1 giờ → không re-call ML Service
- [ ] Dashboard queries: dùng Prisma `groupBy` + aggregate thay vì nhiều queries riêng

**Frontend:**
- [ ] Code splitting: lazy load Dashboard charts
- [ ] Image optimization (Next.js `<Image>`)
- [ ] Debounce search inputs (300ms)
- [ ] Prefetch Lead Detail khi hover Lead row
- [ ] `React.memo` cho heavy components (tables, charts)

---

## TASK-INT-04: Docker Compose Full Stack

**Mô tả:** Cập nhật `docker-compose.yml` để chạy toàn bộ 6 services cùng nhau.

**Services:**
```yaml
services:
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    environment: { POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD }
    volumes: ["postgres_data:/var/lib/postgresql/data"]
    healthcheck: { test: pg_isready, interval: 5s }

  qdrant:
    image: qdrant/qdrant:latest
    ports: ["6333:6333", "6334:6334"]
    volumes: ["qdrant_data:/qdrant/storage"]

  api:
    build: ./apps/api
    ports: ["3000:3000"]
    environment: { DATABASE_URL, JWT_SECRET, ML_SERVICE_URL, AI_SERVICE_URL }
    depends_on: { postgres: { condition: service_healthy } }

  ml-service:
    build: ./apps/lead-ml-service
    ports: ["8001:8001"]

  ai-service:
    build: ./apps/sale-ai-service
    ports: ["8002:8002"]
    environment: { QDRANT_URL, GEMINI_API_KEY }
    depends_on: [qdrant]

  web:
    build: ./apps/web
    ports: ["3001:3001"]
    environment: { NEXT_PUBLIC_API_URL }
    depends_on: [api]
```

**Checklist:**
- [ ] Viết `Dockerfile` cho `apps/api` (NestJS)
- [ ] Viết `Dockerfile` cho `apps/lead-ml-service` (FastAPI)
- [ ] Viết `Dockerfile` cho `apps/sale-ai-service` (FastAPI) — nếu chưa có
- [ ] Viết `Dockerfile` cho `apps/web` (Next.js)
- [ ] Cập nhật `docker-compose.yml` đầy đủ các services
- [ ] `.env.example` cho từng service
- [ ] Health checks cho tất cả services
- [ ] `docker compose up --build` chạy thành công
- [ ] Verify inter-service communication đúng

---

## TASK-INT-05: Demo Preparation

**Mô tả:** Chuẩn bị để demo trước ban giám khảo — dữ liệu đẹp, flow mượt.

**Seed Data Enhancement:**
- [ ] 30 customers với profile phong phú và realistic:
  - Đa dạng income: 8M → 80M
  - Đa dạng age: 22-60
  - Đa dạng city: HN, HCM, ĐN, Cần Thơ
  - Đủ loại sản phẩm đang sở hữu
- [ ] 50+ leads với phân bổ đều các status
- [ ] Interaction history phong phú (100+ records)
- [ ] Pre-computed LeadScores cho tất cả leads (không phải gọi ML real-time)
- [ ] 3-5 GeneratedContent mẫu đẹp (email, pitch) cho demo nhanh

**Demo Script (thứ tự demo):**
```
1. [Dashboard] Vào trang Dashboard → Manager nhìn thấy toàn bộ pipeline
   "Đây là dashboard cho Sales Manager..."

2. [Leads List] Vào Leads → filter High Score leads
   "Hệ thống ưu tiên khách hàng score cao..."

3. [Lead Detail] Click vào lead score 90+
   → Customer profile
   → Lead Score với top features
   → Recommended Product (Rule Engine)
   → Next Best Action (AI)

4. [AI Copilot] Generate Email
   → Click Generate → loading 3-5s → email xuất hiện
   "AI đã RAG từ product catalog và sinh email cá nhân hóa..."

5. [AI Chat] Hỏi: "Nên tư vấn gì cho khách hàng này?"
   → Stream response
   → Hiển thị sources

6. [Tasks] Xem tasks hôm nay → Mark done một task
```

**Checklist:**
- [ ] Viết `demo-script.md` chi tiết
- [ ] Chạy thử demo flow ít nhất 2 lần
- [ ] Đảm bảo AI response tiếng Việt chất lượng tốt (tune prompts nếu cần)
- [ ] Screenshot / record screen để backup nếu live demo có vấn đề
- [ ] Chuẩn bị câu trả lời cho câu hỏi kỹ thuật:
  - "Tại sao dùng LightGBM?"
  - "RAG hoạt động như thế nào?"
  - "Scale thế nào trong production?"

---

## Checklist cuối cùng trước Demo

```
Infrastructure:
✅ Docker Compose chạy ổn định
✅ Database seeded với dữ liệu đẹp
✅ Qdrant collections populated

Backend:
✅ Tất cả API endpoints hoạt động
✅ Auth + Authorization đúng
✅ ML Service integration thành công
✅ AI Service integration thành công

Frontend:
✅ Login flow hoạt động
✅ Dashboard charts hiển thị dữ liệu thật
✅ Lead detail đầy đủ thông tin
✅ AI Copilot: Email + Pitch + Chat hoạt động
✅ Responsive trên 1280px+

Demo:
✅ Demo script chuẩn bị xong
✅ Backup screenshots/recording sẵn sàng
✅ Technical Q&A chuẩn bị
```
