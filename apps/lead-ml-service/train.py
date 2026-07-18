import os
import sys
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score
import lightgbm as lgb

# Đảm bảo stdout ghi dưới dạng UTF-8 trên Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass


def generate_synthetic_data(n_samples: int = 5000) -> pd.DataFrame:
    """
    Sinh dữ liệu giả lập mô phỏng hành vi khách hàng của ngân hàng.
    """
    np.random.seed(42)
    
    # Sinh ngẫu nhiên các đặc trưng thô (raw features)
    income = np.random.uniform(5_000_000, 80_000_000, n_samples)
    age = np.random.randint(18, 70, n_samples)
    salary_account = np.random.binomial(1, 0.4, n_samples)
    email_open_count = np.random.poisson(1.5, n_samples)
    email_click_count = np.random.poisson(0.5, n_samples)
    website_visit_count = np.random.poisson(2.0, n_samples)
    loan_inquiry_count = np.random.poisson(0.8, n_samples)
    branch_visit_count = np.random.poisson(0.5, n_samples)
    call_count = np.random.poisson(1.0, n_samples)
    has_saving = np.random.binomial(1, 0.3, n_samples)
    has_credit_card = np.random.binomial(1, 0.25, n_samples)
    has_insurance = np.random.binomial(1, 0.15, n_samples)

    df = pd.DataFrame({
        'income': income,
        'age': age,
        'salary_account': salary_account,
        'email_open_count': email_open_count,
        'email_click_count': email_click_count,
        'website_visit_count': website_visit_count,
        'loan_inquiry_count': loan_inquiry_count,
        'branch_visit_count': branch_visit_count,
        'call_count': call_count,
        'has_saving': has_saving,
        'has_credit_card': has_credit_card,
        'has_insurance': has_insurance
    })

    # Định nghĩa quy tắc gán nhãn converted (0/1):
    # converted = 1 nếu:
    # - income > 25M AND (loan_inquiry > 1 OR website_visit > 3)
    # - hoặc salary_account AND email_open > 2
    cond1 = (df['income'] > 25_000_000) & ((df['loan_inquiry_count'] > 1) | (df['website_visit_count'] > 3))
    cond2 = (df['salary_account'] == 1) & (df['email_open_count'] > 2)
    df['converted'] = (cond1 | cond2).astype(int)

    # Thêm noise ngẫu nhiên khoảng 12%
    noise_mask = np.random.rand(n_samples) < 0.12
    df.loc[noise_mask, 'converted'] = 1 - df.loc[noise_mask, 'converted']

    return df

def preprocess_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Tiền xử lý dữ liệu trước khi train:
    - Scale income (chia cho 1,000,000) để mô hình hội tụ tốt hơn.
    """
    df_processed = df.copy()
    df_processed['income'] = df_processed['income'] / 1_000_000.0
    return df_processed

def main():
    print("--- Khởi tạo quá trình sinh dữ liệu giả lập ---")
    raw_df = generate_synthetic_data(n_samples=5000)
    
    # Tiền xử lý
    df = preprocess_features(raw_df)
    
    # Tách đặc trưng và nhãn
    features = [
        'income', 'age', 'salary_account', 'email_open_count', 'email_click_count',
        'website_visit_count', 'loan_inquiry_count', 'branch_visit_count', 'call_count',
        'has_saving', 'has_credit_card', 'has_insurance'
    ]
    X = df[features]
    y = df['converted']
    
    # Train / Test split 80/20
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print(f"Số mẫu tập Train: {X_train.shape[0]}")
    print(f"Số mẫu tập Test: {X_test.shape[0]}")
    
    # Huấn luyện mô hình LightGBM
    print("\n--- Huấn luyện mô hình LightGBM Classifier ---")
    model = lgb.LGBMClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=6,
        random_state=42,
        verbosity=-1
    )
    model.fit(X_train, y_train)
    
    # Dự đoán trên tập Test
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    # Đánh giá các chỉ số
    auc_roc = roc_auc_score(y_test, y_prob)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    print("\n=== KẾT QUẢ ĐÁNH GIÁ MÔ HÌNH (TẬP TEST) ===")
    print(f"AUC-ROC:   {auc_roc:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print("===========================================\n")
    
    # Tạo thư mục model nếu chưa tồn tại
    os.makedirs("model", exist_ok=True)
    
    # Lưu mô hình
    model_path = "model/lead_scoring.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    print(f"Đã lưu mô hình tại: {model_path}")
    
    # Lưu độ quan trọng của đặc trưng (Feature Importance)
    # Chuẩn hóa độ quan trọng về tổng bằng 1.0
    importances = model.feature_importances_
    total_importance = np.sum(importances)
    normalized_importances = importances / total_importance if total_importance > 0 else importances
    
    feature_importance_dict = {
        feature: float(importance)
        for feature, importance in zip(features, normalized_importances)
    }
    # Sắp xếp giảm dần theo độ quan trọng
    sorted_importance = dict(
        sorted(feature_importance_dict.items(), key=lambda item: item[1], reverse=True)
    )
    
    importance_path = "model/feature_importance.json"
    with open(importance_path, "w", encoding="utf-8") as f:
        json.dump(sorted_importance, f, indent=4, ensure_ascii=False)
    print(f"Đã lưu feature importance tại: {importance_path}")

if __name__ == "__main__":
    main()
