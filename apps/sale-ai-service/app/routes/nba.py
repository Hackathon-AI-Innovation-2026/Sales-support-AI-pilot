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

def determine_action(lead_score: int, probability: float, interactions: dict) -> tuple[str, str]:
    """
    Rule Engine: Deterministic logic to decide the next best action and priority.
    """
    if lead_score >= 80:
        return "CALL", "HIGH"
    elif lead_score >= 60 and interactions.get("loan_inquiry_count", 0) >= 2:
        return "EMAIL", "HIGH"
    elif lead_score >= 60:
        return "EMAIL", "MEDIUM"
    elif lead_score >= 40:
        return "MEETING", "MEDIUM"
    else:
        return "WAIT", "LOW"

@router.post("/next-best-action", response_model=NBAResponse)
async def next_best_action(
    request: NBARequest,
    retriever: RAGRetriever = Depends(get_retriever),
    llm: LLMProvider = Depends(get_llm_provider)
):
    """
    Endpoint to evaluate lead score through a rule engine, fetch guidelines,
    and generate explainable advice + action templates using LLM.
    """
    try:
        # 1. Determine base action and priority via Rule Engine
        action, priority = determine_action(
            request.leadScore,
            request.conversionProbability,
            request.interactions
        )
        
        # 2. Retrieve guidelines from Qdrant Vector DB
        docs = retriever.retrieve_for_nba(request.interestedProduct)
        
        # 3. Format recent interactions to string if text is not provided
        recent_text = request.recentInteractionsText
        if not recent_text:
            if request.interactions:
                recent_text = ", ".join(f"{k}: {v}" for k, v in request.interactions.items())
            else:
                recent_text = "Không có tương tác gần đây"
                
        # 4. Build prompt
        prompt = PromptBuilder.build_nba_prompt(
            lead_score=request.leadScore,
            probability=request.conversionProbability,
            recent_interactions=recent_text,
            interested_product=request.interestedProduct,
            retrieved_context=docs,
            action=action,
            priority=priority
        )
        
        # 5. Call LLM (using JSON mode) to get explanation and suggested content
        llm_response = llm.generate(prompt, max_tokens=1000, is_json=True)
        
        # 6. Parse result
        data = json.loads(llm_response)
        
        return NBAResponse(
            action=data.get("action", action),
            priority=data.get("priority", priority),
            reason=data.get("reason", ""),
            suggestedContent=data.get("suggestedContent", "")
        )
        
    except ValueError as val_err:
        raise HTTPException(status_code=500, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate next best action: {str(e)}")
