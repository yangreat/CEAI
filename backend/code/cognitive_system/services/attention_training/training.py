"""
Attention Training core functionality.
"""

import os
import json
import logging
from typing import Dict, Any, Tuple
import requests
from openai import OpenAI

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL")
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "dall-e-3")
MULTIMODAL_MODEL = os.getenv("MULTIMODAL_MODEL", "gpt-4-turbo")
IMAGE_SIZE = os.getenv("IMAGE_SIZE", "1024x1024")

class AttentionTrainingService:
    """Service for attention training through image-based exercises."""
    
    def __init__(self):
        """Initialize the attention training service."""
        self.api_key = API_KEY
        self.base_url = BASE_URL
        self.image_model = IMAGE_MODEL
        self.multimodal_model = MULTIMODAL_MODEL
        self.image_size = IMAGE_SIZE
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )
    
    def generate_prompt(self, difficulty: str) -> str:
        """
        Generate a prompt for image creation based on difficulty level.
        
        Args:
            difficulty: The difficulty level (easy, medium, hard)
            
        Returns:
            A prompt string for image generation
        """
        # Base prompt structure
        base_prompt = "Create a detailed image of a {scene} with multiple objects. Include {repeats} {item} in the scene. Make it {visibility} to spot."
        
        # Difficulty settings
        settings = {
            "easy": {
                "scenes": ["children's bedroom", "kitchen counter", "simple desk workspace"],
                "items": ["red ball", "teddy bear", "toy car", "blue cup", "green book"],
                "repeats": "exactly 3",
                "visibility": "easy"
            },
            "medium": {
                "scenes": ["living room", "office space", "classroom", "grocery store shelf"],
                "items": ["coffee mug", "pen", "notebook", "umbrella", "hat", "plant"],
                "repeats": "exactly 4",
                "visibility": "somewhat challenging"
            },
            "hard": {
                "scenes": ["cluttered garage", "busy marketplace", "crowded bookstore", "messy art studio"],
                "items": ["small keychain", "specific book", "black pen", "paper clip", "coin"],
                "repeats": "exactly 5",
                "visibility": "difficult"
            }
        }
        
        # Default to medium if invalid difficulty provided
        difficulty = difficulty.lower() if difficulty.lower() in settings else "medium"
        difficulty_settings = settings[difficulty]
        
        # Select scene and item (could be made random in a more advanced implementation)
        scene = difficulty_settings["scenes"][0]
        item = difficulty_settings["items"][0]
        repeats = difficulty_settings["repeats"]
        visibility = difficulty_settings["visibility"]
        
        # Format the prompt
        prompt = base_prompt.format(
            scene=scene, 
            repeats=repeats, 
            item=item, 
            visibility=visibility
        )
        
        return prompt, item, int(repeats.split()[-1])
    
    def generate_image(self, prompt: str) -> str:
        """
        Generate an image using the text-to-image API.
        
        Args:
            prompt: The text prompt for image generation
            
        Returns:
            URL of the generated image
        """
        try:
            url = f"{self.base_url}/images/generations"
            
            payload = json.dumps({
                "prompt": prompt,
                "n": 1,
                "model": self.image_model,
                "size": self.image_size
            })
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.request("POST", url, headers=headers, data=payload)
            response_data = response.json()
            
            # Extract the image URL from the response
            if "data" in response_data and len(response_data["data"]) > 0:
                return response_data["data"][0]["url"]
            else:
                logger.error(f"Image generation failed: {response_data}")
                return None
        
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            return None
    
    def analyze_image(self, image_url: str, item_name: str) -> Dict[str, Any]:
        """
        Analyze the generated image to verify the objects and their quantities.
        
        Args:
            image_url: URL of the image to analyze
            item_name: The name of the item to look for
            
        Returns:
            Dictionary containing the recognized item and its quantity
        """
        try:
            prompt_text = f"This image contains multiple instances of a specific item: '{item_name}'. Count exactly how many of this item appear in the image and respond only with a JSON object in this format: {{\"name\": \"{item_name}\", \"quantity\": X}} where X is the number you counted."
            
            response = self.client.chat.completions.create(
                model=self.multimodal_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt_text},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_url,
                                    "detail": "high"
                                }
                            },
                        ],
                    }
                ],
                max_tokens=300,
                response_format={"type": "json_object"}
            )
            
            # Parse the response
            result = json.loads(response.choices[0].message.content)
            return result
        
        except Exception as e:
            logger.error(f"Error analyzing image: {str(e)}")
            return {"name": item_name, "quantity": 0, "error": str(e)}
    
    def create_attention_exercise(self, difficulty: str = "medium") -> Dict[str, Any]:
        """
        Create a complete attention training exercise.
        
        Args:
            difficulty: Difficulty level (easy, medium, hard)
            
        Returns:
            Dictionary containing the exercise data including image URL and answer
        """
        # Generate the prompt and get the expected item and quantity
        prompt, expected_item, expected_quantity = self.generate_prompt(difficulty)
        
        # Generate the image
        image_url = self.generate_image(prompt)
        if not image_url:
            return {"error": "Failed to generate image"}
        
        # Analyze the image to get the actual count
        result = self.analyze_image(image_url, expected_item)
        
        # Return the complete exercise
        return {
            "image_url": image_url,
            "difficulty": difficulty,
            "expected_item": expected_item,
            "expected_quantity": expected_quantity,
            "actual_quantity": result.get("quantity", 0),
            "prompt": prompt
        } 