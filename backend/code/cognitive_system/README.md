# Backend of Cognitive Empowerment System

A comprehensive backend system for cognitive training applications designed to help users improve various cognitive abilities including memory, attention, executive function, language ability, logic and reasoning, and emotion regulation.

## Project Overview

This system provides a backend API for a cognitive training web application. The initial implementation focuses on three main components:

1. **Chatbot System**: A text and speech-based chatbot that serves as the foundation for cognitive training exercises
2. **Emotion Regulation Training**: Real-time emotion detection and analysis to help users understand and manage their emotions
3. **Logic and Reasoning Training**: Implementation of Gomoku (Five in a Row) game with an AI agent to improve logical thinking and strategic planning

## Project Structure

```
cognitive_system/
├── api/               # API endpoints and request handlers
├── config/            # Configuration settings and utilities
├── core/              # Core functionality and base classes
├── db/                # Database models and connections
├── docs/              # Detailed documentation for services
├── models/            # Machine learning models and abstractions
├── services/          # Business logic for different system components
│   ├── chatbot/       # Chatbot implementation with text and speech capabilities
│   ├── emotion_regulation/  # Emotion detection and regulation functionality
│   └── logic_reasoning/     # Logic games and reasoning exercises
├── tests/             # Unit and integration tests
├── utils/             # Utility functions and helper modules
├── .env.example       # Example environment variables
├── __init__.py        # Package initialization
├── requirements.txt   # Project dependencies
└── README.md          # Project documentation
```

## Setup Instructions

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-organization/cognitive-system.git
   cd cognitive-system
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file to add your API keys and configure settings.

### Running the Application

To start the backend server:

```
uvicorn api.main:app --reload
```

The API will be available at `http://localhost:8000`.

## Frontend Integration

This backend is designed to be integrated with a frontend web application. Here's how to connect the different components:

### Chatbot Integration

The chatbot service exposes RESTful endpoints for:
- Sending text messages
- Processing speech input
- Retrieving conversation history

Example API usage:
```javascript
// Send a text message
const response = await fetch('/api/chatbot/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Hello, how are you?',
    userId: 'user123'
  }),
});
const data = await response.json();
```

### Emotion Regulation Integration

The emotion regulation service provides endpoints for:
- Real-time emotion analysis
- Emotional state tracking over conversations
- Depression risk assessment based on conversation history
- Emotional stability measurement

Example API usage:
```javascript
// Check depression risk for a conversation
const response = await fetch('/emotion-regulation/depression-risk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    conversation_id: 'conversation123'
  }),
});
const data = await response.json();
```

For detailed documentation on the Emotion Regulation API, see `docs/emotion_regulation_guide.md`.

### Logic and Reasoning Integration

The Gomoku game implementation exposes endpoints for:
- Starting a new game
- Making moves
- Getting AI responses
- Retrieving game state

## Development

### Adding New Training Modules

To add a new cognitive training module:

1. Create a new directory under `services/`
2. Implement the core functionality
3. Create API endpoints in the `api/` directory
4. Add tests in the `tests/` directory

### Code Conventions

This project follows these conventions:
- Type hints for all function parameters and return values
- Docstrings for all classes and functions
- PEP 8 style guidelines
- Object-oriented design patterns

## Recent Updates

### Emotion Regulation Service

- **March 2025**: Updated depression risk detection to analyze conversation history
- **April 2025**: Added conversation ID integration for emotion stability tracking
- **April 2025**: Created comprehensive documentation for emotion regulation endpoints

### Logic and Reasoning Service

- **April 2025**: Fixed Gomoku game controller to handle move validation properly
- **April 2025**: Enhanced AI agent reliability with better error handling

## License

[Specify your license information here]

## Contributors

[List of project contributors]

## Contact

For questions or support, please contact [your contact information].
