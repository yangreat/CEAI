"""
API module for the Cognitive Empowerment System.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create the FastAPI application
app = FastAPI(
    title="Cognitive Empowerment System API",
    description="API for cognitive empowerment functions including logic reasoning, emotional intelligence, and more.",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from cognitive_system.api.logic_reasoning import router as logic_reasoning_router
from cognitive_system.api.emotion_regulation import router as emotion_regulation_router
from cognitive_system.api.chatbot import router as chatbot_router
from cognitive_system.api.attention_training import router as attention_training_router

# Add routers to the application
app.include_router(logic_reasoning_router, prefix="/logic-reasoning", tags=["Logic Reasoning"])
app.include_router(emotion_regulation_router, prefix="/emotion-regulation", tags=["Emotion Regulation"])
app.include_router(chatbot_router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(attention_training_router, prefix="/attention-training", tags=["Attention Training"])
