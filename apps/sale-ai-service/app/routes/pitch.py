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
    """
    try:
        # 1. Retrieve RAG documents for pitch
        docs = retriever.retrieve_for_pitch(request.recommendedProduct)
        
        # 2. Extract sources
        sources = list(set(doc.source for doc in docs))
        
        # 3. Build prompt
        prompt = PromptBuilder.build_pitch_prompt(
            customer_name=request.customerName,
            lead_score=request.leadScore,
            product_name=request.recommendedProduct,
            confidence=request.conversionProbability,
            product_reason=request.productReason,
            documents=docs
        )
        
        # 4. Generate content
        pitch_text = llm.generate(prompt, max_tokens=1000)
        
        return PitchResponse(
            pitch=pitch_text.strip(),
            retrievedSources=sources
        )
        
    except ValueError as val_err:
        raise HTTPException(status_code=500, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate pitch: {str(e)}")
