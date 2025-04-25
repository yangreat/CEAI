import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container not-found">
      <h1>404 - 页面未找到</h1>
      <p>抱歉，您访问的页面不存在或已被移除。</p>
      <div className="action-buttons">
        <Link to="/" className="btn">
          返回首页
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 