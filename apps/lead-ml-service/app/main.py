import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.model.loader import model_loader
from app.predict.router import router as predict_router

app = FastAPI(
    title="SHB Lead Scoring ML Service",
    description="Service API phục vụ dự đoán Lead Score và Conversion Probability",
    version="1.0.0"
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký Predict Router
app.include_router(predict_router)

@app.get("/health")
async def health_check():
    model_loaded = model_loader.model is not None
    return {
        "status": "healthy",
        "modelLoaded": model_loaded
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
