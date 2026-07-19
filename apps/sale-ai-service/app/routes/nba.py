import json
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.nba import NBARequest, NBAResponse
from app.rag.retriever import RAGRetriever
from app.prompt.builder import PromptBuilder
from app.llm.provider import LLMProvider

router = APIRouter()

# Dependency injection factories
def get_retriever() -> RAGRetriever:
    return RAGRetriever()

def get_llm_provider() -> LLMProvider:
    return LLMProvider()

def _get_fallback_nba(lead_score: int, probability: float, interested_product: str) -> NBAResponse:
    """Generate fallback NBA when LLM is unavailable."""
    if lead_score >= 80:
        return NBAResponse(
            action="CALL",
            priority="HIGH",
            reason=f"Khách hàng có điểm tiềm năng rất cao ({lead_score}/100). Cần gọi điện trực tiếp hỗ trợ ngay.",
            suggestedContent=f"Chào anh/chị, em là chuyên viên tư vấn từ SHB. Em thấy mình đang quan tâm đến sản phẩm {interested_product} và có điểm tín nhiệm rất tốt."
        )
    elif lead_score >= 60:
        return NBAResponse(
            action="EMAIL",
            priority="MEDIUM",
            reason=f"Khách hàng có điểm tiềm năng khá ({lead_score}/100). Gửi email giới thiệu sản phẩm và ưu đãi.",
            suggestedContent=f"Chào anh/chị, cảm ơn đã quan tâm đến sản phẩm {interested_product} của SHB. Chúng tôi xin gửi thông tin chi tiết về ưu đãi đặc biệt dành cho bạn."
        )
    elif lead_score >= 40:
        return NBAResponse(
            action="MEETING",
            priority="MEDIUM",
            reason=f"Khách hàng có điểm tiềm năng trung bình ({lead_score}/100). Cần thiết lập cuộc hẹn để tư vấn chi tiết.",
            suggestedContent=f"Chào anh/chị, để có thể giải đáp chi tiết về sản phẩm {interested_product}, em xin phép hẹn anh/chị một buổi tư vấn ngắn tại chi nhánh SHB gần nhất."
        )
    else:
        return NBAResponse(
            action="WAIT",
            priority="LOW",
            reason=f"Điểm tiềm năng thấp ({lead_score}/100). Đề xuất chờ thêm tương tác từ khách hàng.",
            suggestedContent="Tiếp tục theo dõi các lượt tương tác của khách hàng trên hệ thống."
        )

@router.post("/next-best-action", response_model=NBAResponse)
async def next_best_action(
    request: NBARequest,
    retriever: RAGRetriever = Depends(get_retriever),
    llm: LLMProvider = Depends(get_llm_provider)
):
    """
    Endpoint to analyze lead and recommend next best action using LLM.
    LLM analyzes interaction history and decides the optimal action and priority.
    Falls back to rule-based recommendations if LLM is unavailable.
    """
    try:
        # 1. Retrieve guidelines from Qdrant Vector DB
        docs = retriever.retrieve_for_nba(request.interestedProduct or "sales guideline")

        # 2. Format recent interactions to string if text is not provided
        recent_text = request.recentInteractionsText
        if not recent_text:
            if request.interactions:
                recent_text = "\n".join(f"- {k}: {v}" for k, v in request.interactions.items())
            else:
                recent_text = "Không có tương tác gần đây"

        # 3. Build prompt - LLM will decide action and priority
        prompt = PromptBuilder.build_nba_prompt(
            lead_score=request.leadScore,
            probability=request.conversionProbability,
            recent_interactions=recent_text,
            interested_product=request.interestedProduct or "Chưa xác định",
            documents=docs,
            action="LLM sẽ quyết định",  # Placeholder - LLM decides
            priority="LLM sẽ quyết định"  # Placeholder - LLM decides
        )

        # 4. Call LLM (using JSON mode) to get explanation and suggested content
        try:
            llm_response = llm.generate(prompt, max_tokens=8192, is_json=True)

            # 5. Parse result
            data = json.loads(llm_response)

            # Validate and normalize action
            action_map = {"CALL": "CALL", "EMAIL": "EMAIL", "MEETING": "MEETING", "WAIT": "WAIT"}
            action = action_map.get(data.get("action", "").upper(), "WAIT")

            # Validate and normalize priority
            priority_map = {"HIGH": "HIGH", "MEDIUM": "MEDIUM", "LOW": "LOW"}
            priority = priority_map.get(data.get("priority", "").upper(), "MEDIUM")

            return NBAResponse(
                action=action,
                priority=priority,
                reason=data.get("reason", ""),
                suggestedContent=data.get("suggestedContent", "")
            )
        except Exception as llm_error:
            # Fallback to rule-based recommendations if LLM fails
            print(f"[WARN] LLM call failed in NBA, using fallback: {llm_error}")
            return _get_fallback_nba(request.leadScore, request.conversionProbability, request.interestedProduct or "sản phẩm SHB")

    except ValueError as val_err:
        raise HTTPException(status_code=500, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate next best action: {str(e)}")
