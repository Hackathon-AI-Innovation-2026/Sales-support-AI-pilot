from fastapi import APIRouter

router = APIRouter()

@router.post("/chat")
async def chat():
    # TODO: Implement endpoint
    return {"message": "chat placeholder"}
