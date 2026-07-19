from pydantic import BaseModel, Field
from typing import Optional

class ProductRecRequest(BaseModel):
    """Request body for product recommendation with RAG."""
    customer_name: str
    age: int
    income: float
    city: str
    occupation: Optional[str] = None
    salary_account: bool = False
    existing_products: list[str] = Field(default_factory=list, description="List of existing product types customer has (e.g., ['LOAN', 'SAVING', 'CREDIT_CARD'])")
    interested_product: Optional[str] = Field(None, description="Product customer is interested in")
    lead_score: int = 50
    conversion_probability: float = 0.5

class ProductRecItem(BaseModel):
    """Single product recommendation."""
    product_name: str
    confidence: float
    reason: str

class ProductRecResponse(BaseModel):
    """Response with product recommendations."""
    recommendations: list[ProductRecItem]
    retrieved_sources: list[str] = Field(default_factory=list)
