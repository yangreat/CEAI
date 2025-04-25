import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EmotionTraining = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState('list'); // list, game, results
  const [gameData, setGameData] = useState(null);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [score, setScore] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [breathCount, setBreathCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold, exhale

  useEffect(() => {
    // 模拟从后端获取数据
    setExercises([
      {
        id: 'emotion-1',
        name: '情绪识别练习',
        description: '识别面部表情和语调中的情绪，提高情绪认知能力。这有助于更好地理解他人的情感状态和更有效地交流。',
        difficulty: 'easy',
        duration: 5,
        type: 'emotion-recognition'
      },
      {
        id: 'emotion-2',
        name: '引导式放松训练',
        description: '通过冥想和深呼吸等技巧，学习如何有效地减轻压力和焦虑。这些技能有助于在日常生活中更好地管理情绪。',
        difficulty: 'easy',
        duration: 10,
        type: 'relaxation'
      },
      {
        id: 'emotion-3',
        name: '情绪日记训练',
        description: '学习记录和分析自己的情绪变化，了解引发特定情绪的触发因素，并发展健康的应对策略。',
        difficulty: 'medium',
        duration: 15,
        type: 'emotion-journal'
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

  // 模拟情绪识别数据
  const mockEmotionRecognitionGame = {
    title: '情绪识别练习',
    instruction: '识别下面图片中表达的情绪',
    timeLimit: 30, // 秒
    questions: [
      {
        id: 1,
        imageUrl: '/assets/exercises/happy_face.png',
        options: ['高兴', '悲伤', '愤怒', '惊讶'],
        correctAnswer: '高兴'
      },
      {
        id: 2,
        imageUrl: '/assets/exercises/sad_face.png',
        options: ['高兴', '悲伤', '愤怒', '惊讶'],
        correctAnswer: '悲伤'
      },
      {
        id: 3,
        imageUrl: '/assets/exercises/angry_face.png',
        options: ['高兴', '悲伤', '愤怒', '惊讶'],
        correctAnswer: '愤怒'
      },
      {
        id: 4,
        imageUrl: '/assets/exercises/surprised_face.png',
        options: ['高兴', '悲伤', '愤怒', '惊讶'],
        correctAnswer: '惊讶'
      }
    ]
  };

  // 模拟引导式放松训练数据
  const mockRelaxationData = {
    id: 'relaxation-1',
    title: '引导式深呼吸放松',
    instruction: '跟随指示完成一系列深呼吸练习，帮助放松身心',
    timeLimit: 300, // 秒
    steps: [
      {
        id: 1,
        title: '准备',
        instruction: '找一个安静、舒适的地方坐下。保持背部挺直，双手放在膝盖上，闭上眼睛或保持目光轻柔下垂。'
      },
      {
        id: 2,
        title: '专注呼吸',
        instruction: '开始关注你的呼吸，不需要改变它，只需观察自然的呼吸节奏。'
      },
      {
        id: 3,
        title: '深呼吸练习',
        instruction: '我们将开始4-7-8呼吸法：吸气4秒，屏息7秒，呼气8秒。点击"开始"按钮后跟随提示进行。',
        isBreathingExercise: true
      },
      {
        id: 4,
        title: '身体扫描',
        instruction: '从头到脚逐渐关注身体各部位，感受并放松任何紧张区域。从头部开始，慢慢向下移动注意力到脚趾。'
      },
      {
        id: 5,
        title: '正念回顾',
        instruction: '在结束前，花几分钟感受整个身体的放松状态。注意到你的情绪和思维可能已经变得更加平静。'
      }
    ]
  };

  // 模拟情绪日记训练数据
  const mockEmotionJournalData = {
    id: 'emotion-journal-1',
    title: '情绪日记练习',
    instruction: '记录并反思你的情绪体验，了解情绪变化的模式和触发因素',
    timeLimit: 600, // 秒
    prompts: [
      {
        id: 1,
        question: '今天你经历了什么情绪？请选择最主要的一种：',
        options: ['高兴', '悲伤', '愤怒', '焦虑', '平静', '满足', '失望', '烦躁', '其他']
      },
      {
        id: 2,
        question: '这种情绪的强度如何？（1-10分，10分最强）',
        type: 'slider',
        min: 1,
        max: 10
      },
      {
        id: 3,
        question: '是什么触发了这种情绪？尽可能详细地描述当时的情境。',
        type: 'textarea'
      },
      {
        id: 4,
        question: '你的身体有什么反应？（可多选）',
        type: 'checkbox',
        options: ['心跳加速', '呼吸急促', '肌肉紧张', '头痛', '胃部不适', '出汗', '疲劳', '其他']
      },
      {
        id: 5,
        question: '你如何应对这种情绪？你采取了什么行动？',
        type: 'textarea'
      },
      {
        id: 6,
        question: '现在回想起来，你还有其他可能的应对方式吗？',
        type: 'textarea'
      }
    ]
  };

  // 开始练习
  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setStage('game');
    setScore(0);
    setCurrentStep(0);
    setAnswers({});
    setBreathCount(0);
    setBreathPhase('inhale');
    
    // 根据练习类型设置游戏数据
    if (exercise.type === 'emotion-recognition') {
      setGameData(mockEmotionRecognitionGame);
      startTimer(mockEmotionRecognitionGame.timeLimit);
    } else if (exercise.type === 'relaxation') {
      setGameData(mockRelaxationData);
      // 放松练习不需要计时
    } else if (exercise.type === 'emotion-journal') {
      setGameData(mockEmotionJournalData);
      startTimer(mockEmotionJournalData.timeLimit);
    }
  };

  // 启动计时器
  const startTimer = (limit) => {
    setTimer(0);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev + 1 >= limit) {
          clearInterval(interval);
          setTimerInterval(null);
          return limit;
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
    
    let finalScore = 0;
    
    if (selectedExercise.type === 'emotion-recognition') {
      const questions = gameData.questions;
      let correctCount = 0;
      
      questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctCount++;
        }
      });
      
      finalScore = Math.round((correctCount / questions.length) * 100);
    } else if (selectedExercise.type === 'relaxation') {
      // 放松练习没有分数，给予完成奖励
      finalScore = 100;
    } else if (selectedExercise.type === 'emotion-journal') {
      // 情绪日记没有对错，但根据完成度给分
      const completedPrompts = Object.keys(answers).length;
      finalScore = Math.round((completedPrompts / gameData.prompts.length) * 100);
    }
    
    setScore(finalScore);
    setStage('results');
  };
  
  // 处理答案选择
  const handleAnswerSelect = (questionIndex, answer) => {
    setAnswers({
      ...answers,
      [questionIndex]: answer
    });
  };

  // 处理下一步
  const handleNextStep = () => {
    if (selectedExercise.type === 'emotion-recognition') {
      if (currentStep < gameData.questions.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        endGame();
      }
    } else if (selectedExercise.type === 'relaxation') {
      if (currentStep < gameData.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        endGame();
      }
    } else if (selectedExercise.type === 'emotion-journal') {
      if (currentStep < gameData.prompts.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        endGame();
      }
    }
  };

  // 处理上一步
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // 开始呼吸练习
  const startBreathingExercise = () => {
    // 呼吸计数器
    let count = 0;
    const breathingInterval = setInterval(() => {
      count++;
      if (count <= 4) {
        setBreathPhase('inhale');
      } else if (count <= 11) {
        setBreathPhase('hold');
      } else if (count <= 19) {
        setBreathPhase('exhale');
      } else {
        count = 0;
        setBreathCount(prev => prev + 1);
        if (breathCount >= 5) { // 5次呼吸后结束
          clearInterval(breathingInterval);
          handleNextStep();
        }
      }
    }, 1000);
    
    // 清理函数
    return () => clearInterval(breathingInterval);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container">
        <h2>正在加载情绪训练项目...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>情绪调节训练</h1>
      <p className="lead">
        通过识别、理解和调节情绪的练习，提高情绪智力和心理韧性。
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
              {timerInterval && (
                <div className="timer">
                  {selectedExercise.type === 'emotion-recognition' || selectedExercise.type === 'emotion-journal' 
                    ? `剩余时间: ${formatTime(gameData.timeLimit - timer)}`
                    : ''}
                </div>
              )}
              <button className="btn btn-outline" onClick={endGame}>结束训练</button>
            </div>
          </div>
          
          {/* 情绪识别训练 */}
          {selectedExercise.type === 'emotion-recognition' && (
            <div className="emotion-recognition-game">
              <div className="emotion-image">
                <img 
                  src={gameData.questions[currentStep].imageUrl} 
                  alt="面部表情" 
                  className="emotion-image"
                  style={gameData.questions[currentStep].imageUrl && !gameData.questions[currentStep].imageUrl.includes('placeholder') ? {} : { display: 'none' }}
                />
                {/* 仅在没有实际图片时显示SVG */}
                {(!gameData.questions[currentStep].imageUrl || gameData.questions[currentStep].imageUrl.includes('placeholder')) && (
                  <svg 
                    width="300" 
                    height="300" 
                    viewBox="0 0 300 300" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="emotion-image"
                  >
                    <rect width="100%" height="100%" fill="#f0f0f0" />
                    <circle cx="150" cy="150" r="100" fill="#e0e0e0" stroke="#ccc" />
                    {/* 根据情绪类型显示不同表情 */}
                    {gameData.questions[currentStep].correctAnswer.includes('高兴') && (
                      <g>
                        <circle cx="110" cy="120" r="10" fill="#333" /> {/* 左眼 */}
                        <circle cx="190" cy="120" r="10" fill="#333" /> {/* 右眼 */}
                        <path d="M 90 170 Q 150 220 210 170" stroke="#333" strokeWidth="5" fill="none" /> {/* 笑容 */}
                      </g>
                    )}
                    {gameData.questions[currentStep].correctAnswer.includes('悲伤') && (
                      <g>
                        <circle cx="110" cy="120" r="10" fill="#333" /> {/* 左眼 */}
                        <circle cx="190" cy="120" r="10" fill="#333" /> {/* 右眼 */}
                        <path d="M 90 190 Q 150 160 210 190" stroke="#333" strokeWidth="5" fill="none" /> {/* 悲伤表情 */}
                      </g>
                    )}
                    {gameData.questions[currentStep].correctAnswer.includes('愤怒') && (
                      <g>
                        <path d="M 100 110 L 120 120 L 100 130" stroke="#333" strokeWidth="5" fill="none" /> {/* 左眉 */}
                        <path d="M 200 110 L 180 120 L 200 130" stroke="#333" strokeWidth="5" fill="none" /> {/* 右眉 */}
                        <circle cx="110" cy="130" r="10" fill="#333" /> {/* 左眼 */}
                        <circle cx="190" cy="130" r="10" fill="#333" /> {/* 右眼 */}
                        <path d="M 120 190 L 180 190" stroke="#333" strokeWidth="5" fill="none" /> {/* 生气表情 */}
                      </g>
                    )}
                    {!gameData.questions[currentStep].correctAnswer.includes('高兴') && 
                      !gameData.questions[currentStep].correctAnswer.includes('悲伤') && 
                      !gameData.questions[currentStep].correctAnswer.includes('愤怒') && (
                      <g>
                        <circle cx="110" cy="120" r="10" fill="#333" /> {/* 左眼 */}
                        <circle cx="190" cy="120" r="10" fill="#333" /> {/* 右眼 */}
                        <path d="M 120 170 L 180 170" stroke="#333" strokeWidth="5" fill="none" /> {/* 中性表情 */}
                      </g>
                    )}
                  </svg>
                )}
              </div>
              
              <div className="emotion-question">
                <h3>问题 {currentStep + 1}:</h3>
                <p>{gameData.questions[currentStep].question}</p>
              </div>
              
              <div className="options-list">
                {gameData.questions[currentStep].options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`option ${answers[currentStep] === index ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(currentStep, index)}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                  </div>
                ))}
              </div>
              
              <div className="navigation-buttons">
                <button 
                  className="btn" 
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                >
                  上一题
                </button>
                
                <button 
                  className="btn" 
                  onClick={handleNextStep}
                >
                  {currentStep === gameData.questions.length - 1 ? '完成' : '下一题'}
                </button>
              </div>
            </div>
          )}
          
          {/* 引导式放松训练 */}
          {selectedExercise.type === 'relaxation' && (
            <div className="relaxation-game">
              <div className="relaxation-step">
                <h3>{gameData.steps[currentStep].title}</h3>
                <p>{gameData.steps[currentStep].instruction}</p>
                
                {gameData.steps[currentStep].isBreathingExercise && (
                  <div className="breathing-exercise">
                    {breathCount < 5 ? (
                      <>
                        <div className="breath-animation">
                          <div className={`breath-circle ${breathPhase}`}></div>
                        </div>
                        <div className="breath-instruction">
                          {breathPhase === 'inhale' && '吸气 (4秒)'}
                          {breathPhase === 'hold' && '屏息 (7秒)'}
                          {breathPhase === 'exhale' && '呼气 (8秒)'}
                        </div>
                        <div className="breath-counter">
                          完成 {breathCount}/5 次呼吸
                        </div>
                        <button 
                          className="btn" 
                          onClick={startBreathingExercise}
                          disabled={breathCount > 0}
                        >
                          {breathCount === 0 ? '开始' : '呼吸中...'}
                        </button>
                      </>
                    ) : (
                      <div className="breathing-complete">
                        <p>呼吸练习完成！</p>
                        <button className="btn" onClick={handleNextStep}>
                          继续
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="navigation-buttons">
                {!gameData.steps[currentStep].isBreathingExercise && (
                  <>
                    <button 
                      className="btn" 
                      onClick={handlePrevStep}
                      disabled={currentStep === 0}
                    >
                      上一步
                    </button>
                    
                    <button 
                      className="btn" 
                      onClick={handleNextStep}
                    >
                      {currentStep === gameData.steps.length - 1 ? '完成' : '下一步'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* 情绪日记训练 */}
          {selectedExercise.type === 'emotion-journal' && (
            <div className="emotion-journal-game">
              <div className="journal-prompt">
                <h3>提示 {currentStep + 1}:</h3>
                <p>{gameData.prompts[currentStep].question}</p>
              </div>
              
              <div className="journal-input">
                {gameData.prompts[currentStep].type === 'textarea' && (
                  <textarea 
                    className="journal-textarea"
                    placeholder="在这里输入你的想法..."
                    value={answers[currentStep] || ''}
                    onChange={(e) => handleAnswerSelect(currentStep, e.target.value)}
                  ></textarea>
                )}
                
                {!gameData.prompts[currentStep].type && gameData.prompts[currentStep].options && (
                  <div className="options-list">
                    {gameData.prompts[currentStep].options.map((option, index) => (
                      <div 
                        key={index} 
                        className={`option ${answers[currentStep] === option ? 'selected' : ''}`}
                        onClick={() => handleAnswerSelect(currentStep, option)}
                      >
                        <span className="option-text">{option}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {gameData.prompts[currentStep].type === 'slider' && (
                  <div className="slider-container">
                    <input 
                      type="range" 
                      min={gameData.prompts[currentStep].min} 
                      max={gameData.prompts[currentStep].max}
                      value={answers[currentStep] || 5}
                      onChange={(e) => handleAnswerSelect(currentStep, parseInt(e.target.value))}
                      className="slider"
                    />
                    <div className="slider-value">{answers[currentStep] || 5}</div>
                  </div>
                )}
                
                {gameData.prompts[currentStep].type === 'checkbox' && (
                  <div className="checkbox-list">
                    {gameData.prompts[currentStep].options.map((option, index) => {
                      const selected = answers[currentStep] ? answers[currentStep].includes(option) : false;
                      return (
                        <div 
                          key={index} 
                          className={`checkbox-item ${selected ? 'selected' : ''}`}
                          onClick={() => {
                            const currentSelections = answers[currentStep] || [];
                            let newSelections;
                            
                            if (currentSelections.includes(option)) {
                              newSelections = currentSelections.filter(item => item !== option);
                            } else {
                              newSelections = [...currentSelections, option];
                            }
                            
                            handleAnswerSelect(currentStep, newSelections);
                          }}
                        >
                          <span className={`checkbox ${selected ? 'checked' : ''}`}></span>
                          <span className="option-text">{option}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="navigation-buttons">
                <button 
                  className="btn" 
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                >
                  上一题
                </button>
                
                <button 
                  className="btn" 
                  onClick={handleNextStep}
                >
                  {currentStep === gameData.prompts.length - 1 ? '完成' : '下一题'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {stage === 'results' && (
        <div className="results-container">
          <h2>训练结果</h2>
          <div className="results-card">
            {selectedExercise.type === 'emotion-recognition' && (
              <>
                <div className="result-item">
                  <span className="result-label">得分:</span>
                  <span className="result-value">{score}%</span>
                </div>
                <div className="result-item">
                  <span className="result-label">正确识别:</span>
                  <span className="result-value">
                    {Object.entries(answers).filter(([questionIndex, answerIndex]) => 
                      answerIndex === gameData.questions[parseInt(questionIndex)].correctAnswer
                    ).length} / {gameData.questions.length}
                  </span>
                </div>
              </>
            )}
            
            {selectedExercise.type === 'relaxation' && (
              <div className="result-item">
                <span className="result-label">练习完成!</span>
                <span className="result-value">恭喜你完成了放松训练</span>
              </div>
            )}
            
            {selectedExercise.type === 'emotion-journal' && (
              <div className="result-item">
                <span className="result-label">完成度:</span>
                <span className="result-value">{Object.keys(answers).length} / {gameData.prompts.length} 问题</span>
              </div>
            )}
            
            <div className="training-tips">
              <h3>情绪调节技巧</h3>
              <ul>
                {selectedExercise.type === 'emotion-recognition' && (
                  <>
                    <li>练习识别面部微表情，这些细微的表情变化往往包含重要的情绪信息。</li>
                    <li>注意情绪不仅体现在面部，还体现在姿势、语调和手势等方面。</li>
                    <li>提高情绪词汇量，能够更精确地描述和理解不同情绪的细微差别。</li>
                  </>
                )}
                
                {selectedExercise.type === 'relaxation' && (
                  <>
                    <li>尝试在日常生活中定期进行短暂的深呼吸练习，特别是在感到压力时。</li>
                    <li>创建一个放松仪式，例如睡前15分钟的冥想或深呼吸。</li>
                    <li>注意身体紧张的信号，如肩膀紧绷或呼吸急促，这些是压力的早期征兆。</li>
                  </>
                )}
                
                {selectedExercise.type === 'emotion-journal' && (
                  <>
                    <li>定期记录情绪变化，寻找情绪模式和触发因素。</li>
                    <li>尝试"重新评估"技术，即以不同的角度看待引发情绪的事件。</li>
                    <li>区分情绪和行为，记住你可以选择如何应对情绪，而不必被情绪控制。</li>
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

export default EmotionTraining; 