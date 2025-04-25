const express = require('express');
const router = express.Router();
const llmController = require('../controllers/llmController');
const { authenticateUser, bypassAuth } = require('../middleware/auth');

// 使用bypassAuth替代authenticateUser进行测试

// 测试路由
router.get('/test', (req, res) => {
  res.json({ message: 'LLM API is working' });
});

// LLM聊天API
router.post('/chat', bypassAuth, llmController.chat);

// 生成训练建议API
router.post('/generate-suggestions', bypassAuth, llmController.generateSuggestions);

// 记录训练会话API
router.post('/log-session', bypassAuth, llmController.logTrainingSession);

// 生成个性化训练计划API
router.post('/generate-training-plan', bypassAuth, llmController.generateTrainingPlan);

module.exports = router; 