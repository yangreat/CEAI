const express = require('express');
const router = express.Router();

// 记忆训练的类型
const MEMORY_TRAINING_TYPES = {
  PHOTO_RECALL: 'photo_recall',
  WORD_LIST: 'word_list',
  SEQUENCE_MEMORY: 'sequence_memory',
  SPATIAL_MEMORY: 'spatial_memory',
  ASSOCIATION: 'association'
};

// 存储记忆训练内容的模拟数据（实际应用中应存储在数据库）
const memoryTrainingExercises = {
  photo_recall: [
    {
      id: 'pr-1',
      title: '家庭照片回忆',
      description: '查看一系列照片，并记住照片中的人物、关系和事件细节。',
      difficulty: 'medium',
      photos: [
        {
          id: 1,
          imageUrl: '/assets/exercises/family1.jpg',
          description: '家庭公园聚会',
          details: {
            date: '2022年7月15日',
            location: '中央公园',
            people: [
              { name: '李爸爸', relationship: '父亲' },
              { name: '王妈妈', relationship: '母亲' },
              { name: '小丽', relationship: '女儿' },
              { name: '小明', relationship: '儿子' },
              { name: '张奶奶', relationship: '祖母' }
            ],
            event: '家庭年度聚会'
          }
        },
        {
          id: 2,
          imageUrl: '/assets/exercises/family2.jpg',
          description: '圣诞节庆祝',
          details: {
            date: '2022年12月25日',
            location: '家中',
            people: [
              { name: '李爸爸', relationship: '父亲' },
              { name: '王妈妈', relationship: '母亲' },
              { name: '小丽', relationship: '女儿' },
              { name: '小明', relationship: '儿子' },
              { name: '赵叔叔', relationship: '叔叔' },
              { name: '吴阿姨', relationship: '阿姨' }
            ],
            event: '圣诞节庆祝'
          }
        },
        {
          id: 3,
          imageUrl: '/assets/exercises/family3.jpg',
          description: '小丽的毕业典礼',
          details: {
            date: '2023年5月20日',
            location: '城市大学',
            people: [
              { name: '李爸爸', relationship: '父亲' },
              { name: '王妈妈', relationship: '母亲' },
              { name: '小丽', relationship: '女儿' },
              { name: '小明', relationship: '儿子' },
              { name: '刘爷爷', relationship: '祖父' }
            ],
            event: '小丽的毕业典礼'
          }
        }
      ]
    }
  ],
  word_list: [
    {
      id: 'wl-1',
      title: '单词列表记忆',
      description: '记忆一系列单词，然后尝试回忆尽可能多的单词。',
      difficulty: 'easy',
      words: [
        '苹果', '书籍', '电脑', '窗户', '花朵',
        '钢笔', '眼镜', '手表', '椅子', '电话',
        '水杯', '钥匙', '帽子', '鞋子', '背包'
      ],
      memorizeTime: 60, // 60秒记忆时间
      recallTime: 90    // 90秒回忆时间
    },
    {
      id: 'wl-2',
      title: '高级词汇记忆',
      description: '记忆一系列较复杂的词汇，然后尝试回忆它们。',
      difficulty: 'hard',
      words: [
        '海洋学', '哲学家', '生物多样性', '量子力学',
        '认知心理学', '分子结构', '历史演变', '经济学原理',
        '政治制度', '文化遗产', '社会结构', '环境保护'
      ],
      memorizeTime: 90,  // 90秒记忆时间
      recallTime: 120    // 120秒回忆时间
    }
  ],
  sequence_memory: [
    {
      id: 'sm-1',
      title: '数字序列记忆',
      description: '记忆一系列数字序列，然后按正确顺序重复它们。',
      difficulty: 'medium',
      sequences: [
        '4-7-1-9',
        '3-8-2-6-1',
        '5-9-2-7-4-8',
        '1-6-3-9-2-7-5',
        '8-2-5-1-6-4-9-3'
      ],
      displayTime: 3000  // 每个序列显示3000毫秒
    }
  ],
  spatial_memory: [
    {
      id: 'spm-1',
      title: '位置记忆',
      description: '记住物品在网格中的位置，然后回忆它们。',
      difficulty: 'medium',
      gridSize: 4, // 4x4网格
      itemCount: 8, // 8个物品
      memorizeTime: 30, // 30秒记忆时间
      items: ['花朵', '书本', '钥匙', '手表', '眼镜', '杯子', '电话', '笔']
    }
  ],
  association: [
    {
      id: 'as-1',
      title: '人名与面孔配对',
      description: '将人名与面孔关联起来，然后测试记忆。',
      difficulty: 'medium',
      pairs: [
        { face: '/assets/faces/face1.jpg', name: '张明' },
        { face: '/assets/faces/face2.jpg', name: '李华' },
        { face: '/assets/faces/face3.jpg', name: '王芳' },
        { face: '/assets/faces/face4.jpg', name: '刘洋' },
        { face: '/assets/faces/face5.jpg', name: '陈静' },
        { face: '/assets/faces/face6.jpg', name: '赵伟' },
        { face: '/assets/faces/face7.jpg', name: '吴婷' },
        { face: '/assets/faces/face8.jpg', name: '孙强' }
      ],
      memorizeTime: 60 // 60秒记忆时间
    }
  ]
};

