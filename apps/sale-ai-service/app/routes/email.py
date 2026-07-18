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
    """
    try:
        # 1. Retrieve RAG documents for the recommended product
        docs = retriever.retrieve_for_email(request.recommendedProduct)
        
        # 2. Extract unique sources/collections of retrieved documents
        sources = list(set(doc.source for doc in docs))
        
        # 3. Build prompt using template injector
        prompt = PromptBuilder.build_email_prompt(
            customer_name=request.customerName,
            age=request.age,
            income=request.income,
            city=request.city,
            product_name=request.recommendedProduct,
            lead_score=request.leadScore,
            probability=request.conversionProbability,
            top_features=request.topFeatures,
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
        
    except ValueError as val_err:
        # Handles missing API key or parsing failure
        raise HTTPException(status_code=500, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate email: {str(e)}")
