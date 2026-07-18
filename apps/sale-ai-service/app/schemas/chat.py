from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    conversationHistory: list[ChatMessage] = Field(default_factory=list, alias="conversationHistory")
    customerContext: dict | None = Field(None, alias="customerContext")

    model_config = {
        "populate_by_name": True,
        "populate_by_alias": True
    }

class ChatSyncResponse(BaseModel):
    response: str
