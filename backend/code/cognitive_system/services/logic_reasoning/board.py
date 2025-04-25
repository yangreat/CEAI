"""
Board representation for the Gomoku game.
Handles the game state, move validation, and win condition checking.
"""

from enum import Enum
from typing import List, Optional, Tuple, Set


class Player(Enum):
    """
    Enum representing the possible states of a cell on the board.
    """
    EMPTY = 0
    BLACK = 1
    WHITE = 2
    
    def opponent(self):
        """Get the opposing player."""
        if self == Player.BLACK:
            return Player.WHITE
        elif self == Player.WHITE:
            return Player.BLACK
        return Player.EMPTY
    
    def __str__(self):
        """String representation of the player."""
        if self == Player.BLACK:
            return "X"
        elif self == Player.WHITE:
            return "O"
        return "."


class Board:
    """
    Represents a Gomoku (Five in a Row) game board.
    Handles game state, move validation, and win detection.
    """
    
    def __init__(self, size: int = 15):
        """
        Initialize the game board.
        
        Args:
            size: Size of the board (default 15x15)
        """
        self.size = size
        self.board: List[List[Player]] = [[Player.EMPTY for _ in range(size)] for _ in range(size)]
        self.moves_history: List[Tuple[int, int]] = []
        self.current_player = Player.BLACK
        self.winner: Optional[Player] = None
        self.winning_positions: Set[Tuple[int, int]] = set()
    
    def is_valid_move(self, row: int, col: int) -> bool:
        """
        Check if a move is valid.
        
        Args:
            row: Row index
            col: Column index
            
        Returns:
            bool: True if the move is valid, False otherwise
        """
        if not (0 <= row < self.size and 0 <= col < self.size):
            return False
        
        return self.board[row][col] == Player.EMPTY
    
    def make_move(self, row: int, col: int) -> bool:
        """
        Make a move on the board.
        
        Args:
            row: Row index
            col: Column index
            
        Returns:
            bool: True if the move was successful, False otherwise
        """
        if self.winner or not self.is_valid_move(row, col):
            return False
        
        # Place the piece
        self.board[row][col] = self.current_player
        self.moves_history.append((row, col))
        
        # Check for winner
        if self.check_winner(row, col):
            self.winner = self.current_player
        
        # Switch players
        self.current_player = self.current_player.opponent()
        
        return True
    
    def check_winner(self, row: int, col: int) -> bool:
        """
        Check if the last move resulted in a win.
        
        Args:
            row: Row of the last move
            col: Column of the last move
            
        Returns:
            bool: True if there is a winner, False otherwise
        """
        player = self.board[row][col]
        
        # Directions: horizontal, vertical, diagonal, anti-diagonal
        directions = [(0, 1), (1, 0), (1, 1), (1, -1)]
        
        for dr, dc in directions:
            # Count pieces in positive and negative directions
            count = 1  # Start with 1 for the current piece
            winning_positions = {(row, col)}
            
            # Check in positive direction
            r, c = row + dr, col + dc
            while 0 <= r < self.size and 0 <= c < self.size and self.board[r][c] == player:
                count += 1
                winning_positions.add((r, c))
                r += dr
                c += dc
            
            # Check in negative direction
            r, c = row - dr, col - dc
            while 0 <= r < self.size and 0 <= c < self.size and self.board[r][c] == player:
                count += 1
                winning_positions.add((r, c))
                r -= dr
                c -= dc
            
            # Check if there are five or more consecutive pieces
            if count >= 5:
                self.winning_positions = winning_positions
                return True
        
        return False
    
    def get_valid_moves(self) -> List[Tuple[int, int]]:
        """
        Get a list of all valid moves.
        
        Returns:
            List[Tuple[int, int]]: List of (row, col) tuples for valid moves
        """
        valid_moves = []
        
        for i in range(self.size):
            for j in range(self.size):
                if self.is_valid_move(i, j):
                    valid_moves.append((i, j))
        
        return valid_moves
    
    def is_game_over(self) -> bool:
        """
        Check if the game is over.
        
        Returns:
            bool: True if the game is over, False otherwise
        """
        if self.winner:
            return True
        
        # Check if board is full
        for i in range(self.size):
            for j in range(self.size):
                if self.board[i][j] == Player.EMPTY:
                    return False
        
        return True
    
    def get_state(self) -> List[List[str]]:
        """
        Get a string representation of the board state.
        
        Returns:
            List[List[str]]: 2D list of string representations of the board
        """
        return [[str(self.board[i][j]) for j in range(self.size)] for i in range(self.size)]
    
    def reset(self):
        """Reset the board to its initial state."""
        self.board = [[Player.EMPTY for _ in range(self.size)] for _ in range(self.size)]
        self.moves_history = []
        self.current_player = Player.BLACK
        self.winner = None
        self.winning_positions = set()
    
    def get_board_state_for_player(self, player: Player) -> List[List[int]]:
        """
        Get the board state from a specific player's perspective.
        
        Args:
            player: The player whose perspective to use
            
        Returns:
            List[List[int]]: 2D list representing the board state for the player
        """
        board_state = []
        
        for i in range(self.size):
            row = []
            for j in range(self.size):
                cell = self.board[i][j]
                if cell == Player.EMPTY:
                    row.append(0)
                elif cell == player:
                    row.append(1)  # Own pieces
                else:
                    row.append(-1)  # Opponent's pieces
            board_state.append(row)
        
        return board_state
    
    def __str__(self) -> str:
        """
        String representation of the board.
        
        Returns:
            str: String representation of the board
        """
        result = "  " + " ".join(str(i) for i in range(self.size)) + "\n"
        
        for i in range(self.size):
            result += f"{i} "
            for j in range(self.size):
                result += str(self.board[i][j]) + " "
            result += "\n"
        
        return result
