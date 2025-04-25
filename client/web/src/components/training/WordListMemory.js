import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const WordListMemory = () => {
  // 状态管理
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 训练流程状态
  const [stage, setStage] = useState('list'); // list, memorize, recall, results
  const [words, setWords] = useState([]);
  const [recalledWords, setRecalledWords] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [timer, setTimer] = useState(0);
  const [results, setResults] = useState(null);
  
  // 计时器引用
  const timerRef = useRef(null);
  
  // 加载训练练习
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        
        // 在实际应用中，会从后端API获取数据
        // const response = await axios.get('/api/memory/exercises/word_list');
        // const data = response.data;
        
        // 模拟API响应
        const data = [
          {
            id: 'wl-1',
            title: '单词列表记忆',
            description: '记忆一系列单词，然后尝试回忆尽可能多的单词。',
            difficulty: 'easy',
            type: 'word_list'
          },
          {
            id: 'wl-2',
            title: '高级词汇记忆',
            description: '记忆一系列较复杂的词汇，然后尝试回忆它们。',
            difficulty: 'hard',
            type: 'word_list'
          }
        ];
        
        setExercises(data);
        setLoading(false);
      } catch (err) {
        console.error('获取练习失败', err);
        setError('无法加载记忆训练练习。请重试。');
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, []);
  
  // 启动训练
  const startExercise = async (exercise) => {
    try {
      setSelectedExercise(exercise);
      
      // 在实际应用中，会从后端API获取数据
      // const response = await axios.get(`/api/memory/exercise/${exercise.id}`);
      // const data = response.data;
      
      // 模拟API响应
      let data;
      if (exercise.id === 'wl-1') {
        data = {
          id: 'wl-1',
          title: '单词列表记忆',
          description: '记忆一系列单词，然后尝试回忆尽可能多的单词。',
          difficulty: 'easy',
          words: [
            '苹果', '书籍', '电脑', '窗户', '花朵',
            '钢笔', '眼镜', '手表', '椅子', '电话',
            '水杯', '钥匙', '帽子', '鞋子', '背包'
          ],
          memorizeTime: 60,
          recallTime: 90
        };
      } else {
        data = {
          id: 'wl-2',
          title: '高级词汇记忆',
          description: '记忆一系列较复杂的词汇，然后尝试回忆它们。',
          difficulty: 'hard',
          words: [
            '海洋学', '哲学家', '生物多样性', '量子力学',
            '认知心理学', '分子结构', '历史演变', '经济学原理',
            '政治制度', '文化遗产', '社会结构', '环境保护'
          ],
          memorizeTime: 90,
          recallTime: 120
        };
      }
      
      setWords(data.words);
      setStage('memorize');
      setTimer(data.memorizeTime); // 设置记忆阶段计时器
      
      // 启动计时器
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            // 时间到，进入回忆阶段
            clearInterval(timerRef.current);
            setStage('recall');
            setTimer(data.recallTime); // 设置回忆阶段计时器
            
            // 为回忆阶段启动新的计时器
            timerRef.current = setInterval(() => {
              setTimer(prevRecallTimer => {
                if (prevRecallTimer <= 1) {
                  // 时间到，结束训练
                  clearInterval(timerRef.current);
                  submitResults();
                  return 0;
                }
                return prevRecallTimer - 1;
              });
            }, 1000);
            
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('启动训练失败', err);
      setError('无法启动训练。请重试。');
    }
  };
  
  // 添加回忆的单词
  const addRecalledWord = () => {
    if (currentInput.trim() === '') return;
    
    // 检查是否已经添加过这个单词
    if (recalledWords.includes(currentInput.trim())) {
      alert('您已经添加过这个单词了');
      return;
    }
    
    setRecalledWords([...recalledWords, currentInput.trim()]);
    setCurrentInput('');
  };
  
  // 按Enter键添加单词
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRecalledWord();
    }
  };
  
  // 移除已回忆的单词
  const removeRecalledWord = (word) => {
    setRecalledWords(recalledWords.filter(w => w !== word));
  };
  
  // 提交训练结果
  const submitResults = async () => {
    try {
      // 计算正确回忆的单词数量
      const correctWords = recalledWords.filter(word => 
        words.includes(word)
      );
      
      // 计算错误回忆的单词数量
      const incorrectWords = recalledWords.filter(word => 
        !words.includes(word)
      );
      
      // 计算遗漏的单词
      const missedWords = words.filter(word => 
        !recalledWords.includes(word)
      );
      
      // 计算得分
      const score = Math.round((correctWords.length / words.length) * 100);
      
      // 在实际应用中，会向后端API发送结果
      // const response = await axios.post('/api/memory/evaluate', {
      //   exerciseId: selectedExercise.id,
      //   answers: recalledWords,
      //   difficulty: selectedExercise.difficulty
      // });
      // const data = response.data;
      
      // 模拟API响应
      const nextDifficulty = score >= 80 ? 'hard' : (score >= 50 ? 'medium' : 'easy');
      const nextTrainingInterval = score >= 80 ? 3 : (score >= 50 ? 2 : 1);
      
      const data = {
        score,
        correctCount: correctWords.length,
        totalQuestions: words.length,
        feedback: generateFeedback(score),
        nextDifficulty,
        nextTrainingInterval
      };
      
      // 设置结果
      setResults({
        ...data,
        correctWords,
        incorrectWords,
        missedWords
      });
      
      // 切换到结果阶段
      setStage('results');
    } catch (err) {
      console.error('提交结果失败', err);
      setError('提交结果时出错。请重试。');
    }
  };
  
  // 生成反馈信息
  const generateFeedback = (score) => {
    if (score >= 80) {
      return '太棒了！您的记忆力表现出色。尝试将单词分组或创建故事，这样可以更容易记住它们。';
    } else if (score >= 60) {
      return '做得不错！您的记忆力表现良好，还有提升空间。尝试使用关联法，将单词与图像联系起来。';
    } else if (score >= 40) {
      return '继续努力！通过定期训练，您的记忆力会逐步提高。尝试使用"记忆宫殿"技巧。';
    } else {
      return '记忆力训练需要时间和耐心。不要气馁，持续练习会带来进步。尝试将单词分成小组进行记忆。';
    }
  };
  
  // 重新开始训练
  const restartExercise = () => {
    // 清除任何正在运行的计时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // 重置状态
    setStage('list');
    setWords([]);
    setRecalledWords([]);
    setCurrentInput('');
    setTimer(0);
    setResults(null);
    setSelectedExercise(null);
  };
  
  // 清理副作用
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // 加载状态
  if (loading) {
    return (
      <div className="container">
        <h2>加载记忆训练中...</h2>
      </div>
    );
  }
  
  // 错误状态
  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">{error}</div>
        <button className="btn" onClick={() => window.location.reload()}>
          重试
        </button>
      </div>
    );
  }
  
  return (
    <div className="container">
      <h1>单词列表记忆训练</h1>
      <p className="lead">
        通过记忆和回忆单词列表来增强您的短期记忆能力。
      </p>
      
      {/* 训练列表阶段 */}
      {stage === 'list' && (
        <div className="exercise-list">
          {exercises.map(exercise => (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-content">
                <h3 className="exercise-title">{exercise.title}</h3>
                <p className="exercise-description">{exercise.description}</p>
                <div className="exercise-meta">
                  <span className={`difficulty difficulty-${exercise.difficulty}`}>
                    {exercise.difficulty === 'easy' ? '简单' : 
                     exercise.difficulty === 'medium' ? '中等' : '困难'}
                  </span>
                  <button 
                    className="btn" 
                    onClick={() => startExercise(exercise)}
                  >
                    开始训练
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 记忆阶段 */}
      {stage === 'memorize' && selectedExercise && (
        <div className="card">
          <h2>{selectedExercise.title} - 记忆阶段</h2>
          <p>仔细记忆以下单词。稍后您将被要求回忆它们。</p>
          <p className="timer">剩余时间: {formatTime(timer)}</p>
          
          <div className="word-list-container">
            {words.map((word, index) => (
              <div key={index} className="word-item">
                {word}
              </div>
            ))}
          </div>
          
          <div className="memory-tips">
            <h3>记忆技巧</h3>
            <ul>
              <li>尝试将单词分组或分类</li>
              <li>创建包含这些单词的故事</li>
              <li>将单词与图像联系起来</li>
              <li>找出单词之间的联系</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* 回忆阶段 */}
      {stage === 'recall' && selectedExercise && (
        <div className="card">
          <h2>{selectedExercise.title} - 回忆阶段</h2>
          <p>尝试回忆之前记忆的单词。输入您记得的每个单词并按Enter键。</p>
          <p className="timer">剩余时间: {formatTime(timer)}</p>
          
          <div className="recall-input-container">
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="输入您记得的单词并按Enter"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="btn" onClick={addRecalledWord}>
                添加
              </button>
            </div>
            
            <div className="recalled-words">
              <h3>已回忆的单词 ({recalledWords.length})</h3>
              <div className="recalled-words-list">
                {recalledWords.map((word, index) => (
                  <div key={index} className="recalled-word-item">
                    {word}
                    <button 
                      className="btn-remove" 
                      onClick={() => removeRecalledWord(word)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className="btn btn-block"
              onClick={submitResults}
            >
              完成回忆
            </button>
          </div>
        </div>
      )}
      
      {/* 结果阶段 */}
      {stage === 'results' && selectedExercise && results && (
        <div className="card">
          <h2>{selectedExercise.title} - 结果</h2>
          
          <div className="results-container">
            <div className="score">
              <div className="score-circle">
                <span>{results.score}%</span>
              </div>
              <p>
                {results.score >= 80 ? '优秀！' : 
                 results.score >= 60 ? '良好！' : 
                 results.score >= 40 ? '继续努力！' : '再接再厉！'}
              </p>
              <p>您正确回忆了 {results.correctWords.length} 个单词，共 {words.length} 个单词</p>
            </div>
            
            <div className="results-details">
              <div className="correct-words">
                <h3>正确回忆的单词</h3>
                <div className="word-list-result">
                  {results.correctWords.map((word, index) => (
                    <div key={index} className="word-item correct">
                      {word}
                    </div>
                  ))}
                  {results.correctWords.length === 0 && (
                    <p>没有正确回忆的单词</p>
                  )}
                </div>
              </div>
              
              <div className="incorrect-words">
                <h3>错误添加的单词</h3>
                <div className="word-list-result">
                  {results.incorrectWords.map((word, index) => (
                    <div key={index} className="word-item incorrect">
                      {word}
                    </div>
                  ))}
                  {results.incorrectWords.length === 0 && (
                    <p>没有错误添加的单词</p>
                  )}
                </div>
              </div>
              
              <div className="missed-words">
                <h3>遗漏的单词</h3>
                <div className="word-list-result">
                  {results.missedWords.map((word, index) => (
                    <div key={index} className="word-item missed">
                      {word}
                    </div>
                  ))}
                  {results.missedWords.length === 0 && (
                    <p>没有遗漏的单词</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="feedback">
              <h3>反馈</h3>
              <p>{results.feedback}</p>
              <p>
                建议的下一次训练难度：
                <strong>
                  {results.nextDifficulty === 'easy' ? '简单' : 
                   results.nextDifficulty === 'medium' ? '中等' : '困难'}
                </strong>
              </p>
              <p>
                建议在 <strong>{results.nextTrainingInterval}</strong> 天后进行下一次训练，
                以获得最佳的间隔重复效果。
              </p>
            </div>
            
            <div className="action-buttons">
              <button className="btn" onClick={() => startExercise(selectedExercise)}>
                再次尝试
              </button>
              <button className="btn btn-secondary" onClick={restartExercise}>
                选择其他训练
              </button>
              <Link to="/" className="btn btn-secondary">
                返回首页
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .word-list-container {
          display: flex;
          flex-wrap: wrap;
          margin: 20px 0;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 5px;
        }
        
        .word-item {
          background-color: #6a43b5;
          color: white;
          padding: 10px 15px;
          margin: 5px;
          border-radius: 4px;
          font-size: 18px;
        }
        
        .memory-tips {
          margin-top: 20px;
          padding: 15px;
          background-color: #f0f8ff;
          border-left: 4px solid #6a43b5;
        }
        
        .recalled-words {
          margin: 20px 0;
        }
        
        .recalled-words-list {
          display: flex;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        
        .recalled-word-item {
          background-color: #e6e6fa;
          color: #333;
          padding: 8px 12px;
          margin: 5px;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }
        
        .btn-remove {
          background: none;
          border: none;
          color: #ff6b6b;
          margin-left: 8px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .timer {
          font-size: 24px;
          font-weight: bold;
          color: #6a43b5;
          margin: 15px 0;
        }
        
        .word-list-result {
          display: flex;
          flex-wrap: wrap;
          margin: 10px 0;
        }
        
        .word-item.correct {
          background-color: #5cb85c;
        }
        
        .word-item.incorrect {
          background-color: #d9534f;
        }
        
        .word-item.missed {
          background-color: #f0ad4e;
          color: #333;
        }
        
        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background-color: #6a43b5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
        }
        
        .score-circle span {
          font-size: 36px;
          font-weight: bold;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default WordListMemory; 