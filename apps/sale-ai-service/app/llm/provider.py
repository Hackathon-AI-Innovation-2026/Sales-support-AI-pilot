from typing import AsyncIterator

class LLMProvider:
    def __init__(self):
        pass

    def generate(self, prompt: str, max_tokens: int = 1000) -> str:
        # TODO: Implement synchronous LLM generation (Gemini / OpenAI)
        return ""

    async def stream(self, prompt: str) -> AsyncIterator[str]:
        # TODO: Implement streaming LLM generation
        yield ""
