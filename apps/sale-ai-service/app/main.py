from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import email, pitch, chat, nba, product_rec

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic: print settings info
    print(f"Starting SHB Sales AI Service on host {settings.HOST}:{settings.PORT}...")
    print(f"Configured LLM Provider: {settings.LLM_PROVIDER}")
    print(f"Qdrant DB URL: {settings.QDRANT_URL}")
    yield
    # Shutdown logic
    print("Shutting down SHB Sales AI Service...")

app = FastAPI(
    title="SHB Sales Support AI Service",
    description="FastAPI + LangChain + Gemini service for email, pitch, chat, and next-best-action.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(email.router, tags=["Email Generator"])
app.include_router(pitch.router, tags=["Pitch Generator"])
app.include_router(chat.router, tags=["AI Copilot Chat"])
app.include_router(nba.router, tags=["Next Best Action"])
app.include_router(product_rec.router, tags=["Product Recommendation"])

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "sale-ai-service",
        "llm_provider": settings.LLM_PROVIDER
    }
