# Emotion Regulation API Guide

This guide explains how to use the Emotion Regulation API endpoints to analyze emotions, detect depression risk, and monitor emotional stability.

## Getting Started

The Emotion Regulation service provides endpoints for:

1. Analyzing emotions in text
2. Assessing depression risk based on conversation history
3. Tracking emotional trends over time
4. Measuring emotional stability

All these features work with the conversation system to provide insights into a user's emotional state throughout their interactions with the system.

## API Endpoints

### 1. Analyze Emotions in Text

**Endpoint:** `POST /emotion-regulation/analyze`

This endpoint analyzes emotions in a single text sample.

**Request Body:**
```json
{
  "text": "I'm feeling really happy today!",
  "conversation_id": "optional-conversation-id"
}
```

**Response:**
```json
{
  "emotions": {
    "joy": 0.85,
    "sadness": 0.02,
    "anger": 0.01,
    "fear": 0.01,
    "surprise": 0.05,
    "disgust": 0.01,
    "neutral": 0.05
  },
  "dominant_emotion": "joy",
  "dominant_score": 0.85
}
```

### 2. Analyze Depression Risk

**Endpoint:** `POST /emotion-regulation/depression-risk`

Analyzes depression risk based on emotional patterns in a conversation. This endpoint requires a conversation ID to access the message history.

**Request Body:**
```json
{
  "conversation_id": "required-conversation-id"
}
```

**Response:**
```json
{
  "risk_score": 28.5,
  "risk_level": "low",
  "dominant_emotions": [
    {"emotion": "joy", "frequency": 0.45},
    {"emotion": "neutral", "frequency": 0.25},
    {"emotion": "sadness", "frequency": 0.15}
  ],
  "analysis": "Based on emotional patterns, depression risk is low."
}
```

**How It Works:**
1. The system retrieves all user messages from the specified conversation
2. It analyzes the emotions in each message
3. It calculates a depression risk score based on the frequency of depression-indicating emotions
4. A minimum of 3 messages is required for analysis

### 3. Get Emotional Stability

**Endpoint:** `POST /emotion-regulation/stability`

Calculates emotional stability based on the consistency of emotions expressed in a conversation.

**Request Body:**
```json
{
  "conversation_id": "required-conversation-id"
}
```

**Response:**
```json
{
  "stability_score": 0.72,
  "interpretation": "High emotional stability",
  "analyzed_messages": 15
}
```

**How It Works:**
1. The system retrieves all user messages from the specified conversation
2. It analyzes the emotions in each message
3. It calculates stability based on the variance in emotions and frequency of changes
4. Higher scores (closer to 1.0) indicate more stable emotional states
5. A minimum of 3 messages is required for analysis

### 4. Track Emotion Trends

**Endpoint:** `POST /emotion-regulation/trend`

Tracks the trend of a specific emotion over time within a conversation.

**Request Body:**
```json
{
  "emotion": "joy",
  "window": 10,
  "conversation_id": "optional-conversation-id"
}
```

**Response:**
```json
{
  "trend": [0.23, 0.45, 0.67, 0.72, 0.58],
  "emotion": "joy",
  "average": 0.53
}
```

### 5. Batch Analyze Emotions

**Endpoint:** `POST /emotion-regulation/batch-analyze`

Analyzes emotions in multiple text samples at once.

**Request Body:**
```json
{
  "texts": [
    "I'm feeling happy today!",
    "This is making me angry.",
    "I'm not sure how I feel."
  ]
}
```

**Response:**
```json
[
  {
    "emotions": { "joy": 0.85, ... },
    "dominant_emotion": "joy",
    "dominant_score": 0.85
  },
  {
    "emotions": { "anger": 0.76, ... },
    "dominant_emotion": "anger",
    "dominant_score": 0.76
  },
  {
    "emotions": { "neutral": 0.64, ... },
    "dominant_emotion": "neutral",
    "dominant_score": 0.64
  }
]
```

## Step-by-Step Usage Example

1. **Start a conversation with the chatbot**:
   ```
   POST /chatbot/send
   {
     "text": "Hello, I'm not feeling great today."
   }
   ```
   This returns a `conversation_id` that you'll use for subsequent requests.

2. **Continue the conversation**:
   ```
   POST /chatbot/send
   {
     "text": "I've been feeling down for a few days now.",
     "conversation_id": "your-conversation-id"
   }
   ```

3. **Add more messages to build a history**:
   ```
   POST /chatbot/send
   {
     "text": "I'm having trouble sleeping and concentrating.",
     "conversation_id": "your-conversation-id"
   }
   ```

4. **Check depression risk**:
   ```
   POST /emotion-regulation/depression-risk
   {
     "conversation_id": "your-conversation-id"
   }
   ```

5. **View emotional stability**:
   ```
   POST /emotion-regulation/stability
   {
     "conversation_id": "your-conversation-id"
   }
   ```

6. **Track a specific emotion**:
   ```
   POST /emotion-regulation/trend
   {
     "emotion": "sadness",
     "conversation_id": "your-conversation-id"
   }
   ```