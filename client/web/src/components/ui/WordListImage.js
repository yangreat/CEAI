import React from 'react';

// Word List Memorization图像组件，使用SVG绘制
const WordListImage = ({ width = '100%', height = '180px' }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 400 200" 
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* 背景 */}
      <rect width="400" height="200" fill="#4476c2" />
      
      {/* 装饰性几何元素 */}
      <circle cx="50" cy="50" r="25" fill="#5b8bd9" fillOpacity="0.6" />
      <circle cx="350" cy="150" r="30" fill="#396ab3" fillOpacity="0.7" />
      <rect x="300" y="30" width="50" height="50" fill="#396ab3" fillOpacity="0.5" />
      <rect x="70" y="130" width="40" height="40" fill="#5b8bd9" fillOpacity="0.4" />
      
      {/* 单词云效果 */}
      <text x="150" y="60" fontFamily="Arial" fontSize="18" fill="#ffffff" opacity="0.9">Memory</text>
      <text x="210" y="90" fontFamily="Arial" fontSize="16" fill="#ffffff" opacity="0.8">Challenge</text>
      <text x="110" y="110" fontFamily="Arial" fontSize="14" fill="#ffffff" opacity="0.7">Words</text>
      <text x="240" y="120" fontFamily="Arial" fontSize="12" fill="#ffffff" opacity="0.8">Recall</text>
      <text x="180" y="140" fontFamily="Arial" fontSize="20" fill="#ffffff" opacity="0.9">Vocabulary</text>
      <text x="270" y="70" fontFamily="Arial" fontSize="15" fill="#ffffff" opacity="0.7">Learn</text>
      <text x="150" y="160" fontFamily="Arial" fontSize="14" fill="#ffffff" opacity="0.8">Practice</text>
      
      {/* 人物轮廓 - 不同于数字记忆训练中的姿势 */}
      <g transform="translate(200, 100)">
        {/* 头部 */}
        <circle cx="0" cy="-25" r="15" fill="#ffffff" />
        
        {/* 身体 */}
        <path d="M 0 -10 L 0 25" stroke="#ffffff" strokeWidth="3" />
        
        {/* 手臂 - 伸展状态 */}
        <path d="M 0 0 L -25 -10" stroke="#ffffff" strokeWidth="3" />
        <path d="M 0 0 L 25 -10" stroke="#ffffff" strokeWidth="3" />
        
        {/* 腿部 - 站立姿势 */}
        <path d="M 0 25 L -15 50" stroke="#ffffff" strokeWidth="3" />
        <path d="M 0 25 L 15 50" stroke="#ffffff" strokeWidth="3" />
      </g>
      
      {/* 装饰性连接线 */}
      <path d="M 80 70 C 100 50, 150 50, 170 75" stroke="#ffffff" strokeWidth="1" fill="none" />
      <path d="M 230 80 C 250 60, 290 60, 310 80" stroke="#ffffff" strokeWidth="1" fill="none" />
      <path d="M 90 130 C 110 110, 140 110, 160 130" stroke="#ffffff" strokeWidth="1" fill="none" />
    </svg>
  );
};

export default WordListImage; 