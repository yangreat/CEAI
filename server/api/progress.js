const express = require('express');
const router = express.Router();

// Mock progress data (In production, this would be in a database)
const userProgress = {};

/**
 * @route   POST api/progress/record
 * @desc    Record a completed exercise
 * @access  Private
 */
router.post('/record', (req, res) => {
  try {
    const { userId, exerciseId, score, timeSpent, completedAt, category } = req.body;
    
    if (!userProgress[userId]) {
      userProgress[userId] = [];
    }
    
    const progressEntry = {
      id: `progress-${Date.now()}`,
      exerciseId,
      score,
      timeSpent,
      completedAt: completedAt || new Date(),
      category
    };
    
    userProgress[userId].push(progressEntry);
    
    res.json(progressEntry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET api/progress/user/:userId
 * @desc    Get all progress for a user
 * @access  Private
 */
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userProgress[userId]) {
      return res.json([]);
    }
    
    res.json(userProgress[userId]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET api/progress/user/:userId/category/:category
 * @desc    Get progress for a user in a specific category
 * @access  Private
 */
router.get('/user/:userId/category/:category', (req, res) => {
  try {
    const { userId, category } = req.params;
    
    if (!userProgress[userId]) {
      return res.json([]);
    }
    
    const categoryProgress = userProgress[userId].filter(
      progress => progress.category === category
    );
    
    res.json(categoryProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET api/progress/stats/:userId
 * @desc    Get aggregated stats for a user
 * @access  Private
 */
router.get('/stats/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userProgress[userId] || userProgress[userId].length === 0) {
      return res.json({
        totalExercises: 0,
        averageScore: 0,
        categoryBreakdown: {},
        recentTrend: []
      });
    }
    
    // Calculate total exercises and average score
    const totalExercises = userProgress[userId].length;
    const totalScore = userProgress[userId].reduce((sum, entry) => sum + entry.score, 0);
    const averageScore = totalScore / totalExercises;
    
    // Calculate category breakdown
    const categoryBreakdown = {};
    userProgress[userId].forEach(entry => {
      if (!categoryBreakdown[entry.category]) {
        categoryBreakdown[entry.category] = {
          count: 0,
          totalScore: 0
        };
      }
      
      categoryBreakdown[entry.category].count += 1;
      categoryBreakdown[entry.category].totalScore += entry.score;
    });
    
    // Calculate average score per category
    Object.keys(categoryBreakdown).forEach(category => {
      categoryBreakdown[category].averageScore = 
        categoryBreakdown[category].totalScore / categoryBreakdown[category].count;
    });
    
    // Calculate recent trend (last 10 exercises)
    const recentEntries = userProgress[userId]
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 10);
    
    const recentTrend = recentEntries.map(entry => ({
      date: entry.completedAt,
      score: entry.score,
      category: entry.category
    }));
    
    res.json({
      totalExercises,
      averageScore,
      categoryBreakdown,
      recentTrend
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET api/progress/comparison/:userId
 * @desc    Get comparison of user progress with others
 * @access  Private
 */
router.get('/comparison/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real app, this would compare with appropriate peer groups
    // For mock purposes, we'll generate some synthetic comparison data
    
    if (!userProgress[userId] || userProgress[userId].length === 0) {
      return res.json({
        userAverage: 0,
        peerAverage: 70,
        categoryComparison: {}
      });
    }
    
    // Calculate user's average score
    const totalScore = userProgress[userId].reduce((sum, entry) => sum + entry.score, 0);
    const userAverage = totalScore / userProgress[userId].length;
    
    // Create synthetic peer averages for each category
    const categoryComparison = {};
    const uniqueCategories = [...new Set(userProgress[userId].map(entry => entry.category))];
    
    uniqueCategories.forEach(category => {
      const userEntries = userProgress[userId].filter(entry => entry.category === category);
      const userCategoryAverage = userEntries.reduce((sum, entry) => sum + entry.score, 0) / userEntries.length;
      
      // Generate a peer average that's somewhat close to the user's average
      const peerAverage = Math.min(100, Math.max(50, userCategoryAverage + (Math.random() * 20 - 10)));
      
      categoryComparison[category] = {
        userAverage: userCategoryAverage,
        peerAverage
      };
    });
    
    res.json({
      userAverage,
      peerAverage: 75, // Mock peer average
      categoryComparison
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 