# 03 — ML Service (FastAPI + LightGBM)

## Mục tiêu
Xây dựng service độc lập nhận Feature Vector từ NestJS, chạy LightGBM model để dự đoán Lead Score và Conversion Probability.

---

## Stack
- **Framework**: FastAPI
- **ML Model**: LightGBM
- **Serialization**: Pickle / joblib
- **Data Processing**: pandas, numpy, scikit-learn
- **Port**: 8001

---

## Cấu trúc thư mục

```
ml-service/
├── app/
│   ├── main.py
│   ├── routers/
│   │   ├── predict.py
│   │   └── model_info.py
│   ├── services/
│   │   ├── prediction_service.py
│   │   └── feature_service.py
│   ├── models/
│   │   └── lead_score_model.pkl      ← trained model
│   ├── schemas/
│   │   ├── predict_request.py
│   │   └── predict_response.py
│   └── config.py
├── training/
│   ├── generate_dataset.py           ← tạo synthetic data
│   ├── train_model.py                ← train LightGBM
│   ├── evaluate_model.py
│   └── data/
│       └── synthetic_leads.csv
├── requirements.txt
└── Dockerfile
```

---

## Tasks

### TASK-ML-01 — Project Setup

- [ ] Khởi tạo FastAPI project
- [ ] `requirements.txt`:
  ```
  fastapi
  uvicorn
  lightgbm
  scikit-learn
  pandas
  numpy
  joblib
  pydantic
  python-dotenv
  ```
- [ ] `main.py`: setup CORS, include routers
- [ ] Health check: `GET /health`

---

### TASK-ML-02 — Thiết kế Feature Set

**Spec**: Danh sách features đầu vào cho LightGBM.

| Feature | Type | Mô tả |
|---|---|---|
| `age` | int | Tuổi khách hàng |
| `income` | float | Thu nhập hàng tháng (VND) |
| `salary_account` | bool | Nhận lương qua SHB |
| `has_credit_card` | bool | Đang có thẻ tín dụng |
| `has_loan` | bool | Đang có khoản vay |
| `has_saving` | bool | Đang có tài khoản tiết kiệm |
| `has_insurance` | bool | Đang có bảo hiểm |
| `email_open_count` | int | Số email đã mở (30 ngày) |
| `email_click_count` | int | Số email đã click (30 ngày) |
| `website_visit_count` | int | Số lần truy cập website (30 ngày) |
| `loan_inquiry_count` | int | Số lần hỏi về vay (30 ngày) |
| `branch_visit_count` | int | Số lần đến chi nhánh (30 ngày) |
| `call_count` | int | Số cuộc gọi (30 ngày) |
| `days_since_last_interaction` | int | Số ngày kể từ tương tác gần nhất |
| `total_interaction_count` | int | Tổng số tương tác (90 ngày) |

---

### TASK-ML-03 — Request/Response Schema

```python
# schemas/predict_request.py
class PredictRequest(BaseModel):
    age: Optional[int] = None
    income: Optional[float] = None
    salary_account: bool = False
    has_credit_card: bool = False
    has_loan: bool = False
    has_saving: bool = False
    has_insurance: bool = False
    email_open_count: int = 0
    email_click_count: int = 0
    website_visit_count: int = 0
    loan_inquiry_count: int = 0
    branch_visit_count: int = 0
    call_count: int = 0
    days_since_last_interaction: int = 30
    total_interaction_count: int = 0

class BatchPredictRequest(BaseModel):
    leads: List[PredictRequest]

# schemas/predict_response.py
class PredictResponse(BaseModel):
    score: float               # 0-100
    probability: float         # 0-1
    top_features: List[str]    # top 3 features ảnh hưởng nhất

class BatchPredictResponse(BaseModel):
    results: List[PredictResponse]
```

---

### TASK-ML-04 — Tạo Synthetic Dataset

**Spec**: Do không có dữ liệu thực, tạo dataset giả lập với logic hợp lý để train model.

```python
# training/generate_dataset.py

# Dataset: 5000 records
# Target: converted (0/1)
# Logic:
#   - income cao + nhiều tương tác → converted = 1 cao hơn
#   - loan_inquiry > 0 → converted = 1 cao hơn
#   - days_since_last_interaction > 30 → converted = 0 cao hơn
#   - salary_account = True → converted = 1 cao hơn
```

- [ ] Generate 5000 records với `np.random` + business logic
- [ ] Tỷ lệ converted: 30% (class imbalance xử lý bằng `scale_pos_weight`)
- [ ] Lưu thành `data/synthetic_leads.csv`
- [ ] Kiểm tra distribution của các features

---

### TASK-ML-05 — Train LightGBM Model

```python
# training/train_model.py
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report

# 1. Load dataset
# 2. Split train/test (80/20)
# 3. Train LightGBM Classifier
params = {
    "objective": "binary",
    "metric": "auc",
    "learning_rate": 0.05,
    "num_leaves": 31,
    "n_estimators": 200,
    "scale_pos_weight": 2.3,  # handle imbalance
}
# 4. Evaluate: AUC, Precision, Recall
# 5. Save model: joblib.dump(model, "app/models/lead_score_model.pkl")
# 6. Save feature names list
```

- [ ] AUC target: ≥ 0.80 trên test set
- [ ] Log kết quả evaluation vào console
- [ ] Lưu `model_version` (timestamp hoặc git hash)

---

### TASK-ML-06 — Prediction Service

```python
# services/prediction_service.py
class PredictionService:
    def __init__(self):
        self.model = joblib.load("models/lead_score_model.pkl")
        self.feature_names = [...]
        self.model_version = "v1.0.0"

    def predict(self, request: PredictRequest) -> PredictResponse:
        # 1. Convert request to DataFrame
        # 2. Handle missing values (fillna with median)
        # 3. model.predict_proba() → probability
        # 4. score = probability * 100 (rounded)
        # 5. Get top features: model.feature_importances_
        # 6. Return PredictResponse
```

- [ ] Xử lý missing values (age, income có thể None)
- [ ] `top_features`: lấy 3 features có importance cao nhất có giá trị != 0 trong request này
- [ ] Score = round(probability * 100, 1)

---

### TASK-ML-07 — API Endpoints

```python
# routers/predict.py
@router.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    return prediction_service.predict(request)

@router.post("/batch-predict", response_model=BatchPredictResponse)
async def batch_predict(request: BatchPredictRequest):
    results = [prediction_service.predict(lead) for lead in request.leads]
    return BatchPredictResponse(results=results)

# routers/model_info.py
@router.get("/model-info")
async def model_info():
    return {
        "version": prediction_service.model_version,
        "features": prediction_service.feature_names,
        "trained_at": "2026-07-18",
        "algorithm": "LightGBM",
    }
```

- [ ] `POST /predict`
- [ ] `POST /batch-predict`
- [ ] `GET /model-info`
- [ ] `GET /health`

---

### TASK-ML-08 — Error Handling

- [ ] Input validation: tất cả numeric features phải >= 0
- [ ] Nếu model chưa load → trả về 503 Service Unavailable
- [ ] Log lỗi với timestamp
- [ ] Timeout nếu inference > 5s (edge case)

---

### TASK-ML-09 — Testing

- [ ] Unit test `PredictionService.predict()` với mock data
- [ ] Test edge case: tất cả features = 0
- [ ] Test batch predict với 100 leads
- [ ] Performance test: 100 requests/s (single instance)
