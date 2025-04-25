"""
API router for the emotion regulation service.
Provides endpoints for emotion detection and analysis.
"""

from typing import Dict, List, Optional, Any

from fastapi import APIRouter, HTTPException, Body, Depends
from pydantic import BaseModel, Field

from cognitive_system.services.emotion_regulation.emotion_analysis import EmotionAnalyzer
from cognitive_system.api.chatbot import _chatbot_service

router = APIRouter()

# In-memory storage of service instances
_emotion_analyzer = EmotionAnalyzer()


# Data models for requests and responses
class EmotionAnalysisRequest(BaseModel):
    """Request model for emotion analysis."""
    text: str = Field(..., description="Text to analyze for emotions")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for tracking emotional history")


class EmotionAnalysisResponse(BaseModel):
    """Response model for emotion analysis."""
    emotions: Dict[str, float] = Field(..., description="Map of emotions to their scores")
    dominant_emotion: str = Field(..., description="The dominant emotion")
    dominant_score: float = Field(..., description="Score of the dominant emotion")


class DepressionRiskRequest(BaseModel):
    """Request model for depression risk analysis."""
    conversation_id: str = Field(..., description="Conversation ID to analyze")


class DepressionRiskResponse(BaseModel):
    """Response model for depression risk analysis."""
    risk_score: float = Field(..., description="Depression risk score (0-100)")
    risk_level: str = Field(..., description="Risk level description")
    dominant_emotions: List[Dict[str, Any]] = Field(..., description="List of dominant emotions and their frequencies")
    analysis: str = Field(..., description="Text analysis of the results")

    class Config:
        schema_extra = {
            "example": {
                "risk_score": 45.0,
                "risk_level": "moderate",
                "dominant_emotions": [
                    {"emotion": "sadness", "frequency": 0.45},
                    {"emotion": "fear", "frequency": 0.25},
                    {"emotion": "neutral", "frequency": 0.2}
                ],
                "analysis": "Based on emotional patterns, depression risk is moderate. Some concerning emotional patterns. Monitoring recommended."
            }
        }


class EmotionTrendRequest(BaseModel):
    """Request model for emotion trend analysis."""
    emotion: str = Field(..., description="Emotion to track")
    window: int = Field(10, description="Number of recent entries to include")
    conversation_id: Optional[str] = Field(None, description="Conversation ID to analyze")


class EmotionTrendResponse(BaseModel):
    """Response model for emotion trend analysis."""
    trend: List[float] = Field(..., description="List of emotion scores over time")
    emotion: str = Field(..., description="The emotion being tracked")
    average: float = Field(..., description="Average score over the window")


class EmotionalStabilityRequest(BaseModel):
    """Request model for emotional stability analysis."""
    conversation_id: str = Field(..., description="Conversation ID to analyze")


class EmotionalStabilityResponse(BaseModel):
    """Response model for emotional stability analysis."""
    stability_score: float = Field(..., description="Emotional stability score (0-1)")
    interpretation: str = Field(..., description="Interpretation of the stability score")
    analyzed_messages: int = Field(..., description="Number of messages analyzed")


