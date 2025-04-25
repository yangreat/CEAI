const jwt = require('jsonwebtoken');

// 用于保护需要认证的路由
exports.authenticateUser = (req, res, next) => {
  // 从请求头获取token
  const token = req.header('x-auth-token');

  // 检查token是否存在
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-jwt-secret');
    
    // 将用户ID添加到请求对象
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// 用于测试，临时跳过认证
exports.bypassAuth = (req, res, next) => {
  // 为测试创建一个模拟用户
  req.user = {
    id: '65559a7fa6a462c118c2d000',  // 一个模拟的用户ID
    name: 'Test User'
  };
  next();
}; 