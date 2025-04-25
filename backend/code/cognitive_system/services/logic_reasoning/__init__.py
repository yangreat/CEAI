"""
Logic reasoning service module for cognitive empowerment.
"""

# Import core AgentScope implementation
from cognitive_system.services.logic_reasoning.board_agent import BoardAgent, board2img, NAME_BLACK, NAME_WHITE
from cognitive_system.services.logic_reasoning.gomoku_agent import GomokuAgent
from cognitive_system.services.logic_reasoning.game_controller import GomokuGameController

# Original implementation (kept for compatibility)
from cognitive_system.services.logic_reasoning.board import Board, Player
from cognitive_system.services.logic_reasoning.game_agent import GomokuAgent as GomokuAgentOriginal
from cognitive_system.services.logic_reasoning.gomoku_game import GomokuGame

__all__ = [
    # AgentScope implementation
    "BoardAgent", "board2img", "NAME_BLACK", "NAME_WHITE", "GomokuAgent", "GomokuGameController",
    
    # Original implementation
    "Board", "Player", "GomokuAgentOriginal", "GomokuGame",
]
