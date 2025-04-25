# Cognitive Empowerment: Run Instructions

This document provides step-by-step instructions to set up and run the Cognitive Empowerment training system.

## Prerequisites

Before getting started, make sure you have the following installed:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- MongoDB (v4.0.0 or later) - optional, as the demo uses mock data

## Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd cognitive-empowerment
```

2. **Install server dependencies**

```bash
npm install
```

3. **Install client dependencies**

```bash
# Install web client dependencies
cd client/web
npm install
cd ../..

# Install mobile client dependencies (if needed)
cd client/mobile
npm install
cd ../..
```

4. **Configure environment variables**

Create a `.env` file in the root directory based on the provided `.env` example:

```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=mongodb://localhost:27017/cognitive-training
```

Note: For the demo version, you don't need to set up a real OpenAI API key as the system uses mock data.

## Running the Application

1. **Start the development server (backend)**

From the root directory:

```bash
npm run server
```

The server will start on http://localhost:5000

2. **Start the client application (frontend)**

In a new terminal, from the root directory:

```bash
npm run client
```

The React development server will start on http://localhost:3000

3. **Run both concurrently (recommended)**

```bash
npm run dev
```

This will start both the server and client concurrently.

## Usage Instructions

1. Open your browser and navigate to http://localhost:3000

2. **Demo Login Credentials**:
   - Email: demo@example.com
   - Password: password123

3. **Explore the Cognitive Training Modules**:
   - Memory Training
   - Attention Training
   - Executive Function Training
   - Language Ability Training
   - Logic and Reasoning Training
   - Emotion Regulation Training

4. **Track Your Progress**:
   Navigate to the Progress page to see statistics and performance metrics.

## Mobile Application (Future)

The mobile application is currently under development. Instructions for running the React Native app will be provided in a future update.

## Testing

Run the test suite with:

```bash
npm test
```

## Deployment

For production deployment, build the client:

```bash
cd client/web
npm run build
cd ../..
```

Then set the environment variable:

```
NODE_ENV=production
```

And start the server:

```bash
npm start
```

## Troubleshooting

- **API Connection Issues**: Ensure the backend server is running on port 5000
- **Database Connection**: For a real MongoDB connection, make sure your MongoDB instance is running
- **CORS Errors**: The development setup should handle CORS automatically. If you experience issues, check the server console for details.

## Support

For additional help, please open an issue on the GitHub repository or contact the development team. 