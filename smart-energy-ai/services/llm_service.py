"""
LLM Integration Service for SmartEnergy AI.
Provides resilient API client orchestration supporting Groq and OpenAI,
with automatic timeouts, exponential retry, and offline analytical fallback.
"""

import os
import time
from typing import Optional, Dict, Any
from utils.config import config
from utils.logging_config import logger

class LLMService:
    """Manages LLM communication with resilient offline fallback."""

    def __init__(self):
        self.provider = config.llm.provider
        self.gemini_api_key = config.llm.gemini_api_key
        self.groq_api_key = config.llm.groq_api_key
        self.openai_api_key = config.llm.openai_api_key
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        """Initializes the active LLM client based on environment variables."""
        if self.gemini_api_key and not self.gemini_api_key.startswith("your_"):
            self.provider = "gemini"
            self.client = "gemini_rest"
            logger.info("Google Gemini LLM service initialized successfully.")
        elif self.provider == "groq" and self.groq_api_key and not self.groq_api_key.startswith("gsk_your_"):
            try:
                from groq import Groq
                self.client = Groq(api_key=self.groq_api_key, timeout=config.llm.timeout_seconds)
                logger.info("Groq LLM client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}. Defaulting to offline mode.")
                self.client = None
        elif self.provider == "openai" and self.openai_api_key and not self.openai_api_key.startswith("sk-your_"):
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=self.openai_api_key, timeout=config.llm.timeout_seconds)
                logger.info("OpenAI LLM client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}. Defaulting to offline mode.")
                self.client = None
        else:
            logger.info("No valid LLM API key configured. Offline Fallback / Demo mode active.")
            self.client = None

    def is_api_active(self) -> bool:
        """Returns True if a live cloud API client is configured."""
        return self.client is not None

    def generate_completion(
        self,
        prompt: str,
        system_prompt: str = "You are a helpful and knowledgeable energy advisor.",
        fallback_text: Optional[str] = None
    ) -> str:
        """
        Queries the LLM provider with fallback safety.
        
        Parameters:
            prompt (str): Main user/data prompt.
            system_prompt (str): System instruction.
            fallback_text (str): Deterministic text returned if LLM is unavailable.
            
        Returns:
            str: Generated natural language response or deterministic fallback.
        """
        if not self.client:
            return self._build_fallback(fallback_text)

        # 1. Check in-memory request cache (prevents duplicate API spend)
        from services.security_service import security_service
        cached = security_service.cache.get(prompt, system_prompt)
        if cached:
            logger.info("Request Cache Hit: Serving cached response without cloud API call.")
            return cached

        # 2. Check spending cap & financial budget
        if not security_service.budget_tracker.check_cap():
            logger.warning("Spending cap reached. Bypassing cloud API call to preserve budget.")
            security_service.log_event("WARN", "LLM request blocked: Spending cap threshold reached.")
            return self._build_fallback(f"⚠️ [Spending Cap Active]: Budget threshold reached. Reverting to offline analytical synthesis.\n\n" + (fallback_text or ""))

        # 3. Check rate limiting (prevents 429 quota exhaustion)
        allowed, remaining, retry_after = security_service.rate_limiter.is_allowed("global_client")
        if not allowed:
            logger.warning(f"Rate limit reached. Throttling for {retry_after}s.")
            security_service.log_event("WARN", f"Rate limit throttled. Retry in {retry_after}s.")
            return self._build_fallback(f"⚠️ [Rate Limit Protection]: Too many requests in 60s. Serving analytical synthesis.\n\n" + (fallback_text or ""))

        retries = config.llm.max_retries
        for attempt in range(retries + 1):
            try:
                if self.provider == "gemini":
                    import requests
                    model = config.llm.gemini_model
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_api_key}"
                    payload = {
                        "contents": [
                            {"role": "user", "parts": [{"text": f"SYSTEM INSTRUCTIONS:\n{system_prompt}\n\nUSER / CONTEXT:\n{prompt}"}]}
                        ],
                        "generationConfig": {
                            "temperature": config.llm.temperature,
                            "maxOutputTokens": 1200
                        }
                    }
                    res = requests.post(url, json=payload, timeout=config.llm.timeout_seconds)
                    if res.status_code == 200:
                        data = res.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                        # Record token usage & update cache
                        security_service.budget_tracker.record_usage(prompt, text)
                        security_service.cache.set(prompt, system_prompt, text)
                        return text
                    elif res.status_code in [429, 503]:
                        logger.warning(f"Gemini API returned status {res.status_code} (Quota or Service Busy). Serving fallback.")
                        security_service.log_event("WARN", f"Gemini API returned {res.status_code}. Fallback engaged.")
                        return self._build_fallback(fallback_text)
                    else:
                        logger.warning(f"Gemini API returned status {res.status_code}: {res.text[:200]}")
                        raise RuntimeError(f"Gemini error {res.status_code}")
                elif self.provider == "groq":
                    response = self.client.chat.completions.create(
                        model=config.llm.groq_model,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=config.llm.temperature,
                        max_tokens=1000
                    )
                    text = response.choices[0].message.content.strip()
                    security_service.budget_tracker.record_usage(prompt, text)
                    security_service.cache.set(prompt, system_prompt, text)
                    return text
                elif self.provider == "openai":
                    response = self.client.chat.completions.create(
                        model=config.llm.openai_model,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=config.llm.temperature,
                        max_tokens=1000
                    )
                    text = response.choices[0].message.content.strip()
                    security_service.budget_tracker.record_usage(prompt, text)
                    security_service.cache.set(prompt, system_prompt, text)
                    return text
            except Exception as e:
                logger.warning(f"LLM API call failed (Attempt {attempt+1}/{retries+1}): {str(e)}")
                if attempt < retries:
                    time.sleep(1.0)
                else:
                    logger.error("All LLM attempts failed. Switching to deterministic fallback mode.")

        return self._build_fallback(fallback_text)

    def _build_fallback(self, custom_text: Optional[str]) -> str:
        """Formats the offline synthesis fallback response without emojis or buzzwords."""
        prefix = "[Analytical Baseline Synthesis - Active]\n\n"
        if custom_text:
            return prefix + custom_text
        return prefix + "Calculations completed using deterministic analytical models."

llm_service = LLMService()
