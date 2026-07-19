from fastapi import APIRouter, HTTPException, Depends
from app.schemas.pitch import PitchRequest, PitchResponse
from app.rag.retriever import RAGRetriever
from app.prompt.builder import PromptBuilder
from app.llm.provider import LLMProvider

router = APIRouter()

# Dependency injection factories
def get_retriever() -> RAGRetriever:
    return RAGRetriever()

def get_llm_provider() -> LLMProvider:
    return LLMProvider()

@router.post("/generate-pitch", response_model=PitchResponse)
async def generate_pitch(
    request: PitchRequest,
    retriever: RAGRetriever = Depends(get_retriever),
    llm: LLMProvider = Depends(get_llm_provider)
):
    """
    Endpoint to retrieve sales guidelines, product info, and FAQs to generate a concise sales pitch.
    Falls back to mock pitch if LLM is unavailable.
    """
    # 1. Retrieve RAG documents for pitch
    docs = retriever.retrieve_for_pitch(request.recommendedProduct)

    # 2. Extract sources
    sources = list(set(doc.source for doc in docs))

    try:
        # 3. Build prompt
        confidence = request.confidence or request.conversionProbability or 0.5
        product_reason = request.productReason or f"Sản phẩm phù hợp với khách hàng {request.customerName}"
        prompt = PromptBuilder.build_pitch_prompt(
            customer_name=request.customerName,
            lead_score=request.leadScore,
            product_name=request.recommendedProduct,
            confidence=confidence,
            product_reason=product_reason,
            documents=docs
        )

        # 4. Generate content
        pitch_text = llm.generate(prompt, max_tokens=8192)

        return PitchResponse(
            pitch=pitch_text.strip(),
            retrievedSources=sources
        )

    except Exception as llm_error:
        # Fallback to mock pitch when LLM is unavailable
        print(f"[WARN] LLM call failed in pitch generation, using fallback: {llm_error}")
        pitch_text = f"""Chào anh/chị {request.customerName}, em gọi điện hỗ trợ từ ngân hàng SHB. Em thấy mình đang tìm hiểu về sản phẩm {request.recommendedProduct}. Đây là dòng sản phẩm cực kỳ phù hợp với hồ sơ của mình với nhiều ưu đãi lãi suất và đặc quyền đi kèm. Em xin phép chia sẻ thêm thông tin chi tiết ạ."""

        return PitchResponse(
            pitch=pitch_text,
            retrievedSources=sources or ["fallback_mock"]
        )
