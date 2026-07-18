from typing import List
from fastapi import HTTPException
from app.predict.schemas import FeatureInput
from app.feature.processor import preprocess_batch
from app.model.loader import model_loader

def get_top_features(input_dict: dict, global_importances: dict, top_n: int = 3) -> list:
    """
    Kết hợp giữa độ quan trọng đặc trưng toàn cục và giá trị thực tế của khách hàng
    để lọc ra các đặc trưng đóng góp hàng đầu mang tính cá nhân hóa.
    """
    contributions = []
    for feat, importance in global_importances.items():
        val = input_dict.get(feat, 0)
        
        # Chuẩn hóa giá trị đầu vào về khoảng [0, 1] để so sánh
        if feat == 'income':
            val_norm = min(val / 80_000_000.0, 1.0) if val > 1000 else min(val / 80.0, 1.0)
        elif feat == 'age':
            val_norm = min(val / 70.0, 1.0)
        elif isinstance(val, bool):
            val_norm = 1.0 if val else 0.0
        elif isinstance(val, (int, float)):
            val_norm = min(val / 5.0, 1.0)
        else:
            val_norm = 0.0
        
        # Contribution = Global Importance * Local Factor
        contrib = importance * (0.1 + 0.9 * val_norm)
        contributions.append({
            "feature": feat,
            "importance": round(importance, 4),
            "contrib": contrib
        })
        
    # Sắp xếp theo đóng góp cá nhân hóa
    sorted_contrib = sorted(contributions, key=lambda x: x['contrib'], reverse=True)
    return [{"feature": x["feature"], "importance": x["importance"]} for x in sorted_contrib[:top_n]]

def predict_single(input_data: FeatureInput) -> dict:
    if not model_loader.model:
        raise HTTPException(status_code=503, detail="Mô hình chưa được load vào bộ nhớ")
        
    df = preprocess_batch(input_data)
    prob = float(model_loader.model.predict_proba(df)[0][1])
    score = int(round(prob * 100))
    score = min(max(score, 0), 100)
    
    top_features = get_top_features(input_data.model_dump(), model_loader.feature_importance)
    
    return {
        "score": score,
        "probability": round(prob, 4),
        "topFeatures": top_features
    }

def predict_batch(inputs: List[FeatureInput]) -> List[dict]:
    if not model_loader.model:
        raise HTTPException(status_code=503, detail="Mô hình chưa được load vào bộ nhớ")
        
    df = preprocess_batch(inputs)
    probs = model_loader.model.predict_proba(df)[:, 1]
    
    results = []
    for i, item in enumerate(inputs):
        prob = float(probs[i])
        score = int(round(prob * 100))
        score = min(max(score, 0), 100)
        
        top_features = get_top_features(item.model_dump(), model_loader.feature_importance)
        results.append({
            "score": score,
            "probability": round(prob, 4),
            "topFeatures": top_features
        })
        
    return results
