from pydantic import BaseModel, Field

class PitchRequest(BaseModel):
    customerName: str = Field(..., alias="customerName")
    leadScore: int = Field(..., alias="leadScore")
    recommendedProduct: str = Field(..., alias="recommendedProduct")
    conversionProbability: float = Field(..., alias="conversionProbability")
    productReason: str = Field(..., alias="productReason")

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
