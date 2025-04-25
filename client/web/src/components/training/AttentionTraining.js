import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const AttentionTraining = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState('list'); // list, game, results
  const [gameData, setGameData] = useState(null);
  const [timer, setTimer] = useState(0);
  const [timeLimit, setTimeLimit] = useState(60);
  const [score, setScore] = useState(0);
  const [found, setFound] = useState([]);
  const [timerInterval, setTimerInterval] = useState(null);
  
  // 注意力追踪游戏状态
  const [trackingPhase, setTrackingPhase] = useState('intro'); // intro, highlight, tracking, selection, feedback
  const [trackingRound, setTrackingRound] = useState(1);
  const [trackingObjects, setTrackingObjects] = useState([]);
  const [targetObjects, setTargetObjects] = useState([]);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [correctSelections, setCorrectSelections] = useState(0);
  
  // 注意力追踪游戏动画参考
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // 模拟从后端获取数据
    setExercises([
      {
        id: 'attention-1',
        name: '找不同',
        description: '在两张相似的图片中找出所有不同之处。训练视觉注意力和细节观察能力。',
        difficulty: 'easy',
        duration: 5,
        type: 'spot-difference'
      },
      {
        id: 'attention-2',
        name: '隐藏物体寻找',
        description: '在复杂场景中找出特定的隐藏物体。训练选择性注意力和视觉搜索能力。',
        difficulty: 'medium',
        duration: 5,
        type: 'hidden-objects'
      },
      {
        id: 'attention-3',
        name: '注意力追踪',
        description: '追踪屏幕上移动的多个目标。训练分散注意力和动态视觉追踪能力。',
        difficulty: 'hard',
        duration: 3,
        type: 'object-tracking'
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

  // 模拟隐藏物体游戏数据
  const mockHiddenObjectsGame = {
    id: 'hidden-objects-1',
    title: '繁忙街道',
    instruction: '在街道场景中找出以下10个物品:',
    imageUrl: '/assets/exercises/busy_street.png',
    timeLimit: 120, // 秒
    objects: [
      { id: 1, name: '红色雨伞', found: false },
      { id: 2, name: '篮球', found: false },
      { id: 3, name: '小狗', found: false },
      { id: 4, name: '冰淇淋', found: false },
      { id: 5, name: '自行车', found: false },
      { id: 6, name: '书籍', found: false },
      { id: 7, name: '钥匙', found: false },
      { id: 8, name: '咖啡杯', found: false },
      { id: 9, name: '手表', found: false },
      { id: 10, name: '帽子', found: false }
    ]
  };

  // 模拟找不同游戏数据
  const mockSpotDifferenceGame = {
    id: 'spot-difference-1',
    title: '公园场景',
    instruction: '找出两张图片之间的5个不同之处',
    imageUrl1: '/assets/exercises/park_scene_1.png',
    imageUrl2: '/assets/exercises/park_scene_2.png',
    timeLimit: 60, // 秒
    differences: [
      { id: 1, coordinates: { x1: 120, y1: 100, x2: 120, y2: 100 }, found: false },
      { id: 2, coordinates: { x1: 250, y1: 150, x2: 250, y2: 150 }, found: false },
      { id: 3, coordinates: { x1: 300, y1: 200, x2: 300, y2: 200 }, found: false },
      { id: 4, coordinates: { x1: 400, y1: 300, x2: 400, y2: 300 }, found: false },
      { id: 5, coordinates: { x1: 150, y1: 250, x2: 150, y2: 250 }, found: false }
    ]
  };

  // 模拟注意力追踪游戏数据
  const mockObjectTrackingGame = {
    id: 'object-tracking-1',
    title: '目标追踪',
    instruction: '记住高亮显示的目标，然后在它们移动后识别这些目标',
    timeLimit: 90, // 秒
    difficultyLevel: 'medium', // easy, medium, hard
    targetCount: 3, // 需要追踪的目标数量
    totalObjects: 8, // 屏幕上的总对象数
    highlightDuration: 3000, // 高亮显示的时间（毫秒）
    movementDuration: 5000, // 移动的时间（毫秒）
    rounds: 5 // 回合数
  };

  // 开始练习
  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setStage('game');
    setScore(0);
    setFound([]);
    
    // 重置注意力追踪游戏状态（如果适用）
    if (exercise.type === 'object-tracking') {
      setTrackingPhase('intro');
      setTrackingRound(1);
      setCorrectSelections(0);
      setSelectedObjects([]);
    }
    
    // 根据练习类型设置游戏数据
    if (exercise.type === 'hidden-objects') {
      setGameData(mockHiddenObjectsGame);
      setTimeLimit(mockHiddenObjectsGame.timeLimit);
    } else if (exercise.type === 'spot-difference') {
      setGameData(mockSpotDifferenceGame);
      setTimeLimit(mockSpotDifferenceGame.timeLimit);
    } else if (exercise.type === 'object-tracking') {
      setGameData(mockObjectTrackingGame);
      setTimeLimit(mockObjectTrackingGame.timeLimit);
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
    
    // 停止任何可能正在运行的动画
    stopTrackingAnimation();
    
    let finalScore = 0;
    
    // 确保selectedExercise和gameData都存在才进行计算
    if (selectedExercise && gameData) {
      if (selectedExercise.type === 'hidden-objects') {
        finalScore = Math.round((found.length / gameData.objects.length) * 100);
      } else if (selectedExercise.type === 'spot-difference') {
        finalScore = Math.round((found.length / gameData.differences.length) * 100);
      } else if (selectedExercise.type === 'object-tracking') {
        // 使用累计的正确选择来计算分数
        finalScore = Math.round((correctSelections / (gameData.rounds * gameData.targetCount)) * 100);
      }
    }
    
    setScore(finalScore);
    setStage('results');
  };
  
  // 处理发现物体
  const handleObjectFound = (objectId) => {
    if (!found.includes(objectId)) {
      const newFound = [...found, objectId];
      setFound(newFound);
      
      // 更新游戏数据中的物体状态
      if (selectedExercise.type === 'hidden-objects') {
        const updatedObjects = gameData.objects.map(obj => 
          obj.id === objectId ? { ...obj, found: true } : obj
        );
        setGameData({ ...gameData, objects: updatedObjects });
      } else if (selectedExercise.type === 'spot-difference') {
        const updatedDifferences = gameData.differences.map(diff => 
          diff.id === objectId ? { ...diff, found: true } : diff
        );
        setGameData({ ...gameData, differences: updatedDifferences });
      } else if (selectedExercise.type === 'object-tracking') {
        const updatedTargets = gameData.targets.map(target => 
          target.id === objectId ? { ...target, found: true } : target
        );
        setGameData({ ...gameData, targets: updatedTargets });
      }
      
      // 检查是否所有物体都已找到
      if (selectedExercise.type === 'hidden-objects' && newFound.length === gameData.objects.length) {
        endGame();
      } else if (selectedExercise.type === 'spot-difference' && newFound.length === gameData.differences.length) {
        endGame();
      } else if (selectedExercise.type === 'object-tracking' && newFound.length === gameData.targetCount) {
        endGame();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 刷新游戏状态
  useEffect(() => {
    try {
      if (selectedExercise?.type === 'object-tracking' && stage === 'game' && gameData) {
        if (trackingPhase === 'intro') {
          // 初始化游戏对象
          initializeTrackingGame();
          
          // 3秒后进入高亮阶段
          const timer = setTimeout(() => {
            setTrackingPhase('highlight');
          }, 3000);
          
          return () => clearTimeout(timer);
        }
        
        if (trackingPhase === 'highlight' && gameData.highlightDuration) {
          // 高亮目标，然后进入追踪阶段
          const timer = setTimeout(() => {
            setTrackingPhase('tracking');
          }, gameData.highlightDuration);
          
          return () => clearTimeout(timer);
        }
        
        if (trackingPhase === 'tracking' && gameData.movementDuration) {
          // 开始动画
          startTrackingAnimation();
          
          // 移动结束后进入选择阶段
          const timer = setTimeout(() => {
            stopTrackingAnimation();
            setTrackingPhase('selection');
          }, gameData.movementDuration);
          
          return () => {
            clearTimeout(timer);
            stopTrackingAnimation();
          };
        }
      }
    } catch (error) {
      console.error("游戏阶段更新错误:", error);
      // 发生错误时停止动画，回到训练列表
      stopTrackingAnimation();
      setStage('list');
    }
  }, [selectedExercise, stage, trackingPhase, gameData]);
  
  // 初始化追踪游戏
  const initializeTrackingGame = () => {
    if (!gameData) return;
    
    const canvasWidth = 600;
    const canvasHeight = 400;
    const objectRadius = 20;
    
    // 生成随机对象位置
    const objects = [];
    const targets = [];
    
    for (let i = 0; i < gameData.totalObjects; i++) {
      const obj = {
        id: i + 1,
        x: Math.random() * (canvasWidth - objectRadius * 2) + objectRadius,
        y: Math.random() * (canvasHeight - objectRadius * 2) + objectRadius,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: objectRadius,
        color: '#8065c9',
        isTarget: i < gameData.targetCount
      };
      
      objects.push(obj);
      
      if (obj.isTarget) {
        targets.push(obj);
      }
    }
    
    setTrackingObjects(objects);
    setTargetObjects(targets);
    setSelectedObjects([]);
    
    // 更新游戏数据，添加对象和目标
    const updatedGameData = {
      ...gameData,
      objects,
      targets: targets.map((target, index) => ({
        id: target.id,
        name: `目标 ${index + 1}`,
        found: false
      }))
    };
    
    setGameData(updatedGameData);
  };
  
  // 重置当前回合的追踪游戏
  const resetTrackingRound = () => {
    setTrackingPhase('intro');
    setSelectedObjects([]);
    // 重新初始化游戏对象
    initializeTrackingGame();
  };
  
  // 开始动画
  const startTrackingAnimation = () => {
    if (!canvasRef.current || !trackingObjects.length) return;
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const animate = () => {
        // 确保canvas和context仍然可用
        if (!canvasRef.current || !ctx) {
          stopTrackingAnimation();
          return;
        }
        
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // 更新和绘制所有对象
        const updatedObjects = trackingObjects.map(obj => {
          // 更新位置（仅在追踪阶段）
          let x = obj.x;
          let y = obj.y;
          
          if (trackingPhase === 'tracking') {
            x = obj.x + obj.vx;
            y = obj.y + obj.vy;
            
            // 边界检测
            if (x < obj.radius || x > canvasWidth - obj.radius) {
              obj.vx *= -1;
              x = x < obj.radius ? obj.radius : canvasWidth - obj.radius;
            }
            
            if (y < obj.radius || y > canvasHeight - obj.radius) {
              obj.vy *= -1;
              y = y < obj.radius ? obj.radius : canvasHeight - obj.radius;
            }
          }
          
          // 确定对象的颜色
          let fillColor = obj.color;
          
          // 在高亮阶段，突出显示目标对象
          if (trackingPhase === 'highlight' && obj.isTarget) {
            fillColor = '#ffb700'; // 高亮颜色
          }
          
          // 在选择阶段，显示选中的对象
          if (trackingPhase === 'selection' && selectedObjects.includes(obj.id)) {
            fillColor = '#5cb85c'; // 选择颜色
          }
          
          // 绘制对象
          ctx.beginPath();
          ctx.arc(x, y, obj.radius, 0, Math.PI * 2);
          ctx.fillStyle = fillColor;
          ctx.fill();
          
          // 添加轮廓
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // 返回更新后的对象
          return {
            ...obj,
            x,
            y
          };
        });
        
        setTrackingObjects(updatedObjects);
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } catch (error) {
      console.error("动画错误:", error);
      stopTrackingAnimation();
    }
  };
  
  // 停止动画
  const stopTrackingAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };
  
  // 处理对象选择
  const handleObjectSelection = (objectId) => {
    if (trackingPhase !== 'selection' || !objectId) return;
    
    // 添加到选中对象列表
    setSelectedObjects(prev => {
      // 如果已经选中，则取消选中
      if (prev.includes(objectId)) {
        return prev.filter(id => id !== objectId);
      }
      
      // 如果已达到最大选择数量，不做任何操作
      if (gameData && prev.length >= gameData.targetCount) {
        return prev;
      }
      
      return [...prev, objectId];
    });
  };
  
  // 提交选择
  const submitSelection = () => {
    if (trackingPhase !== 'selection' || !gameData || !targetObjects.length) return;
    
    // 计算正确选择的数量
    let correct = 0;
    const targetIds = targetObjects.map(obj => obj.id);
    
    selectedObjects.forEach(id => {
      if (targetIds.includes(id)) {
        correct++;
      }
    });
    
    setCorrectSelections(prev => prev + correct);
    
    // 检查是否还有更多回合
    if (trackingRound < gameData.rounds) {
      setTrackingRound(prev => prev + 1);
      resetTrackingRound();
    } else {
      // 游戏结束
      endGame();
    }
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopTrackingAnimation();
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h2>正在加载注意力训练项目...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>注意力训练</h1>
      <p className="lead">
        通过有趣的互动游戏提高您的专注力、注意力持续时间和选择性注意力。
      </p>

      {stage === 'list' && (
        <div className="exercise-list">
          {exercises.map(exercise => (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-image">
                {exercise.type === 'hidden-objects' && (
                  <img
                    src="/assets/exercises/busy_street.png"
                    alt={exercise.name}
                    className="exercise-thumbnail"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/assets/exercises/placeholder.png';
                    }}
                  />
                )}
                {exercise.type === 'spot-difference' && (
                  <img
                    src="/assets/exercises/park_scene_1.png"
                    alt={exercise.name}
                    className="exercise-thumbnail"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/assets/exercises/placeholder.png';
                    }}
                  />
                )}
                {exercise.type === 'object-tracking' && (
                  <img
                    src="/assets/thumbnails/attention_thumbnail.png"
                    alt={exercise.name}
                    className="exercise-thumbnail"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/assets/exercises/placeholder.png';
                    }}
                  />
                )}
              </div>
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
              <div className="score">已找到: {found.length} / {selectedExercise.type === 'hidden-objects' ? gameData.objects.length : selectedExercise.type === 'spot-difference' ? gameData.differences.length : gameData.targetCount}</div>
              <button className="btn btn-outline" onClick={endGame}>结束游戏</button>
            </div>
          </div>
          
          {selectedExercise.type === 'hidden-objects' && (
            <div className="hidden-objects-game">
              <div className="object-list">
                {gameData.objects.map(obj => (
                  <div key={obj.id} className={`object-item ${obj.found ? 'found' : ''}`}>
                    {obj.name}
                  </div>
                ))}
              </div>
              <div className="game-image-container">
                <img 
                  src={gameData.imageUrl} 
                  alt={gameData.title} 
                  className="game-image"
                  style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain' }}
                  onClick={(e) => {
                    // 在实际应用中，这里需要检测点击位置是否匹配物体位置
                    // 这里简化处理，随机找到一个尚未发现的物体
                    const notFoundObjects = gameData.objects.filter(obj => !obj.found);
                    if (notFoundObjects.length > 0) {
                      const randomIndex = Math.floor(Math.random() * notFoundObjects.length);
                      handleObjectFound(notFoundObjects[randomIndex].id);
                    }
                  }}
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = '/assets/exercises/placeholder.png';
                  }}
                />
                {/* SVG placeholder is removed as we're handling errors with onError event */}
                <div className="image-overlay">
                  {/* 在实际应用中，这里会显示物体的热区 */}
                </div>
              </div>
            </div>
          )}
          
          {selectedExercise.type === 'spot-difference' && (
            <div className="spot-difference-game">
              <div className="difference-counter">
                找到的不同: {found.length} / {gameData.differences.length}
              </div>
              <div className="images-container">
                <div className="game-image-container">
                  <img 
                    src={gameData.imageUrl1} 
                    alt="图片1" 
                    className="game-image"
                    style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain' }}
                    onClick={(e) => {
                      // 简化处理，随机找到一个尚未发现的差异
                      const notFoundDifferences = gameData.differences.filter(diff => !diff.found);
                      if (notFoundDifferences.length > 0) {
                        const randomIndex = Math.floor(Math.random() * notFoundDifferences.length);
                        handleObjectFound(notFoundDifferences[randomIndex].id);
                      }
                    }}
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/assets/exercises/placeholder.png';
                    }}
                  />
                  {/* SVG placeholder is only shown if the image truly doesn't exist */}
                  {/* This section is removed as we're handling errors with onError event */}
                </div>
                <div className="game-image-container">
                  <img 
                    src={gameData.imageUrl2} 
                    alt="图片2" 
                    className="game-image"
                    style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain' }}
                    onClick={(e) => {
                      // 同上，简化处理
                      const notFoundDifferences = gameData.differences.filter(diff => !diff.found);
                      if (notFoundDifferences.length > 0) {
                        const randomIndex = Math.floor(Math.random() * notFoundDifferences.length);
                        handleObjectFound(notFoundDifferences[randomIndex].id);
                      }
                    }}
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/assets/exercises/placeholder.png';
                    }}
                  />
                  {/* SVG placeholder is only shown if the image truly doesn't exist */}
                  {/* This section is removed as we're handling errors with onError event */}
                </div>
              </div>
            </div>
          )}
          
          {selectedExercise.type === 'object-tracking' && (
            <div className="object-tracking-game">
              <div className="game-status">
                <div className="round-info">回合: {trackingRound} / {gameData.rounds}</div>
                <div className="phase-info">
                  {trackingPhase === 'intro' && '准备开始'}
                  {trackingPhase === 'highlight' && '记住高亮的目标'}
                  {trackingPhase === 'tracking' && '跟踪移动的目标'}
                  {trackingPhase === 'selection' && '选择目标'}
                </div>
              </div>
              
              <div className="object-tracking-canvas-container">
                <canvas 
                  ref={canvasRef}
                  width="600"
                  height="400"
                  className="tracking-canvas"
                  onClick={(e) => {
                    if (trackingPhase !== 'selection' || !canvasRef.current || !trackingObjects.length) return;
                    
                    try {
                      // 获取点击坐标
                      const rect = canvasRef.current.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      
                      // 检测点击是否命中任何对象
                      for (const obj of trackingObjects) {
                        if (!obj) continue;
                        const dx = x - obj.x;
                        const dy = y - obj.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance <= obj.radius) {
                          handleObjectSelection(obj.id);
                          break;
                        }
                      }
                    } catch (error) {
                      console.error("Canvas点击错误:", error);
                    }
                  }}
                />
              </div>
              
              {trackingPhase === 'intro' && (
                <div className="phase-message">
                  <h3>准备开始</h3>
                  <p>注意力追踪训练将开始，请准备好。</p>
                  <p>您需要记住高亮的目标，然后在它们移动后选择这些目标。</p>
                </div>
              )}
              
              {trackingPhase === 'highlight' && (
                <div className="phase-message">
                  <h3>记住这些目标</h3>
                  <p>请记住高亮显示的 {gameData.targetCount} 个目标。</p>
                  <p>它们将很快开始移动。</p>
                </div>
              )}
              
              {trackingPhase === 'tracking' && (
                <div className="phase-message">
                  <h3>跟踪目标</h3>
                  <p>请跟踪您刚才记住的目标。</p>
                  <p>它们正在移动，请不要丢失它们！</p>
                </div>
              )}
              
              {trackingPhase === 'selection' && (
                <div className="phase-message">
                  <h3>选择目标</h3>
                  <p>请点击您认为是最初高亮显示的 {gameData.targetCount} 个目标。</p>
                  <p>已选择: {selectedObjects.length} / {gameData.targetCount}</p>
                  {selectedObjects.length === gameData.targetCount && (
                    <button className="btn" onClick={submitSelection}>确认</button>
                  )}
                </div>
              )}
              
              <div className="score-info">
                <p>当前得分: {gameData && trackingRound > 0 && gameData.targetCount > 0 ? 
                  Math.round((correctSelections / (trackingRound * gameData.targetCount)) * 100) : 0}%</p>
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
            {selectedExercise && gameData && (
              <div className="result-item">
                <span className="result-label">找到的物体:</span>
                <span className="result-value">{found.length} / {selectedExercise.type === 'hidden-objects' ? gameData.objects.length : selectedExercise.type === 'spot-difference' ? gameData.differences.length : gameData.targetCount}</span>
              </div>
            )}
            
            <div className="training-tips">
              <h3>训练技巧</h3>
              <ul>
                {score < 50 && (
                  <>
                    <li>尝试分区域系统地扫描图像，避免漏掉任何区域。</li>
                    <li>练习保持专注，排除外部干扰。</li>
                    <li>从简单难度开始，逐渐增加挑战。</li>
                  </>
                )}
                {score >= 50 && score < 80 && (
                  <>
                    <li>使用"对比法"，即同时比较两张图片的同一区域。</li>
                    <li>尝试在更短的时间内完成任务，提高注意力效率。</li>
                    <li>定期训练可以提高视觉搜索的速度和准确性。</li>
                  </>
                )}
                {score >= 80 && (
                  <>
                    <li>出色的表现！尝试更复杂的场景或更短的时间限制。</li>
                    <li>挑战自己在日常生活中注意细节的能力。</li>
                    <li>尝试结合其他认知训练，如记忆训练，提高整体认知能力。</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="action-buttons">
              <button className="btn" onClick={() => setStage('list')}>
                返回训练列表
              </button>
              {selectedExercise && (
                <button className="btn" onClick={() => startExercise(selectedExercise)}>
                  再次尝试
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttentionTraining; 