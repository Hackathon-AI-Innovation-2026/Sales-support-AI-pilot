from pydantic import BaseModel, Field

class NBARequest(BaseModel):
    leadScore: int = Field(..., alias="leadScore")
    conversionProbability: float = Field(..., alias="conversionProbability")
    interestedProduct: str = Field(..., alias="interestedProduct")
    interactions: dict = Field(default_factory=dict, alias="interactions")
    recentInteractionsText: str | None = Field(None, alias="recentInteractionsText")

    model_config = {
        "populate_by_name": True,
        "populate_by_alias": True
    }

class NBAResponse(BaseModel):
    action: str
    priority: str
    reason: str
    suggestedContent: str = Field(..., alias="suggestedContent")

    model_config = {
        "populate_by_name": True,
        "populate_by_alias": True
    }
