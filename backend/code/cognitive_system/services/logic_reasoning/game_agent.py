"""
Game agent for the Gomoku game.
Implements an AI opponent for the user to play against.
"""

import random
from typing import Dict, List, Optional, Tuple, Union

import numpy as np

from cognitive_system.services.logic_reasoning.board import Board, Player


class GomokuAgent:
    """
    AI agent that plays Gomoku (Five in a Row) against a human player.
    Uses heuristic-based evaluation and search algorithms to determine the best move.
    """
    
    def __init__(self, difficulty: str = "medium"):
        """
        Initialize the agent with a specified difficulty level.
        
        Args:
            difficulty: Difficulty level ("easy", "medium", "hard")
        """
        self.difficulty = difficulty
        
        # Pattern score values
        self.pattern_scores = {
            "FIVE": 100000,     # Five in a row (win)
            "OPEN_FOUR": 10000, # Four in a row with open ends
            "FOUR": 1000,       # Four in a row with one blocked end
            "OPEN_THREE": 500,  # Three in a row with open ends
            "THREE": 100,       # Three in a row with one blocked end
            "OPEN_TWO": 50,     # Two in a row with open ends
            "TWO": 10           # Two in a row with one blocked end
        }
        
        # Search depth based on difficulty
        self.search_depth = {
            "easy": 1,
            "medium": 2,
            "hard": 3
        }.get(difficulty, 2)
    
    def get_move(self, board: Board) -> Tuple[int, int]:
        """
        Get the agent's next move.
        
        Args:
            board: Current game board
            
        Returns:
            Tuple[int, int]: Row and column indices for the next move
        """
        player = board.current_player
        
        # If it's the first move, play near the center
        if not board.moves_history:
            center = board.size // 2
            offset = random.randint(-2, 2)
            return (center + offset, center + offset)
        
        # Choose a strategy based on difficulty
        if self.difficulty == "easy":
            return self._get_easy_move(board, player)
        elif self.difficulty == "hard":
            return self._get_hard_move(board, player)
        else:
            return self._get_medium_move(board, player)
    
    def _get_easy_move(self, board: Board, player: Player) -> Tuple[int, int]:
        """
        Generate a move with low difficulty.
        Makes obvious defensive moves but otherwise plays somewhat randomly.
        
        Args:
            board: Current game board
            player: The player the agent is playing as
            
        Returns:
            Tuple[int, int]: Row and column for the next move
        """
        # Check for immediate win or block
        critical_move = self._find_critical_move(board, player)
        if critical_move:
            return critical_move
        
        # Get valid moves
        valid_moves = board.get_valid_moves()
        
        # Focus on moves near existing pieces
        focused_moves = self._get_focused_moves(board)
        if focused_moves:
            return random.choice(focused_moves)
        
        # If no focused moves, choose randomly
        return random.choice(valid_moves)
    
    def _get_medium_move(self, board: Board, player: Player) -> Tuple[int, int]:
        """
        Generate a move with medium difficulty.
        Uses basic heuristics and limited search.
        
        Args:
            board: Current game board
            player: The player the agent is playing as
            
        Returns:
            Tuple[int, int]: Row and column for the next move
        """
        # Check for immediate win or block
        critical_move = self._find_critical_move(board, player)
        if critical_move:
            return critical_move
        
        # Get focused moves
        focused_moves = self._get_focused_moves(board)
        
        # Score each move and choose the best one
        best_move = None
        best_score = float('-inf')
        
        for move in focused_moves:
            row, col = move
            
            # Test this move
            board_copy = self._copy_board(board)
            board_copy.make_move(row, col)
            
            # Calculate score for this move
            score = self._evaluate_board(board_copy, player)
            
            if score > best_score:
                best_score = score
                best_move = move
        
        return best_move or random.choice(focused_moves)
    
    def _get_hard_move(self, board: Board, player: Player) -> Tuple[int, int]:
        """
        Generate a move with high difficulty.
        Uses advanced heuristics and deeper search.
        
        Args:
            board: Current game board
            player: The player the agent is playing as
            
        Returns:
            Tuple[int, int]: Row and column for the next move
        """
        # Check for immediate win or block
        critical_move = self._find_critical_move(board, player)
        if critical_move:
            return critical_move
        
        # Get focused moves
        focused_moves = self._get_focused_moves(board)
        
        # Use minimax with alpha-beta pruning
        best_move = None
        best_score = float('-inf')
        alpha = float('-inf')
        beta = float('inf')
        
        for move in focused_moves:
            row, col = move
            
            # Test this move
            board_copy = self._copy_board(board)
            board_copy.make_move(row, col)
            
            # Calculate score using minimax
            score = self._minimax(board_copy, self.search_depth - 1, alpha, beta, False, player)
            
            if score > best_score:
                best_score = score
                best_move = move
            
            alpha = max(alpha, best_score)
        
        return best_move or random.choice(focused_moves)
    
    def _minimax(self, board: Board, depth: int, alpha: float, beta: float, 
                 is_maximizing: bool, agent_player: Player) -> float:
        """
        Minimax algorithm with alpha-beta pruning.
        
        Args:
            board: Current game board
            depth: Current search depth
            alpha: Alpha value for pruning
            beta: Beta value for pruning
            is_maximizing: Whether to maximize or minimize
            agent_player: The player the agent is playing as
            
        Returns:
            float: Score for the current board state
        """
        # Terminal conditions
        if board.winner:
            if board.winner == agent_player:
                return 100000  # Agent wins
            else:
                return -100000  # Agent loses
        
        if depth == 0 or board.is_game_over():
            return self._evaluate_board(board, agent_player)
        
        # Get focused moves to reduce branching factor
        focused_moves = self._get_focused_moves(board)
        
        if is_maximizing:
            max_eval = float('-inf')
            for move in focused_moves:
                row, col = move
                board_copy = self._copy_board(board)
                board_copy.make_move(row, col)
                
                eval = self._minimax(board_copy, depth - 1, alpha, beta, False, agent_player)
                max_eval = max(max_eval, eval)
                
                alpha = max(alpha, eval)
                if beta <= alpha:
                    break
            
            return max_eval
        else:
            min_eval = float('inf')
            for move in focused_moves:
                row, col = move
                board_copy = self._copy_board(board)
                board_copy.make_move(row, col)
                
                eval = self._minimax(board_copy, depth - 1, alpha, beta, True, agent_player)
                min_eval = min(min_eval, eval)
                
                beta = min(beta, eval)
                if beta <= alpha:
                    break
            
            return min_eval
    
    def _get_focused_moves(self, board: Board) -> List[Tuple[int, int]]:
        """
        Get a list of moves that are adjacent to existing pieces.
        This reduces the branching factor for search.
        
        Args:
            board: Current game board
            
        Returns:
            List[Tuple[int, int]]: List of (row, col) tuples for focused moves
        """
        focused_moves = []
        
        # Look for empty cells adjacent to existing pieces
        for i in range(board.size):
            for j in range(board.size):
                if board.board[i][j] != Player.EMPTY:
                    # Check adjacent cells
                    for di in range(-2, 3):
                        for dj in range(-2, 3):
                            ni, nj = i + di, j + dj
                            if (0 <= ni < board.size and 0 <= nj < board.size and 
                                board.board[ni][nj] == Player.EMPTY and
                                (ni, nj) not in focused_moves):
                                focused_moves.append((ni, nj))
        
        # If no focused moves are found, get all valid moves
        if not focused_moves:
            return board.get_valid_moves()
        
        return focused_moves
    
    def _find_critical_move(self, board: Board, player: Player) -> Optional[Tuple[int, int]]:
        """
        Find a critical move (win or block opponent's win).
        
        Args:
            board: Current game board
            player: The player the agent is playing as
            
        Returns:
            Optional[Tuple[int, int]]: Critical move or None if none is found
        """
        # Check for winning move
        winning_move = self._find_winning_move(board, player)
        if winning_move:
            return winning_move
        
        # Check for blocking move
        blocking_move = self._find_winning_move(board, player.opponent())
        if blocking_move:
            return blocking_move
        
        return None
    
    def _find_winning_move(self, board: Board, player: Player) -> Optional[Tuple[int, int]]:
        """
        Find a move that would result in an immediate win.
        
        Args:
            board: Current game board
            player: The player to find a winning move for
            
        Returns:
            Optional[Tuple[int, int]]: Winning move or None if none is found
        """
        valid_moves = board.get_valid_moves()
        
        for move in valid_moves:
            row, col = move
            
            # Test this move
            board_copy = self._copy_board(board)
            
            # Set the current player to the specified player
            board_copy.current_player = player
            
            # Make the move
            board_copy.make_move(row, col)
            
            # Check if this move resulted in a win
            if board_copy.winner == player:
                return move
        
        return None
    
    def _evaluate_board(self, board: Board, player: Player) -> float:
        """
        Evaluate the board position from the perspective of the given player.
        
        Args:
            board: Current game board
            player: The player from whose perspective to evaluate
            
        Returns:
            float: Score for the board position
        """
        if board.winner:
            if board.winner == player:
                return 100000  # Win
            else:
                return -100000  # Loss
        
        # Score patterns for both players
        own_score = self._score_patterns(board, player)
        opponent_score = self._score_patterns(board, player.opponent())
        
        # Return net score
        return own_score - opponent_score
    
    def _score_patterns(self, board: Board, player: Player) -> float:
        """
        Score the board based on patterns for a specific player.
        
        Args:
            board: Current game board
            player: The player to score for
            
        Returns:
            float: Pattern-based score
        """
        score = 0
        
        # Check all rows
        for i in range(board.size):
            row = [board.board[i][j] for j in range(board.size)]
            score += self._score_line(row, player)
        
        # Check all columns
        for j in range(board.size):
            col = [board.board[i][j] for i in range(board.size)]
            score += self._score_line(col, player)
        
        # Check all diagonals (top-left to bottom-right)
        for i in range(board.size - 4):
            for j in range(board.size - 4):
                diag = [board.board[i+k][j+k] for k in range(5)]
                score += self._score_line(diag, player)
        
        # Check all anti-diagonals (bottom-left to top-right)
        for i in range(4, board.size):
            for j in range(board.size - 4):
                diag = [board.board[i-k][j+k] for k in range(5)]
                score += self._score_line(diag, player)
        
        return score
    
    def _score_line(self, line: List[Player], player: Player) -> float:
        """
        Score a line of cells based on patterns.
        
        Args:
            line: List of cells to check
            player: The player to score for
            
        Returns:
            float: Pattern-based score for the line
        """
        score = 0
        empty = Player.EMPTY
        opponent = player.opponent()
        
        # Convert line to a simple representation
        # 0: empty, 1: player, -1: opponent
        simple_line = []
        for cell in line:
            if cell == empty:
                simple_line.append(0)
            elif cell == player:
                simple_line.append(1)
            else:
                simple_line.append(-1)
        
        # Check for patterns in windows of 5
        for i in range(len(simple_line) - 4):
            window = simple_line[i:i+5]
            
            # Count player pieces and empty spaces
            player_count = window.count(1)
            empty_count = window.count(0)
            
            # Score based on counts
            if player_count == 5:
                score += self.pattern_scores["FIVE"]
            elif player_count == 4 and empty_count == 1:
                if i > 0 and simple_line[i-1] == 0 and i+5 < len(simple_line) and simple_line[i+5] == 0:
                    score += self.pattern_scores["OPEN_FOUR"]
                else:
                    score += self.pattern_scores["FOUR"]
            elif player_count == 3 and empty_count == 2:
                if self._is_open_sequence(simple_line, i, i+4):
                    score += self.pattern_scores["OPEN_THREE"]
                else:
                    score += self.pattern_scores["THREE"]
            elif player_count == 2 and empty_count == 3:
                if self._is_open_sequence(simple_line, i, i+4):
                    score += self.pattern_scores["OPEN_TWO"]
                else:
                    score += self.pattern_scores["TWO"]
        
        return score
    
    def _is_open_sequence(self, line: List[int], start: int, end: int) -> bool:
        """
        Check if a sequence has open ends.
        
        Args:
            line: The line to check
            start: Start index of the sequence
            end: End index of the sequence
            
        Returns:
            bool: True if the sequence has open ends, False otherwise
        """
        is_left_open = start == 0 or line[start-1] == 0
        is_right_open = end == len(line) - 1 or line[end+1] == 0
        
        return is_left_open and is_right_open
    
    def _copy_board(self, board: Board) -> Board:
        """
        Create a deep copy of the board.
        
        Args:
            board: The board to copy
            
        Returns:
            Board: A new board with the same state
        """
        new_board = Board(board.size)
        
        # Copy board state
        for i in range(board.size):
            for j in range(board.size):
                new_board.board[i][j] = board.board[i][j]
        
        # Copy other properties
        new_board.current_player = board.current_player
        new_board.winner = board.winner
        new_board.moves_history = board.moves_history.copy()
        
        return new_board
