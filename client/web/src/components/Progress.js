import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Progress = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [categoryProgress, setCategoryProgress] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [exercisesCompleted, setExercisesCompleted] = useState(0);

  useEffect(() => {
    // In a real app, this would fetch from the backend
    // For this demo, we'll use hardcoded data
    setTimeout(() => {
      const mockStats = {
        totalExercises: 28,
        averageScore: 72,
        categoryBreakdown: {
          memory: {
            count: 10,
            averageScore: 68
          },
          attention: {
            count: 5,
            averageScore: 75
          },
          executive: {
            count: 4,
            averageScore: 80
          },
          language: {
            count: 3,
            averageScore: 65
          },
          logic: {
            count: 4,
            averageScore: 82
          },
          emotion: {
            count: 2,
            averageScore: 70
          }
        },
        recentTrend: [
          { date: '2023-06-01', score: 65, category: 'memory' },
          { date: '2023-06-03', score: 70, category: 'attention' },
          { date: '2023-06-05', score: 75, category: 'memory' },
          { date: '2023-06-07', score: 68, category: 'language' },
          { date: '2023-06-10', score: 80, category: 'executive' },
          { date: '2023-06-12', score: 85, category: 'logic' },
          { date: '2023-06-15', score: 72, category: 'memory' },
          { date: '2023-06-18', score: 75, category: 'attention' },
          { date: '2023-06-20', score: 78, category: 'emotion' },
          { date: '2023-06-22', score: 82, category: 'logic' }
        ]
      };

      // Calculate category progress
      const progress = {};
      Object.keys(mockStats.categoryBreakdown).forEach(category => {
        progress[category] = {
          exercises: mockStats.categoryBreakdown[category].count,
          score: mockStats.categoryBreakdown[category].averageScore,
          lastExercise: findLastExercise(mockStats.recentTrend, category)
        };
      });

      // Calculate total time spent (mock data)
      const totalTimeSpent = 540; // 9 hours in minutes

      setStats(mockStats);
      setCategoryProgress(progress);
      setTimeSpent(totalTimeSpent);
      setExercisesCompleted(mockStats.totalExercises);
      setLoading(false);
    }, 1000);
  }, []);

  // Helper function to find the last exercise in a category
  const findLastExercise = (trend, category) => {
    const filtered = trend.filter(item => item.category === category);
    return filtered.length > 0 ? filtered[filtered.length - 1].date : 'Never';
  };

  // Helper function to format minutes into hours and minutes
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hr ${mins} min`;
  };

  // Get color for progress based on score
  const getScoreColor = (score) => {
    if (score >= 80) return '#5cb85c'; // Green
    if (score >= 60) return '#f0ad4e'; // Orange
    return '#d9534f'; // Red
  };

  if (loading) {
    return (
      <div className="container">
        <h2>Loading Progress Data...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Your Progress</h1>
      <p className="lead">
        Track your cognitive training journey and see your improvements over time.
      </p>

      <div className="progress-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.averageScore}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{exercisesCompleted}</div>
          <div className="stat-label">Exercises Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatTime(timeSpent)}</div>
          <div className="stat-label">Total Time Spent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Object.keys(categoryProgress).length}
          </div>
          <div className="stat-label">Categories Explored</div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Category Breakdown</h2>
        <div className="category-progress">
          {Object.keys(categoryProgress).map(category => (
            <div key={category} className="category-progress-item">
              <div className="category-info">
                <h3 className="category-name">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
                <p>
                  <strong>Exercises:</strong> {categoryProgress[category].exercises}
                </p>
                <p>
                  <strong>Average Score:</strong> {categoryProgress[category].score}%
                </p>
                <p>
                  <strong>Last Exercise:</strong> {new Date(categoryProgress[category].lastExercise).toLocaleDateString()}
                </p>
              </div>
              <div className="category-score-bar">
                <div 
                  className="score-bar-fill"
                  style={{ 
                    width: `${categoryProgress[category].score}%`,
                    backgroundColor: getScoreColor(categoryProgress[category].score)
                  }}
                ></div>
              </div>
              <Link to={`/training/${category}`} className="btn btn-sm">
                Train More
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Recent Performance</h2>
        <div className="recent-exercises">
          <table className="performance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTrend.map((exercise, index) => (
                <tr key={index}>
                  <td>{new Date(exercise.date).toLocaleDateString()}</td>
                  <td>{exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}</td>
                  <td>
                    <span
                      className="score-pill"
                      style={{ backgroundColor: getScoreColor(exercise.score) }}
                    >
                      {exercise.score}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Recommendations</h2>
        <div className="recommendations">
          <div className="recommendation-item">
            <h3>Based on your progress</h3>
            <p>
              Your strongest category is <strong>Logic and Reasoning</strong> with an average score of {categoryProgress.logic.score}%.
              Keep up the good work!
            </p>
            <p>
              You might want to focus more on <strong>Language Ability</strong> training, as it's your lowest scoring category at {categoryProgress.language.score}%.
            </p>
          </div>
          <div className="recommendation-item">
            <h3>Suggested exercises</h3>
            <ul>
              <li>
                <Link to="/training/language">Word Puzzle and Proverbs</Link> - Improve your language ability skills
              </li>
              <li>
                <Link to="/training/memory">Family Photo Recall</Link> - Continue strengthening your memory
              </li>
              <li>
                <Link to="/training/executive">Daily Schedule Organizer</Link> - Challenge your executive functions
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress; 