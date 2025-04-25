"""
API router for the logic reasoning service.
Provides endpoints for playing the Gomoku game.
"""

from typing import Dict, List, Optional, Tuple, Any

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field

from cognitive_system.services.logic_reasoning.gomoku_game import GomokuGame

router = APIRouter()

# In-memory storage of game instances
_game_instances: Dict[str, GomokuGame] = {}


# Data models for requests and responses
class GameInitRequest(BaseModel):
    """Request model for initializing a game."""
    board_size: int = Field(15, description="Size of the board")
    difficulty: str = Field("medium", description="Difficulty level (easy, medium, hard)")
    user_first: bool = Field(True, description="Whether the user plays first")
    game_id: Optional[str] = Field(None, description="Game ID for resuming a game")


class GameMoveRequest(BaseModel):
    """Request model for making a move."""
    row: int = Field(..., description="Row index of the move")
    col: int = Field(..., description="Column index of the move")
    game_id: str = Field(..., description="Game ID")


class GameResponse(BaseModel):
    """Response model for game state."""
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Description of the result")
    state: Dict[str, Any] = Field(..., description="Current game state")


class GameIdResponse(BaseModel):
    """Response model for game ID."""
    game_id: str = Field(..., description="Game ID")
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Description of the result")


class HintResponse(BaseModel):
    """Response model for move hints."""
    row: Optional[int] = Field(None, description="Row index of the suggested move")
    col: Optional[int] = Field(None, description="Column index of the suggested move")
    available: bool = Field(..., description="Whether a hint is available")
    message: str = Field(..., description="Description of the result")


def _get_game(game_id: str) -> GomokuGame:
    """
    Get a game instance by ID.
    
    Args:
        game_id: The game ID
        
    Returns:
        GomokuGame: The game instance
        
    Raises:
        HTTPException: If the game ID is not found
    """
    if game_id not in _game_instances:
        raise HTTPException(status_code=404, detail=f"Game {game_id} not found")
    
    return _game_instances[game_id]


@router.post("/init", response_model=GameIdResponse)
async def initialize_game(request: GameInitRequest):
    """
    Initialize a new Gomoku game.
    
    Args:
        request: The game initialization request
        
    Returns:
        GameIdResponse: The game ID and success status
    """
    try:
        # Create a new game instance
        game = GomokuGame(
            board_size=request.board_size,
            difficulty=request.difficulty
        )
        
        # Generate a game ID
        import uuid
        game_id = str(uuid.uuid4())
        
        # Store the game instance
        _game_instances[game_id] = game
        
        # Set up initial state
        if not request.user_first:
            game.reset_game(user_first=False)
        
        return {
            "game_id": game_id,
            "success": True,
            "message": "Game initialized successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/move", response_model=GameResponse)
async def make_move(request: GameMoveRequest):
    """
    Make a move in the game.
    
    Args:
        request: The move request
        
    Returns:
        GameResponse: The result of the move and the updated game state
    """
    try:
        # Get the game instance
        game = _get_game(request.game_id)
        
        # Make the move
        result = game.make_user_move(request.row, request.col)
        
        return result
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/state/{game_id}", response_model=GameResponse)
async def get_game_state(game_id: str):
    """
    Get the current state of a game.
    
    Args:
        game_id: The game ID
        
    Returns:
        GameResponse: The current game state
    """
    try:
        # Get the game instance
        game = _get_game(game_id)
        
        return {
            "success": True,
            "message": "Game state retrieved",
            "state": game.get_board_state()
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset/{game_id}", response_model=GameResponse)
async def reset_game(game_id: str, user_first: bool = Body(True)):
    """
    Reset a game to its initial state.
    
    Args:
        game_id: The game ID
        user_first: Whether the user plays first
        
    Returns:
        GameResponse: The reset game state
    """
    try:
        # Get the game instance
        game = _get_game(game_id)
        
        # Reset the game
        result = game.reset_game(user_first=user_first)
        
        return result
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/difficulty/{game_id}", response_model=GameResponse)
async def change_difficulty(game_id: str, difficulty: str = Body(..., embed=True)):
    """
    Change the difficulty level of a game.
    
    Args:
        game_id: The game ID
        difficulty: The new difficulty level
        
    Returns:
        GameResponse: The updated game state
    """
    try:
        # Get the game instance
        game = _get_game(game_id)
        
        # Change the difficulty
        result = game.change_difficulty(difficulty)
        
        return result
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hint/{game_id}", response_model=HintResponse)
async def get_hint(game_id: str):
    """
    Get a hint for the next move.
    
    Args:
        game_id: The game ID
        
    Returns:
        HintResponse: The suggested move
    """
    try:
        # Get the game instance
        game = _get_game(game_id)
        
        # Get a hint
        hint = game.get_hint()
        
        if hint:
            row, col = hint
            return {
                "row": row,
                "col": col,
                "available": True,
                "message": "Hint available"
            }
        else:
            return {
                "row": None,
                "col": None,
                "available": False,
                "message": "No hint available (game over or not your turn)"
            }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary/{game_id}")
async def get_game_summary(game_id: str):
    """
    Get a summary of the game state.
    
    Args:
        game_id: The game ID
        
    Returns:
        Dict: Summary of the game state
    """
    try:
        # Get the game instance
        game = _get_game(game_id)
        
        # Get the game summary
        return game.get_game_summary()
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 