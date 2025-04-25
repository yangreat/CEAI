"""
Gomoku agent implementation using AgentScope.
This agent plays the game Gomoku (Five in a Row) against a human player.
"""

import json
import re # Import re at the top level
import logging
from typing import Optional, Union, Sequence

from agentscope.message import Msg
from agentscope.agents import AgentBase
from agentscope.models import ModelResponse

# Configure logging
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Prompt to guide the AI in generating a properly formatted move
HINT_PROMPT = """
You should respond in the following format, which can be loaded by json.loads in Python:
{
    "thought": "analyze the present situation, and what move you should make",
    "move": [row index, column index]
}
Make sure your response is a valid JSON object containing the 'thought' and 'move' keys.
"""

# System prompt for the AI agent
SYSTEM_PROMPT = """
You're a skillful Gomoku player. You should play against your opponent according to the following rules:

Game Rules:
1. This Gomoku board is a 15*15 grid. Moves are made by specifying row and column indexes, with [0, 0] marking the top-left corner and [14, 14] indicating the bottom-right corner.
2. The goal is to be the first player to form an unbroken line of five 'x' pieces horizontally, vertically, or diagonally.
3. If the board is completely filled with pieces and no player has formed a row of five, the game is declared a draw.

Note:
1. Your pieces are represented by 'x', your opponent's by 'o'. 0 represents an empty spot on the board.
2. You should think carefully about your strategy and moves, considering both your and your opponent's subsequent moves.
3. Make sure you don't place your piece on a spot that has already been occupied.
4. Only an unbroken line of five same pieces will win the game. For example, "xxxoxx" won't be considered a win.
5. Note the unbroken line can be formed in any direction: horizontal, vertical, or diagonal.
"""


def parse_gomoku_response(response: ModelResponse) -> dict:
    """Parse the response from the model into a dict with "move" and "thought"
    keys. Handles potential JSON errors and extracts move fallback.
    Returns a dictionary, not a ModelResponse.
    """
    raw_text = response.text
    logging.debug(f"Parsing model response text: {raw_text}")
    try:
        # Attempt to find JSON block within potentially larger text
        json_match = re.search(r'\{.*?\}', raw_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            res_dict = json.loads(json_str)
            if isinstance(res_dict.get("move"), list) and len(res_dict["move"]) == 2 and "thought" in res_dict:
                logging.info(f"Successfully parsed JSON: {res_dict}")
                # Ensure move components are integers
                res_dict["move"] = [int(res_dict["move"][0]), int(res_dict["move"][1])]
                return res_dict
            else:
                logging.warning(f"Parsed JSON lacks 'move' list or 'thought': {json_str}")
        else:
            logging.warning(f"No JSON object found in response: {raw_text}")

        # Fallback: Try to extract move with regex if JSON fails
        move_match = re.search(r'\[\s*(\d+)\s*,\s*(\d+)\s*\]', raw_text)
        if move_match:
            row, col = int(move_match.group(1)), int(move_match.group(2))
            logging.warning(f"JSON parsing failed/incomplete, using regex fallback for move: ({row}, {col})")
            return {"move": [row, col], "thought": raw_text} # Use full text as thought fallback
        else:
             logging.error(f"Failed to parse JSON or find move pattern in response: {raw_text}")
             raise ValueError(f"Could not parse valid move from response: {raw_text}")
             
    except (json.JSONDecodeError, ValueError, TypeError) as e:
        logging.error(f"Error parsing response '{raw_text}': {e}", exc_info=True)
        raise ValueError(f"Could not parse valid move from response: {raw_text}. Error: {e}")


class GomokuAgent(AgentBase):
    """A Gomoku agent that can play the game with another agent."""

    def __init__(
        self,
        name: str,
        sys_prompt: Optional[str] = None,
        model_config_name: str = None,
        difficulty: str = "medium",
    ) -> None:
        super().__init__(
            name=name,
            sys_prompt=sys_prompt or SYSTEM_PROMPT,
            model_config_name=model_config_name,
            use_memory=True, # Ensure memory is enabled
        )
        
        self.difficulty = difficulty
        # Add system prompt to memory if not already handled by super().__init__
        if not self.memory.get_memory():
             self.memory.add(Msg("system", self.sys_prompt, role="system"))
        logging.info(f"GomokuAgent '{self.name}' initialized with model '{model_config_name}', difficulty '{self.difficulty}'.")

    def reply(self, x: Optional[Union[Msg, Sequence[Msg]]] = None) -> Msg:
        """Generates the next move message based on the game state."""
        if x:
            self.memory.add(x)
        
        # Prepare the prompt for the model
        # Include the hint prompt reminding the format
        msg_hint = Msg("system", HINT_PROMPT, role="system")
        prompt = self.model.format(
            self.memory.get_memory(),
            msg_hint, # Add hint to the formatted prompt
        )
        logging.debug(f"GomokuAgent '{self.name}' sending prompt to model: {prompt}")

        # Call the model WITHOUT parse_func and WITHOUT max_retries
        try:
            raw_response: ModelResponse = self.model(prompt)
            logging.debug(f"GomokuAgent '{self.name}' received raw response: {raw_response}")
        except Exception as model_err:
            logging.error(f"Model call failed for agent '{self.name}': {model_err}", exc_info=True)
            # Create a fallback move as STRING not LIST
            error_move_str = "8,8" # Center fallback, slightly offset
            return Msg(self.name, error_move_str, role="assistant", metadata={"error": str(model_err)})

        # Manually parse the response using our dedicated function
        try:
            parsed_response_dict = parse_gomoku_response(raw_response)
            move = parsed_response_dict["move"]
            
            # Convert move to string format for Msg
            move_str = f"{move[0]},{move[1]}"
            
            thought = parsed_response_dict.get("thought", "N/A")
        except ValueError as parse_err:
            logging.error(f"Failed to parse model response for agent '{self.name}': {parse_err}", exc_info=True)
            # Fallback move - use STRING format
            move = [8, 8] # Center fallback, slightly offset
            move_str = f"{move[0]},{move[1]}"
            thought = f"Parsing failed: {parse_err}. Raw response: {raw_response.text}"
        
        # Speak the thought process
        thought_msg = Msg(self.name, f"Thinking: {thought}", role="assistant")
        self.speak(thought_msg)

        # Add AI's response (both thought and move) to memory
        # Use the dictionary format that parse_gomoku_response provides
        ai_memory_msg = Msg(self.name, parsed_response_dict, role="assistant")
        self.memory.add(ai_memory_msg)

        # Return only the move in the final message - AS STRING
        final_move_msg = Msg(self.name, move_str, role="assistant")
        logging.info(f"GomokuAgent '{self.name}' generated move: {move_str}")
        return final_move_msg

    def set_difficulty(self, difficulty: str) -> None:
        """ Sets the difficulty level of the agent. """
        self.difficulty = difficulty
        difficulty_msg = Msg("system", f"Difficulty set to {difficulty}. Adjust play style.", role="system")
        self.memory.add(difficulty_msg)
        self.speak(difficulty_msg)
        logging.info(f"GomokuAgent '{self.name}' difficulty set to {difficulty}") 