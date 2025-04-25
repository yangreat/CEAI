"""
Game controller for Gomoku (Five in a Row).
Manages the game state and coordinates between the board, agent, and user interface.
"""

from typing import Dict, List, Optional, Tuple, Union

from cognitive_system.services.logic_reasoning.board import Board, Player
from cognitive_system.services.logic_reasoning.game_agent import GomokuAgent


class GomokuGame:
    """
    Controller for the Gomoku game.
    Manages game state and handles interactions between board, agent, and frontend.
    """
    
    def __init__(self, board_size: int = 15, difficulty: str = "medium"):
        """
        Initialize the game with specified board size and AI difficulty.
        
        Args:
            board_size: Size of the board (default 15x15)
            difficulty: Difficulty level for the AI ("easy", "medium", "hard")
        """
        self.board = Board(board_size)
        self.agent = GomokuAgent(difficulty)
        self.user_player = Player.BLACK  # User plays as black (first player)
        self.agent_player = Player.WHITE  # Agent plays as white (second player)
        self.game_status = "active"
        self.last_move: Optional[Tuple[int, int]] = None
    
    def get_board_state(self) -> Dict:
        """
        Get the current state of the game.
        
        Returns:
            Dict: Game state information
        """
        return {
            "board": self.board.get_state(),
            "current_player": str(self.board.current_player),
            "game_over": self.board.is_game_over(),
            "winner": str(self.board.winner) if self.board.winner else None,
            "last_move": self.last_move,
            "user_player": str(self.user_player),
            "agent_player": str(self.agent_player),
            "game_status": self.game_status,
            "winning_positions": list(self.board.winning_positions) if self.board.winning_positions else []
        }
    
    def make_user_move(self, row: int, col: int) -> Dict:
        """
        Process a move from the user.
        
        Args:
            row: Row index of the move
            col: Column index of the move
            
        Returns:
            Dict: Game state after the move
        """
        # Check if it's user's turn
        if self.board.current_player != self.user_player or self.board.is_game_over():
            return {
                "success": False,
                "message": "It's not your turn or the game is over",
                "state": self.get_board_state()
            }
        
        # Make the move
        if not self.board.make_move(row, col):
            return {
                "success": False,
                "message": "Invalid move",
                "state": self.get_board_state()
            }
        
        self.last_move = (row, col)
        
        # Check if the game is over
        if self.board.is_game_over():
            if self.board.winner == self.user_player:
                self.game_status = "user_win"
            else:
                self.game_status = "draw"
            
            return {
                "success": True,
                "message": "Valid move, game over",
                "state": self.get_board_state()
            }
        
        # Make the agent's move
        return self.make_agent_move()
    
    def make_agent_move(self) -> Dict:
        """
        Process a move from the AI agent.
        
        Returns:
            Dict: Game state after the move
        """
        # Check if it's agent's turn
        if self.board.current_player != self.agent_player or self.board.is_game_over():
            return {
                "success": True,
                "message": "Waiting for user's move",
                "state": self.get_board_state()
            }
        
        # Get the agent's move
        agent_row, agent_col = self.agent.get_move(self.board)
        
        # Make the move
        if not self.board.make_move(agent_row, agent_col):
            # This should not happen if the agent is implemented correctly
            return {
                "success": False,
                "message": "Agent made an invalid move",
                "state": self.get_board_state()
            }
        
        self.last_move = (agent_row, agent_col)
        
        # Check if the game is over
        if self.board.is_game_over():
            if self.board.winner == self.agent_player:
                self.game_status = "agent_win"
            else:
                self.game_status = "draw"
            
            return {
                "success": True,
                "message": "Agent move, game over",
                "state": self.get_board_state()
            }
        
        return {
            "success": True,
            "message": "Agent move successful",
            "state": self.get_board_state()
        }
    
    def reset_game(self, user_first: bool = True) -> Dict:
        """
        Reset the game to its initial state.
        
        Args:
            user_first: Whether the user plays first (default True)
            
        Returns:
            Dict: Game state after reset
        """
        self.board.reset()
        
        if user_first:
            self.user_player = Player.BLACK
            self.agent_player = Player.WHITE
        else:
            self.user_player = Player.WHITE
            self.agent_player = Player.BLACK
            
            # If agent goes first, make the first move
            return self.make_agent_move()
        
        self.game_status = "active"
        self.last_move = None
        
        return {
            "success": True,
            "message": "Game reset",
            "state": self.get_board_state()
        }
    
    def change_difficulty(self, difficulty: str) -> Dict:
        """
        Change the difficulty level of the AI agent.
        
        Args:
            difficulty: New difficulty level ("easy", "medium", "hard")
            
        Returns:
            Dict: Game state after difficulty change
        """
        self.agent = GomokuAgent(difficulty)
        
        return {
            "success": True,
            "message": f"Difficulty changed to {difficulty}",
            "state": self.get_board_state()
        }
    
    def get_valid_moves(self) -> List[Tuple[int, int]]:
        """
        Get a list of valid moves in the current game state.
        
        Returns:
            List[Tuple[int, int]]: List of valid (row, col) positions
        """
        return self.board.get_valid_moves()
    
    def get_hint(self) -> Optional[Tuple[int, int]]:
        """
        Get a hint for the user's next move.
        
        Returns:
            Optional[Tuple[int, int]]: Suggested move or None if game is over
        """
        if self.board.is_game_over() or self.board.current_player != self.user_player:
            return None
        
        # Create a temporary agent to get a suggestion
        hint_agent = GomokuAgent("medium")
        return hint_agent.get_move(self.board)
    
    def is_user_turn(self) -> bool:
        """
        Check if it's currently the user's turn.
        
        Returns:
            bool: True if it's the user's turn, False otherwise
        """
        return self.board.current_player == self.user_player and not self.board.is_game_over()
    
    def get_game_summary(self) -> Dict:
        """
        Get a summary of the game state.
        
        Returns:
            Dict: Summary of the game state
        """
        if not self.board.is_game_over():
            return {
                "status": "active",
                "message": "Game in progress",
                "moves_count": len(self.board.moves_history)
            }
        
        if self.board.winner == self.user_player:
            return {
                "status": "user_win",
                "message": "Congratulations! You won the game.",
                "moves_count": len(self.board.moves_history)
            }
        elif self.board.winner == self.agent_player:
            return {
                "status": "agent_win",
                "message": "The AI has won the game. Better luck next time!",
                "moves_count": len(self.board.moves_history)
            }
        else:
            return {
                "status": "draw",
                "message": "The game ended in a draw.",
                "moves_count": len(self.board.moves_history)
            }
