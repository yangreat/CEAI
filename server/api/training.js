const express = require('express');
const router = express.Router();

// Mock training exercises data for each cognitive domain
const trainingExercises = {
  memory: [
    {
      id: 'memory-1',
      name: 'Family Photo Recall',
      description: 'An app presents a series of family photographs, including children, grandchildren, and old friends. The user spends time reviewing these images and is later quizzed on details like names, relationships, or events associated with the photos.',
      difficulty: 'medium',
      duration: 10, // minutes
      imageUrl: '/assets/exercises/family-photo-recall.jpg',
      type: 'interactive'
    },
    {
      id: 'memory-2',
      name: 'Word List Memorization',
      description: 'Users are shown a list of words to memorize within a time limit, then asked to recall as many as possible.',
      difficulty: 'easy',
      duration: 5,
      imageUrl: '/assets/exercises/word-list.jpg',
      type: 'quiz'
    }
  ],
  attention: [
    {
      id: 'attention-1',
      name: 'Find the Hidden Objects',
      description: 'A game displays a cluttered room scene, such as a living room filled with various items. The user is tasked with finding specific objects (e.g., a pair of glasses, a book) within a time limit.',
      difficulty: 'medium',
      duration: 8,
      imageUrl: '/assets/exercises/hidden-objects.jpg',
      type: 'game'
    },
    {
      id: 'attention-2',
      name: 'Number Sequence',
      description: 'Users must identify patterns in number sequences and predict the next numbers.',
      difficulty: 'hard',
      duration: 7,
      imageUrl: '/assets/exercises/number-sequence.jpg',
      type: 'interactive'
    }
  ],
  executive: [
    {
      id: 'executive-1',
      name: 'Daily Schedule Organizer',
      description: 'An interactive planner where the user organizes their daily or weekly activities, such as appointments, medication times, and social events. Unexpected changes are introduced (e.g., a rescheduled doctor\'s appointment), requiring them to adjust their plans.',
      difficulty: 'medium',
      duration: 12,
      imageUrl: '/assets/exercises/schedule-organizer.jpg',
      type: 'interactive'
    },
    {
      id: 'executive-2',
      name: 'Tower of Hanoi',
      description: 'A classic puzzle that requires planning and strategic thinking to move disks from one peg to another.',
      difficulty: 'hard',
      duration: 10,
      imageUrl: '/assets/exercises/tower-hanoi.jpg',
      type: 'puzzle'
    }
  ],
  language: [
    {
      id: 'language-1',
      name: 'Word Puzzle and Proverbs',
      description: 'The user engages with crosswords or word-search puzzles that incorporate proverbs and idioms common in their culture. They can also participate in filling in missing words in famous sayings.',
      difficulty: 'medium',
      duration: 15,
      imageUrl: '/assets/exercises/word-puzzle.jpg',
      type: 'puzzle'
    },
    {
      id: 'language-2',
      name: 'Story Completion',
      description: 'Users are given the beginning of a story and must complete it using proper grammar and vocabulary.',
      difficulty: 'medium',
      duration: 12,
      imageUrl: '/assets/exercises/story-completion.jpg',
      type: 'creative'
    }
  ],
  logic: [
    {
      id: 'logic-1',
      name: 'Classic Board Games',
      description: 'Digital versions of checkers or chess that the user can play against the computer at adjustable difficulty levels. These games require strategic thinking and planning ahead.',
      difficulty: 'medium',
      duration: 20,
      imageUrl: '/assets/exercises/board-games.jpg',
      type: 'game'
    },
    {
      id: 'logic-2',
      name: 'Sudoku Puzzles',
      description: 'Traditional Sudoku puzzles with adjustable difficulty levels.',
      difficulty: 'variable',
      duration: 15,
      imageUrl: '/assets/exercises/sudoku.jpg',
      type: 'puzzle'
    }
  ],
  emotion: [
    {
      id: 'emotion-1',
      name: 'Guided Relaxation Exercises',
      description: 'Users can engage in a dialogue with the chatbot to detect shifts in mood and practice guided relaxation techniques.',
      difficulty: 'easy',
      duration: 10,
      imageUrl: '/assets/exercises/relaxation.jpg',
      type: 'interactive'
    },
    {
      id: 'emotion-2',
      name: 'Emotion Recognition',
      description: 'Users identify emotions in pictures of facial expressions and learn about appropriate emotional responses.',
      difficulty: 'medium',
      duration: 8,
      imageUrl: '/assets/exercises/emotion-recognition.jpg',
      type: 'educational'
    }
  ]
};

/**
 * @route   GET api/training/categories
 * @desc    Get all training categories
 * @access  Public
 */
router.get('/categories', (req, res) => {
  try {
    const categories = Object.keys(trainingExercises).map(key => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      count: trainingExercises[key].length
    }));
    
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET api/training/exercises/:category
 * @desc    Get exercises by category
 * @access  Public
 */
router.get('/exercises/:category', (req, res) => {
  try {
    const { category } = req.params;
    
    if (!trainingExercises[category]) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    res.json(trainingExercises[category]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET api/training/exercise/:id
 * @desc    Get exercise by ID
 * @access  Public
 */
router.get('/exercise/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Search for the exercise across all categories
    let exercise = null;
    for (const category in trainingExercises) {
      const found = trainingExercises[category].find(ex => ex.id === id);
      if (found) {
        exercise = found;
        break;
      }
    }
    
    if (!exercise) {
      return res.status(404).json({ msg: 'Exercise not found' });
    }
    
    res.json(exercise);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET api/training/recommended
 * @desc    Get recommended exercises based on user preferences
 * @access  Private
 */
router.get('/recommended', (req, res) => {
  try {
    // In a real app, this would use the user's JWT token to get preferences
    // For mock purposes, we'll use query parameters
    const { difficulty = 'medium', categories = 'memory,attention' } = req.query;
    
    const userCategories = categories.split(',');
    
    // Get exercises from requested categories with matching difficulty
    const recommended = [];
    
    userCategories.forEach(category => {
      if (trainingExercises[category]) {
        const categoryExercises = trainingExercises[category].filter(
          ex => difficulty === 'all' || ex.difficulty === difficulty
        );
        recommended.push(...categoryExercises);
      }
    });
    
    // Randomize the order
    const shuffled = recommended.sort(() => 0.5 - Math.random());
    
    // Return at most 5 exercises
    res.json(shuffled.slice(0, 5));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 