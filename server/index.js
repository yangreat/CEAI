const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// 启用模拟数据库模式
process.env.MOCK_DB = 'true';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/users', require('./api/users'));
app.use('/api/training', require('./api/training'));
app.use('/api/progress', require('./api/progress'));
app.use('/api/ai', require('./api/ai'));
app.use('/api/memory', require('./api/memory'));
app.use('/api/llm', require('./routes/llmRoutes'));

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'API server is running' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/web/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/web/build', 'index.html'));
  });
}

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 