/**
 * @route   GET api/memory/exercises
 * @desc    获取所有记忆训练练习
 * @access  Public
 */
router.get('/exercises', (req, res) => {
  try {
    const allExercises = {};
    
    Object.keys(memoryTrainingExercises).forEach(type => {
      allExercises[type] = memoryTrainingExercises[type].map(exercise => ({
        id: exercise.id,
        title: exercise.title,
        description: exercise.description,
        difficulty: exercise.difficulty,
        type: type
      }));
    });
    
    res.json(allExercises);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

/**
 * @route   GET api/memory/exercises/:type
 * @desc    获取特定类型的记忆训练练习
 * @access  Public
 */
router.get('/exercises/:type', (req, res) => {
  try {
    const { type } = req.params;
    
    if (!memoryTrainingExercises[type]) {
      return res.status(404).json({ msg: '未找到该类型的训练' });
    }
    
    const exercisesOfType = memoryTrainingExercises[type].map(exercise => ({
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      difficulty: exercise.difficulty,
      type: type
    }));
    
    res.json(exercisesOfType);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

/**
 * @route   GET api/memory/exercise/:id
 * @desc    获取特定ID的记忆训练练习详情
 * @access  Public
 */
router.get('/exercise/:id', (req, res) => {
  try {
    const { id } = req.params;
    let exercise = null;
    
    // 查找练习
    for (const type in memoryTrainingExercises) {
      const found = memoryTrainingExercises[type].find(ex => ex.id === id);
      if (found) {
        exercise = {...found, type};
        break;
      }
    }
    
    if (!exercise) {
      return res.status(404).json({ msg: '未找到该训练' });
    }
    
    res.json(exercise);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

/**
 * @route   POST api/memory/generate-questions/:id
 * @desc    为特定训练生成问题
 * @access  Private
 */
router.post('/generate-questions/:id', (req, res) => {
  try {
    const { id } = req.params;
    let exercise = null;
    let exerciseType = '';
    
    // 查找练习
    for (const type in memoryTrainingExercises) {
      const found = memoryTrainingExercises[type].find(ex => ex.id === id);
      if (found) {
        exercise = found;
        exerciseType = type;
        break;
      }
    }
    
    if (!exercise) {
      return res.status(404).json({ msg: '未找到该训练' });
    }
    
    // 根据训练类型生成问题
    let questions = [];
    
    switch (exerciseType) {
      case MEMORY_TRAINING_TYPES.PHOTO_RECALL:
        questions = generatePhotoRecallQuestions(exercise);
        break;
      case MEMORY_TRAINING_TYPES.WORD_LIST:
        questions = generateWordListQuestions(exercise);
        break;
      case MEMORY_TRAINING_TYPES.SEQUENCE_MEMORY:
        questions = generateSequenceMemoryQuestions(exercise);
        break;
      case MEMORY_TRAINING_TYPES.SPATIAL_MEMORY:
        questions = generateSpatialMemoryQuestions(exercise);
        break;
      case MEMORY_TRAINING_TYPES.ASSOCIATION:
        questions = generateAssociationQuestions(exercise);
        break;
      default:
        return res.status(400).json({ msg: '不支持的训练类型' });
    }
    
    res.json({ questions });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

/**
 * @route   POST api/memory/evaluate
 * @desc    评估训练结果
 * @access  Private
 */
router.post('/evaluate', (req, res) => {
  try {
    const { exerciseId, answers, difficulty } = req.body;
    
    // 查找练习
    let exercise = null;
    let exerciseType = '';
    
    for (const type in memoryTrainingExercises) {
      const found = memoryTrainingExercises[type].find(ex => ex.id === exerciseId);
      if (found) {
        exercise = found;
        exerciseType = type;
        break;
      }
    }
    
    if (!exercise) {
      return res.status(404).json({ msg: '未找到该训练' });
    }
    
    // 计算结果
    let correctCount = 0;
    const totalQuestions = answers.length;
    
    // 为简化示例，这里只是模拟评分计算
    // 在实际应用中，应根据exerciseType和具体答案进行精确评分
    correctCount = Math.floor(Math.random() * (totalQuestions + 1));
    
    const score = Math.round((correctCount / totalQuestions) * 100);
    
    // 生成反馈
    const feedback = generateFeedback(score, exerciseType, difficulty);
    
    // 建议的下一次训练难度
    let nextDifficulty = difficulty;
    if (score >= 80 && difficulty !== 'hard') {
      nextDifficulty = difficulty === 'easy' ? 'medium' : 'hard';
    } else if (score <= 40 && difficulty !== 'easy') {
      nextDifficulty = difficulty === 'hard' ? 'medium' : 'easy';
    }
    
    // 建议的下一次训练间隔（天）
    const nextTrainingInterval = score >= 80 ? 3 : (score >= 60 ? 2 : 1);
    
    // 计算记忆强度提升（模拟值）
    const memoryStrengthIncrease = Math.round(score / 10);
    
    res.json({
      score,
      correctCount,
      totalQuestions,
      feedback,
      nextDifficulty,
      nextTrainingInterval,
      memoryStrengthIncrease
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// ====== 辅助函数 ======

// 为照片回忆训练生成问题
function generatePhotoRecallQuestions(exercise) {
  const questions = [];
  
  exercise.photos.forEach(photo => {
    // 关于日期的问题
    questions.push({
      photoId: photo.id,
      question: `这张照片是什么时候拍摄的？`,
      correctAnswer: photo.details.date,
      options: [
        photo.details.date,
        '2023年1月10日',
        '2022年10月5日',
        '2023年3月15日'
      ].sort(() => Math.random() - 0.5)
    });
    
    // 关于地点的问题
    questions.push({
      photoId: photo.id,
      question: `这张照片在哪里拍摄的？`,
      correctAnswer: photo.details.location,
      options: [
        photo.details.location,
        '海滨度假村',
        '山区木屋',
        '市中心餐厅'
      ].sort(() => Math.random() - 0.5)
    });
    
    // 关于人物的问题
    const randomPerson = photo.details.people[Math.floor(Math.random() * photo.details.people.length)];
    questions.push({
      photoId: photo.id,
      question: `${randomPerson.name}是什么关系？`,
      correctAnswer: randomPerson.relationship,
      options: [
        randomPerson.relationship,
        '表亲',
        '朋友',
        '邻居'
      ].sort(() => Math.random() - 0.5)
    });
    
    // 关于事件的问题
    questions.push({
      photoId: photo.id,
      question: `这张照片拍摄于什么场合？`,
      correctAnswer: photo.details.event,
      options: [
        photo.details.event,
        '生日派对',
        '结婚周年纪念',
        '感恩节晚餐'
      ].sort(() => Math.random() - 0.5)
    });
  });
  
  // 随机打乱问题并选取前8个
  return questions.sort(() => Math.random() - 0.5).slice(0, 8);
}

// 为单词列表训练生成问题
function generateWordListQuestions(exercise) {
  // 在这种类型的训练中，问题是让用户回忆所有单词
  // 所以我们返回原始单词列表，UI将处理实际测试
  return exercise.words.map(word => ({
    word: word,
    isRecalled: false
  }));
}

// 为序列记忆训练生成问题
function generateSequenceMemoryQuestions(exercise) {
  return exercise.sequences.map(sequence => ({
    sequence: sequence,
    question: '请按正确顺序输入您记住的数字：',
    correctAnswer: sequence
  }));
}

// 为空间记忆训练生成问题
function generateSpatialMemoryQuestions(exercise) {
  // 创建具有随机位置的物品
  const gridPositions = [];
  for (let i = 0; i < exercise.gridSize; i++) {
    for (let j = 0; j < exercise.gridSize; j++) {
      gridPositions.push({ row: i, col: j });
    }
  }
  
  // 随机选择位置
  const selectedPositions = [];
  while (selectedPositions.length < exercise.itemCount) {
    const randomIndex = Math.floor(Math.random() * gridPositions.length);
    selectedPositions.push(gridPositions.splice(randomIndex, 1)[0]);
  }
  
  // 将物品分配到位置
  const itemPositions = [];
  for (let i = 0; i < exercise.itemCount; i++) {
    itemPositions.push({
      item: exercise.items[i],
      position: selectedPositions[i]
    });
  }
  
  return itemPositions;
}

// 为关联记忆训练生成问题
function generateAssociationQuestions(exercise) {
  return exercise.pairs.map(pair => ({
    face: pair.face,
    options: shuffleArray([
      pair.name,
      ...getRandomNames(exercise.pairs, pair.name, 3)
    ]),
    correctAnswer: pair.name
  }));
}

// 获取随机名字（排除正确答案）
function getRandomNames(pairs, correctName, count) {
  const allNames = pairs.map(p => p.name).filter(name => name !== correctName);
  const result = [];
  
  while (result.length < count && allNames.length > 0) {
    const randomIndex = Math.floor(Math.random() * allNames.length);
    result.push(allNames.splice(randomIndex, 1)[0]);
  }
  
  return result;
}

// 根据分数生成反馈
function generateFeedback(score, exerciseType, difficulty) {
  let generalFeedback = '';
  
  if (score >= 80) {
    generalFeedback = '太棒了！您的记忆力表现出色。';
  } else if (score >= 60) {
    generalFeedback = '做得不错！您的记忆力表现良好，还有提升空间。';
  } else if (score >= 40) {
    generalFeedback = '继续努力！通过定期训练，您的记忆力会逐步提高。';
  } else {
    generalFeedback = '记忆力训练需要时间和耐心。不要气馁，持续练习会带来进步。';
  }
  
  let specificFeedback = '';
  
  switch (exerciseType) {
    case MEMORY_TRAINING_TYPES.PHOTO_RECALL:
      specificFeedback = '尝试使用关联法，将照片中的内容与您熟悉的事物建立联系。';
      break;
    case MEMORY_TRAINING_TYPES.WORD_LIST:
      specificFeedback = '尝试将单词分组或创建故事，这样可以更容易记住它们。';
      break;
    case MEMORY_TRAINING_TYPES.SEQUENCE_MEMORY:
      specificFeedback = '尝试将数字分成小组，或者找出数字间的模式。';
      break;
    case MEMORY_TRAINING_TYPES.SPATIAL_MEMORY:
      specificFeedback = '尝试创建心理地图，或将物品位置与熟悉的空间联系起来。';
      break;
    case MEMORY_TRAINING_TYPES.ASSOCIATION:
      specificFeedback = '尝试找出面孔的独特特征，并将其与名字创造性地联系起来。';
      break;
  }
  
  return `${generalFeedback} ${specificFeedback}`;
}

// 数组随机排序
function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

module.exports = router; 