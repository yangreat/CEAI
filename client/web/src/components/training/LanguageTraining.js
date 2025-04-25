import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LanguageTraining = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState('list'); // list, game, results
  const [gameData, setGameData] = useState(null);
  const [timer, setTimer] = useState(0);
  const [timeLimit, setTimeLimit] = useState(300);
  const [score, setScore] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // 模拟从后端获取数据
    setExercises([
      {
        id: 'language-1',
        name: '词汇扩展训练',
        description: '通过同义词、反义词和词汇联想练习来扩大词汇量，提高语言表达的准确性和丰富性。',
        difficulty: 'medium',
        duration: 10,
        type: 'vocabulary'
      },
      {
        id: 'language-2',
        name: '阅读理解训练',
        description: '阅读各类文章并回答相关问题，提高理解能力、阅读速度和信息提取能力。',
        difficulty: 'hard',
        duration: 15,
        type: 'reading'
      },
      {
        id: 'language-3',
        name: '谚语与成语训练',
        description: '学习理解常用谚语和成语的含义，提高语言的灵活性和文化理解能力。',
        difficulty: 'medium',
        duration: 8,
        type: 'proverbs'
      }
    ]);

    setLoading(false);
    
    // 清理函数
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // 模拟词汇扩展训练数据
  const mockVocabularyData = {
    id: 'vocabulary-1',
    title: '词汇扩展训练',
    instruction: '完成以下词汇练习，选择最合适的答案',
    timeLimit: 300, // 秒
    questions: [
      {
        id: 1,
        type: 'synonym', // 同义词
        question: '找出与"高兴"最接近的同义词:',
        options: ['开心', '悲伤', '激动', '平静'],
        correctAnswer: 0,
        hint: '表示愉快、快乐的心情'
      },
      {
        id: 2,
        type: 'antonym', // 反义词
        question: '找出与"勤劳"的反义词:',
        options: ['聪明', '懒惰', '诚实', '勇敢'],
        correctAnswer: 1,
        hint: '不愿意工作或付出努力的状态'
      },
      {
        id: 3,
        type: 'definition', // 词义解释
        question: '"婉转"的正确含义是:',
        options: ['直接明了', '含蓄委婉', '高声嘹亮', '低沉忧伤'],
        correctAnswer: 1,
        hint: '表达方式不直接，而是委婉含蓄'
      },
      {
        id: 4,
        type: 'usage', // 词语用法
        question: '下列哪个句子中"经过"的用法正确:',
        options: [
          '他经过长时间的思考后做出了决定',
          '这件事经过我们村子',
          '他经过了很多鞋',
          '这本书经过很有意思'
        ],
        correctAnswer: 0,
        hint: '经过可表示"通过一段时间或过程"'
      },
      {
        id: 5,
        type: 'completion', // 填空
        question: '选择正确的词语填入空白: 这个问题_____了我很久。',
        options: ['困扰', '困住', '困难', '困境'],
        correctAnswer: 0,
        hint: '表示一直让人感到烦恼或忧虑的状态'
      }
    ]
  };

  // 模拟阅读理解训练数据
  const mockReadingData = {
    id: 'reading-1',
    title: '阅读理解训练',
    instruction: '阅读以下文章，然后回答问题',
    timeLimit: 420, // 秒
    passage: `
      人工智能(AI)正在迅速改变我们的世界。从智能手机上的语音助手到自动驾驶汽车，AI技术已经融入我们的日常生活。这些系统能够学习、推理和自主行动，模仿人类的认知功能。
      
      AI的发展可以追溯到20世纪50年代，当时计算机科学家开始探索机器如何模拟人类思维。经过几十年的研究和技术突破，今天的AI系统可以执行复杂任务，如语言翻译、图像识别和复杂决策。
      
      然而，随着AI技术的进步，也出现了一些担忧。其中一个主要问题是隐私。智能设备收集大量用户数据以提高性能，这可能导致隐私侵犯。另一个担忧是就业问题，因为自动化可能取代某些工作岗位。
      
      尽管存在这些挑战，AI的潜力仍然巨大。在医疗领域，AI可以帮助诊断疾病；在环境保护方面，它可以优化资源使用；在教育方面，它可以提供个性化学习体验。
      
      面对AI的快速发展，我们需要负责任地管理这项技术。这意味着制定道德准则，确保AI系统的透明度，并考虑其社会影响。通过明智地引导AI的发展，我们可以最大化其益处，同时减轻潜在风险。
    `,
    questions: [
      {
        id: 1,
        question: '根据文章，AI的起源可以追溯到什么时候？',
        options: ['20世纪30年代', '20世纪50年代', '20世纪70年代', '21世纪初'],
        correctAnswer: 1,
        hint: '文章第二段提到了时间信息'
      },
      {
        id: 2,
        question: '文章提到了哪些AI带来的担忧？',
        options: [
          '隐私和就业问题',
          '环境问题和能源消耗',
          '国家安全和文化冲突',
          '教育质量下降和社交技能减弱'
        ],
        correctAnswer: 0,
        hint: '文章第三段详细讨论了这些担忧'
      },
      {
        id: 3,
        question: '文章提到AI在哪些领域有潜力带来积极影响？',
        options: [
          '娱乐和社交媒体',
          '军事和国防',
          '医疗、环境保护和教育',
          '体育和艺术创作'
        ],
        correctAnswer: 2,
        hint: '文章第四段列举了几个AI应用的积极领域'
      },
      {
        id: 4,
        question: '文章的主要目的是什么？',
        options: [
          '宣传最新的AI技术',
          '批评AI对社会的负面影响',
          '概述AI的发展、挑战和潜力',
          '预测AI未来的发展方向'
        ],
        correctAnswer: 2,
        hint: '考虑文章整体结构和信息组织方式'
      },
      {
        id: 5,
        question: '根据文章，负责任地管理AI技术需要什么？',
        options: [
          '限制AI研究',
          '制定道德准则和确保透明度',
          '完全由市场决定发展方向',
          '将AI控制权交给政府'
        ],
        correctAnswer: 1,
        hint: '文章最后一段讨论了管理AI的方式'
      }
    ]
  };

  // 模拟谚语与成语训练数据
  const mockProverbsData = {
    id: 'proverbs-1',
    title: '谚语与成语训练',
    instruction: '选择最能解释每个成语或谚语含义的选项',
    timeLimit: 240, // 秒
    questions: [
      {
        id: 1,
        proverb: '一箭双雕',
        question: '这个成语的含义是:',
        options: [
          '形容射箭技术高超',
          '形容仅用一次努力就获得两种收获',
          '形容做事不专心，一心二用',
          '形容事情非常困难'
        ],
        correctAnswer: 1,
        hint: '考虑一次行动带来的结果数量'
      },
      {
        id: 2,
        proverb: '防微杜渐',
        question: '这个成语的含义是:',
        options: [
          '加固房屋防止渗水',
          '在小事情发展成大问题前就加以控制',
          '小心谨慎地处理每件事',
          '因小失大'
        ],
        correctAnswer: 1,
        hint: '关注问题的早期阶段和发展趋势'
      },
      {
        id: 3,
        proverb: '塞翁失马，焉知非福',
        question: '这个谚语想表达的是:',
        options: [
          '失去财物是一种幸福',
          '善于训马的人会失去马匹',
          '坏事可能带来好的结果，好事也可能带来坏的结果',
          '老年人不应该骑马'
        ],
        correctAnswer: 2,
        hint: '考虑事物的辩证关系和结果的不确定性'
      },
      {
        id: 4,
        proverb: '画蛇添足',
        question: '这个成语的含义是:',
        options: [
          '把事情描述得夸张',
          '给蛇画上脚是很困难的',
          '做了多余的事情反而画蛇不像',
          '锦上添花，使事情更完美'
        ],
        correctAnswer: 2,
        hint: '思考添加不必要的东西会有什么后果'
      },
      {
        id: 5,
        proverb: '守株待兔',
        question: '这个成语用来比喻:',
        options: [
          '狩猎技巧',
          '固守岗位',
          '不劳而获的想法',
          '坐等机遇，不主动追求'
        ],
        correctAnswer: 3,
        hint: '考虑一个人的被动态度'
      }
    ]
  };

  // 开始练习
  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setStage('game');
    setScore(0);
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowHint(false);
    
    // 根据练习类型设置游戏数据
    if (exercise.type === 'vocabulary') {
      setGameData(mockVocabularyData);
      setTimeLimit(mockVocabularyData.timeLimit);
    } else if (exercise.type === 'reading') {
      setGameData(mockReadingData);
      setTimeLimit(mockReadingData.timeLimit);
    } else if (exercise.type === 'proverbs') {
      setGameData(mockProverbsData);
      setTimeLimit(mockProverbsData.timeLimit);
    }

    // 设置计时器
    setTimer(0);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev + 1 >= timeLimit) {
          clearInterval(interval);
          setTimerInterval(null);
          endGame();
          return timeLimit;
        }
        return prev + 1;
      });
    }, 1000);
    
    setTimerInterval(interval);
  };

  // 结束游戏，计算分数
  const endGame = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // 计算得分 - 所有训练类型都是基于正确答案数量
    const totalQuestions = gameData.questions.length;
    let correctCount = 0;
    
    Object.entries(userAnswers).forEach(([questionIndex, answer]) => {
      const question = gameData.questions[parseInt(questionIndex)];
      if (answer === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / totalQuestions) * 100);
    setScore(finalScore);
    setStage('results');
  };
  
  // 处理答案选择
  const handleAnswerSelect = (answer) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion]: answer
    });
  };

  // 处理下一题
  const handleNextQuestion = () => {
    if (currentQuestion < gameData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowHint(false);
    } else {
      endGame();
    }
  };

  // 处理上一题
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowHint(false);
    }
  };

  // 切换显示提示
  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container">
        <h2>正在加载语言训练项目...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>语言能力训练</h1>
      <p className="lead">
        提高词汇量、语言理解能力和表达能力，增强语言的流利性和准确性。
      </p>

      {stage === 'list' && (
        <div className="exercise-list">
          {exercises.map(exercise => (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-content">
                <h3 className="exercise-title">{exercise.name}</h3>
                <p className="exercise-description">{exercise.description}</p>
                <div className="exercise-meta">
                  <span className={`difficulty difficulty-${exercise.difficulty}`}>
                    {exercise.difficulty}
                  </span>
                  <span>{exercise.duration} 分钟</span>
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

      {stage === 'game' && selectedExercise && gameData && (
        <div className="game-container">
          <div className="game-header">
            <h2>{gameData.title}</h2>
            <p>{gameData.instruction}</p>
            <div className="game-meta">
              <div className="timer">剩余时间: {formatTime(timeLimit - timer)}</div>
              <div className="progress">问题 {currentQuestion + 1} / {gameData.questions.length}</div>
              <button className="btn btn-outline" onClick={endGame}>结束训练</button>
            </div>
          </div>
          
          {/* 阅读理解训练 */}
          {selectedExercise.type === 'reading' && (
            <div className="reading-game">
              <div className="reading-passage">
                <h3>阅读文章:</h3>
                <div className="passage-content">
                  {gameData.passage.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
              
              <div className="reading-question">
                <h3>问题 {currentQuestion + 1}:</h3>
                <p>{gameData.questions[currentQuestion].question}</p>
                
                <div className="options-list">
                  {gameData.questions[currentQuestion].options.map((option, index) => (
                    <div 
                      key={index} 
                      className={`option ${userAnswers[currentQuestion] === index ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="option-text">{option}</span>
                    </div>
                  ))}
                </div>
                
                <div className="hint-section">
                  <button className="hint-button" onClick={toggleHint}>
                    {showHint ? '隐藏提示' : '显示提示'}
                  </button>
                  {showHint && (
                    <div className="hint-content">
                      {gameData.questions[currentQuestion].hint}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 词汇扩展训练 */}
          {selectedExercise.type === 'vocabulary' && (
            <div className="vocabulary-game">
              <div className="vocabulary-question">
                <h3>问题 {currentQuestion + 1}:</h3>
                <p>{gameData.questions[currentQuestion].question}</p>
                
                <div className="options-list">
                  {gameData.questions[currentQuestion].options.map((option, index) => (
                    <div 
                      key={index} 
                      className={`option ${userAnswers[currentQuestion] === index ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="option-text">{option}</span>
                    </div>
                  ))}
                </div>
                
                <div className="hint-section">
                  <button className="hint-button" onClick={toggleHint}>
                    {showHint ? '隐藏提示' : '显示提示'}
                  </button>
                  {showHint && (
                    <div className="hint-content">
                      {gameData.questions[currentQuestion].hint}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 谚语与成语训练 */}
          {selectedExercise.type === 'proverbs' && (
            <div className="proverbs-game">
              <div className="proverb-display">
                <h3>成语/谚语:</h3>
                <div className="proverb">{gameData.questions[currentQuestion].proverb}</div>
              </div>
              
              <div className="proverb-question">
                <h3>问题:</h3>
                <p>{gameData.questions[currentQuestion].question}</p>
                
                <div className="options-list">
                  {gameData.questions[currentQuestion].options.map((option, index) => (
                    <div 
                      key={index} 
                      className={`option ${userAnswers[currentQuestion] === index ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="option-text">{option}</span>
                    </div>
                  ))}
                </div>
                
                <div className="hint-section">
                  <button className="hint-button" onClick={toggleHint}>
                    {showHint ? '隐藏提示' : '显示提示'}
                  </button>
                  {showHint && (
                    <div className="hint-content">
                      {gameData.questions[currentQuestion].hint}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 导航按钮 - 所有训练类型通用 */}
          <div className="navigation-buttons">
            <button 
              className="btn" 
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
            >
              上一题
            </button>
            
            <button 
              className="btn" 
              onClick={handleNextQuestion}
            >
              {currentQuestion === gameData.questions.length - 1 ? '完成' : '下一题'}
            </button>
          </div>
        </div>
      )}
      
      {stage === 'results' && (
        <div className="results-container">
          <h2>训练结果</h2>
          <div className="results-card">
            <div className="result-item">
              <span className="result-label">得分:</span>
              <span className="result-value">{score}%</span>
            </div>
            <div className="result-item">
              <span className="result-label">用时:</span>
              <span className="result-value">{formatTime(timer)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">正确回答:</span>
              <span className="result-value">
                {Object.entries(userAnswers).filter(([questionIndex, answer]) => 
                  answer === gameData.questions[parseInt(questionIndex)].correctAnswer
                ).length} / {gameData.questions.length}
              </span>
            </div>
            
            <div className="training-tips">
              <h3>语言学习技巧</h3>
              <ul>
                {selectedExercise.type === 'vocabulary' && (
                  <>
                    <li>尝试在日常生活中使用新学到的词汇，这样能更好地记住它们。</li>
                    <li>阅读各类文章，积累不同领域的专业词汇。</li>
                    <li>尝试用同义词替换常用词，丰富你的表达方式。</li>
                  </>
                )}
                
                {selectedExercise.type === 'reading' && (
                  <>
                    <li>主动阅读：提出问题，预测内容，总结主要观点。</li>
                    <li>提高阅读速度：减少回读，扩大视野范围，减少口头阅读。</li>
                    <li>尝试多种类型的阅读材料，拓展知识面和理解能力。</li>
                  </>
                )}
                
                {selectedExercise.type === 'proverbs' && (
                  <>
                    <li>了解成语的典故和历史背景，有助于深入理解其含义。</li>
                    <li>观察成语在不同语境中的使用，掌握其适用场景。</li>
                    <li>尝试在写作和口语中恰当使用成语，提升语言的生动性。</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="action-buttons">
              <button className="btn" onClick={() => setStage('list')}>
                返回训练列表
              </button>
              <button className="btn" onClick={() => startExercise(selectedExercise)}>
                再次尝试
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageTraining; 