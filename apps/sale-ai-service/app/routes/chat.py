import json
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from app.schemas.chat import ChatRequest, ChatSyncResponse
from app.rag.retriever import RAGRetriever
from app.prompt.builder import PromptBuilder
from app.llm.provider import LLMProvider

router = APIRouter()

# Dependency injection factories
def get_retriever() -> RAGRetriever:
    return RAGRetriever()

def get_llm_provider() -> LLMProvider:
    return LLMProvider()

def _prepare_chat_inputs(request: ChatRequest, retriever: RAGRetriever) -> str:
    """
    Helper to search Qdrant collections, format customer context and conversation history,
    and build the final prompt for the LLM.
    """
    # 1. RAG Retrieve from all collections
    docs = retriever.retrieve_for_chat(request.message)
    
    # 2. History truncation: Keep maximum 10 most recent turns (messages)
    recent_history = request.conversationHistory[-10:]
    history_str = ""
    for msg in recent_history:
        role_name = "User" if msg.role == "user" else "Assistant"
        history_str += f"{role_name}: {msg.content}\n"
    if not history_str:
        history_str = "Không có lịch sử hội thoại."
        
    # 3. Format customerContext dict into readable string list
    context_str = ""
    if request.customerContext:
        for k, v in request.customerContext.items():
            context_str += f"- {k}: {v}\n"
    else:
        context_str = "Không có ngữ cảnh khách hàng."
        
    # 4. Build prompt
    prompt = PromptBuilder.build_chat_prompt(
        customer_context=context_str,
        retrieved_context=docs,
        conversation_history=history_str,
        message=request.message
    )
    return prompt

@router.post("/chat")
async def chat_stream(
    request: ChatRequest,
    retriever: RAGRetriever = Depends(get_retriever),
    llm: LLMProvider = Depends(get_llm_provider)
):
    """
    Endpoint for streaming chat (SSE). Yields text tokens in format:
    data: {"token": "value"}\n\n
    Ending with:
    data: [DONE]\n\n
    """
    try:
        prompt = _prepare_chat_inputs(request, retriever)
        
        async def event_generator():
            try:
                # LLMProvider.stream returns an AsyncIterator[str]
                async for token in llm.stream(prompt):
                    yield f"data: {json.dumps({'token': token})}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                yield "data: [DONE]\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")
        
    except ValueError as val_err:
        raise HTTPException(status_code=500, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initiate chat stream: {str(e)}")

@router.post("/chat/sync", response_model=ChatSyncResponse)
async def chat_sync(
    request: ChatRequest,
    retriever: RAGRetriever = Depends(get_retriever),
    llm: LLMProvider = Depends(get_llm_provider)
):
    """
    Fallback endpoint for non-streaming chat. Returns the entire response at once.
    """
    try:
        prompt = _prepare_chat_inputs(request, retriever)
        response_text = llm.generate(prompt, max_tokens=1500)
        return ChatSyncResponse(response=response_text)
        
    except ValueError as val_err:
        raise HTTPException(status_code=500, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate chat response: {str(e)}")
