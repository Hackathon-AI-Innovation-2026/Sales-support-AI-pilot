# Phase 3 — ML Service (FastAPI + LightGBM)

> **Mục tiêu:** Xây dựng service độc lập nhận feature vector từ NestJS, trả về Lead Score và Conversion Probability.

---

## Tổng quan

| Thông tin | Chi tiết |
|-----------|----------|
| Thứ tự | Phase 3 (song song với Phase 4) |
| Độ phức tạp | 🟡 Trung bình |
| Phụ thuộc | Phase 1 (infrastructure) |
| Unblock | Phase 2 TASK-BE-04 (Lead Scoring), Phase 6 |
| Service | `apps/lead-ml-service` — FastAPI + LightGBM |

**Nguyên tắc thiết kế:**
- ML Service **không** truy cập PostgreSQL trực tiếp
- NestJS chịu trách nhiệm **feature engineering** từ raw data
- ML Service chỉ nhận **feature vector đã chuẩn bị** và trả về predictions

---

## TASK-ML-01: Project Setup

**Mô tả:** Khởi tạo cấu trúc dự án FastAPI cho ML Service.

**Cấu trúc thư mục:**
```
apps/lead-ml-service/
├── app/
│   ├── main.py              — FastAPI app entry point
│   ├── config.py            — Settings (port, model path, ...)
│   ├── predict/
│   │   ├── router.py        — API routes
│   │   ├── schemas.py       — Pydantic models (input/output)
│   │   └── service.py       — Prediction logic
│   ├── feature/
│   │   └── processor.py     — Feature validation & preprocessing
│   └── model/
│       └── loader.py        — Load model từ disk
├── model/
│   └── lead_scoring.pkl     — Trained model file
├── train.py                 — Script train model
├── requirements.txt
├── Dockerfile
└── .env
```

**Checklist:**
- [ ] Khởi tạo cấu trúc thư mục trên
- [ ] `requirements.txt`:
  ```
  fastapi
  uvicorn
  lightgbm
  scikit-learn
  numpy
  pandas
  python-dotenv
  pydantic-settings
  ```
- [ ] `main.py` — FastAPI app với CORS middleware
- [ ] CORS cho phép NestJS gọi (từ `API_URL` trong env)
- [ ] `GET /health` — health check endpoint
- [ ] `Dockerfile` với multi-stage build

---

## TASK-ML-02: Model Training

**Mô tả:** Train LightGBM model trên synthetic dataset mô phỏng hành vi khách hàng ngân hàng.

**Features (10 features):**

| Feature | Type | Mô tả |
|---------|------|--------|
| `income` | float | Thu nhập tháng (VND) |
| `age` | int | Tuổi |
| `salary_account` | bool (0/1) | Nhận lương qua SHB |
| `email_open_count` | int | Số lần mở email (30 ngày) |
| `email_click_count` | int | Số lần click email (30 ngày) |
| `website_visit_count` | int | Số lần visit website (30 ngày) |
| `loan_inquiry_count` | int | Số lần hỏi về vay vốn (30 ngày) |
| `branch_visit_count` | int | Số lần đến chi nhánh (30 ngày) |
| `call_count` | int | Số cuộc gọi (30 ngày) |
| `has_saving` | bool (0/1) | Có tài khoản tiết kiệm |
| `has_credit_card` | bool (0/1) | Có thẻ tín dụng |
| `has_insurance` | bool (0/1) | Có bảo hiểm |

**Target:** `converted` (0/1) — khách hàng có mua sản phẩm không

**Synthetic Data Generation:**
```python
# Quy tắc sinh label:
# converted = 1 nếu:
#   income > 25M AND (loan_inquiry > 1 OR website_visit > 3)
#   hoặc salary_account AND email_open > 2
#   với noise ngẫu nhiên 10-15%
```

**Checklist:**
- [ ] `train.py` — generate 5000 synthetic samples
- [ ] Train/Test split 80/20
- [ ] Train LightGBM classifier
- [ ] Hyperparameters: `n_estimators=200`, `learning_rate=0.05`, `max_depth=6`
- [ ] Evaluate: AUC-ROC, Precision, Recall, F1
- [ ] Save model: `model/lead_scoring.pkl`
- [ ] Save feature importance: `model/feature_importance.json`
- [ ] Log training metrics vào console

---

## TASK-ML-03: Feature Processing

**Mô tả:** Validate và preprocess feature vector nhận từ NestJS trước khi đưa vào model.

**Input schema (từ NestJS):**
```json
{
  "income": 30000000,
  "age": 35,
  "salaryAccount": true,
  "emailOpenCount": 3,
  "emailClickCount": 1,
  "websiteVisitCount": 5,
  "loanInquiryCount": 2,
  "branchVisitCount": 1,
  "callCount": 0,
  "hasSaving": true,
  "hasCreditCard": false,
  "hasInsurance": false
}
```

**Checklist:**
- [ ] `feature/processor.py`:
  - Validate types và ranges
  - Convert camelCase → snake_case
  - Handle missing values (default: 0)
  - Scale income (chia cho 1,000,000 để normalize)
  - Convert bool → int (0/1)
- [ ] Pydantic schema `FeatureInput` với validators
- [ ] Unit test cho feature processor

---

## TASK-ML-04: Predict API

**Mô tả:** Expose prediction endpoints theo contract với NestJS.

**Endpoints:**

### `POST /predict`
```json
// Request
{
  "income": 30000000,
  "age": 35,
  "salaryAccount": true,
  "emailOpenCount": 3,
  "emailClickCount": 1,
  "websiteVisitCount": 5,
  "loanInquiryCount": 2,
  "branchVisitCount": 1,
  "callCount": 0,
  "hasSaving": true,
  "hasCreditCard": false,
  "hasInsurance": false
}

// Response
{
  "score": 87,
  "probability": 0.87,
  "topFeatures": [
    { "feature": "loan_inquiry_count", "importance": 0.32 },
    { "feature": "website_visit_count", "importance": 0.24 },
    { "feature": "income", "importance": 0.18 }
  ]
}
```

### `POST /batch-predict`
```json
// Request: array of feature objects
[{ ...feature1 }, { ...feature2 }]

// Response: array of predictions
[{ "score": 87, "probability": 0.87, "topFeatures": [...] }]
```

### `GET /model-info`
```json
{
  "version": "1.0.0",
  "algorithm": "LightGBM",
  "trainedAt": "2026-07-18",
  "features": [...],
  "performance": {
    "aucRoc": 0.91,
    "precision": 0.84,
    "recall": 0.79
  }
}
```

### `GET /health`
```json
{ "status": "healthy", "modelLoaded": true }
```

**Checklist:**
- [ ] `predict/router.py` — định nghĩa routes
- [ ] `predict/service.py` — gọi feature processor + model
- [ ] Score = round(probability * 100) capped 0-100
- [ ] Top features từ model's `feature_importances_` kết hợp input values
- [ ] Error handling: model chưa load, feature validation fail
- [ ] Response time < 200ms cho single predict

---

## Kết quả mong đợi sau Phase 3

```
✅ ML Service chạy trên port 8001
✅ POST /predict trả về score + probability trong < 200ms
✅ Model có AUC-ROC >= 0.85
✅ NestJS có thể gọi và nhận kết quả đúng format
✅ Docker image build thành công
```
