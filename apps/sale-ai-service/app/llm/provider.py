import json
import time
import asyncio
from typing import AsyncIterator
from app.config import settings

class LLMProvider:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        if self.provider == "gemini":
            from google import genai
            if not settings.GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY is not set. Please configure it in .env")
            self.client = genai.Client(
                api_key=settings.GEMINI_API_KEY,
                http_options={"api_version": "v1"}
            )
            self.model = settings.GEMINI_MODEL
        elif self.provider == "openai":
            import openai
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY is not set. Please configure it in .env")
            self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            self.async_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            self.model = settings.OPENAI_MODEL
        else:
            raise ValueError(f"Unsupported LLM provider: {settings.LLM_PROVIDER}")

    def generate(self, prompt: str, max_tokens: int = 1000, is_json: bool = False) -> str:
        """
        Synchronous content generation with rate limit and JSON validation retries.
        """
        max_retries = 3
        wait_time = 2.0
        
        for attempt in range(max_retries):
            try:
                if self.provider == "gemini":
                    from google.genai import types
                    
                    config = types.GenerateContentConfig(
                        max_output_tokens=max_tokens,
                    )
                    if is_json:
                        config.response_mime_type = "application/json"
                        
                    response = self.client.models.generate_content(
                        model=self.model,
                        contents=prompt,
                        config=config
                    )
                    text = response.text
                    
                elif self.provider == "openai":
                    messages = [{"role": "user", "content": prompt}]
                    kwargs = {
                        "model": self.model,
                        "messages": messages,
                        "max_tokens": max_tokens
                    }
                    if is_json:
                        kwargs["response_format"] = {"type": "json_object"}
                        
                    response = self.client.chat.completions.create(**kwargs)
                    text = response.choices[0].message.content
                
                # Validation check for JSON mode
                if is_json:
                    try:
                        json.loads(text)
                    except json.JSONDecodeError:
                        raise ValueError("LLM response did not contain a valid JSON object.")
                
                return text
                
            except Exception as e:
                err_str = str(e)
                is_rate_limit = "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "RateLimit" in err_str
                
                if attempt < max_retries - 1:
                    sleep_sec = wait_time * (2 ** attempt)
                    if is_rate_limit:
                        print(f"[Rate Limit] LLM call failed. Retrying in {sleep_sec}s... Error: {e}")
                    else:
                        print(f"[LLM Error] LLM call failed. Retrying in {sleep_sec}s... Error: {e}")
                    time.sleep(sleep_sec)
                else:
                    print(f"[LLM Fail] LLM call failed after {max_retries} attempts: {e}")
                    raise e

    async def stream(self, prompt: str, max_tokens: int = 1000) -> AsyncIterator[str]:
        """
        Asynchronous streaming generator for chat copilot.
        """
        if self.provider == "gemini":
            from google.genai import types
            config = types.GenerateContentConfig(
                max_output_tokens=max_tokens,
            )
            try:
                # In google-genai SDK, client.aio handles asynchronous calls
                response_stream = await self.client.aio.models.generate_content_stream(
                    model=self.model,
                    contents=prompt,
                    config=config
                )
                async for response in response_stream:
                    if response.text:
                        yield response.text
            except Exception as e:
                print(f"Error in Gemini streaming: {e}")
                yield f"Error in stream generation: {e}"
                
        elif self.provider == "openai":
            try:
                response = await self.async_client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=max_tokens,
                    stream=True
                )
                async for chunk in response:
                    if chunk.choices and chunk.choices[0].delta.content:
                        yield chunk.choices[0].delta.content
            except Exception as e:
                print(f"Error in OpenAI streaming: {e}")
                yield f"Error in stream generation: {e}"
