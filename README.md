# Cognitive Empowerment: AI-Driven Training System

An AI-powered cognitive training platform designed to enhance brain health across all ages, with a special focus on the elderly and people with cognitive impairments.

## Project Overview

This application offers personalized cognitive training exercises across six key domains:

1. **Memory Training**: Enhance short-term and long-term memory through activities like "Family Photo Recall" and "Number Memory Training"
2. **Attention Training**: Improve focus and attention span with games like "Find the Hidden Objects" and "Spot the Difference"
3. **Executive Function Training**: Develop planning, organization, and problem-solving with tools like "Daily Schedule Organizer" and task switching exercises 
4. **Language Ability Training**: Boost vocabulary and language fluency via word puzzles, reading comprehension, and proverbs exercises
5. **Logic and Reasoning Training**: Strengthen logical thinking through sudoku, logical puzzles, and sequence reasoning games
6. **Emotion Regulation Training**: Help users recognize and manage emotions with emotion identification and guided relaxation exercises

## Technology Stack

- **Frontend**: React.js for web interface
- **Backend**: Node.js with Express
- **UI/Components**: Custom CSS and React components
- **Routing**: React Router for client-side navigation
- **State Management**: React Hooks for local state management
- **Icons & Graphics**: React Icons and custom SVG components

## Installation Requirements

Before getting started, ensure you have the following installed:

- **Node.js** (v14.0.0 or later)
- **npm** (v6.0.0 or later)

## Installation & Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd cognitive-empowerment
```

2. **Install root dependencies**

```bash
npm install
```

3. **Install client dependencies**

```bash
cd client/web
npm install
cd ../..
```

4. **Install server dependencies**

```bash
cd server
npm install
cd ..
```

## Running the Application

There are several ways to run the application:

### Method 1: Start client and server separately

1. **Start the server (backend)**

```bash
cd server
node index.js
```

The server will run on http://localhost:5000

2. **Start the client (frontend) in a new terminal**

```bash
cd client/web
npm start
```

The React application will launch at http://localhost:3000 and automatically open in your default browser.

### Method 2: Start from root directory

If you have the project's root package.json properly configured with scripts:

```bash
# To run the server
npm run server

# To run the client
npm run client

# To run both concurrently
npm run dev
```

## Using the Application

1. **Home Page**
   - The application starts at the home page with an overview of available training categories
   - Featured exercises are displayed at the top

2. **Training Categories**
   - Click on any category card to view available exercises
   - Each exercise shows difficulty level and estimated duration

3. **Training Exercises**
   - **Memory Training**: Test your recall with various memory exercises
   - **Attention Training**: Find hidden objects or spot differences in images
   - **Executive Training**: Practice planning and organization skills
   - **Language Training**: Enhance vocabulary and language comprehension
   - **Logic Training**: Challenge your reasoning with sudoku and logic puzzles
   - **Emotion Training**: Identify emotions and practice regulation techniques

4. **Exercise Workflow**
   - Select an exercise to begin
   - Read the instructions carefully
   - Complete the exercise following on-screen prompts
   - View your results and personalized tips after completion

5. **Progress Tracking**
   - The app tracks your performance across different cognitive domains
   - Review your progress to identify strengths and areas for improvement

## Troubleshooting

- **Images not loading**: Ensure your internet connection is stable
- **Interactive elements not responding**: Check if JavaScript is enabled in your browser
- **Server connection issues**: Verify the server is running on port 5000
- **Drag-and-drop not working**: Some browsers may have compatibility issues with drag events, try another browser

## Project Structure

```
/
├── client/                # Frontend application
│   └── web/               # React.js web application
│       ├── public/        # Static files
│       └── src/           # Source code
│           ├── components/# React components
│           │   ├── training/  # Training exercises components
│           │   └── ui/    # Reusable UI components
│           ├── App.js     # Main application component
│           └── App.css    # Global styles
├── server/                # Backend services
│   ├── api/               # REST API endpoints
│   └── index.js           # Server entry point
├── README.md              # Project documentation
└── RUN_INSTRUCTIONS.md    # Detailed run instructions
```

## Development Notes

- The application uses mock data for demonstration purposes
- User authentication is simulated in the current version
- The project is designed to be extended with real backend services and database integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 