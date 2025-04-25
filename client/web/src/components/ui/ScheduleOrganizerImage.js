import React from 'react';

// 日程规划组织器图像组件，用于替代重复使用的图片
const ScheduleOrganizerImage = ({ width = '100%', height = '180px' }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 400 200" 
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* 背景 */}
      <rect width="400" height="200" fill="#ffefd5" /> {/* 调整背景高度 */}
      
      {/* 装饰性元素 - 调整曲线位置 */}
      <path d="M 50 30 C 100 15, 200 15, 350 30" stroke="#ff8c00" strokeWidth="3" fill="none" />
      <path d="M 50 170 C 100 185, 200 185, 350 170" stroke="#ff8c00" strokeWidth="3" fill="none" />

      {/* 日历元素 - 缩小并调整位置 */}
      <rect x="120" y="50" width="160" height="110" fill="#fff" stroke="#666" strokeWidth="2" />
      
      {/* 日历表头 */}
      <rect x="120" y="50" width="160" height="25" fill="#ff9f43" />
      <text x="200" y="67" fontFamily="Arial" fontSize="14" fill="#fff" textAnchor="middle">日程规划</text>
      
      {/* 日历行 - 调整位置 */}
      <line x1="120" y1="75" x2="280" y2="75" stroke="#ddd" strokeWidth="1" />
      <line x1="120" y1="95" x2="280" y2="95" stroke="#ddd" strokeWidth="1" />
      <line x1="120" y1="115" x2="280" y2="115" stroke="#ddd" strokeWidth="1" />
      <line x1="120" y1="135" x2="280" y2="135" stroke="#ddd" strokeWidth="1" />
      
      {/* 任务图标 - 调整位置和大小 */}
      <circle cx="135" cy="85" r="6" fill="#4caf50" />
      <circle cx="135" cy="105" r="6" fill="#f44336" />
      <circle cx="135" cy="125" r="6" fill="#2196f3" />
      
      {/* 任务文本线条 - 调整位置和长度 */}
      <line x1="150" y1="85" x2="260" y2="85" stroke="#4caf50" strokeWidth="2" />
      <line x1="150" y1="105" x2="240" y2="105" stroke="#f44336" strokeWidth="2" />
      <line x1="150" y1="125" x2="220" y2="125" stroke="#2196f3" strokeWidth="2" />
      
      {/* 时钟指针象征时间管理 - 调整位置和大小 */}
      <circle cx="320" cy="50" r="20" fill="#fff" stroke="#666" strokeWidth="2" />
      <line x1="320" y1="50" x2="320" y2="38" stroke="#666" strokeWidth="2" />
      <line x1="320" y1="50" x2="332" y2="50" stroke="#666" strokeWidth="2" />
    </svg>
  );
};

export default ScheduleOrganizerImage; 