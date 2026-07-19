import json
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.email import EmailRequest, EmailResponse
from app.rag.retriever import RAGRetriever
from app.prompt.builder import PromptBuilder
from app.llm.provider import LLMProvider

router = APIRouter()

# Dependency injection factories
def get_retriever() -> RAGRetriever:
    return RAGRetriever()

def get_llm_provider() -> LLMProvider:
    return LLMProvider()

@router.post("/generate-email", response_model=EmailResponse)
async def generate_email(
    request: EmailRequest,
    retriever: RAGRetriever = Depends(get_retriever),
    llm: LLMProvider = Depends(get_llm_provider)
):
    """
    Endpoint to retrieve context, assemble prompt and generate a personalized marketing email.
    Falls back to mock email if LLM is unavailable.
    """
    # 1. Retrieve RAG documents for the recommended product
    docs = retriever.retrieve_for_email(request.recommendedProduct)

    # 2. Extract unique sources/collections of retrieved documents
    sources = list(set(doc.source for doc in docs))

    try:
        # 3. Build prompt using template injector
        prompt = PromptBuilder.build_email_prompt(
            customer_name=request.customerName,
            age=request.age,
            income=request.income,
            city=request.city,
            product_name=request.recommendedProduct,
            lead_score=request.leadScore,
            probability=request.conversionProbability,
            top_features=request.topFeatures if request.topFeatures else [],
            documents=docs
        )

        # 4. Generate JSON output from LLM provider
        llm_response = llm.generate(prompt, max_tokens=8192, is_json=True)

        # 5. Parse JSON output
        data = json.loads(llm_response)

        return EmailResponse(
            subject=data.get("subject", ""),
            body=data.get("body", ""),
            retrievedSources=sources
        )

    except Exception as llm_error:
        # Fallback to mock email when LLM is unavailable
        print(f"[WARN] LLM call failed in email generation, using fallback: {llm_error}")
        subject = f"[SHB] Giải pháp tài chính tối ưu cho anh/chị {request.customerName}"
        body = f"""Thân gửi anh/chị {request.customerName},

Nhận thấy anh/chị đang quan tâm đến sản phẩm {request.recommendedProduct} tại SHB, chúng tôi xin gửi tặng anh/chị chương trình ưu đãi đặc biệt dành cho khách hàng tiềm năng.

{request.productReason if request.productReason else 'Sản phẩm này được đánh giá là phù hợp với nhu cầu tài chính của anh/chị.'}

Để biết thêm chi tiết, vui lòng liên hệ hotline hoặc ghé thăm chi nhánh SHB gần nhất.

Trân trọng,
SHB Sales Copilot"""

        return EmailResponse(
            subject=subject,
            body=body,
            retrievedSources=sources or ["fallback_mock"]
        )
