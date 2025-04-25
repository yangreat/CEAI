"""
Board representation for the Gomoku game using AgentScope.
Manages the game board and updates the game status.
"""

from typing import Optional, Union, Sequence
import logging

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches

from agentscope.message import Msg
from agentscope.agents import AgentBase

# Configure logging if not already done globally
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

CURRENT_BOARD_PROMPT_TEMPLATE = """The current board is as follows:
{board}
{player}, it's your turn."""

NAME_BLACK = "Human"
NAME_WHITE = "AI"

# The mapping from name to piece
NAME_TO_PIECE = {
    NAME_BLACK: "o",
    NAME_WHITE: "x",
}

EMPTY_PIECE = "0"


def board2img(board: np.ndarray, save_path: str) -> str:
    """Convert the board to an image and save it to the specified path."""

    size = board.shape[0]
    fig, ax = plt.subplots(figsize=(10, 10))
    ax.set_xlim(0, size - 1)
    ax.set_ylim(0, size - 1)

    for i in range(size):
        ax.axhline(i, color="black", linewidth=1)
        ax.axvline(i, color="black", linewidth=1)

    for y in range(size):
        for x in range(size):
            if board[y, x] == NAME_TO_PIECE[NAME_BLACK]:  # black player
                circle = patches.Circle(
                    (x, y),
                    0.45,
                    edgecolor="black",
                    facecolor="black",
                    zorder=10,
                )
                ax.add_patch(circle)
            elif board[y, x] == NAME_TO_PIECE[NAME_WHITE]:  # white player
                circle = patches.Circle(
                    (x, y),
                    0.45,
                    edgecolor="black",
                    facecolor="white",
                    zorder=10,
                )
                ax.add_patch(circle)
    # Hide the axes and invert the y-axis
    ax.set_xticks(range(size))
    ax.set_yticks(range(size))
    ax.set_xticklabels(range(size))
    ax.set_yticklabels(range(size))
    ax.invert_yaxis()
    plt.savefig(save_path, bbox_inches="tight", pad_inches=0.1)
    plt.close(fig)  # Close the figure to free memory
    return save_path


class BoardAgent(AgentBase):
    """A board agent that can host a Gomoku game."""

    def __init__(self, name: str) -> None:
        super().__init__(name=name, use_memory=False)

        # Init the board
        self.size = 15
        self.board = np.full((self.size, self.size), EMPTY_PIECE)

        # Record the status of the game
        self.game_end = False
        logging.info(f"BoardAgent '{self.name}' initialized ({self.size}x{self.size}).")

    def reply(self, x: Optional[Union[Msg, Sequence[Msg]]] = None) -> Msg:
        logging.debug(f"BoardAgent '{self.name}' received input: {x}")
        if x is None:
            # Beginning of the game
            content = (
                "Welcome to the Gomoku game! Black player goes first. "
                "Please make your move."
            )
            logging.info("Starting new game.")
        else:
            # --- Parse move content (expecting string "row,col") ---
            try:
                if not isinstance(x.content, str):
                    raise TypeError(f"Expected move content to be string, got {type(x.content)}")
                
                parts = x.content.split(',')
                if len(parts) != 2:
                    raise ValueError(f"Expected move content format 'row,col', got '{x.content}'")
                
                row_str, col_str = parts
                row = int(row_str.strip())
                col = int(col_str.strip())
                logging.info(f"Parsed move from {x.name}: ({row}, {col})")

            except (ValueError, TypeError, AttributeError) as e:
                logging.error(f"Failed to parse move content '{getattr(x, 'content', 'N/A')}': {e}", exc_info=True)
                # Return an error message to the controller/player
                error_content = f"Error: Invalid move format received. Expected 'row,col', got '{getattr(x, 'content', 'N/A')}'. {e}"
                msg_error = Msg(self.name, error_content, role="assistant")
                self.speak(msg_error)
                return msg_error
            # --- End of parsing ---

            try:
                self.assert_valid_move(row, col)
            except RuntimeError as e:
                logging.warning(f"Invalid move attempt by {x.name} at ({row},{col}): {e}")
                # Return the error message back
                msg_invalid = Msg(self.name, str(e), role="assistant")
                self.speak(msg_invalid)
                return msg_invalid

            # Change the board
            self.board[row, col] = NAME_TO_PIECE[x.name]
            logging.info(f"Board updated by {x.name} at ({row}, {col})")

            # Check if the game ends
            if self.check_win(row, col, NAME_TO_PIECE[x.name]):
                content = f"The game ends, {x.name} wins!"
                self.game_end = True
                logging.info(f"Game ended. Winner: {x.name}")
            elif self.check_draw():
                content = "The game ends in a draw!"
                self.game_end = True
                logging.info("Game ended in a draw.")
            else:
                next_player_name = (
                    NAME_BLACK if x.name == NAME_WHITE else NAME_WHITE
                )
                content = CURRENT_BOARD_PROMPT_TEMPLATE.format(
                    board=self.board2text(),
                    player=next_player_name,
                )

        # Construct and return the response message
        msg_response = Msg(self.name, content, role="assistant")
        # self.speak(msg_response) # Maybe speaking is not needed if controller logs it
        logging.debug(f"BoardAgent '{self.name}' sending response: {msg_response}")
        return msg_response

    def assert_valid_move(self, row: int, col: int) -> None:
        """Check if the move is valid."""
        if not (0 <= row < self.size and 0 <= col < self.size):
            raise RuntimeError(f"Invalid move: ({row},{col}) is out of board range [0-{self.size-1}].")

        if not self.board[row, col] == EMPTY_PIECE:
            raise RuntimeError(
                f"Invalid move: ({row},{col}) is already occupied by '{self.board[row, col]}'."
            )

    def check_win(self, x: int, y: int, piece: str) -> bool:
        """Check if the player wins the game."""
        xline = self._check_line(self.board[x, :], piece)
        yline = self._check_line(self.board[:, y], piece)
        diag1 = self._check_line(np.diag(self.board, y - x), piece)
        diag2 = self._check_line(
            np.diag(np.fliplr(self.board), self.size - 1 - x - y),
            piece,
        )
        return xline or yline or diag1 or diag2

    def check_draw(self) -> bool:
        """Check if the game ends in a draw."""
        return np.all(self.board != EMPTY_PIECE)

    def board2text(self) -> str:
        """Convert the board to a text representation."""
        return "\n".join(
            [
                str(_)[1:-1].replace("'", "").replace(" ", "")
                for _ in self.board
            ],
        )

    def _check_line(self, line: np.ndarray, piece: str) -> bool:
        """Check if the player wins in a line."""
        count = 0
        for i in line:
            if i == piece:
                count += 1
                if count == 5:
                    return True
            else:
                count = 0
        return False
        
    def get_board_state(self):
        """Get the current state of the board as a 2D list."""
        return self.board.tolist()
    
    def get_board_image(self, save_path="current_board.png"):
        """Generate and return an image of the current board state."""
        return board2img(self.board, save_path) 