@router.post("/analyze", response_model=EmotionAnalysisResponse)
async def analyze_emotions(request: EmotionAnalysisRequest):
    """
    Analyze emotions in a text sample.
    
    Args:
        request: The emotion analysis request
        
    Returns:
        EmotionAnalysisResponse: Emotion analysis results
    """
    try:
        # Analyze the text
        emotion_scores = _emotion_analyzer.analyze_text(request.text)
        
        # Get dominant emotion
        dominant_emotion, dominant_score = _emotion_analyzer.get_dominant_emotion(emotion_scores)
        
        return {
            "emotions": emotion_scores,
            "dominant_emotion": dominant_emotion,
            "dominant_score": dominant_score
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/depression-risk", response_model=DepressionRiskResponse)
async def analyze_depression_risk(request: DepressionRiskRequest):
    """
    Analyze depression risk based on emotional patterns in a conversation.
    
    Args:
        request: The depression risk request containing conversation ID
        
    Returns:
        DepressionRiskResponse: Depression risk analysis
    """
    try:
        # Get conversation history
        conversation = _chatbot_service.get_conversation(request.conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail=f"Conversation {request.conversation_id} not found")
        
        # Get user messages from the conversation
        messages = conversation.get_messages()
        user_messages = [msg["content"] for msg in messages if msg["role"] == "user"]
        
        if len(user_messages) < 3:
            return {
                "risk_score": 0.0,
                "risk_level": "insufficient_data",
                "dominant_emotions": [],
                "analysis": "More messages needed for risk assessment (minimum 3)."
            }
        
        # Analyze emotions for each message
        _emotion_analyzer.emotion_history.clear()  # Reset history
        for message in user_messages:
            _emotion_analyzer.analyze_text(message)
        
        # Get depression risk analysis
        risk_analysis = _emotion_analyzer.analyze_depression_risk()
        
        return risk_analysis
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/trend", response_model=EmotionTrendResponse)
async def get_emotion_trend(request: EmotionTrendRequest):
    """
    Get the trend of a specific emotion over time.
    
    Args:
        request: The emotion trend request
        
    Returns:
        EmotionTrendResponse: Emotion trend data
    """
    try:
        # If conversation_id is provided, analyze all messages first
        if request.conversation_id:
            conversation = _chatbot_service.get_conversation(request.conversation_id)
            if not conversation:
                raise HTTPException(status_code=404, detail=f"Conversation {request.conversation_id} not found")
            
            # Get user messages from the conversation
            messages = conversation.get_messages()
            user_messages = [msg["content"] for msg in messages if msg["role"] == "user"]
            
            # Analyze emotions for each message
            _emotion_analyzer.emotion_history.clear()  # Reset history
            for message in user_messages:
                _emotion_analyzer.analyze_text(message)
        
        # Get the trend data
        trend_data = _emotion_analyzer.get_emotion_trend(
            emotion=request.emotion,
            window=request.window
        )
        
        # Calculate average
        average = sum(trend_data) / len(trend_data) if trend_data else 0.0
        
        return {
            "trend": trend_data,
            "emotion": request.emotion,
            "average": average
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stability", response_model=EmotionalStabilityResponse)
async def get_emotional_stability(request: EmotionalStabilityRequest):
    """
    Get emotional stability score based on a conversation's messages.
    
    Args:
        request: The stability request containing conversation ID
        
    Returns:
        EmotionalStabilityResponse: Emotional stability analysis
    """
    try:
        # Get conversation history
        conversation = _chatbot_service.get_conversation(request.conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail=f"Conversation {request.conversation_id} not found")
        
        # Get user messages from the conversation
        messages = conversation.get_messages()
        user_messages = [msg["content"] for msg in messages if msg["role"] == "user"]
        
        if len(user_messages) < 3:
            return {
                "stability_score": 0.5,
                "interpretation": "Insufficient data for accurate stability assessment.",
                "analyzed_messages": len(user_messages)
            }
        
        # Analyze emotions for each message
        _emotion_analyzer.emotion_history.clear()  # Reset history
        for message in user_messages:
            _emotion_analyzer.analyze_text(message)
        
        # Get stability score
        stability_score = _emotion_analyzer.get_emotional_stability()
        
        # Generate interpretation
        interpretation = "High emotional stability"
        if stability_score < 0.3:
            interpretation = "Low emotional stability, frequent mood changes detected"
        elif stability_score < 0.6:
            interpretation = "Moderate emotional stability with some mood variations"
        
        return {
            "stability_score": stability_score,
            "interpretation": interpretation,
            "analyzed_messages": len(user_messages)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch-analyze", response_model=List[EmotionAnalysisResponse])
async def batch_analyze_emotions(texts: List[str] = Body(..., embed=True)):
    """
    Analyze emotions in multiple text samples.
    
    Args:
        texts: List of text samples to analyze
        
    Returns:
        List[EmotionAnalysisResponse]: List of emotion analysis results
    """
    try:
        results = []
        
        for text in texts:
            # Analyze the text
            emotion_scores = _emotion_analyzer.analyze_text(text)
            
            # Get dominant emotion
            dominant_emotion, dominant_score = _emotion_analyzer.get_dominant_emotion(emotion_scores)
            
            results.append({
                "emotions": emotion_scores,
                "dominant_emotion": dominant_emotion,
                "dominant_score": dominant_score
            })
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 