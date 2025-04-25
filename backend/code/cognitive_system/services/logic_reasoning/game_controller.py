"""
Game controller for Gomoku using AgentScope.
Controls the interaction between human players, AI, and the game board.
"""

import uuid
import logging # Import logging
from typing import Dict, Optional, List, Tuple, Any

import agentscope
from agentscope import msghub
from agentscope.message import Msg

from cognitive_system.services.logic_reasoning.board_agent import BoardAgent, NAME_BLACK, NAME_WHITE
from cognitive_system.services.logic_reasoning.gomoku_agent import GomokuAgent

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class GomokuGameController:
    """
    Controller for Gomoku games using AgentScope.
    Manages game instances and handles interactions between players and board.
    """
    
    def __init__(self):
        """Initialize the game controller."""
        self.game_instances: Dict[str, Dict[str, Any]] = {}
        
    def create_game(self, model_config_name: str, difficulty: str = "medium", board_size: int = 15) -> str:
        """
        Create a new game instance.
        
        Args:
            model_config_name: Name of the model configuration for the AI agent
            difficulty: Difficulty level of the AI agent
            board_size: Size of the game board
            
        Returns:
            str: Game ID
        """
        # Generate a unique game ID
        game_id = str(uuid.uuid4())
        
        # Initialize the agents
        board = BoardAgent(name="Host")
        ai_agent = GomokuAgent(
            name=NAME_WHITE,
            model_config_name=model_config_name,
            difficulty=difficulty
        )
        
        # Store the game instance
        self.game_instances[game_id] = {
            "board": board,
            "ai_agent": ai_agent,
            "model_config_name": model_config_name,
            "difficulty": difficulty,
            "current_state": None,
            "last_move": None,
            "is_game_over": False,
            "winner": None,
            "history": []
        }
        
        # Start the game
        with msghub(participants=[ai_agent, board]):
            msg = board(None)
            self.game_instances[game_id]["current_state"] = msg.content
        
        logging.info(f"Created game: {game_id}")
        return game_id
        
    def make_move(self, game_id: str, row: int, col: int) -> Dict[str, Any]:
        """
        Make a move as the human player and get the AI's response.
        
        Args:
            game_id: Game ID
            row: Row index of the move
            col: Column index of the move
            
        Returns:
            Dict[str, Any]: Game state after the moves
        """
        # Get the game instance
        game = self.get_game(game_id)
        board = game["board"]
        ai_agent = game["ai_agent"]
        
        if board.game_end:
            logging.warning(f"Attempted move on finished game: {game_id}")
            return {
                "success": False,
                "message": "Game is already over",
                "state": self.get_game_state(game_id)
            }
        
        try:
            # Process moves with the message hub
            with msghub(participants=[ai_agent, board]):
                # Convert row and col to integers
                row_int, col_int = int(row), int(col)
                
                # Format the move as a STRING "row,col" (to satisfy Msg validation)
                move_content_str = f"{row_int},{col_int}"
                
                # Make the human move
                human_move = Msg(name=NAME_BLACK, content=move_content_str, role="user")
                
                # Process human move through the board agent
                logging.info(f"[{game_id}] Sending human move to board: {human_move}")
                board_msg = board(human_move)
                logging.info(f"[{game_id}] Received board response to human move: {board_msg}")
                
                # Record the move in history
                game["history"].append({
                    "player": NAME_BLACK,
                    "move": [row_int, col_int], # Store as list
                    "board_state": board.board2text()
                })
                
                # Update game state
                game["current_state"] = board_msg.content
                game["last_move"] = [row_int, col_int] # Store as list
                
                # Check if game is over after human move
                if board.game_end:
                    logging.info(f"[{game_id}] Game over after human move.")
                    game["is_game_over"] = True
                    game["winner"] = NAME_BLACK if "wins" in str(board_msg.content) and NAME_BLACK in str(board_msg.content) else None
                    
                    return {
                        "success": True,
                        "message": str(board_msg.content),
                        "state": self.get_game_state(game_id)
                    }
                
                # Make AI move (Send current board state to AI)
                logging.info(f"[{game_id}] Sending board state to AI agent: {board_msg}")
                ai_msg = ai_agent(board_msg)
                logging.info(f"[{game_id}] Received AI agent raw response: {ai_msg}")

                # --- Robustly extract AI move coordinates ---
                ai_row, ai_col = 7, 7 # Default fallback
                try:
                    ai_move_content = ai_msg.content
                    logging.info(f"[{game_id}] Attempting to parse AI move content: {ai_move_content} (Type: {type(ai_move_content)})")

                    if isinstance(ai_move_content, list) and len(ai_move_content) == 2:
                        ai_row, ai_col = int(ai_move_content[0]), int(ai_move_content[1])
                        logging.info(f"[{game_id}] Parsed AI move from list: ({ai_row}, {ai_col})")
                    elif isinstance(ai_move_content, str):
                        parts = [p.strip() for p in ai_move_content.split(',')]
                        if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
                           ai_row, ai_col = int(parts[0]), int(parts[1])
                           logging.info(f"[{game_id}] Parsed AI move from string: ({ai_row}, {ai_col})")
                        else:
                            logging.warning(f"[{game_id}] Could not parse AI move from string: '{ai_move_content}'")
                    elif isinstance(ai_move_content, dict) and 'row' in ai_move_content and 'col' in ai_move_content:
                         ai_row, ai_col = int(ai_move_content['row']), int(ai_move_content['col'])
                         logging.info(f"[{game_id}] Parsed AI move from dict: ({ai_row}, {ai_col})")
                    else:
                        logging.warning(f"[{game_id}] Unknown AI move content format: {ai_move_content}, using fallback ({ai_row},{ai_col})")

                except Exception as parse_err:
                    logging.error(f"[{game_id}] Error parsing AI move content '{ai_msg.content}': {parse_err}", exc_info=True)
                    # Keep default fallback ai_row, ai_col = 7, 7
                # --- End of robust parsing ---

                # Create a properly formatted AI move message (as STRING for Msg validation)
                ai_move_content_str = f"{ai_row},{ai_col}"
                ai_move_formatted = Msg(name=NAME_WHITE, content=ai_move_content_str, role="user")
                
                # Process AI move
                logging.info(f"[{game_id}] Sending formatted AI move to board: {ai_move_formatted}")
                board_msg = board(ai_move_formatted)
                logging.info(f"[{game_id}] Received board response to AI move: {board_msg}")
                
                # Record the AI move
                game["history"].append({
                    "player": NAME_WHITE,
                    "move": [ai_row, ai_col], # Store as list
                    "board_state": board.board2text()
                })
                
                # Update game state
                game["current_state"] = board_msg.content
                game["last_move"] = [ai_row, ai_col] # Store as list
                
                # Check if game is over after AI move
                if board.game_end:
                    logging.info(f"[{game_id}] Game over after AI move.")
                    game["is_game_over"] = True
                    game["winner"] = NAME_WHITE if "wins" in str(board_msg.content) and NAME_WHITE in str(board_msg.content) else (
                        "draw" if "draw" in str(board_msg.content) else None
                    )
            
            logging.info(f"[{game_id}] Move successful.")
            return {
                "success": True,
                "message": str(board_msg.content),
                "state": self.get_game_state(game_id)
            }
            
        except Exception as e:
            logging.error(f"[{game_id}] Error in make_move for game {game_id}: {e}", exc_info=True)
            import traceback
            return {
                "success": False,
                "message": f"Error making move: {str(e)}",
                "state": self.get_game_state(game_id),
                "error_details": traceback.format_exc()
            }
    
    def get_game(self, game_id: str) -> Dict[str, Any]:
        """
        Get a game instance by ID.
        
        Args:
            game_id: Game ID
            
        Returns:
            Dict[str, Any]: Game instance
            
        Raises:
            ValueError: If the game ID is not found
        """
        if game_id not in self.game_instances:
            logging.error(f"Attempted to access non-existent game: {game_id}")
            raise ValueError(f"Game {game_id} not found")
        
        return self.game_instances[game_id]
    
    def get_game_state(self, game_id: str) -> Dict[str, Any]:
        """
        Get the current state of a game.
        
        Args:
            game_id: Game ID
            
        Returns:
            Dict[str, Any]: Game state
        """
        try:
            game = self.get_game(game_id)
            board = game["board"]
            
            # Ensure board state is serializable (e.g., list of lists)
            board_state_list = board.get_board_state() 
            if not isinstance(board_state_list, list):
                 # Attempt to convert if possible, otherwise provide placeholder
                 try:
                     board_state_list = list(board_state_list) 
                 except TypeError:
                     logging.warning(f"[{game_id}] Board state for game {game_id} is not a list and couldn't be converted.")
                     board_state_list = [] # Or some other default

            return {
                "board": board_state_list,
                "current_state": str(game.get("current_state", "")), # Ensure string
                "last_move": game.get("last_move"),
                "is_game_over": game.get("is_game_over", False),
                "winner": game.get("winner"),
                "history": game.get("history", [])
            }
        except Exception as e:
            logging.error(f"[{game_id}] Error getting game state for {game_id}: {e}", exc_info=True)
            # Return a default error state
            return {
                 "board": [],
                 "current_state": "Error retrieving game state.",
                 "last_move": None,
                 "is_game_over": False,
                 "winner": None,
                 "history": [],
                 "error": str(e)
            }
    
    def reset_game(self, game_id: str) -> Dict[str, Any]:
        """
        Reset a game to its initial state.
        
        Args:
            game_id: Game ID
            
        Returns:
            Dict[str, Any]: New game state
        """
        logging.info(f"[{game_id}] Resetting game.")
        # Get the game instance
        game = self.get_game(game_id)
        
        # Get the model and difficulty
        model_config_name = game["model_config_name"]
        difficulty = game["difficulty"]
        
        # Delete the old game
        del self.game_instances[game_id]
        
        # Create a new game with the same ID
        self.game_instances[game_id] = {
            "board": BoardAgent(name="Host"),
            "ai_agent": GomokuAgent(
                name=NAME_WHITE,
                model_config_name=model_config_name,
                difficulty=difficulty
            ),
            "model_config_name": model_config_name,
            "difficulty": difficulty,
            "current_state": None,
            "last_move": None,
            "is_game_over": False,
            "winner": None,
            "history": []
        }
        
        # Start the game
        game = self.get_game(game_id)
        board = game["board"]
        ai_agent = game["ai_agent"]
        
        with msghub(participants=[ai_agent, board]):
            msg = board(None)
            game["current_state"] = msg.content
        
        logging.info(f"[{game_id}] Game {game_id} reset successfully.")
        return {
            "success": True,
            "message": "Game reset successfully",
            "state": self.get_game_state(game_id)
        }
    
    def change_difficulty(self, game_id: str, difficulty: str) -> Dict[str, Any]:
        """
        Change the difficulty of the AI agent.
        
        Args:
            game_id: Game ID
            difficulty: New difficulty level
            
        Returns:
            Dict[str, Any]: Updated game state
        """
        logging.info(f"[{game_id}] Changing difficulty for game {game_id} to {difficulty}")
        # Get the game instance
        game = self.get_game(game_id)
        ai_agent = game["ai_agent"]
        
        # Update the difficulty
        ai_agent.set_difficulty(difficulty)
        game["difficulty"] = difficulty
        
        logging.info(f"[{game_id}] Difficulty for game {game_id} changed to {difficulty}")
        return {
            "success": True,
            "message": f"Difficulty changed to {difficulty}",
            "state": self.get_game_state(game_id)
        }
    
    def get_hint(self, game_id: str) -> Dict[str, Any]:
        """
        Get a hint for the next move.
        
        Args:
            game_id: Game ID
            
        Returns:
            Dict[str, Any]: Hint for the next move
        """
        logging.info(f"[{game_id}] Getting hint for game: {game_id}")
        # Get the game instance
        game = self.get_game(game_id)
        board = game["board"]
        
        if board.game_end:
            logging.warning(f"[{game_id}] Hint requested for finished game.")
            return {
                "success": False,
                "message": "Game is already over",
                "hint": None
            }
        
        try:
            # Create a temporary AI to get a hint
            hint_agent = GomokuAgent(
                name="Hint",
                model_config_name=game["model_config_name"],
                difficulty="medium"
            )
            
            # Get the current board state
            current_state = game["current_state"]
            
            # Get the hint
            with msghub(participants=[hint_agent]):
                # Send the current board state (assuming the hint agent expects it)
                hint_request_msg = Msg("Host", current_state, role="user") # Or role="system"?
                hint_msg = hint_agent(hint_request_msg)
                
                # Robust parsing for hint_msg.content similar to make_move
                hint_row, hint_col = 7, 7 # Default fallback
                try:
                    hint_content = hint_msg.content
                    logging.info(f"[{game_id}] Attempting to parse hint content: {hint_content} (Type: {type(hint_content)})")
                    if isinstance(hint_content, list) and len(hint_content) == 2:
                        hint_row, hint_col = int(hint_content[0]), int(hint_content[1])
                    elif isinstance(hint_content, str):
                        parts = [p.strip() for p in hint_content.split(',')]
                        if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
                            hint_row, hint_col = int(parts[0]), int(parts[1])
                        else:
                             logging.warning(f"[{game_id}] Could not parse hint from string: '{hint_content}'")
                    elif isinstance(hint_content, dict) and 'row' in hint_content and 'col' in hint_content:
                         hint_row, hint_col = int(hint_content['row']), int(hint_content['col'])
                    else:
                        logging.warning(f"[{game_id}] Unknown hint content format: {hint_content}")
                except Exception as parse_err:
                    logging.error(f"[{game_id}] Error parsing hint content '{hint_msg.content}': {parse_err}", exc_info=True)
                # ... end of parsing ...

                logging.info(f"[{game_id}] Hint for game {game_id}: ({hint_row}, {hint_col})")
                return {
                    "success": True,
                    "message": "Hint available",
                    "hint": {"row": hint_row, "col": hint_col}
                }
        except Exception as e:
             logging.error(f"[{game_id}] Error getting hint for game {game_id}: {e}", exc_info=True)
             # Provide a default hint if there's an error
             return {
                 "success": True,
                 "message": "Default hint provided (error occurred)",
                 "hint": {
                     "row": 7, 
                     "col": 7
                 },
                 "error": str(e)
             }
        
    def cleanup_games(self, max_games: int = 100) -> None:
        """
        Clean up old game instances to prevent memory leaks.
        
        Args:
            max_games: Maximum number of games to keep
        """
        logging.info(f"Running game cleanup (max_games={max_games}). Current games: {len(self.game_instances)}")
        if len(self.game_instances) <= max_games:
            return
        
        # Sort games by last activity and remove the oldest ones
        games_to_remove = sorted(
            self.game_instances.keys(), 
            key=lambda game_id: len(self.game_instances[game_id]["history"])
        )[:len(self.game_instances) - max_games]
        
        for game_id in games_to_remove:
            logging.info(f"Cleaning up old game: {game_id}")
            del self.game_instances[game_id] 
        logging.info(f"Cleanup finished. Games remaining: {len(self.game_instances)}")

# Make sure BoardAgent and GomokuAgent paths are correct relative to this file's location
# from cognitive_system.services.logic_reasoning.board_agent import BoardAgent, NAME_BLACK, NAME_WHITE
# from cognitive_system.services.logic_reasoning.gomoku_agent import GomokuAgent 