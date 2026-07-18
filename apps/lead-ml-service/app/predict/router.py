from fastapi import APIRouter, HTTPException
from typing import List
from app.predict.schemas import FeatureInput
from app.predict.service import predict_single, predict_batch
from app.model.loader import model_loader

router = APIRouter(tags=["Prediction"])

@router.post("/predict")
async def api_predict(payload: FeatureInput):
    try:
        return predict_single(payload)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi dự đoán: {str(e)}")

@router.post("/batch-predict")
async def api_batch_predict(payload: List[FeatureInput]):
    try:
        return predict_batch(payload)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi dự đoán hàng loạt: {str(e)}")

@router.get("/model-info")
async def api_model_info():
    if not model_loader.model:
        raise HTTPException(status_code=503, detail="Mô hình chưa được load vào bộ nhớ")
    return model_loader.model_info
