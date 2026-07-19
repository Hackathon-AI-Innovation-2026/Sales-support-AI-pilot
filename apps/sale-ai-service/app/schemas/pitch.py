from pydantic import BaseModel, Field

class PitchRequest(BaseModel):
    customerName: str = Field(..., alias="customerName")
    leadScore: int = Field(..., alias="leadScore")
    recommendedProduct: str = Field(..., alias="recommendedProduct")
    confidence: float | None = Field(None, alias="confidence")
    conversionProbability: float | None = Field(None, alias="conversionProbability")
    productReason: str | None = Field(None, alias="productReason")

    model_config = {
        "populate_by_name": True,
        "populate_by_alias": True
    }

class PitchResponse(BaseModel):
    pitch: str
    retrievedSources: list[str] = Field(default_factory=list, alias="retrievedSources")

    model_config = {
        "populate_by_name": True,
        "populate_by_alias": True
    }
