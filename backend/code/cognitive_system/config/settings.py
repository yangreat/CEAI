"""
Configuration settings for the Cognitive Empowerment System.
Loads settings from environment variables with appropriate defaults.
"""

import os
from typing import Dict, List, Optional, Union

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Configuration
API_KEY: str = os.getenv("API_KEY", "")
BASE_URL: str = os.getenv("BASE_URL", "https://api.chatanywhere.tech/v1")

# Model Selection
DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "gpt-3.5-turbo-1106")
AVAILABLE_MODELS: Dict[str, str] = {
    "gpt-3.5-turbo": "gpt-3.5-turbo-1106",
    "gpt-4o": "gpt-4o-2024-05-13",
    "claude-3-7-sonnet": "claude-3-7-sonnet-20250219",
    "gemini-2.0-flash": "gemini-2.0-flash",
    "deepseek-r1": "deepseek-r1",
    "grok-3-reasoner": "grok-3-reasoner"
}

# Emotion Analysis
EMOTION_MODEL: str = os.getenv("EMOTION_MODEL", "distilbert-base-uncased-finetuned-emotion")

# Speech Recognition
ENABLE_SPEECH: bool = os.getenv("ENABLE_SPEECH", "true").lower() == "true"
SPEECH_LANGUAGE: str = os.getenv("SPEECH_LANGUAGE", "en-US")

# Server Configuration
PORT: int = int(os.getenv("PORT", "8000"))
DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

# Security and Rate Limiting
MAX_REQUESTS_PER_MINUTE: int = int(os.getenv("MAX_REQUESTS_PER_MINUTE", "60"))
REQUEST_TIMEOUT: int = int(os.getenv("REQUEST_TIMEOUT", "30"))

# Function to validate settings
def validate_settings() -> List[str]:
    """
    Validate settings to ensure all required values are present.
    
    Returns:
        List[str]: A list of error messages, empty if all settings are valid.
    """
    errors = []
    
    if not API_KEY:
        errors.append("API_KEY is not set. Please add it to your .env file.")
    
    return errors 