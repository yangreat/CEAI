"""
Router for logic reasoning endpoints, including Gomoku game using AgentScope.
"""

from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional

import agentscope
from cognitive_system.config import settings
from cognitive_system.services.logic_reasoning.game_controller import GomokuGameController

router = APIRouter()

# In-memory storage of the game controller
_game_controller = None

# Model configuration for AgentScope using settings from .env
MODEL_CONFIG_NAME = "logic_reasoning_model"
MODEL_CONFIG = {
    "config_name": MODEL_CONFIG_NAME,
    "model_type": "openai_chat",  # Default model type (will be overridden if needed)
    "api_key": settings.API_KEY,
    "base_url": settings.BASE_URL,
    "model": settings.DEFAULT_MODEL,
    "model_name": settings.DEFAULT_MODEL,  # Explicitly set model_name for OpenAI
    "parameters": {
        "max_tokens": 1024,
        "temperature": 0.7,
    },
    "client_args": {
        "base_url": settings.BASE_URL  # Explicitly set in client_args too
    },
    "use_default_api_base": False  # Force using the custom base_url, don't default to OpenAI
}


async def get_game_controller() -> GomokuGameController:
    """
    Get or initialize the game controller singleton.
    
    Returns:
        GomokuGameController: The game controller instance
    """
    global _game_controller
    if _game_controller is None:
        try:
            # Initialize AgentScope with model configuration
            agentscope.init(model_configs=[MODEL_CONFIG])
            _game_controller = GomokuGameController()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to initialize game controller: {str(e)}")
    return _game_controller


# Data models for logical reasoning analysis
class LogicalAnalysisRequest(BaseModel):
    """Request model for logical analysis."""
    text: str
    additional_context: Optional[str] = None


class LogicalAnalysisResponse(BaseModel):
    """Response model for logical analysis."""
    fallacies: List[Dict[str, Any]]
    analysis: str
    suggestions: List[str]


class ReasoningChainRequest(BaseModel):
    """Request model for reasoning chain generation."""
    premise: str
    question: str
    steps: Optional[int] = 5


class ReasoningChainResponse(BaseModel):
    """Response model for reasoning chain generation."""
    steps: List[str]
    conclusion: str


# Data models for Gomoku game
class GomokuGameInitRequest(BaseModel):
    """Request model for initializing a Gomoku game."""
    model_type: str = Field("openai_chat", description="Type of model to use for the AI agent")
    api_key: Optional[str] = Field(None, description="API key for the model service")
    difficulty: str = Field("medium", description="Difficulty level (easy, medium, hard)")
    board_size: int = Field(15, description="Size of the board")


class GomokuGameMoveRequest(BaseModel):
    """Request model for making a move in Gomoku."""
    row: int = Field(..., description="Row index of the move")
    col: int = Field(..., description="Column index of the move")


class GomokuGameResponse(BaseModel):
    """Response model for Gomoku game state."""
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Description of the result")
    state: Dict[str, Any] = Field(..., description="Current game state")


