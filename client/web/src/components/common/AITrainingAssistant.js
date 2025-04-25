import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AITrainingAssistant.css';

const AITrainingAssistant = ({ 
  userId, 
  currentExercise, 
  trainingHistory, 
  performance,
  onSuggestionSelect
}) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [autoSuggestions, setAutoSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  // 初始化助手
  useEffect(() => {
    if (currentExercise) {
      const welcomeMessage = {
        sender: 'assistant',
        text: `我是您的认知训练助手。我看到您正在进行${getExerciseName(currentExercise)}训练。需要任何帮助或建议吗？`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // 根据用户表现生成自动建议
      if (performance) {
        generateAutoSuggestions();
      }
    }
  }, [currentExercise]);

  // 当消息列表更新时，滚动到最新消息
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 根据当前训练类型返回训练名称
  const getExerciseName = (exercise) => {
    const exerciseTypes = {
      'hidden-objects': '隐藏物体寻找',
      'spot-difference': '找不同',
      'object-tracking': '注意力追踪',
      // 添加其他训练类型
    };
    return exerciseTypes[exercise?.type] || '认知';
  };

  // 发送消息到LLM API
  const sendMessageToLLM = async (userMessage) => {
    setIsLoading(true);
    try {
      // 准备上下文信息
      const context = {
        userId,
        exerciseType: currentExercise?.type,
        exerciseName: getExerciseName(currentExercise),
        currentPerformance: performance,
        trainingHistory: trainingHistory?.slice(-5) || [],
        previousMessages: messages.slice(-5)
      };

      // 调用LLM API
      const response = await axios.post('/api/llm/chat', {
        message: userMessage,
        context
      });

      // 添加助手回复
      const assistantMessage = {
        sender: 'assistant',
        text: response.data.reply,
        timestamp: new Date(),
        suggestions: response.data.suggestions || []
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // 如果API返回了建议操作，保存它们
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        setAutoSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('发送消息到LLM失败:', error);
      // 添加错误信息
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: '抱歉，我无法连接到服务器。请稍后再试。',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理用户发送消息
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // 添加用户消息到列表
    const userMessage = {
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // 发送到LLM
    sendMessageToLLM(inputText);
  };

  // 生成基于性能的自动建议
  const generateAutoSuggestions = async () => {
    try {
      // 调用LLM API生成建议
      const response = await axios.post('/api/llm/generate-suggestions', {
        userId,
        exerciseType: currentExercise?.type,
        performance
      });

      if (response.data.suggestions) {
        setAutoSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('生成建议失败:', error);
    }
  };

  // 处理建议选择
  const handleSuggestionClick = (suggestion) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    
    // 记录用户选择了建议
    const userMessage = {
      sender: 'user',
      text: `我选择了建议: ${suggestion.text}`,
      timestamp: new Date(),
      isSuggestion: true
    };
    setMessages(prev => [...prev, userMessage]);

    // 获取后续回复
    sendMessageToLLM(`我选择了: ${suggestion.text}`);
  };

  return (
    <div className="ai-assistant-container">
      {/* 最小化/展开按钮 */}
      <div className="assistant-toggle" onClick={() => setIsChatOpen(!isChatOpen)}>
        <i className={`fa ${isChatOpen ? 'fa-times' : 'fa-comment'}`}></i>
        {!isChatOpen && autoSuggestions.length > 0 && (
          <span className="suggestion-badge">{autoSuggestions.length}</span>
        )}
      </div>

      {/* 主聊天界面 */}
      {isChatOpen && (
        <div className="assistant-chat-panel">
          <div className="assistant-header">
            <h3>认知训练助手</h3>
          </div>

          {/* 消息区域 */}
          <div className="messages-container">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`message ${msg.sender === 'assistant' ? 'assistant-message' : 'user-message'} ${msg.isError ? 'error-message' : ''}`}
              >
                <div className="message-content">{msg.text}</div>
                <div className="message-timestamp">
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />

            {/* 加载指示器 */}
            {isLoading && (
              <div className="loading-indicator">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          {/* 建议区域 */}
          {autoSuggestions.length > 0 && (
            <div className="suggestions-container">
              <div className="suggestions-title">建议</div>
              {autoSuggestions.map((suggestion, idx) => (
                <div 
                  key={idx} 
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.text}
                </div>
              ))}
            </div>
          )}

          {/* 输入区域 */}
          <div className="input-container">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="询问任何关于训练的问题..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              className="send-button" 
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
            >
              <i className="fa fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITrainingAssistant; 