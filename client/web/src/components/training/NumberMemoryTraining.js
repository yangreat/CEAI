import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NumberMemoryTraining = () => {
  const [stage, setStage] = useState('start'); // start, learn, quiz, results
  const [difficulty, setDifficulty] = useState('easy');
  const [numberSequence, setNumberSequence] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [memoryTips, setMemoryTips] = useState([]);

  // Configuration for different difficulty levels
  const difficultyConfig = {
    easy: {
      length: 5,
      learnTime: 10, // seconds
      description: 'A 5-digit sequence to memorize in 10 seconds.'
    },
    medium: {
      length: 7,
      learnTime: 10,
      description: 'A 7-digit sequence to memorize in 10 seconds.'
    },
    hard: {
      length: 10,
      learnTime: 15,
      description: 'A 10-digit sequence to memorize in 15 seconds.'
    }
  };

  // Generate random number sequence based on difficulty
  const generateNumberSequence = (level) => {
    const config = difficultyConfig[level];
    const sequence = [];
    
    for (let i = 0; i < config.length; i++) {
      sequence.push(Math.floor(Math.random() * 10));
    }
    
    return sequence;
  };

  // Start training with selected difficulty
  const startTraining = (level) => {
    setDifficulty(level);
    setNumberSequence(generateNumberSequence(level));
    setStage('learn');
    setTimer(difficultyConfig[level].learnTime);
    
    // Start countdown timer
    const interval = setInterval(() => {
      setTimer(prevTime => {
        if (prevTime <= 1) {
          clearInterval(interval);
          setStage('quiz');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setTimerInterval(interval);
  };

  // Handle quiz submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert user answer string to array of digits
    const userAnswerArray = userAnswer.split('').map(Number);
    
    // Calculate score
    let correctDigits = 0;
    userAnswerArray.forEach((digit, index) => {
      if (index < numberSequence.length && digit === numberSequence[index]) {
        correctDigits++;
      }
    });
    
    const percentage = Math.round((correctDigits / numberSequence.length) * 100);
    setScore(percentage);
    
    // Generate memory tips based on performance
    generateMemoryTips(percentage);
    
    setStage('results');
  };

  // Generate personalized memory tips
  const generateMemoryTips = (percentage) => {
    const tips = [
      'Break long numbers into chunks. For example, remember 9876543210 as 987-654-321-0.',
      'Create a rhythm or pattern when memorizing numbers.',
      'Associate numbers with meaningful dates or familiar sequences.',
      'Visualize the numbers in your mind\'s eye as you memorize them.',
      'Create a story using the numbers (e.g., "I woke up at 7, ate 4 eggs, and walked 2 miles").'
    ];
    
    // Select appropriate tips based on performance
    if (percentage < 60) {
      setMemoryTips(tips);
    } else if (percentage < 80) {
      setMemoryTips(tips.slice(0, 3));
    } else {
      setMemoryTips(tips.slice(0, 2));
    }
  };

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Handle input change for quiz answer
  const handleAnswerChange = (e) => {
    // Only allow numeric input
    const value = e.target.value.replace(/[^0-9]/g, '');
    setUserAnswer(value);
  };

  // Try again with same difficulty
  const tryAgain = () => {
    setUserAnswer('');
    setNumberSequence(generateNumberSequence(difficulty));
    setStage('learn');
    setTimer(difficultyConfig[difficulty].learnTime);
    
    // Start countdown timer
    const interval = setInterval(() => {
      setTimer(prevTime => {
        if (prevTime <= 1) {
          clearInterval(interval);
          setStage('quiz');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setTimerInterval(interval);
  };

  return (
    <div className="container">
      <h1>Number Memory Training</h1>
      <p className="lead">
        Enhance your memory for numbers through targeted exercises that challenge your recall ability.
      </p>

      {stage === 'start' && (
        <div className="card">
          <h2>Select Difficulty Level</h2>
          <div className="difficulty-selection">
            {Object.keys(difficultyConfig).map((level) => (
              <div key={level} className="difficulty-option">
                <h3 className={`difficulty difficulty-${level}`}>{level.charAt(0).toUpperCase() + level.slice(1)}</h3>
                <p>{difficultyConfig[level].description}</p>
                <button 
                  className="btn" 
                  onClick={() => startTraining(level)}
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === 'learn' && (
        <div className="card">
          <h2>Memorize the Number Sequence</h2>
          <p>You have {timer} seconds left to memorize.</p>
          
          <div className="number-display">
            {numberSequence.map((digit, index) => (
              <span key={index} className="digit">{digit}</span>
            ))}
          </div>
          
          <div className="memory-strategies">
            <h3>Memory Strategies:</h3>
            <ul>
              <li>Divide the number into chunks</li>
              <li>Create a visual pattern</li>
              <li>Associate with familiar numbers</li>
            </ul>
          </div>
        </div>
      )}

      {stage === 'quiz' && (
        <div className="card">
          <h2>Recall the Number Sequence</h2>
          <p>Enter the number sequence you just memorized:</p>
          
          <form onSubmit={handleSubmit} className="quiz-form">
            <input
              type="text"
              value={userAnswer}
              onChange={handleAnswerChange}
              placeholder="Enter the numbers..."
              maxLength={difficultyConfig[difficulty].length}
              autoFocus
            />
            <button 
              type="submit" 
              className="btn"
              disabled={userAnswer.length === 0}
            >
              Submit
            </button>
          </form>
        </div>
      )}

      {stage === 'results' && (
        <div className="card">
          <h2>Results</h2>
          
          <div className="results-container">
            <div className="score">
              <div className="score-circle">
                <span>{score}%</span>
              </div>
              <p>{score >= 80 ? 'Excellent!' : score >= 60 ? 'Good job!' : 'Keep practicing!'}</p>
            </div>
            
            <div className="results-details">
              <p><strong>Correct Sequence:</strong></p>
              <div className="number-display">
                {numberSequence.map((digit, index) => (
                  <span key={index} className="digit">{digit}</span>
                ))}
              </div>
              
              <p><strong>Your Answer:</strong></p>
              <div className="number-display">
                {userAnswer.split('').map((digit, index) => (
                  <span 
                    key={index} 
                    className={`digit ${index < numberSequence.length && Number(digit) === numberSequence[index] ? 'correct' : 'incorrect'}`}
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="feedback">
              <h3>Memory Tips</h3>
              <ul>
                {memoryTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
            
            <div className="action-buttons">
              <button className="btn" onClick={tryAgain}>
                Try Again
              </button>
              <button className="btn" onClick={() => setStage('start')}>
                Change Difficulty
              </button>
              <Link to="/training/memory" className="btn btn-secondary">
                Back to Memory Training
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberMemoryTraining; 