# Endpoints for logical reasoning analysis
@router.post("/analyze", response_model=LogicalAnalysisResponse)
async def analyze_logic(request: LogicalAnalysisRequest):
    """
    Analyze text for logical reasoning and identify potential fallacies.
    """
    # Placeholder for actual logic analysis implementation
    # This would typically connect to your reasoning models or services
    
    try:
        # Mock response for now
        response = LogicalAnalysisResponse(
            fallacies=[
                {
                    "type": "ad hominem",
                    "description": "Attacking the person instead of addressing their argument",
                    "confidence": 0.85,
                    "spans": [(0, 20)] if request.text else []
                }
            ],
            analysis=f"Preliminary analysis of: {request.text[:50]}...",
            suggestions=[
                "Focus on addressing the argument rather than the person",
                "Consider evidence-based counterpoints"
            ]
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/chain", response_model=ReasoningChainResponse)
async def generate_reasoning_chain(request: ReasoningChainRequest):
    """
    Generate a chain of logical reasoning steps from premise to conclusion.
    """
    try:
        # Placeholder implementation
        steps = [f"Step {i+1}: Reasoning step placeholder" for i in range(request.steps)]
        
        return ReasoningChainResponse(
            steps=steps,
            conclusion="Placeholder conclusion based on the reasoning chain."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reasoning chain generation failed: {str(e)}")


# Endpoints for Gomoku game
@router.post("/gomoku/create", response_model=Dict[str, Any])
async def create_gomoku_game(
    request: GomokuGameInitRequest,
    game_controller: GomokuGameController = Depends(get_game_controller)
):
    """
    Create a new Gomoku game instance.
    
    Args:
        request: Game initialization request
        
    Returns:
        Dict[str, Any]: Game ID and initial state
    """
    try:
        # Update model configuration with the requested model type
        MODEL_CONFIG["model_type"] = request.model_type
        
        # Always use API key from settings, ignoring any provided in the request
        MODEL_CONFIG["api_key"] = settings.API_KEY
        
        # Ensure we're always using the correct model name
        MODEL_CONFIG["model"] = settings.DEFAULT_MODEL
        MODEL_CONFIG["model_name"] = settings.DEFAULT_MODEL
        
        # Ensure we're always using the custom base_url
        MODEL_CONFIG["use_default_api_base"] = False
        MODEL_CONFIG["base_url"] = settings.BASE_URL
        
        # Make sure client_args explicitly includes base_url
        if "client_args" not in MODEL_CONFIG:
            MODEL_CONFIG["client_args"] = {}
        MODEL_CONFIG["client_args"]["base_url"] = settings.BASE_URL
            
        # Initialize AgentScope with updated model configuration
        agentscope.init(model_configs=[MODEL_CONFIG])
        
        # Create a new game
        game_id = game_controller.create_game(
            model_config_name=MODEL_CONFIG_NAME,
            difficulty=request.difficulty,
            board_size=request.board_size
        )
        
        # Get initial game state
        state = game_controller.get_game_state(game_id)
        
        return {
            "game_id": game_id,
            "success": True,
            "message": "Game created successfully",
            "state": state
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create game: {str(e)}")


@router.post("/gomoku/{game_id}/move", response_model=GomokuGameResponse)
async def make_gomoku_move(
    game_id: str,
    request: GomokuGameMoveRequest,
    game_controller: GomokuGameController = Depends(get_game_controller)
):
    """
    Make a move in the Gomoku game.
    
    Args:
        game_id: Game ID
        request: Move request with row and column indices
        
    Returns:
        GomokuGameResponse: Result of the move and updated game state
    """
    try:
        # Make the move
        result = game_controller.make_move(game_id, request.row, request.col)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Move failed: {str(e)}")


@router.get("/gomoku/{game_id}/state", response_model=GomokuGameResponse)
async def get_gomoku_state(
    game_id: str,
    game_controller: GomokuGameController = Depends(get_game_controller)
):
    """
    Get the current state of the Gomoku game.
    
    Args:
        game_id: Game ID
        
    Returns:
        GomokuGameResponse: Current game state
    """
    try:
        # Get game state
        state = game_controller.get_game_state(game_id)
        
        return {
            "success": True,
            "message": "Game state retrieved successfully",
            "state": state
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get game state: {str(e)}")


@router.post("/gomoku/{game_id}/reset", response_model=GomokuGameResponse)
async def reset_gomoku_game(
    game_id: str,
    game_controller: GomokuGameController = Depends(get_game_controller)
):
    """
    Reset a Gomoku game to its initial state.
    
    Args:
        game_id: Game ID
        
    Returns:
        GomokuGameResponse: New game state
    """
    try:
        # Reset the game
        result = game_controller.reset_game(game_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset game: {str(e)}")


@router.post("/gomoku/{game_id}/difficulty", response_model=GomokuGameResponse)
async def change_gomoku_difficulty(
    game_id: str,
    difficulty: str = Body(..., embed=True),
    game_controller: GomokuGameController = Depends(get_game_controller)
):
    """
    Change the difficulty of the Gomoku AI agent.
    
    Args:
        game_id: Game ID
        difficulty: New difficulty level (easy, medium, hard)
        
    Returns:
        GomokuGameResponse: Updated game state
    """
    try:
        # Change difficulty
        result = game_controller.change_difficulty(game_id, difficulty)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to change difficulty: {str(e)}")


@router.get("/gomoku/{game_id}/hint", response_model=Dict[str, Any])
async def get_gomoku_hint(
    game_id: str,
    game_controller: GomokuGameController = Depends(get_game_controller)
):
    """
    Get a hint for the next move in the Gomoku game.
    
    Args:
        game_id: Game ID
        
    Returns:
        Dict[str, Any]: Hint for the next move
    """
    try:
        # Get hint
        result = game_controller.get_hint(game_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get hint: {str(e)}")


@router.post("/gomoku/cleanup", response_model=Dict[str, Any])
async def cleanup_gomoku_games(
    max_games: int = Body(100, embed=True),
    game_controller: GomokuGameController = Depends(get_game_controller)
):
    """
    Clean up old Gomoku game instances to prevent memory leaks.
    
    Args:
        max_games: Maximum number of games to keep
        
    Returns:
        Dict[str, Any]: Result of the cleanup operation
    """
    try:
        # Clean up games
        game_controller.cleanup_games(max_games)
        
        return {
            "success": True,
            "message": f"Cleaned up old games, keeping at most {max_games} games",
            "remaining_games": len(game_controller.game_instances)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clean up games: {str(e)}") 