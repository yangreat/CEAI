import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const WordListTraining = () => {
  const [stage, setStage] = useState('start'); // start, learn, quiz, results
  const [wordLists, setWordLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [currentWords, setCurrentWords] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);

  // Define sample word lists for different difficulty levels
  useEffect(() => {
    const sampleWordLists = {
      easy: {
        id: 'easy-words',
        name: 'Basic Words',
        words: ['Apple', 'Book', 'Chair', 'Door', 'Elephant', 'Flower', 'Guitar', 'House', 'Ice', 'Jacket'],
        learningTime: 60, // in seconds
      },
      medium: {
        id: 'medium-words',
        name: 'Intermediate Words',
        words: ['Atmosphere', 'Blueprint', 'Constitution', 'Dialogue', 'Equilibrium', 'Fundamental', 'Generation', 'Heritage', 'Innovation', 'Jurisdiction'],
        learningTime: 90,
      },
      hard: {
        id: 'hard-words',
        name: 'Advanced Words',
        words: ['Ambiguous', 'Benevolent', 'Circumvent', 'Diligence', 'Empirical', 'Fortuitous', 'Gratuitous', 'Hierarchical', 'Imperative', 'Juxtaposition', 'Kaleidoscope', 'Labyrinth'],
        learningTime: 120,
      }
    };

    setWordLists(sampleWordLists);
  }, []);

  const startTraining = (level) => {
    setSelectedList(wordLists[level]);
    setCurrentWords(wordLists[level].words);
    setStage('learn');
    
    // Start the timer
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
  };

  const startQuiz = () => {
    // Clear the timer
    clearInterval(timerInterval);
    setTimerInterval(null);
    
    // Initialize empty answers array
    setAnswers(Array(currentWords.length).fill(''));
    
    // Move to quiz stage
    setStage('quiz');
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const submitAnswers = () => {
    // Calculate score
    let correctCount = 0;
    answers.forEach((answer, index) => {
      if (answer.toLowerCase() === currentWords[index].toLowerCase()) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / currentWords.length) * 100);
    setScore(finalScore);
    setStage('results');
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="container">
      <h1>Word List Memory Training</h1>
      <p className="lead">
        Improve your memory by memorizing lists of words and recalling them.
      </p>

      {stage === 'start' && (
        <div className="exercise-selection">
          <h2>Select Difficulty Level</h2>
          <div className="difficulty-cards">
            <div className="card" onClick={() => startTraining('easy')}>
              <h3>Easy</h3>
              <p>10 simple words</p>
              <p>60 seconds to memorize</p>
              <button className="btn">Start Easy Training</button>
            </div>
            <div className="card" onClick={() => startTraining('medium')}>
              <h3>Medium</h3>
              <p>10 intermediate words</p>
              <p>90 seconds to memorize</p>
              <button className="btn">Start Medium Training</button>
            </div>
            <div className="card" onClick={() => startTraining('hard')}>
              <h3>Hard</h3>
              <p>12 advanced words</p>
              <p>120 seconds to memorize</p>
              <button className="btn">Start Hard Training</button>
            </div>
          </div>
        </div>
      )}

      {stage === 'learn' && selectedList && (
        <div className="learning-stage">
          <h2>Memorize These Words</h2>
          <p>Time remaining: {formatTime(selectedList.learningTime - timer)}</p>
          
          {timer < selectedList.learningTime ? (
            <>
              <div className="word-grid">
                {currentWords.map((word, index) => (
                  <div key={index} className="word-card">
                    {word}
                  </div>
                ))}
              </div>
              <p className="instructions">
                Try to memorize all these words. You'll be asked to recall them afterward.
              </p>
            </>
          ) : (
            <>
              <p>Time's up!</p>
              <button className="btn" onClick={startQuiz}>
                Continue to Quiz
              </button>
            </>
          )}
          
          {timer < selectedList.learningTime && (
            <button className="btn" onClick={startQuiz}>
              I'm Ready - Start Quiz Now
            </button>
          )}
        </div>
      )}

      {stage === 'quiz' && (
        <div className="quiz-stage">
          <h2>Recall the Words</h2>
          <p>Type in as many words as you can remember from the list.</p>
          
          <div className="answer-grid">
            {answers.map((answer, index) => (
              <div key={index} className="answer-input">
                <label>Word {index + 1}</label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="Type word here"
                />
              </div>
            ))}
          </div>
          
          <button 
            className="btn" 
            onClick={submitAnswers}
          >
            Submit Answers
          </button>
        </div>
      )}

      {stage === 'results' && (
        <div className="results-stage">
          <h2>Your Results</h2>
          
          <div className="score-display">
            <div className="score-circle">
              <span>{score}%</span>
            </div>
            <p>{score >= 80 ? 'Excellent!' : score >= 60 ? 'Good job!' : 'Keep practicing!'}</p>
          </div>
          
          <div className="word-comparison">
            <div className="column">
              <h3>Original Words</h3>
              <ul>
                {currentWords.map((word, index) => (
                  <li key={index}>{word}</li>
                ))}
              </ul>
            </div>
            
            <div className="column">
              <h3>Your Answers</h3>
              <ul>
                {answers.map((answer, index) => (
                  <li key={index} className={answer.toLowerCase() === currentWords[index].toLowerCase() ? 'correct' : 'incorrect'}>
                    {answer || '(no answer)'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="memory-tips">
            <h3>Memory Tips</h3>
            <ul>
              <li>Try grouping words into categories or creating a story with them.</li>
              <li>Visualize each word vividly in your mind.</li>
              <li>Create associations between words or connect them to personal experiences.</li>
              <li>Practice regularly to improve your memory capacity.</li>
            </ul>
          </div>
          
          <div className="action-buttons">
            <button className="btn" onClick={() => setStage('start')}>
              Try Again
            </button>
            <Link to="/training/memory" className="btn">
              Return to Memory Training
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordListTraining; 