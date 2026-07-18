# Phase 1 — Infrastructure & Foundation

> **Mục tiêu:** Đảm bảo toàn bộ hạ tầng chạy được local, migrate schema, seed dữ liệu trước khi bắt đầu phát triển tính năng.

---

## Tổng quan

| Thông tin | Chi tiết |
|-----------|----------|
| Thứ tự | Phase 1 (đầu tiên) |
| Độ phức tạp | 🟢 Thấp |
| Phụ thuộc | Không có |
| Unblock | Phase 2, Phase 3, Phase 4, Phase 5 |

---

## TASK-INF-01: Chạy Docker Compose (PostgreSQL + Qdrant)

**Mô tả:** Khởi động infrastructure services cần thiết cho toàn bộ dự án.

**Checklist:**
- [ ] Kiểm tra `docker-compose.yml` có đầy đủ các service: `postgres`, `qdrant`
- [ ] Cấu hình biến môi trường: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- [ ] Chạy `docker compose up -d`
- [ ] Verify PostgreSQL: connect trên port `5432`
- [ ] Verify Qdrant: truy cập dashboard tại `http://localhost:6333/dashboard`
- [ ] Kiểm tra `.env` của `apps/api` đã trỏ đúng `DATABASE_URL`

**Commands:**
```bash
docker compose up -d
docker compose ps  # kiểm tra status
```

---

## TASK-INF-02: Migrate Database (Prisma)

**Mô tả:** Chạy migration để tạo toàn bộ schema trong PostgreSQL.

**Checklist:**
- [ ] Chạy `prisma migrate dev --name init` tại `apps/api`
- [ ] Verify 11 bảng đã được tạo:
  - `User`
  - `Customer`
  - `CustomerProduct`
  - `CustomerInteraction`
  - `Lead`
  - `LeadScore`
  - `ProductRecommendation`
  - `Recommendation`
  - `GeneratedContent`
  - `SalesTask`
- [ ] Kiểm tra Prisma Client được generate thành công

**Commands:**
```bash
cd apps/api
pnpm prisma migrate dev --name init
pnpm prisma generate
```

---

## TASK-INF-03: Seed PostgreSQL

**Mô tả:** Chạy seed script để tạo dữ liệu mẫu phục vụ development và demo.

**Checklist:**
- [ ] Chạy `prisma/seed.ts` tại `apps/api`
- [ ] Verify dữ liệu đã seed:
  - Users: ít nhất 1 SALES, 1 MANAGER, 1 ADMIN
  - Customers: 20–30 khách hàng với đầy đủ profile
  - CustomerProducts: sản phẩm đang sở hữu của từng khách
  - CustomerInteractions: lịch sử tương tác (email open, website visit, loan inquiry...)
  - Leads: 30–50 leads với các status khác nhau
  - LeadScores: điểm mẫu cho mỗi lead

**Commands:**
```bash
cd apps/api
pnpm prisma db seed
```

---

## TASK-INF-04: Import Qdrant Knowledge Base

**Mô tả:** Import toàn bộ knowledge base vào Qdrant phục vụ RAG của AI Service.

**Checklist:**
- [ ] Đảm bảo Qdrant đang chạy (TASK-INF-01)
- [ ] Cài đặt Python dependencies cho import script
- [ ] Chạy `import_to_qdrant.py` tại `apps/sale-ai-service/seed/`
- [ ] Verify 6 collections đã được tạo:
  - `product_catalog` — thông tin sản phẩm SHB
  - `faq` — câu hỏi thường gặp
  - `banking_policy` — chính sách ngân hàng
  - `promotions` — chương trình khuyến mãi
  - `competitor_info` — thông tin ngân hàng đối thủ
  - `sales_guideline` — quy trình bán hàng
- [ ] Kiểm tra số lượng vectors trong mỗi collection qua Qdrant Dashboard

**Commands:**
```bash
cd apps/sale-ai-service/seed
pip install qdrant-client sentence-transformers pandas
python import_to_qdrant.py
```

---

## Kết quả mong đợi sau Phase 1

```
✅ PostgreSQL running on localhost:5432
✅ Qdrant running on localhost:6333
✅ 11 tables created in DB
✅ Seed data loaded (~30 customers, ~50 leads)
✅ 6 Qdrant collections populated
✅ Environment ready for development
```
