"""
Chatbot service for the Cognitive Empowerment System.
Handles conversations with users through text and optional speech interfaces.
"""

import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Union

from cognitive_system.config import settings
from cognitive_system.core.client import AIClient


class Conversation:
    """Class to represent and manage a conversation history."""
    
    def __init__(self, conversation_id: Optional[str] = None):
        """Initialize a conversation with optional ID."""
        self.conversation_id = conversation_id or str(uuid.uuid4())
        self.messages: List[Dict[str, str]] = []
        self.created_at = datetime.now()
        self.last_updated = self.created_at
    
    def add_message(self, role: str, content: str) -> None:
        """
        Add a message to the conversation.
        
        Args:
            role: The role of the message sender (user, assistant, system)
            content: The content of the message
        """
        self.messages.append({"role": role, "content": content})
        self.last_updated = datetime.now()
    
    def get_messages(self) -> List[Dict[str, str]]:
        """Get all messages in the conversation."""
        return self.messages
    
    def clear(self) -> None:
        """Clear all messages in the conversation."""
        self.messages = []
        self.last_updated = datetime.now()


class ChatbotService:
    """
    Service for handling chatbot interactions.
    Manages conversations and interfaces with the AI model.
    """
    
    def __init__(self, model: Optional[str] = None):
        """
        Initialize the chatbot service.
        
        Args:
            model: Optional model override to use for this chatbot
        """
        self.client = AIClient(model=model)
        self.conversations: Dict[str, Conversation] = {}
        
        # System prompt to define chatbot behavior
        self.system_prompt = """
        You are a helpful assistant in a cognitive training system for elderly users. 
        Your primary goal is to assist users with various cognitive training exercises.
        Be patient, clear, and supportive in your responses.
        Use simple language and avoid complex terminology.
        If the user seems confused, gently offer to clarify or provide additional guidance.
        """
    
    def create_conversation(self) -> str:
        """
        Create a new conversation and return its ID.
        
        Returns:
            str: The conversation ID
        """
        conversation = Conversation()
        conversation.add_message("system", self.system_prompt)
        self.conversations[conversation.conversation_id] = conversation
        return conversation.conversation_id
    
    def get_conversation(self, conversation_id: str) -> Optional[Conversation]:
        """
        Get a conversation by ID.
        
        Args:
            conversation_id: The ID of the conversation to retrieve
            
        Returns:
            Optional[Conversation]: The conversation if found, None otherwise
        """
        return self.conversations.get(conversation_id)
    
    def process_message(self, message: str, conversation_id: Optional[str] = None) -> Tuple[str, str]:
        """
        Process a user message and generate a response.
        
        Args:
            message: The user's message
            conversation_id: Optional conversation ID (creates new if None)
            
        Returns:
            Tuple[str, str]: The response and the conversation ID
        """
        # Get or create conversation
        if conversation_id and conversation_id in self.conversations:
            conversation = self.conversations[conversation_id]
        else:
            conversation_id = self.create_conversation()
            conversation = self.conversations[conversation_id]
        
        # Add user message to conversation
        conversation.add_message("user", message)
        
        # Get response from AI
        response = self.client.get_text_response(conversation.get_messages())
        
        # Add assistant response to conversation
        conversation.add_message("assistant", response)
        
        return response, conversation_id
    
    def get_conversation_history(self, conversation_id: str) -> List[Dict[str, str]]:
        """
        Get the history of a conversation.
        
        Args:
            conversation_id: The ID of the conversation
            
        Returns:
            List[Dict[str, str]]: The conversation history
        """
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return []
        
        # Filter out system messages from the response
        return [msg for msg in conversation.get_messages() if msg["role"] != "system"]
    
    def clear_conversation(self, conversation_id: str) -> bool:
        """
        Clear a conversation's history.
        
        Args:
            conversation_id: The ID of the conversation to clear
            
        Returns:
            bool: True if successful, False otherwise
        """
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return False
        
        # Preserve the system message
        system_message = next((msg for msg in conversation.get_messages() if msg["role"] == "system"), None)
        
        conversation.clear()
        
        # Re-add the system message if it existed
        if system_message:
            conversation.add_message(system_message["role"], system_message["content"])
        
        return True
