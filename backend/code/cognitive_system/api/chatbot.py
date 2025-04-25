"""
API router for the chatbot service.
Provides endpoints for text and speech-based conversations.
"""

import base64
from typing import Dict, List, Optional, Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Body
from pydantic import BaseModel, Field

from cognitive_system.services.chatbot.chatbot import ChatbotService
from cognitive_system.services.chatbot.speech import SpeechProcessor

router = APIRouter()

# In-memory storage of service instances
_chatbot_service = ChatbotService()
_speech_processor = SpeechProcessor()


# Data models for requests and responses
class MessageRequest(BaseModel):
    """Request model for sending a message."""
    message: str = Field(..., description="The message text to process")
    conversation_id: Optional[str] = Field(None, description="Conversation ID to continue")


class MessageResponse(BaseModel):
    """Response model for message processing."""
    response: str = Field(..., description="The chatbot's response")
    conversation_id: str = Field(..., description="The conversation ID")


class SpeechRequest(BaseModel):
    """Request model for speech input."""
    audio_data: str = Field(..., description="Base64-encoded audio data")
    conversation_id: Optional[str] = Field(None, description="Conversation ID to continue")


class SpeechResponse(BaseModel):
    """Response model for speech processing."""
    text: str = Field(..., description="Transcribed text")
    response: str = Field(..., description="The chatbot's response")
    conversation_id: str = Field(..., description="The conversation ID")
    audio_response: Optional[str] = Field(None, description="Base64-encoded audio response")


class ConversationHistoryResponse(BaseModel):
    """Response model for conversation history."""
    history: List[Dict[str, str]] = Field(..., description="The conversation history")
    conversation_id: str = Field(..., description="The conversation ID")


class ModelSelectionRequest(BaseModel):
    """Request model for selecting a different model."""
    model: str = Field(..., description="The model to use")


class ModelSelectionResponse(BaseModel):
    """Response model for model selection."""
    success: bool = Field(..., description="Whether the selection was successful")
    message: str = Field(..., description="Description of the result")


@router.post("/message", response_model=MessageResponse)
async def process_message(request: MessageRequest):
    """
    Process a text message and get a response from the chatbot.
    
    Args:
        request: The message request containing text and optional conversation ID
        
    Returns:
        MessageResponse: The chatbot's response and conversation ID
    """
    response, conversation_id = _chatbot_service.process_message(
        message=request.message,
        conversation_id=request.conversation_id
    )
    
    return {
        "response": response,
        "conversation_id": conversation_id
    }


@router.post("/speech", response_model=SpeechResponse)
async def process_speech(request: SpeechRequest):
    """
    Process a speech input and get a text and optional speech response.
    
    Args:
        request: The speech request containing audio data and optional conversation ID
        
    Returns:
        SpeechResponse: Transcribed text, chatbot response, and optionally audio response
    """
    try:
        # Decode the base64 audio data
        audio_data = base64.b64decode(request.audio_data)
        
        # Transcribe the audio
        success, transcribed_text = _speech_processor.recognize_from_audio_data(audio_data)
        
        if not success:
            raise HTTPException(status_code=400, detail=f"Speech recognition failed: {transcribed_text}")
        
        # Process the transcribed text
        response, conversation_id = _chatbot_service.process_message(
            message=transcribed_text,
            conversation_id=request.conversation_id
        )
        
        # Generate audio response
        audio_response = _speech_processor.text_to_audio_data(response)
        audio_response_b64 = base64.b64encode(audio_response).decode('utf-8')
        
        return {
            "text": transcribed_text,
            "response": response,
            "conversation_id": conversation_id,
            "audio_response": audio_response_b64
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/speech/text-to-speech", response_model=Dict[str, str])
async def text_to_speech(text: str = Body(..., embed=True)):
    """
    Convert text to speech and return the audio data.
    
    Args:
        text: The text to convert to speech
        
    Returns:
        Dict[str, str]: Base64-encoded audio data
    """
    try:
        audio_data = _speech_processor.text_to_audio_data(text)
        audio_data_b64 = base64.b64encode(audio_data).decode('utf-8')
        
        return {
            "audio_data": audio_data_b64
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversation/{conversation_id}", response_model=ConversationHistoryResponse)
async def get_conversation_history(conversation_id: str):
    """
    Get the history of a conversation.
    
    Args:
        conversation_id: The ID of the conversation to retrieve
        
    Returns:
        ConversationHistoryResponse: The conversation history
    """
    history = _chatbot_service.get_conversation_history(conversation_id)
    
    if not history:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
    
    return {
        "history": history,
        "conversation_id": conversation_id
    }


@router.post("/conversation/{conversation_id}/clear", response_model=Dict[str, Any])
async def clear_conversation(conversation_id: str):
    """
    Clear the history of a conversation.
    
    Args:
        conversation_id: The ID of the conversation to clear
        
    Returns:
        Dict[str, Any]: Success status and message
    """
    success = _chatbot_service.clear_conversation(conversation_id)
    
    if not success:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
    
    return {
        "success": True,
        "message": f"Conversation {conversation_id} cleared"
    }


@router.post("/model", response_model=ModelSelectionResponse)
async def select_model(request: ModelSelectionRequest):
    """
    Select a different model for the chatbot.
    
    Args:
        request: The model selection request
        
    Returns:
        ModelSelectionResponse: Success status and message
    """
    try:
        # Create a new chatbot service with the selected model
        global _chatbot_service
        _chatbot_service = ChatbotService(model=request.model)
        
        return {
            "success": True,
            "message": f"Model changed to {request.model}"
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to change model: {str(e)}"
        } 