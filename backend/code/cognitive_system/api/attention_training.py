"""
API endpoints for the Attention Training module.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from pydantic import BaseModel

from cognitive_system.services.attention_training.training import AttentionTrainingService

# Create router
router = APIRouter()

# Create models
class AttentionExerciseRequest(BaseModel):
    """Request model for attention training exercises."""
    difficulty: str = "medium"  # Default to medium difficulty

class AttentionExerciseResponse(BaseModel):
    """Response model for attention training exercises."""
    image_url: str
    difficulty: str
    expected_item: str
    expected_quantity: int
    actual_quantity: int
    prompt: str

class VerifyAnswerRequest(BaseModel):
    """Request model for verifying user answers."""
    exercise_id: Optional[str] = None
    user_item: str
    user_quantity: int

class VerifyAnswerResponse(BaseModel):
    """Response model for answer verification."""
    correct: bool
    expected_item: str
    expected_quantity: int
    user_item: str
    user_quantity: int
    message: str

# Service dependency
def get_attention_service():
    """Dependency to get the attention training service."""
    return AttentionTrainingService()

@router.post("/exercise", response_model=AttentionExerciseResponse)
async def create_attention_exercise(
    request: AttentionExerciseRequest,
    service: AttentionTrainingService = Depends(get_attention_service)
) -> Dict[str, Any]:
    """
    Generate a new attention training exercise.
    
    Args:
        request: The exercise request with difficulty
        
    Returns:
        Exercise data including image URL and item details
    """
    try:
        exercise = service.create_attention_exercise(request.difficulty)
        
        if "error" in exercise:
            raise HTTPException(status_code=500, detail=exercise["error"])
            
        return exercise
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify", response_model=VerifyAnswerResponse)
async def verify_answer(
    request: VerifyAnswerRequest,
    service: AttentionTrainingService = Depends(get_attention_service)
) -> Dict[str, Any]:
    """
    Verify a user's answer to an attention training exercise.
    
    Args:
        request: The verification request with user's answers
        
    Returns:
        Verification result
    """
    try:
        # In a real implementation, you might retrieve the exercise from a database
        # using the exercise_id, but for simplicity we'll just check against values in the request
        
        # Mock data for demonstration
        expected_item = request.user_item  # In real implementation, get from DB
        expected_quantity = request.user_quantity  # In real implementation, get from DB
        
        # Check if the answer is correct
        correct = (request.user_item.lower() == expected_item.lower() and 
                   request.user_quantity == expected_quantity)
        
        # Generate appropriate message
        if correct:
            message = "Correct! You've identified the item and quantity accurately."
        else:
            message = "Not quite right. Keep practicing to improve your attention skills."
        
        return {
            "correct": correct,
            "expected_item": expected_item,
            "expected_quantity": expected_quantity,
            "user_item": request.user_item,
            "user_quantity": request.user_quantity,
            "message": message
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 