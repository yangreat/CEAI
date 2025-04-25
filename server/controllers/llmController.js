const axios = require('axios');
const User = require('../../server/models/User');
const TrainingSession = require('../../server/models/TrainingSession');

// LLM API configuration - SiliconFlow
const LLM_API_KEY = process.env.LLM_API_KEY || 'sk-lzvswlngvlsvgadnmptmbbqmqsigmiidkskfszoakxjumkkq';
const LLM_API_URL = process.env.LLM_API_URL || 'https://api.siliconflow.cn/v1/chat/completions';
const LLM_MODEL = process.env.LLM_MODEL || 'Pro/deepseek-ai/DeepSeek-V3';

// 用于测试的辅助函数
const getMockUser = async (userId) => {
  // 如果全局有mock数据，则使用它
  if (global.mockUser) {
    return {
      ...global.mockUser,
      name: 'Test User',
      age: 35,
      trainingPreferences: {
        focus: 'Memory improvement'
      },
      level: 'Intermediate'
    };
  }
  
  // 否则尝试从数据库获取
  try {
    return await User.findById(userId).select('-password');
  } catch (err) {
    console.error('Error fetching user:', err);
    return null;
  }
};

// 用于测试的辅助函数
const getMockTrainingSessions = async (userId, exerciseType) => {
  // 如果全局有mock数据，则使用它
  if (global.mockTrainingSessions) {
    let sessions = [
      {
        userId,
        exerciseType: 'memory',
        difficulty: 'medium',
        score: 85,
        accuracy: 78,
        completionTime: 120,
        targetTime: 150,
        createdAt: new Date()
      },
      {
        userId,
        exerciseType: 'attention',
        difficulty: 'easy',
        score: 92,
        accuracy: 89,
        completionTime: 90,
        targetTime: 120,
        createdAt: new Date()
      }
    ];
    
    if (exerciseType) {
      sessions = sessions.filter(s => s.exerciseType === exerciseType);
    }
    
    return sessions;
  }
  
  // 否则尝试从数据库获取
  try {
    const query = { userId };
    if (exerciseType) {
      query.exerciseType = exerciseType;
    }
    return await TrainingSession.find(query).sort({ createdAt: -1 }).limit(10);
  } catch (err) {
    console.error('Error fetching training sessions:', err);
    return [];
  }
};

// 添加用于测试的保存mock会话的辅助函数
const saveMockTrainingSession = async (sessionData) => {
  if (global.mockTrainingSessions) {
    global.mockTrainingSessions.push({
      ...sessionData,
      _id: `mock-session-${Date.now()}`,
      createdAt: new Date()
    });
    return { _id: `mock-session-${Date.now()}` };
  }
  
  try {
    const session = new TrainingSession(sessionData);
    await session.save();
    return session;
  } catch (err) {
    console.error('Error saving training session:', err);
    return null;
  }
};

/**
 * Generate a system prompt based on user context and exercise type
 * @param {Object} userContext - User context information
 * @returns {String} - System prompt
 */
const generateSystemPrompt = (userContext) => {
  const { exerciseType, exerciseDifficulty, userData } = userContext;
  
  return `You are an AI cognitive training assistant helping users with ${exerciseType || 'cognitive'} training exercises.
Current exercise: ${exerciseType || 'Unknown'}
Difficulty level: ${exerciseDifficulty || 'Normal'}
User profile: ${userData?.name || 'User'} (Age: ${userData?.age || 'Unknown'}, Training focus: ${userData?.trainingFocus || 'General cognitive improvement'})

Provide concise, helpful guidance that is relevant to the current exercise. Keep responses under 2-3 sentences unless more detail is requested.
For technique suggestions, focus on evidence-based approaches.
If suggesting exercises, consider the user's current level and goals.`;
};

/**
 * Generate suggestions based on context
 * @param {Object} context - The context for suggestion generation
 * @returns {Array} - List of suggestions
 */
const generateSuggestionsList = (context) => {
  const { exerciseType, performanceData } = context;
  
  const suggestions = [
    `How can I improve my ${exerciseType || 'cognitive'} skills?`,
    "What techniques help with focus?",
    "Show me my progress trends"
  ];
  
  // Add performance-specific suggestions
  if (performanceData) {
    if (performanceData.accuracy < 70) {
      suggestions.push("Tips for improving accuracy");
    }
    if (performanceData.speed < 60) {
      suggestions.push("How can I increase my response speed?");
    }
  }
  
  return suggestions;
};

