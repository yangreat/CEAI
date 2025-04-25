import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ExecutiveTraining = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState('list'); // list, game, results
  const [gameData, setGameData] = useState(null);
  const [timer, setTimer] = useState(0);
  const [timeLimit, setTimeLimit] = useState(300);
  const [score, setScore] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [taskList, setTaskList] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userActions, setUserActions] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    // 模拟从后端获取数据
    setExercises([
      {
        id: 'executive-1',
        name: '任务规划训练',
        description: '练习制定和执行计划的能力，学习如何有效安排任务顺序和管理时间，提高组织能力和工作效率。',
        difficulty: 'medium',
        duration: 10,
        type: 'planning'
      },
      {
        id: 'executive-2',
        name: '任务切换训练',
        description: '提高在不同任务之间快速转换注意力的能力，增强认知灵活性和多任务处理能力。',
        difficulty: 'hard',
        duration: 8,
        type: 'task-switching'
      },
      {
        id: 'executive-3',
        name: '工作记忆训练',
        description: '加强短时间内同时保持和处理多个信息的能力，对学习、推理和问题解决至关重要。',
        difficulty: 'medium',
        duration: 12,
        type: 'working-memory'
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

  // 模拟任务规划训练数据
  const mockPlanningData = {
    id: 'planning-1',
    title: '日程规划挑战',
    instruction: '为一天的活动制定最优计划，考虑时间限制和任务优先级',
    timeLimit: 300, // 秒
    scenario: '你需要在一天内完成以下任务，请按照最有效的顺序排列它们：',
    tasks: [
      {
        id: 1,
        name: '准备重要演讲',
        duration: 120, // 分钟
        deadline: '下午2:00',
        priority: 'high',
        dependencies: []
      },
      {
        id: 2,
        name: '购买生日礼物',
        duration: 60,
        deadline: '晚上8:00',
        priority: 'medium',
        dependencies: []
      },
      {
        id: 3,
        name: '医生预约',
        duration: 90,
        deadline: '上午11:00',
        priority: 'high',
        dependencies: []
      },
      {
        id: 4,
        name: '回复工作邮件',
        duration: 45,
        deadline: '下午5:00',
        priority: 'medium',
        dependencies: []
      },
      {
        id: 5,
        name: '健身锻炼',
        duration: 60,
        deadline: '无',
        priority: 'low',
        dependencies: []
      }
    ],
    timeSlots: [
      '上午8:00 - 9:00',
      '上午9:00 - 10:00',
      '上午10:00 - 11:00',
      '上午11:00 - 12:00',
      '中午12:00 - 1:00',
      '下午1:00 - 2:00',
      '下午2:00 - 3:00',
      '下午3:00 - 4:00',
      '下午4:00 - 5:00',
      '下午5:00 - 6:00'
    ],
    optimalSolution: [3, 1, 4, 2, 5] // 任务ID的最优顺序
  };

  // 模拟任务切换训练数据
  const mockTaskSwitchingData = {
    id: 'task-switching-1',
    title: '任务切换挑战',
    instruction: '根据规则快速在两种不同任务之间切换',
    timeLimit: 180, // 秒
    tasks: [
      {
        id: 1,
        type: 'color',
        instruction: '选择与文字颜色相匹配的按钮',
        trials: [
          { text: '红色', color: 'red', correctAnswer: 'red' },
          { text: '蓝色', color: 'blue', correctAnswer: 'blue' },
          { text: '绿色', color: 'green', correctAnswer: 'green' },
          { text: '红色', color: 'green', correctAnswer: 'green' },
          { text: '蓝色', color: 'red', correctAnswer: 'red' }
        ]
      },
      {
        id: 2,
        type: 'word',
        instruction: '选择与文字含义相匹配的按钮',
        trials: [
          { text: '红色', color: 'blue', correctAnswer: 'red' },
          { text: '蓝色', color: 'green', correctAnswer: 'blue' },
          { text: '绿色', color: 'red', correctAnswer: 'green' },
          { text: '红色', color: 'green', correctAnswer: 'red' },
          { text: '蓝色', color: 'red', correctAnswer: 'blue' }
        ]
      }
    ],
    sequence: [1, 2, 1, 2, 1, 2, 2, 1, 2, 1] // 任务类型序列
  };

  // 模拟工作记忆训练数据
  const mockWorkingMemoryData = {
    id: 'working-memory-1',
    title: 'N-back测试',
    instruction: '判断当前显示的字母是否与N步之前显示的字母相同',
    timeLimit: 240, // 秒
    n: 2, // 2-back测试
    letters: ['A', 'B', 'C', 'A', 'D', 'E', 'C', 'F', 'A', 'C', 'B', 'A', 'F', 'B', 'D', 'E', 'A', 'C', 'E', 'F'],
    targets: [false, false, false, true, false, false, false, false, false, false, false, false, false, true, false, false, true, false, false, false]
  };

  // 开始练习
  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setStage('game');
    setScore(0);
    setCurrentStep(0);
    setUserActions({});
    setTaskList([]);
    
    // 根据练习类型设置游戏数据
    if (exercise.type === 'planning') {
      setGameData(mockPlanningData);
      setTimeLimit(mockPlanningData.timeLimit);
      // 随机打乱任务顺序以供用户排序
      setTaskList([...mockPlanningData.tasks].sort(() => Math.random() - 0.5));
    } else if (exercise.type === 'task-switching') {
      setGameData(mockTaskSwitchingData);
      setTimeLimit(mockTaskSwitchingData.timeLimit);
    } else if (exercise.type === 'working-memory') {
      setGameData(mockWorkingMemoryData);
      setTimeLimit(mockWorkingMemoryData.timeLimit);
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
    
    let finalScore = 0;
    
    if (selectedExercise.type === 'planning') {
      // 计算规划得分 - 任务顺序与最优解的匹配度
      const userOrder = taskList.map(task => task.id);
      let correctPositions = 0;
      
      gameData.optimalSolution.forEach((taskId, index) => {
        if (userOrder[index] === taskId) {
          correctPositions++;
        }
      });
      
      finalScore = Math.round((correctPositions / gameData.optimalSolution.length) * 100);
    } else if (selectedExercise.type === 'task-switching') {
      // 计算任务切换得分 - 正确回答的比例
      const totalTrials = Object.keys(userActions).length;
      let correctTrials = 0;
      
      Object.entries(userActions).forEach(([trialIndex, answer]) => {
        const taskIndex = gameData.sequence[parseInt(trialIndex)];
        const taskType = (taskIndex === 1) ? 'color' : 'word';
        const trial = gameData.tasks.find(t => t.type === taskType).trials[currentStep % 5];
        
        if (answer === trial.correctAnswer) {
          correctTrials++;
        }
      });
      
      finalScore = totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;
    } else if (selectedExercise.type === 'working-memory') {
      // 计算工作记忆得分 - 正确回答的比例
      const totalTrials = Object.keys(userActions).length;
      let correctTrials = 0;
      
      Object.entries(userActions).forEach(([letterIndex, response]) => {
        const index = parseInt(letterIndex);
        const isTarget = gameData.targets[index];
        
        if ((response === true && isTarget) || (response === false && !isTarget)) {
          correctTrials++;
        }
      });
      
      finalScore = totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;
    }
    
    setScore(finalScore);
    setStage('results');
  };
  
  // 处理任务拖拽开始
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', task.id);
    setDraggedItem(task);
  };

  // 处理任务拖拽经过
  const handleDragOver = (e) => {
    e.preventDefault(); // 这是必须的，允许放置
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
  };
  
  // 处理拖拽离开
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  // 处理任务放置
  const handleDrop = (e, index) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const draggedId = e.dataTransfer.getData('text/plain');
    const newTaskList = [...taskList];
    const draggedItemIndex = newTaskList.findIndex(task => task.id.toString() === draggedId);
    
    if (draggedItemIndex > -1) {
      // 移除拖拽项
      const [removed] = newTaskList.splice(draggedItemIndex, 1);
      // 在新位置插入
      newTaskList.splice(index, 0, removed);
      
      setTaskList(newTaskList);
    }
    
    setDraggedItem(null);
  };

  // 处理任务切换回答
  const handleTaskSwitchingAnswer = (answer) => {
    setUserActions({
      ...userActions,
      [currentStep]: answer
    });
    
    // 移动到下一个试验
    if (currentStep < gameData.sequence.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endGame();
    }
  };

  // 处理工作记忆回答
  const handleWorkingMemoryAnswer = (response) => {
    setUserActions({
      ...userActions,
      [currentStep]: response
    });
    
    // 移动到下一个字母
    if (currentStep < gameData.letters.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endGame();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container">
        <h2>正在加载执行功能训练项目...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>执行功能训练</h1>
      <p className="lead">
        提高规划、组织、任务切换和问题解决能力，增强大脑的执行控制系统。
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
              <button className="btn btn-outline" onClick={endGame}>结束训练</button>
            </div>
          </div>
          
          {/* 任务规划训练 */}
          {selectedExercise.type === 'planning' && (
            <div className="planning-game">
              <div className="planning-scenario">
                <h3>场景:</h3>
                <p>{gameData.scenario}</p>
              </div>
              
              <div className="task-list-container">
                <h3>拖拽任务进行排序:</h3>
                <div className="task-list">
                  {taskList.map((task, index) => (
                    <div 
                      key={task.id}
                      className="task-item"
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragOver={(e) => handleDragOver(e)}
                      onDragLeave={(e) => handleDragLeave(e)}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="task-info">
                        <span className="task-name">{task.name}</span>
                        <div className="task-details">
                          <span className="task-duration">用时: {task.duration}分钟</span>
                          <span className="task-deadline">截止: {task.deadline}</span>
                          <span className={`task-priority priority-${task.priority}`}>
                            优先级: {task.priority === 'high' ? '高' : (task.priority === 'medium' ? '中' : '低')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="time-slots">
                <h3>可用时间段:</h3>
                <div className="slot-list">
                  {gameData.timeSlots.map((slot, index) => (
                    <div key={index} className="time-slot">
                      {slot}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="planning-submit">
                <button className="btn" onClick={endGame}>提交计划</button>
              </div>
            </div>
          )}
          
          {/* 任务切换训练 */}
          {selectedExercise.type === 'task-switching' && (
            <div className="task-switching-game">
              <div className="task-instruction">
                {gameData.sequence[currentStep] === 1 ? (
                  <h3>{gameData.tasks[0].instruction}</h3>
                ) : (
                  <h3>{gameData.tasks[1].instruction}</h3>
                )}
              </div>
              
              <div className="task-content">
                {gameData.sequence[currentStep] === 1 ? (
                  <div 
                    className="color-word" 
                    style={{ color: gameData.tasks[0].trials[currentStep % 5].color }}
                  >
                    {gameData.tasks[0].trials[currentStep % 5].text}
                  </div>
                ) : (
                  <div 
                    className="color-word" 
                    style={{ color: gameData.tasks[1].trials[currentStep % 5].color }}
                  >
                    {gameData.tasks[1].trials[currentStep % 5].text}
                  </div>
                )}
              </div>
              
              <div className="task-options">
                <button 
                  className="btn color-btn red" 
                  onClick={() => handleTaskSwitchingAnswer('red')}
                >
                  红色
                </button>
                <button 
                  className="btn color-btn blue" 
                  onClick={() => handleTaskSwitchingAnswer('blue')}
                >
                  蓝色
                </button>
                <button 
                  className="btn color-btn green" 
                  onClick={() => handleTaskSwitchingAnswer('green')}
                >
                  绿色
                </button>
              </div>
              
              <div className="task-progress">
                试验 {currentStep + 1} / {gameData.sequence.length}
              </div>
            </div>
          )}
          
          {/* 工作记忆训练 */}
          {selectedExercise.type === 'working-memory' && (
            <div className="working-memory-game">
              <div className="memory-instruction">
                <h3>
                  {gameData.n}-back测试: 如果当前字母与{gameData.n}步之前的字母相同，请点击"匹配"，否则点击"不匹配"
                </h3>
              </div>
              
              <div className="memory-content">
                <div className="memory-letter">
                  {gameData.letters[currentStep]}
                </div>
                
                {currentStep >= gameData.n && (
                  <div className="memory-hint">
                    {gameData.n}步前的字母是: {gameData.letters[currentStep - gameData.n]}
                  </div>
                )}
              </div>
              
              <div className="memory-options">
                <button 
                  className="btn" 
                  onClick={() => handleWorkingMemoryAnswer(true)}
                  disabled={currentStep < gameData.n}
                >
                  匹配
                </button>
                <button 
                  className="btn" 
                  onClick={() => handleWorkingMemoryAnswer(false)}
                  disabled={currentStep < gameData.n}
                >
                  不匹配
                </button>
              </div>
              
              <div className="memory-progress">
                字母 {currentStep + 1} / {gameData.letters.length}
              </div>
            </div>
          )}
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
            
            {selectedExercise.type === 'planning' && (
              <div className="result-details">
                <h3>最优安排参考:</h3>
                <ol className="optimal-solution">
                  {gameData.optimalSolution.map(taskId => {
                    const task = gameData.tasks.find(t => t.id === taskId);
                    return (
                      <li key={taskId}>
                        {task.name} - {task.deadline} - 优先级: {task.priority === 'high' ? '高' : (task.priority === 'medium' ? '中' : '低')}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
            
            <div className="training-tips">
              <h3>训练技巧</h3>
              <ul>
                {selectedExercise.type === 'planning' && (
                  <>
                    <li>制定计划时，先考虑紧急且重要的任务，再处理重要但不紧急的任务。</li>
                    <li>注意任务之间的依赖关系，有些任务需要按特定顺序完成。</li>
                    <li>为复杂任务预留缓冲时间，避免时间安排过于紧凑。</li>
                  </>
                )}
                
                {selectedExercise.type === 'task-switching' && (
                  <>
                    <li>练习预先准备策略，在切换任务前提前做好心理准备。</li>
                    <li>减少分心因素，专注于当前任务的规则。</li>
                    <li>定期练习可以减少任务切换的认知成本，提高切换效率。</li>
                  </>
                )}
                
                {selectedExercise.type === 'working-memory' && (
                  <>
                    <li>尝试使用记忆辅助策略，如将信息编码为视觉图像。</li>
                    <li>提高专注度，减少干扰因素。</li>
                    <li>增加训练难度可以进一步提升工作记忆容量，尝试挑战更高的n值。</li>
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

export default ExecutiveTraining; 