import json
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.product_rec import ProductRecRequest, ProductRecResponse, ProductRecItem
from app.rag.retriever import RAGRetriever
from app.prompt.builder import PromptBuilder
from app.llm.provider import LLMProvider

router = APIRouter()

def get_retriever() -> RAGRetriever:
    return RAGRetriever()

def get_llm_provider() -> LLMProvider:
    return LLMProvider()

def _get_product_context(product_name: str, retriever: RAGRetriever) -> tuple:
    """Retrieve RAG documents for product recommendations."""
    docs = retriever.retrieve_for_email(product_name)
    sources = list(set(doc.source for doc in docs))
    return docs, sources

def _generate_mock_recommendations(request: ProductRecRequest) -> list[ProductRecItem]:
    """Generate mock recommendations when LLM is unavailable."""
    recommendations = []

    # Simple rule-based fallback recommendations
    if request.income > 30000000 and 'Credit Card' not in request.existing_products:
        recommendations.append(ProductRecItem(
            product_name="SHB Visa Platinum",
            confidence=0.85,
            reason=f"Thu nhập {request.income/1000000:.0f}M VND/tháng phù hợp với thẻ tín dụng cao cấp"
        ))

    if request.income > 15000000 and 'Savings Account' not in request.existing_products:
        recommendations.append(ProductRecItem(
            product_name="SHB Savings Account",
            confidence=0.75,
            reason="Nên bắt đầu tiết kiệm với lãi suất ưu đãi từ SHB"
        ))

    if request.age >= 25 and request.income > 20000000 and 'Loan' not in str(request.existing_products):
        recommendations.append(ProductRecItem(
            product_name="Personal Loan",
            confidence=0.7,
            reason=f"Với thu nhập ổn định, khoản vay cá nhân là giải pháp tài chính phù hợp"
        ))

    if not recommendations:
        recommendations.append(ProductRecItem(
            product_name="SHB Basic Account",
            confidence=0.6,
            reason="Tài khoản cơ bản với nhiều tiện ích miễn phí"
        ))

    return recommendations

@router.post("/recommend-product", response_model=ProductRecResponse)
async def recommend_product(
    request: ProductRecRequest,
    retriever: RAGRetriever = Depends(get_retriever),
    llm: LLMProvider = Depends(get_llm_provider)
):
    """
    Generate product recommendations using RAG and LLM.
    Analyzes customer profile and queries knowledge base to recommend suitable products.
    Falls back to rule-based recommendations if LLM is unavailable.
    """
    try:
        # 1. Build query for RAG based on customer profile
        query = f"{request.interested_product or ''} {request.customer_name} {request.occupation}"

        # 2. Retrieve relevant documents from RAG
        docs, sources = _get_product_context(query, retriever)

        # 3. Build prompt with customer data and RAG context
        prompt = PromptBuilder.build_product_rec_prompt(
            customer_name=request.customer_name,
            age=request.age,
            income=request.income,
            city=request.city,
            occupation=request.occupation or "Chưa xác định",
            salary_account=request.salary_account,
            existing_products=request.existing_products,
            interested_product=request.interested_product or "",
            lead_score=request.lead_score,
            conversion_probability=request.conversion_probability,
            documents=docs
        )

        # 4. Generate recommendations using LLM
        try:
            llm_response = llm.generate(prompt, max_tokens=8192, is_json=True)

            # 5. Parse JSON response
            data = json.loads(llm_response)

            recommendations = []
            for rec in data.get("recommendations", []):
                recommendations.append(ProductRecItem(
                    product_name=rec.get("product_name", ""),
                    confidence=rec.get("confidence", 0.0),
                    reason=rec.get("reason", "")
                ))
        except Exception as llm_error:
            # Fallback to rule-based recommendations if LLM fails
            print(f"[WARN] LLM call failed, using fallback: {llm_error}")
            recommendations = _generate_mock_recommendations(request)
            sources = ["fallback_rules"]

        return ProductRecResponse(
            recommendations=recommendations,
            retrieved_sources=sources
        )

    except ValueError as val_err:
        raise HTTPException(status_code=500, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")
