import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LogicTraining = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState('list'); // list, game, results
  const [gameData, setGameData] = useState(null);
  const [timer, setTimer] = useState(0);
  const [timeLimit, setTimeLimit] = useState(300);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timerInterval, setTimerInterval] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // 数独游戏相关状态
  const [sudokuBoard, setSudokuBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    // 模拟从后端获取数据
    setExercises([
      {
        id: 'logic-1',
        name: '数独挑战',
        description: '填写9×9网格，使每行、每列和每个3×3子网格包含1-9的数字且不重复。培养模式识别和逻辑推理能力。',
        difficulty: 'medium',
        duration: 15,
        type: 'sudoku'
      },
      {
        id: 'logic-2',
        name: '逻辑谜题',
        description: '解决各种逻辑谜题，包括推理问题、序列完成和类比问题。提高推理和解决问题的能力。',
        difficulty: 'hard',
        duration: 10,
        type: 'logical-puzzles'
      },
      {
        id: 'logic-3',
        name: '数列推理',
        description: '分析数字序列并找出规律，预测下一个数字。加强模式识别和数学逻辑思维。',
        difficulty: 'easy',
        duration: 5,
        type: 'sequence'
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

  // 模拟逻辑谜题游戏数据
  const mockLogicalPuzzles = {
    id: 'logical-puzzles-1',
    title: '逻辑谜题挑战',
    instruction: '解决以下逻辑推理问题，选择正确答案',
    timeLimit: 300, // 秒
    questions: [
      {
        id: 1,
        question: '小明比小红年龄大。小红比小蓝年龄大。从这些信息中，我们可以确定：',
        options: [
          '小明比小蓝年龄大',
          '小蓝比小明年龄大',
          '小红和小蓝年龄相同',
          '没有足够信息确定小明和小蓝的年龄关系'
        ],
        correctAnswer: 0
      },
      {
        id: 2,
        question: '如果所有的猫都有尾巴，而咪咪是一只猫，那么：',
        options: [
          '咪咪可能没有尾巴',
          '咪咪一定有尾巴',
          '有些有尾巴的动物是猫',
          '所有有尾巴的动物都是猫'
        ],
        correctAnswer: 1
      },
      {
        id: 3,
        question: '在一个村庄里，理发师声称他只给不自己理发的村民理发。那么，理发师自己：',
        options: [
          '必须自己理发',
          '必须不自己理发',
          '可能自己理发，也可能不自己理发',
          '这个情况下存在逻辑矛盾'
        ],
        correctAnswer: 3
      },
      {
        id: 4,
        question: '如果今天不是星期五，那么明天是星期六。今天不是星期四。因此：',
        options: [
          '今天是星期五',
          '明天是星期六',
          '今天是星期三',
          '以上都不正确'
        ],
        correctAnswer: 1
      },
      {
        id: 5,
        question: '有5个人参加跑步比赛。李明跑得比王强快，但比张伟慢。陈刚比赵远快，但比李明慢。谁跑得最快？',
        options: [
          '李明',
          '王强',
          '张伟',
          '陈刚',
          '赵远'
        ],
        correctAnswer: 2
      }
    ]
  };

  // 模拟数列推理游戏数据
  const mockSequenceGame = {
    id: 'sequence-1',
    title: '数列推理训练',
    instruction: '分析每个数列，找出规律并选择正确的下一个数字',
    timeLimit: 180, // 秒
    questions: [
      {
        id: 1,
        sequence: [2, 4, 6, 8, 10],
        question: '这个数列的下一个数字是什么？',
        options: ['11', '12', '14', '16'],
        correctAnswer: 1
      },
      {
        id: 2,
        sequence: [1, 3, 6, 10, 15],
        question: '这个数列的下一个数字是什么？',
        options: ['18', '20', '21', '25'],
        correctAnswer: 2
      },
      {
        id: 3,
        sequence: [3, 6, 12, 24, 48],
        question: '这个数列的下一个数字是什么？',
        options: ['72', '96', '60', '84'],
        correctAnswer: 0
      },
      {
        id: 4,
        sequence: [1, 4, 9, 16, 25],
        question: '这个数列的下一个数字是什么？',
        options: ['30', '36', '49', '64'],
        correctAnswer: 1
      },
      {
        id: 5,
        sequence: [1, 1, 2, 3, 5, 8],
        question: '这个数列的下一个数字是什么？',
        options: ['12', '13', '15', '21'],
        correctAnswer: 1
      }
    ]
  };

  // 模拟数独游戏数据（简化版）
  const mockSudokuGame = {
    id: 'sudoku-1',
    title: '数独挑战',
    instruction: '填写空格，使每行、每列和每个3×3方块包含数字1-9且不重复',
    timeLimit: 600, // 秒
    board: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ]
  };

  // 开始练习
  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setStage('game');
    setScore(0);
    setAnswers({});
    setCurrentQuestion(0);
    setSelectedCell(null);
    setShowErrors(false);
    
    // 根据练习类型设置游戏数据
    if (exercise.type === 'logical-puzzles') {
      setGameData(mockLogicalPuzzles);
      setTimeLimit(mockLogicalPuzzles.timeLimit);
    } else if (exercise.type === 'sequence') {
      setGameData(mockSequenceGame);
      setTimeLimit(mockSequenceGame.timeLimit);
    } else if (exercise.type === 'sudoku') {
      setGameData(mockSudokuGame);
      setTimeLimit(mockSudokuGame.timeLimit);
      // 深拷贝数独棋盘以避免直接修改原始数据
      setSudokuBoard(JSON.parse(JSON.stringify(mockSudokuGame.board)));
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
    
    if (selectedExercise.type === 'logical-puzzles' || selectedExercise.type === 'sequence') {
      const questions = gameData.questions;
      let correctCount = 0;
      
      questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctCount++;
        }
      });
      
      finalScore = Math.round((correctCount / questions.length) * 100);
    } else if (selectedExercise.type === 'sudoku') {
      // 简化的数独评分 - 实际情况会更复杂
      finalScore = 50; // 默认给50分，这里需要根据实际填写的数独盘面来计算
    }
    
    setScore(finalScore);
    setStage('results');
  };
  
  // 处理问题答案选择
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerIndex
    });
  };

  // 处理下一题
  const handleNextQuestion = () => {
    if (currentQuestion < gameData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      endGame();
    }
  };

  // 处理上一题
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 处理数独单元格点击
  const handleCellClick = (rowIndex, colIndex) => {
    // 只能选择可编辑的单元格
    if (sudokuBoard[rowIndex][colIndex] === 0 || sudokuBoard[rowIndex][colIndex] > 0 && typeof sudokuBoard[rowIndex][colIndex] === 'number' && !isOriginalCell(rowIndex, colIndex)) {
      setSelectedCell({ row: rowIndex, col: colIndex });
    }
  };

  // 检查是否是原始棋盘上的数字
  const isOriginalCell = (rowIndex, colIndex) => {
    return gameData.board[rowIndex][colIndex] !== 0;
  };

  // 处理数字按钮点击
  const handleNumberClick = (num) => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      
      // 检查是否为原始棋盘上的数字
      if (!isOriginalCell(row, col)) {
        const newBoard = [...sudokuBoard];
        newBoard[row][col] = num;
        setSudokuBoard(newBoard);
      }
    }
  };

  // 检查数独是否有错误
  const checkSudoku = () => {
    setShowErrors(true);
    
    // 计算填写完成度
    let filledCells = 0;
    let totalEmptyCells = 0;
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (gameData.board[i][j] === 0) {
          totalEmptyCells++;
          if (sudokuBoard[i][j] !== 0) {
            filledCells++;
          }
        }
      }
    }
    
    const completionPercentage = totalEmptyCells > 0 ? (filledCells / totalEmptyCells) * 100 : 0;
    return completionPercentage;
  };

  // 检查单元格是否有错误
  const hasError = (rowIndex, colIndex) => {
    if (!showErrors || sudokuBoard[rowIndex][colIndex] === 0) return false;
    
    return sudokuBoard[rowIndex][colIndex] !== gameData.solution[rowIndex][colIndex];
  };

  // 获取提示
  const getHint = () => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      
      // 检查是否为原始棋盘上的数字
      if (!isOriginalCell(row, col)) {
        const newBoard = [...sudokuBoard];
        newBoard[row][col] = gameData.solution[row][col];
        setSudokuBoard(newBoard);
      }
    } else {
      // 如果没有选中单元格，随机找一个空白单元格提供提示
      const emptyCells = [];
      
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (sudokuBoard[i][j] === 0) {
            emptyCells.push({ row: i, col: j });
          }
        }
      }
      
      if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const { row, col } = randomCell;
        
        const newBoard = [...sudokuBoard];
        newBoard[row][col] = gameData.solution[row][col];
        setSudokuBoard(newBoard);
      }
    }
  };

  // 提交数独答案
  const submitSudoku = () => {
    const completionRate = checkSudoku();
    
    // 计算正确率
    let correctCells = 0;
    let totalFilledCells = 0;
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (gameData.board[i][j] === 0 && sudokuBoard[i][j] !== 0) {
          totalFilledCells++;
          if (sudokuBoard[i][j] === gameData.solution[i][j]) {
            correctCells++;
          }
        }
      }
    }
    
    const accuracyRate = totalFilledCells > 0 ? (correctCells / totalFilledCells) * 100 : 0;
    
    // 综合得分：完成度 * 0.6 + 正确率 * 0.4
    const finalScore = Math.round(completionRate * 0.6 + accuracyRate * 0.4);
    setScore(finalScore);
    
    endGame();
  };

  if (loading) {
    return (
      <div className="container">
        <h2>正在加载逻辑训练项目...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>逻辑与推理训练</h1>
      <p className="lead">
        通过解决各种逻辑谜题、数列和模式识别问题来增强您的逻辑推理能力。
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
              {(selectedExercise.type === 'logical-puzzles' || selectedExercise.type === 'sequence') && (
                <div className="progress">问题 {currentQuestion + 1} / {gameData.questions.length}</div>
              )}
              <button className="btn btn-outline" onClick={endGame}>结束游戏</button>
            </div>
          </div>
          
          {/* 逻辑谜题游戏 */}
          {selectedExercise.type === 'logical-puzzles' && (
            <div className="logical-puzzles-game">
              <div className="puzzle-question">
                <h3>问题 {currentQuestion + 1}:</h3>
                <p>{gameData.questions[currentQuestion].question}</p>
              </div>
              
              <div className="options-list">
                {gameData.questions[currentQuestion].options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`option ${answers[currentQuestion] === index ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(currentQuestion, index)}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                  </div>
                ))}
              </div>
              
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
          
          {/* 数列推理游戏 */}
          {selectedExercise.type === 'sequence' && (
            <div className="sequence-game">
              <div className="sequence-display">
                {gameData.questions[currentQuestion].sequence.map((num, index) => (
                  <span key={index} className="sequence-number">{num}</span>
                ))}
                <span className="sequence-number question-mark">?</span>
              </div>
              
              <div className="puzzle-question">
                <p>{gameData.questions[currentQuestion].question}</p>
              </div>
              
              <div className="options-list">
                {gameData.questions[currentQuestion].options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`option ${answers[currentQuestion] === index ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(currentQuestion, index)}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                  </div>
                ))}
              </div>
              
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
          
          {/* 数独游戏 (改进版) */}
          {selectedExercise.type === 'sudoku' && (
            <div className="sudoku-game">
              <div className="sudoku-board">
                {sudokuBoard.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="sudoku-row">
                    {row.map((cell, colIndex) => (
                      <div 
                        key={`cell-${rowIndex}-${colIndex}`} 
                        className={`sudoku-cell 
                          ${gameData.board[rowIndex][colIndex] === 0 ? 'editable' : 'fixed'} 
                          ${selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'selected' : ''}
                          ${hasError(rowIndex, colIndex) ? 'error' : ''}
                        `}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {cell !== 0 ? cell : ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              
              <div className="sudoku-controls">
                <div className="number-controls">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button 
                      key={num} 
                      className="number-btn"
                      onClick={() => handleNumberClick(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                
                <div className="game-buttons">
                  <button className="btn" onClick={checkSudoku}>检查</button>
                  <button className="btn" onClick={getHint}>提示</button>
                  <button className="btn" onClick={submitSudoku}>提交</button>
                </div>
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
            
            {(selectedExercise.type === 'logical-puzzles' || selectedExercise.type === 'sequence') && (
              <div className="result-item">
                <span className="result-label">正确问题:</span>
                <span className="result-value">
                  {Object.entries(answers).filter(([questionIndex, answerIndex]) => 
                    answerIndex === gameData.questions[parseInt(questionIndex)].correctAnswer
                  ).length} / {gameData.questions.length}
                </span>
              </div>
            )}
            
            <div className="training-tips">
              <h3>训练技巧</h3>
              <ul>
                {score < 50 && (
                  <>
                    <li>逻辑题目需要逐步分析，尝试用草稿纸记录推理过程。</li>
                    <li>对于数列问题，寻找简单规律，如加减、乘除、平方等。</li>
                    <li>练习分解复杂问题为更小、更容易处理的部分。</li>
                  </>
                )}
                {score >= 50 && score < 80 && (
                  <>
                    <li>尝试在解题前先考虑所有可能的情况，然后逐一排除。</li>
                    <li>对于数列，先观察相邻数字之间的关系，再考虑整体模式。</li>
                    <li>多练习不同类型的逻辑问题，拓展思维方式。</li>
                  </>
                )}
                {score >= 80 && (
                  <>
                    <li>出色的表现！尝试更复杂的逻辑谜题和数学推理问题。</li>
                    <li>尝试在更短的时间内解决问题，提高思考效率。</li>
                    <li>考虑自己创造逻辑问题，这有助于深入理解逻辑思维过程。</li>
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

export default LogicTraining; 