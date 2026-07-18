from pydantic import BaseModel, Field

class EmailRequest(BaseModel):
    customerName: str = Field(..., alias="customerName")
    age: int | None = None
    income: float | None = None
    city: str | None = None
    leadScore: int | None = Field(None, alias="leadScore")
    conversionProbability: float | None = Field(None, alias="conversionProbability")
    recommendedProduct: str = Field(..., alias="recommendedProduct")
    productReason: str | None = Field(None, alias="productReason")
    topFeatures: list[str] | None = Field(None, alias="topFeatures")

    model_config = {
        "populate_by_name": True,
        "populate_by_alias": True
    }

class EmailResponse(BaseModel):
    subject: str
    body: str
    retrievedSources: list[str] = Field(default_factory=list, alias="retrievedSources")

    model_config = {
        "populate_by_name": True,
        "populate_by_alias": True
    }
