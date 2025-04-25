import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBrain, FaEye, FaTasks, FaLanguage, FaChessKnight, FaSmile } from 'react-icons/fa';
import ScheduleOrganizerImage from './ui/ScheduleOrganizerImage';

const Dashboard = () => {
  const [categories, setCategories] = useState([]);
  const [recommendedExercises, setRecommendedExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from the backend
    // For this demo, we'll use hardcoded data
    setCategories([
      {
        id: 'memory',
        name: 'Memory Training',
        description: 'Enhance short-term and long-term memory through memory games, vocabulary memorization, number memorization, and other activities.',
        icon: <FaBrain className="category-icon" />,
        path: '/training/memory',
        thumbnailUrl: '/assets/thumbnails/memory_thumbnail.png'
      },
      {
        id: 'attention',
        name: 'Attention Training',
        description: 'Improve focus and attention duration through tasks like finding specific patterns or recognizing targets amidst distractions.',
        icon: <FaEye className="category-icon" />,
        path: '/training/attention',
        thumbnailUrl: '/assets/thumbnails/attention_thumbnail.png'
      },
      {
        id: 'executive',
        name: 'Executive Function Training',
        description: 'Training in planning, organizing, task switching, and problem-solving abilities through strategy games or complex tasks.',
        icon: <FaTasks className="category-icon" />,
        path: '/training/executive',
        thumbnailUrl: '/assets/thumbnails/executive_thumbnail.png'
      },
      {
        id: 'language',
        name: 'Language Ability Training',
        description: 'Improve language fluency and vocabulary through reading, writing, and language games.',
        icon: <FaLanguage className="category-icon" />,
        path: '/training/language',
        thumbnailUrl: '/assets/thumbnails/language_thumbnail.png'
      },
      {
        id: 'logic',
        name: 'Logic and Reasoning Training',
        description: 'Improve logical thinking and reasoning abilities through puzzles, Sudoku, and logical reasoning problems.',
        icon: <FaChessKnight className="category-icon" />,
        path: '/training/logic',
        thumbnailUrl: '/assets/thumbnails/logic_thumbnail.png'
      },
      {
        id: 'emotion',
        name: 'Emotion Regulation Training',
        description: 'Help users recognize and manage emotions, reducing the negative impact of stress and anxiety on cognitive function.',
        icon: <FaSmile className="category-icon" />,
        path: '/training/emotion',
        thumbnailUrl: '/assets/thumbnails/emotion_thumbnail.png'
      }
    ]);

    // Mock recommended exercises
    setRecommendedExercises([
      {
        id: 'memory-1',
        name: 'Family Photo Recall',
        description: 'Review family photos and recall details about the people and events.',
        category: 'memory',
        difficulty: 'medium',
        path: '/training/memory',
        thumbnailUrl: '/assets/exercises/family_scene.png'
      },
      {
        id: 'attention-1',
        name: 'Find the Hidden Objects',
        description: 'Find specific objects in a cluttered scene within a time limit.',
        category: 'attention',
        difficulty: 'medium',
        path: '/training/attention',
        thumbnailUrl: '/assets/exercises/busy_street.png'
      },
      {
        id: 'executive-1',
        name: 'Daily Schedule Organizer',
        description: 'Plan and adjust a daily schedule with unexpected changes.',
        category: 'executive',
        difficulty: 'medium',
        path: '/training/executive'
      }
    ]);

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Welcome to Cognitive Empowerment</h1>
      <p className="lead">
        Train your brain with personalized cognitive exercises powered by AI.
      </p>

      <div className="card">
        <h2 className="card-title">Recommended for You</h2>
        <div className="exercise-list">
          {recommendedExercises.map(exercise => (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-image">
                {exercise.id === 'executive-1' ? (
                  <ScheduleOrganizerImage height="180px" />
                ) : exercise.thumbnailUrl ? (
                  <img 
                    src={exercise.thumbnailUrl} 
                    alt={exercise.name} 
                    className="exercise-thumbnail"
                  />
                ) : (
                  <svg width="100%" height="150" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="#f0f0f0" />
                    <text x="50%" y="50%" fontFamily="Arial" fontSize="16" fill="#666" textAnchor="middle">
                      {exercise.name}
                    </text>
                  </svg>
                )}
              </div>
              <div className="exercise-content">
                <h3 className="exercise-title">{exercise.name}</h3>
                <p className="exercise-description">{exercise.description}</p>
                <div className="exercise-meta">
                  <span className={`difficulty difficulty-${exercise.difficulty}`}>
                    {exercise.difficulty}
                  </span>
                  <Link to={exercise.path} className="btn">
                    Start Training
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2>Cognitive Training Categories</h2>
      <div className="dashboard-cards">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            {category.thumbnailUrl ? (
              <img 
                src={category.thumbnailUrl} 
                alt={category.name} 
                className="category-thumbnail"
              />
            ) : (
              category.icon
            )}
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <Link to={category.path} className="btn">
              View Exercises
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 