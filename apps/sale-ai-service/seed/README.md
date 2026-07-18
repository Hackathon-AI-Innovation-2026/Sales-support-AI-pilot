# Qdrant Seed Data

Dữ liệu seed cho Knowledge Base (Qdrant) của Sales Support AI Copilot - SHB.

## Cấu trúc Collections

| File CSV | Qdrant Collection | Mô tả | Số records |
|---|---|---|---|
| `product_catalog.csv` | `product_catalog` | Danh mục sản phẩm ngân hàng SHB | 12 |
| `faq.csv` | `faq` | Câu hỏi thường gặp của khách hàng | 15 |
| `banking_policy.csv` | `banking_policy` | Quy định và chính sách nội bộ | 10 |
| `promotions.csv` | `promotions` | Chương trình khuyến mãi hiện hành | 10 |
| `competitor_info.csv` | `competitor_info` | Thông tin sản phẩm đối thủ cạnh tranh | 10 |
| `sales_guideline.csv` | `sales_guideline` | Quy trình và kỹ thuật bán hàng | 10 |

## Schema mỗi Collection

### product_catalog
```
id, title, category, content, tags
```
- `content` → text được embedding
- `category`: Credit Card / Home Loan / Personal Loan / Savings / Investment / Insurance

### faq
```
id, question, answer, category, tags
```
- `content` để embed = `question + " " + answer`
- `category`: credit card / home loan / savings / general / loan

### banking_policy
```
id, title, category, content, effective_date, tags
```
- `content` → text được embedding
- `category`: Credit Card Policy / Loan Policy / Risk Policy / VIP Policy...

### promotions
```
id, title, product_type, start_date, end_date, content, target_segment, tags
```
- `content` → text được embedding
- Lưu ý lọc theo `end_date` để chỉ lấy khuyến mãi còn hiệu lực

### competitor_info
```
id, bank_name, product_name, product_type, content, shb_advantage, tags
```
- Embed cả `content` và `shb_advantage` để AI có thể trả lời khi khách so sánh
- `bank_name`: VPBank / Techcombank / BIDV / Vietcombank / MB / HSBC...

### sales_guideline
```
id, title, product_type, scenario, guideline_steps, tips, tags
```
- Embed cả `scenario + guideline_steps + tips`

## Cách sử dụng

### 1. Cài đặt dependencies
```bash
pip install qdrant-client sentence-transformers pandas
```

### 2. Chạy script import
```bash
python seed/import_to_qdrant.py
```

### 3. Cấu hình
Chỉnh sửa biến trong `import_to_qdrant.py`:
```python
QDRANT_URL = "http://localhost:6333"
EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
```

## Mô hình Embedding được đề xuất

Vì dữ liệu là **tiếng Việt**, sử dụng một trong các model sau:
- `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (nhẹ, nhanh)
- `VoVanPhuc/sup-SimCSE-VietNamese-phobert-base` (tiếng Việt tốt hơn)
- `text-embedding-ada-002` của OpenAI (nếu dùng API)

## Ghi chú
- Dữ liệu này là **mock data** cho mục đích demo hackathon
- Trong production, nội dung nên được cập nhật từ hệ thống CMS của ngân hàng
- Lãi suất và ưu đãi trong file phản ánh thời điểm tháng 7/2026 (dữ liệu giả lập)
