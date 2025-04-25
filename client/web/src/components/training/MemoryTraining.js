import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WordListImage from '../ui/WordListImage';

const MemoryTraining = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState('list'); // list, learn, quiz, results
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);

  useEffect(() => {
    // In a real app, this would fetch from the backend
    // For this demo, we'll use hardcoded data
    setExercises([
      {
        id: 'memory-1',
        name: 'Family Photo Recall',
        description: 'An app presents a series of family photographs, including children, grandchildren, and old friends. The user spends time reviewing these images and is later quizzed on details like names, relationships, or events associated with the photos.',
        difficulty: 'medium',
        duration: 10,
        type: 'interactive'
      },
      {
        id: 'memory-2',
        name: 'Word List Memorization',
        description: 'Users are shown a list of words to memorize within a time limit, then asked to recall as many as possible.',
        difficulty: 'easy',
        duration: 5,
        type: 'quiz',
        path: '/training/memory/word-list'
      },
      {
        id: 'memory-3',
        name: '数字记忆训练',
        description: '通过记忆随机数字序列并在限时内回忆，提高短期记忆能力和工作记忆容量。包括不同难度级别。',
        difficulty: 'medium',
        duration: 8,
        type: 'quiz',
        path: '/training/memory/number-memory'
      }
    ]);

    setLoading(false);
  }, []);

  // Mock family photos data for the Family Photo Recall exercise
  const mockPhotos = [
    {
      id: 1,
      imageUrl: '/assets/exercises/family_scene.png',
      description: 'Family reunion at the park last summer.',
      details: {
        date: 'July 15, 2022',
        location: 'Central Park',
        people: [
          { name: 'John', relationship: 'Father' },
          { name: 'Mary', relationship: 'Mother' },
          { name: 'Lisa', relationship: 'Daughter' },
          { name: 'Mike', relationship: 'Son' },
          { name: 'Grandma Ellen', relationship: 'Grandmother' }
        ],
        event: 'Annual Family Reunion'
      }
    },
    {
      id: 2,
      imageUrl: '/assets/exercises/family_scene.png',
      description: 'Christmas celebration at home.',
      details: {
        date: 'December 25, 2022',
        location: 'Home',
        people: [
          { name: 'John', relationship: 'Father' },
          { name: 'Mary', relationship: 'Mother' },
          { name: 'Lisa', relationship: 'Daughter' },
          { name: 'Mike', relationship: 'Son' },
          { name: 'Uncle Bob', relationship: 'Uncle' },
          { name: 'Aunt Susan', relationship: 'Aunt' }
        ],
        event: 'Christmas Celebration'
      }
    },
    {
      id: 3,
      imageUrl: '/assets/exercises/family_scene.png',
      description: 'Graduation ceremony for Lisa.',
      details: {
        date: 'May 20, 2023',
        location: 'City University',
        people: [
          { name: 'John', relationship: 'Father' },
          { name: 'Mary', relationship: 'Mother' },
          { name: 'Lisa', relationship: 'Daughter' },
          { name: 'Mike', relationship: 'Son' },
          { name: 'Grandpa Joe', relationship: 'Grandfather' }
        ],
        event: 'Lisa\'s Graduation Ceremony'
      }
    }
  ];

  // Generate quiz questions based on photos
  const generateQuizQuestions = (photos) => {
    const questions = [];
    
    photos.forEach(photo => {
      // Question about date
      questions.push({
        photoId: photo.id,
        question: `When was this photo taken?`,
        correctAnswer: photo.details.date,
        options: [
          photo.details.date,
          'January 10, 2023',
          'October 5, 2022',
          'March 15, 2023'
        ].sort(() => Math.random() - 0.5)
      });
      
      // Question about location
      questions.push({
        photoId: photo.id,
        question: `Where was this photo taken?`,
        correctAnswer: photo.details.location,
        options: [
          photo.details.location,
          'Beach Resort',
          'Mountain Cabin',
          'Downtown Restaurant'
        ].sort(() => Math.random() - 0.5)
      });
      
      // Question about a person
      const randomPerson = photo.details.people[Math.floor(Math.random() * photo.details.people.length)];
      questions.push({
        photoId: photo.id,
        question: `What is ${randomPerson.name}'s relationship to you?`,
        correctAnswer: randomPerson.relationship,
        options: [
          randomPerson.relationship,
          'Cousin',
          'Friend',
          'Neighbor'
        ].sort(() => Math.random() - 0.5)
      });
      
      // Question about the event
      questions.push({
        photoId: photo.id,
        question: `What event was this photo taken at?`,
        correctAnswer: photo.details.event,
        options: [
          photo.details.event,
          'Birthday Party',
          'Wedding Anniversary',
          'Thanksgiving Dinner'
        ].sort(() => Math.random() - 0.5)
      });
    });
    
    // Shuffle questions and take the first 8
    return questions.sort(() => Math.random() - 0.5).slice(0, 8);
  };

  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setStage('learn');
    setPhotos(mockPhotos);
    setCurrentPhotoIndex(0);
    setTimer(0);
    setQuizQuestions(generateQuizQuestions(mockPhotos));

    // Start timer
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    // Clean up timer on unmount
    return () => clearInterval(interval);
  };

  const moveToNextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(prevIndex => prevIndex + 1);
    } else {
      // All photos viewed, move to quiz stage
      setStage('quiz');
      setCurrentPhotoIndex(0);
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const submitQuiz = () => {
    // Calculate score
    let correctAnswers = 0;
    quizQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / quizQuestions.length) * 100);
    setScore(finalScore);
    setStage('results');

    // In a real app, this would send the results to the backend
  };

  if (loading) {
    return (
      <div className="container">
        <h2>Loading Memory Training Exercises...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Memory Training</h1>
      <p className="lead">
        Enhance short-term and long-term memory through engaging, personalized exercises.
      </p>

      {stage === 'list' && (
        <div className="exercise-list">
          {exercises.map(exercise => (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-image">
                {exercise.id === 'memory-1' && (
                  <img
                    src="/assets/exercises/family_scene.png"
                    alt={exercise.name}
                    className="exercise-thumbnail"
                  />
                )}
                {exercise.id === 'memory-2' && (
                  <WordListImage height="180px" />
                )}
                {exercise.id === 'memory-3' && (
                  <img
                    src="/assets/thumbnails/memory_thumbnail.png"
                    alt={exercise.name}
                    className="exercise-thumbnail"
                  />
                )}
              </div>
              <div className="exercise-content">
                <h3 className="exercise-title">{exercise.name}</h3>
                <p className="exercise-description">{exercise.description}</p>
                <div className="exercise-meta">
                  <span className={`difficulty difficulty-${exercise.difficulty}`}>
                    {exercise.difficulty}
                  </span>
                  <span>{exercise.duration} minutes</span>
                  {exercise.path ? (
                    <Link to={exercise.path} className="btn">
                      开始训练
                    </Link>
                  ) : (
                    <button 
                      className="btn" 
                      onClick={() => startExercise(exercise)}
                    >
                      Start Exercise
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {stage === 'learn' && selectedExercise && (
        <div className="card">
          <h2>{selectedExercise.name} - Learning Phase</h2>
          <p>Study the photos carefully. You will be asked questions about them later.</p>
          <p className="timer">Time spent: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</p>

          <div className="photo-container">
            <img 
              src={photos[currentPhotoIndex].imageUrl} 
              alt={`${currentPhotoIndex + 1}`} 
              style={photos[currentPhotoIndex].imageUrl.includes('placeholder') ? { display: 'none' } : {}}
            />
            {/* 仅在没有实际图片时显示SVG */}
            {photos[currentPhotoIndex].imageUrl.includes('placeholder') && (
              <svg width="100%" height="250" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#e0e0e0" />
                <text x="50%" y="50%" fontFamily="Arial" fontSize="18" fill="#666" textAnchor="middle">
                  家庭照片 {currentPhotoIndex + 1}
                </text>
              </svg>
            )}
            <div className="photo-details">
              <h3>{photos[currentPhotoIndex].description}</h3>
              <p><strong>Date:</strong> {photos[currentPhotoIndex].details.date}</p>
              <p><strong>Location:</strong> {photos[currentPhotoIndex].details.location}</p>
              <p><strong>Event:</strong> {photos[currentPhotoIndex].details.event}</p>
              <p><strong>People:</strong></p>
              <ul>
                {photos[currentPhotoIndex].details.people.map((person, index) => (
                  <li key={index}>{person.name} - {person.relationship}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="navigation-buttons">
            <button 
              className="btn"
              onClick={moveToNextPhoto}
            >
              {currentPhotoIndex < photos.length - 1 ? 'Next Photo' : 'Start Quiz'}
            </button>
          </div>
        </div>
      )}

      {stage === 'quiz' && selectedExercise && (
        <div className="card">
          <h2>{selectedExercise.name} - Quiz Phase</h2>
          <p>Answer the following questions about the photos you studied.</p>
          <p className="timer">Time spent: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</p>

          <div className="quiz-container">
            {quizQuestions.map((question, index) => (
              <div key={index} className="quiz-question">
                <p><strong>Question {index + 1}:</strong> {question.question}</p>
                <div className="options">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="option">
                      <input 
                        type="radio" 
                        id={`q${index}-o${optionIndex}`}
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={() => handleAnswerSelect(index, option)}
                      />
                      <label htmlFor={`q${index}-o${optionIndex}`}>{option}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button 
            className="btn"
            onClick={submitQuiz}
            disabled={Object.keys(answers).length < quizQuestions.length}
          >
            Submit Answers
          </button>
        </div>
      )}

      {stage === 'results' && selectedExercise && (
        <div className="card">
          <h2>{selectedExercise.name} - Results</h2>
          <div className="results-container">
            <div className="score">
              <div className="score-circle">
                <span>{score}%</span>
              </div>
              <p>{score >= 80 ? 'Excellent!' : score >= 60 ? 'Good job!' : 'Keep practicing!'}</p>
            </div>

            <div className="results-details">
              <p><strong>Time spent:</strong> {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</p>
              <p><strong>Difficulty:</strong> {selectedExercise.difficulty}</p>
              <p><strong>Correct answers:</strong> {quizQuestions.filter((q, i) => answers[i] === q.correctAnswer).length} out of {quizQuestions.length}</p>
            </div>

            <div className="feedback">
              <h3>Feedback</h3>
              <p>
                {score >= 80 ? 
                  'Your memory recall is excellent! You remembered most details accurately.' : 
                  score >= 60 ? 
                  'You have good memory recall. With more practice, you can improve even further.' : 
                  'Memory recall can be challenging. Regular practice will help improve your skills.'}
              </p>
              <p>Try to use these memory techniques:</p>
              <ul>
                <li>Association: Connect new information with things you already know</li>
                <li>Chunking: Group information into meaningful units</li>
                <li>Visualization: Create mental images of what you're trying to remember</li>
                <li>Repetition: Review information regularly</li>
              </ul>
            </div>

            <div className="action-buttons">
              <button className="btn" onClick={() => startExercise(selectedExercise)}>
                Try Again
              </button>
              <Link to="/" className="btn btn-secondary">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryTraining; 