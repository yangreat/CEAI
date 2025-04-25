"""
Main application entry point for the Cognitive Empowerment System.
"""

import uvicorn
from cognitive_system.api import app

if __name__ == "__main__":
    # Run the FastAPI application with uvicorn
    uvicorn.run(
        "cognitive_system.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Enable auto-reload during development
    ) 