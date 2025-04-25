const mongoose = require('mongoose');

// 默认连接字符串，可通过环境变量覆盖
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/cognitive-training';

// 连接选项
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// 连接数据库函数
const connectDB = async () => {
  try {
    // 对于测试环境，如果没有真实的MongoDB连接，创建一个内存数据库
    if (process.env.NODE_ENV === 'test' || process.env.MOCK_DB === 'true') {
      console.log('Using in-memory database for testing');
      global.mockUser = { _id: '65559a7fa6a462c118c2d000', name: 'Test User' };
      global.mockTrainingSessions = [];
      return;
    }
    
    // 连接到MongoDB
    await mongoose.connect(mongoURI, options);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    
    // 如果是生产环境，则退出进程
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('Running in fallback mode with mock data...');
      global.mockUser = { _id: '65559a7fa6a462c118c2d000', name: 'Test User' };
      global.mockTrainingSessions = [];
    }
  }
};

module.exports = connectDB; 