/**
 * Handle chat with LLM
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.chat = async (req, res) => {
  try {
    const { message, context, messageHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get user information using mock or real data
    const userId = req.user.id;
    const user = await getMockUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate context with user data
    const userContext = {
      ...context,
      userData: {
        name: user.name,
        age: user.age,
        trainingFocus: user.trainingPreferences?.focus || 'General cognitive improvement',
        level: user.level || 'Beginner'
      }
    };
    
    // Generate system prompt
    const systemPrompt = generateSystemPrompt(userContext);
    
    // Construct message history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...messageHistory.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message }
    ];
    
    // Call SiliconFlow LLM API
    const response = await axios.post(
      LLM_API_URL,
      {
        model: LLM_MODEL,
        messages,
        stream: false,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        frequency_penalty: 0.5,
        n: 1,
        stop: []
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLM_API_KEY}`
        }
      }
    );
    
    // Extract LLM response
    const llmResponse = response.data.choices[0].message.content;
    let parsedResponse;
    
    try {
      parsedResponse = JSON.parse(llmResponse);
    } catch (e) {
      parsedResponse = { response: llmResponse };
    }
    
    // Generate suggestions based on context
    const suggestions = generateSuggestionsList(userContext);
    
    res.json({
      message: parsedResponse.response || llmResponse,
      suggestions
    });
  } catch (error) {
    console.error('LLM API Error:', error);
    res.status(500).json({ error: 'Error communicating with LLM API', details: error.message });
  }
};

/**
 * Generate personalized suggestions based on user performance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { exerciseType } = req.body;
    
    // Get user information using mock or real data
    const user = await getMockUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's recent training sessions using mock or real data
    const recentSessions = await getMockTrainingSessions(userId, exerciseType);
    
    // Calculate average performance
    let totalAccuracy = 0;
    let totalSpeed = 0;
    let totalSessions = recentSessions.length;
    
    recentSessions.forEach(session => {
      totalAccuracy += session.accuracy || 0;
      totalSpeed += session.completionTime ? (100 - Math.min(session.completionTime / session.targetTime * 100, 100)) : 0;
    });
    
    const avgAccuracy = totalSessions > 0 ? totalAccuracy / totalSessions : 0;
    const avgSpeed = totalSessions > 0 ? totalSpeed / totalSessions : 0;
    
    // Prepare prompt for LLM
    const messages = [
      { 
        role: 'system', 
        content: `You are an AI cognitive training assistant. Generate 3-5 personalized suggestions for a user 
        based on their recent performance in ${exerciseType || 'cognitive'} exercises. Format output as a JSON 
        array of suggestion objects with 'text' and 'category' properties. Keep each suggestion concise 
        (15-20 words max). Categories should be one of: 'technique', 'exercise', 'lifestyle', 'motivation'.` 
      },
      { 
        role: 'user', 
        content: `User profile: ${user.name} (Age: ${user.age || 'Unknown'}, Focus: ${user.trainingPreferences?.focus || 'General'})
        Exercise type: ${exerciseType || 'Various cognitive exercises'}
        Recent performance: 
        - Average accuracy: ${avgAccuracy.toFixed(2)}%
        - Average speed: ${avgSpeed.toFixed(2)}%
        - Total recent sessions: ${totalSessions}
        - Most recent score: ${recentSessions[0]?.score || 'No data'}
        
        Generate personalized training suggestions considering this performance data.`
      }
    ];
    
    // Call SiliconFlow LLM API
    const response = await axios.post(
      LLM_API_URL,
      {
        model: LLM_MODEL,
        messages,
        stream: false,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        frequency_penalty: 0.5,
        n: 1,
        stop: []
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLM_API_KEY}`
        }
      }
    );
    
    // Extract suggestions from response
    const llmResponse = response.data.choices[0].message.content;
    let suggestions;
    
    try {
      const parsedResponse = JSON.parse(llmResponse);
      suggestions = parsedResponse.suggestions || [];
    } catch (e) {
      suggestions = [{ text: "Try to maintain consistent practice schedules", category: "motivation" }];
    }
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Generate Suggestions Error:', error);
    res.status(500).json({ error: 'Error generating suggestions', details: error.message });
  }
};

/**
 * Log a training session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.logTrainingSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      exerciseType, 
      exerciseId,
      difficulty,
      score,
      accuracy,
      completionTime,
      targetTime,
      mistakes,
      details
    } = req.body;
    
    // Validate required fields
    if (!exerciseType) {
      return res.status(400).json({ error: 'Exercise type is required' });
    }
    
    // Create new training session using mock or real data
    const sessionData = {
      userId,
      exerciseType,
      exerciseId,
      difficulty,
      score,
      accuracy,
      completionTime,
      targetTime,
      mistakes,
      details
    };
    
    const trainingSession = await saveMockTrainingSession(sessionData);
    
    res.json({ 
      message: 'Training session logged successfully',
      sessionId: trainingSession?._id
    });
  } catch (error) {
    console.error('Log Training Session Error:', error);
    res.status(500).json({ error: 'Error logging training session', details: error.message });
  }
};

/**
 * Generate a personalized training plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateTrainingPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { goals, duration, focus } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get user information using mock or real data
    const user = await getMockUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's training history using mock or real data
    const trainingHistory = await getMockTrainingSessions(userId);
    
    // Group sessions by exercise type
    const exerciseGroups = {};
    
    trainingHistory.forEach(session => {
      if (!exerciseGroups[session.exerciseType]) {
        exerciseGroups[session.exerciseType] = [];
      }
      exerciseGroups[session.exerciseType].push(session);
    });
    
    // Calculate average scores for each exercise type
    const exerciseStats = {};
    
    Object.keys(exerciseGroups).forEach(type => {
      const sessions = exerciseGroups[type];
      const totalScore = sessions.reduce((sum, session) => sum + (session.score || 0), 0);
      const avgScore = sessions.length > 0 ? totalScore / sessions.length : 0;
      
      exerciseStats[type] = {
        avgScore,
        count: sessions.length,
        lastPlayed: sessions[0].createdAt
      };
    });
    
    // Prepare prompt for LLM
    const messages = [
      { 
        role: 'system', 
        content: `You are an AI cognitive training plan generator. Create a personalized training plan based on user data, 
        goals, and performance history. Format as a JSON object with 'overview' (string), 'focus_areas' (array of strings), 
        and 'schedule' (array of daily plans). Each day should include 'day', 'exercises' (array of objects with 'type', 
        'duration', 'difficulty'), and 'note' (optional tips).` 
      },
      { 
        role: 'user', 
        content: `Generate a ${duration || '7-day'} cognitive training plan with focus on ${focus || 'overall cognitive improvement'}.
        
        User profile:
        - Name: ${user.name}
        - Age: ${user.age || 'Unknown'}
        - Goals: ${goals || 'Improve cognitive abilities'}
        - Training preferences: ${user.trainingPreferences?.focus || 'General cognitive training'}
        
        Performance history:
        ${Object.keys(exerciseStats).map(type => 
          `- ${type}: Average score ${exerciseStats[type].avgScore.toFixed(2)}, ${exerciseStats[type].count} sessions`
        ).join('\n')}
        
        Create a balanced plan that targets user's goals while considering performance data.`
      }
    ];
    
    // Call SiliconFlow LLM API
    const response = await axios.post(
      LLM_API_URL,
      {
        model: LLM_MODEL,
        messages,
        stream: false,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        frequency_penalty: 0.5,
        n: 1,
        stop: []
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLM_API_KEY}`
        }
      }
    );
    
    // Extract training plan from response
    const llmResponse = response.data.choices[0].message.content;
    let trainingPlan;
    
    try {
      trainingPlan = JSON.parse(llmResponse);
    } catch (e) {
      trainingPlan = { 
        overview: "Could not generate a personalized plan. Please try again.",
        focus_areas: [focus || "General cognitive training"],
        schedule: []
      };
    }
    
    res.json({ trainingPlan });
  } catch (error) {
    console.error('Generate Training Plan Error:', error);
    res.status(500).json({ error: 'Error generating training plan', details: error.message });
  }
}; 