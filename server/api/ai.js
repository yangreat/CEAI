const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

// Create OpenAI instance
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'demo-key'
  });
} catch (error) {
  console.error('OpenAI initialization error:', error);
}

/**
 * @route   POST api/ai/generate-exercise
 * @desc    Generate a personalized exercise using AI
 * @access  Private
 */
router.post('/generate-exercise', async (req, res) => {
  try {
    const { category, difficulty, userContext } = req.body;

    if (!openai) {
      return res.status(500).json({ msg: 'AI service not available' });
    }

    // Construct a prompt based on the category and difficulty
    const prompts = {
      memory: `Create a memory exercise that helps users improve their ${difficulty} level memory skills. Consider user context: ${userContext}`,
      attention: `Design an attention training exercise at ${difficulty} difficulty that helps improve focus. Consider user context: ${userContext}`,
      executive: `Create an executive function exercise at ${difficulty} level that improves planning and organization. Consider user context: ${userContext}`,
      language: `Design a language ability exercise at ${difficulty} level that improves vocabulary and comprehension. Consider user context: ${userContext}`,
      logic: `Create a logic and reasoning puzzle at ${difficulty} level. Consider user context: ${userContext}`,
      emotion: `Design an emotion regulation exercise that helps users identify and manage their feelings. Consider user context: ${userContext}`
    };

    // Default prompt if category not found
    const prompt = prompts[category] || `Create a cognitive training exercise at ${difficulty} level. Consider user context: ${userContext}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI specialized in creating personalized cognitive training exercises. Provide detailed, engaging exercises with clear instructions, objectives, and expected outcomes." },
        { role: "user", content: prompt }
      ],
    });

    const response = completion.choices[0].message.content;

    // Process the AI response and format it as an exercise
    const exercise = {
      id: `ai-${Date.now()}`,
      name: `AI-Generated ${category.charAt(0).toUpperCase() + category.slice(1)} Exercise`,
      description: response,
      difficulty,
      category,
      duration: calculateEstimatedDuration(difficulty),
      type: 'ai-generated'
    };

    res.json(exercise);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'AI service error', error: err.message });
  }
});

/**
 * @route   POST api/ai/feedback
 * @desc    Get AI feedback on user exercise performance
 * @access  Private
 */
router.post('/feedback', async (req, res) => {
  try {
    const { exerciseType, userPerformance, difficulty } = req.body;

    if (!openai) {
      return res.status(500).json({ msg: 'AI service not available' });
    }

    const prompt = `Provide constructive feedback for a user who completed a ${exerciseType} cognitive training exercise at ${difficulty} difficulty level. Their performance metrics are: ${JSON.stringify(userPerformance)}. Include encouragement and specific suggestions for improvement.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI specialized in cognitive training and rehabilitation. Provide personalized, supportive feedback that is appropriate for elderly users or those with cognitive impairments." },
        { role: "user", content: prompt }
      ],
    });

    const feedback = completion.choices[0].message.content;

    res.json({ feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'AI service error', error: err.message });
  }
});

/**
 * @route   POST api/ai/adapt-difficulty
 * @desc    Use reinforcement learning to adapt exercise difficulty
 * @access  Private
 */
router.post('/adapt-difficulty', (req, res) => {
  try {
    const { exerciseHistory, currentDifficulty, userPreferences } = req.body;
    
    // Simple RL algorithm to determine if difficulty should change
    // In a real implementation, this would be a more sophisticated model
    let newDifficulty = currentDifficulty;
    
    // Calculate success rate from the last 5 exercises
    const recentExercises = exerciseHistory.slice(-5);
    const successRate = recentExercises.filter(ex => ex.score > 70).length / recentExercises.length;
    
    if (successRate > 0.8) {
      // User is doing very well, increase difficulty
      if (currentDifficulty === 'easy') newDifficulty = 'medium';
      else if (currentDifficulty === 'medium') newDifficulty = 'hard';
    } else if (successRate < 0.3) {
      // User is struggling, decrease difficulty
      if (currentDifficulty === 'hard') newDifficulty = 'medium';
      else if (currentDifficulty === 'medium') newDifficulty = 'easy';
    }
    
    res.json({ 
      previousDifficulty: currentDifficulty,
      recommendedDifficulty: newDifficulty,
      successRate,
      explanation: getExplanation(successRate, currentDifficulty, newDifficulty)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Helper function to calculate estimated exercise duration based on difficulty
function calculateEstimatedDuration(difficulty) {
  switch (difficulty) {
    case 'easy': return Math.floor(Math.random() * 5) + 5; // 5-10 minutes
    case 'medium': return Math.floor(Math.random() * 10) + 10; // 10-20 minutes
    case 'hard': return Math.floor(Math.random() * 15) + 15; // 15-30 minutes
    default: return 10; // Default 10 minutes
  }
}

// Helper function to generate explanation for difficulty adaptation
function getExplanation(successRate, currentDifficulty, newDifficulty) {
  if (currentDifficulty === newDifficulty) {
    return `Your performance (${Math.round(successRate * 100)}% success rate) suggests that ${currentDifficulty} difficulty is appropriate for you.`;
  } else if (newDifficulty === 'easy') {
    return `We noticed you might be finding the exercises challenging (${Math.round(successRate * 100)}% success rate). We've adjusted to an easier level to help you build confidence.`;
  } else {
    return `Great job! Your high performance (${Math.round(successRate * 100)}% success rate) shows you're ready for more challenging exercises.`;
  }
}

module.exports = router; 