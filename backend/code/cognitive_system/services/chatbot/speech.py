"""
Speech recognition and processing for the chatbot service.
"""

import io
import os
import tempfile
from typing import Optional, Tuple

import speech_recognition as sr
import pyttsx3

from cognitive_system.config import settings


class SpeechProcessor:
    """
    Process speech input and output for the chatbot service.
    Handles speech recognition and text-to-speech functionality.
    """
    
    def __init__(self, language: Optional[str] = None):
        """
        Initialize the speech processor.
        
        Args:
            language: Optional language code override (default from settings)
        """
        self.language = language or settings.SPEECH_LANGUAGE
        self.recognizer = sr.Recognizer()
        self.engine = pyttsx3.init()
        
        # Configure speech properties
        self.engine.setProperty('rate', 150)  # Slower rate for elderly users
        self.engine.setProperty('volume', 1.0)
        
        # Try to get a female voice for better clarity
        voices = self.engine.getProperty('voices')
        for voice in voices:
            if 'female' in voice.name.lower():
                self.engine.setProperty('voice', voice.id)
                break
    
    def recognize_from_microphone(self, timeout: int = 5) -> Tuple[bool, str]:
        """
        Recognize speech from microphone input.
        
        Args:
            timeout: Number of seconds to listen for (default 5)
            
        Returns:
            Tuple[bool, str]: Success status and recognized text or error message
        """
        try:
            with sr.Microphone() as source:
                print("Listening...")
                
                # Adjust for ambient noise
                self.recognizer.adjust_for_ambient_noise(source)
                
                # Listen for speech
                audio = self.recognizer.listen(source, timeout=timeout)
                
                print("Processing speech...")
                
                # Convert speech to text
                text = self.recognizer.recognize_google(audio, language=self.language)
                return True, text
                
        except sr.WaitTimeoutError:
            return False, "Listening timed out. Please try again."
        except sr.UnknownValueError:
            return False, "Could not understand audio. Please try again."
        except sr.RequestError as e:
            return False, f"Speech service error: {str(e)}"
        except Exception as e:
            return False, f"Error in speech recognition: {str(e)}"
    
    def recognize_from_audio_file(self, audio_file_path: str) -> Tuple[bool, str]:
        """
        Recognize speech from an audio file.
        
        Args:
            audio_file_path: Path to the audio file
            
        Returns:
            Tuple[bool, str]: Success status and recognized text or error message
        """
        try:
            with sr.AudioFile(audio_file_path) as source:
                audio = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio, language=self.language)
                return True, text
        except Exception as e:
            return False, f"Error processing audio file: {str(e)}"
    
    def recognize_from_audio_data(self, audio_data: bytes) -> Tuple[bool, str]:
        """
        Recognize speech from raw audio data.
        
        Args:
            audio_data: Raw audio data bytes
            
        Returns:
            Tuple[bool, str]: Success status and recognized text or error message
        """
        try:
            # Create a temporary file for the audio data
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_path = temp_file.name
                temp_file.write(audio_data)
            
            # Process the temporary file
            result = self.recognize_from_audio_file(temp_path)
            
            # Clean up
            os.unlink(temp_path)
            
            return result
        except Exception as e:
            return False, f"Error processing audio data: {str(e)}"
    
    def text_to_speech(self, text: str) -> None:
        """
        Convert text to speech and play it.
        
        Args:
            text: The text to convert to speech
        """
        self.engine.say(text)
        self.engine.runAndWait()
    
    def text_to_audio_data(self, text: str) -> bytes:
        """
        Convert text to audio data.
        
        Args:
            text: The text to convert to speech
            
        Returns:
            bytes: The audio data in WAV format
        """
        # Create a temporary in-memory file
        output = io.BytesIO()
        
        # Save speech to the in-memory file
        self.engine.save_to_file(text, output)
        self.engine.runAndWait()
        
        # Get the binary data
        output.seek(0)
        audio_data = output.read()
        
        return audio_data
