"""
Emotion analysis service for the Cognitive Empowerment System.
Detects emotions and sentiment from text inputs to help with regulation.
"""

import time
from collections import deque
from typing import Dict, List, Optional, Tuple, Union, Deque

import numpy as np
from transformers import pipeline

from cognitive_system.config import settings


class EmotionAnalyzer:
    """
    Analyzes emotions in text using pre-trained models.
    
    Detects emotions in text using transformer-based models and
    provides depression risk analysis based on emotional patterns.
    """
    
    def __init__(self, model_name: Optional[str] = None):
        """
        Initialize the emotion analyzer with a specified model.
        
        Args:
            model_name: Optional model name override (default from settings)
        """
        self.model_name = model_name or "j-hartmann/emotion-english-distilroberta-base"
        self.classifier = pipeline("text-classification", model=self.model_name, return_all_scores=True)
        
        # Store history of emotions for tracking patterns
        self.emotion_history: Deque[Dict[str, float]] = deque(maxlen=50)
        self.last_analysis_time = 0
        
        # Map of emotions that can indicate depression risk when occurring frequently
        self.depression_indicators = {
            "sadness": 2.0,
            "fear": 1.5,
            "anger": 1.2,
            "disgust": 1.2,
            "neutral": 0.5,  # Persistent neutral/emotionless state can be concerning
            "joy": -1.5,     # Positive emotions lower depression risk
            "surprise": 0.0  # Neutral impact
        }
    
    def analyze_text(self, text: str) -> Dict[str, float]:
        """
        Analyze the emotional content of a text sample.
        
        Args:
            text: The text to analyze
            
        Returns:
            Dict[str, float]: Dictionary mapping emotions to their scores
        """
        # Get raw predictions from the model
        predictions = self.classifier(text)[0]
        
        # Convert to a more usable format
        emotion_scores = {item["label"]: item["score"] for item in predictions}
        
        # Update history
        self.emotion_history.append(emotion_scores)
        self.last_analysis_time = time.time()
        
        return emotion_scores
    
    def get_dominant_emotion(self, emotion_scores: Dict[str, float]) -> Tuple[str, float]:
        """
        Get the dominant emotion from a set of emotion scores.
        
        Args:
            emotion_scores: Dictionary of emotion scores
            
        Returns:
            Tuple[str, float]: The dominant emotion and its score
        """
        if not emotion_scores:
            return "neutral", 0.0
        
        dominant_emotion = max(emotion_scores.items(), key=lambda x: x[1])
        return dominant_emotion[0], dominant_emotion[1]
    
    def analyze_depression_risk(self) -> Dict[str, Union[float, str]]:
        """
        Analyze the risk of depression based on emotional patterns.
        
        Returns:
            Dict[str, Union[float, str]]: Depression risk assessment
        """
        if len(self.emotion_history) < 5:
            return {
                "risk_score": 0.0,
                "risk_level": "insufficient_data",
                "dominant_emotions": [],
                "analysis": "More data needed for risk assessment."
            }
        
        # Calculate weighted average of emotion frequencies
        emotion_counts = {}
        total_entries = len(self.emotion_history)
        
        # Count dominant emotions in history
        for entry in self.emotion_history:
            dominant, _ = self.get_dominant_emotion(entry)
            emotion_counts[dominant] = emotion_counts.get(dominant, 0) + 1
        
        # Calculate frequencies
        emotion_frequencies = {k: v / total_entries for k, v in emotion_counts.items()}
        
        # Calculate depression risk score
        risk_score = 0.0
        for emotion, frequency in emotion_frequencies.items():
            indicator_weight = self.depression_indicators.get(emotion, 0.0)
            risk_score += frequency * indicator_weight
        
        # Normalize between 0-100
        risk_score = min(max(risk_score * 50, 0), 100)
        
        # Determine risk level
        risk_level = "low"
        if risk_score > 70:
            risk_level = "high"
        elif risk_score > 40:
            risk_level = "moderate"
        
        # Get top 3 dominant emotions
        dominant_emotions = sorted(
            emotion_frequencies.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:3]
        
        # Convert tuples to dictionaries for proper response validation
        dominant_emotions = [{"emotion": emotion, "frequency": freq} for emotion, freq in dominant_emotions]
        
        # Create analysis
        analysis = f"Based on emotional patterns, depression risk is {risk_level}."
        if risk_level == "high":
            analysis += " Frequent negative emotions detected. Consider suggesting professional assistance."
        elif risk_level == "moderate":
            analysis += " Some concerning emotional patterns. Monitoring recommended."
        
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "dominant_emotions": dominant_emotions,
            "analysis": analysis
        }
    
    def get_emotion_trend(self, emotion: str, window: int = 10) -> List[float]:
        """
        Get the trend of a specific emotion over time.
        
        Args:
            emotion: The emotion to track
            window: Number of recent entries to include
            
        Returns:
            List[float]: List of emotion scores over time
        """
        if not self.emotion_history:
            return []
        
        window = min(window, len(self.emotion_history))
        recent_history = list(self.emotion_history)[-window:]
        
        return [entry.get(emotion, 0.0) for entry in recent_history]
    
    def get_emotional_stability(self) -> float:
        """
        Calculate emotional stability based on variance in emotional patterns.
        
        Returns:
            float: Stability score (0-1, higher is more stable)
        """
        if len(self.emotion_history) < 3:
            return 0.5  # Default middle value with insufficient data
        
        # Extract dominant emotions
        dominant_emotions = [self.get_dominant_emotion(entry)[0] for entry in self.emotion_history]
        
        # Calculate diversity (more diversity = less stability)
        unique_emotions = set(dominant_emotions)
        emotion_diversity = len(unique_emotions) / len(self.depression_indicators)
        
        # Calculate frequency changes (more changes = less stability)
        changes = sum(1 for i in range(1, len(dominant_emotions)) if dominant_emotions[i] != dominant_emotions[i-1])
        change_rate = changes / (len(dominant_emotions) - 1)
        
        # Combine factors (lower is less stable)
        stability_score = 1.0 - ((emotion_diversity + change_rate) / 2)
        
        return stability_score
