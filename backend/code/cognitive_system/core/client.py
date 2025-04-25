"""
Base client for interacting with AI service providers.
"""

from typing import Any, Dict, List, Optional, Union

from openai import OpenAI

from cognitive_system.config import settings


class AIClient:
    """
    Base client for interacting with AI services.
    Handles creating and managing connections to different AI service providers.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
    ):
        """
        Initialize the AI client.

        Args:
            api_key: Optional API key override
            base_url: Optional base URL override
            model: Optional model name override
        """
        self.api_key = api_key or settings.API_KEY
        self.base_url = base_url or settings.BASE_URL
        self.model = model or settings.DEFAULT_MODEL
        self.client = self._create_client()

    def _create_client(self) -> OpenAI:
        """
        Create and configure the OpenAI client.

        Returns:
            An initialized OpenAI client
        """
        return OpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )

    def get_completion(
        self, 
        messages: List[Dict[str, str]], 
        stream: bool = False,
        **kwargs
    ) -> Union[Dict[str, Any], Any]:
        """
        Get a completion from the AI model.

        Args:
            messages: List of message dictionaries (role, content)
            stream: Whether to stream the response
            **kwargs: Additional arguments to pass to the API

        Returns:
            The completion response
        """
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                stream=stream,
                **kwargs
            )
            return completion
        except Exception as e:
            # Log the error and re-raise
            print(f"Error in get_completion: {str(e)}")
            raise

    def get_text_response(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """
        Get a text response from the AI model.

        Args:
            messages: List of message dictionaries (role, content)
            **kwargs: Additional arguments to pass to the API

        Returns:
            The text response as a string
        """
        completion = self.get_completion(messages=messages, stream=False, **kwargs)
        return completion.choices[0].message.content 