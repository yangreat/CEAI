// 通义万相文生图 API 图片生成脚本
// 该脚本使用通义万相文生图API生成认知训练应用所需的图片
const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const mkdirp = require('mkdirp');
const axios = require('axios');

// API配置
const apiKey = "sk-dc4c46fb88d44ff69071d14c0df52d7b";
const model = "wanx2.1-t2i-turbo";
const baseUrl = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis";

// 检查并创建保存目录
const thumbnailsDir = path.join("client", "web", "public", "assets", "thumbnails");
const exercisesDir = path.join("client", "web", "public", "assets", "exercises");

// 创建目录函数
async function createDirectories() {
  try {
    await mkdirp(thumbnailsDir);
    console.log(`创建目录: ${thumbnailsDir}`);
    
    await mkdirp(exercisesDir);
    console.log(`创建目录: ${exercisesDir}`);
  } catch (error) {
    console.error('创建目录时出错:', error);
  }
}

// 图片生成函数
async function generateImage(prompt, outputPath, size = "1024*1024", n = 1) {
  console.log(`正在生成图片: ${prompt}`);
  
  try {
    // 创建API请求正文
    const body = {
      model: model,
      input: {
        prompt: prompt
      },
      parameters: {
        size: size,
        n: n
      }
    };
    
    // 发送API请求创建任务
    const createResponse = await axios.post(baseUrl, body, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable"
      }
    });
    
    const taskId = createResponse.data.output.task_id;
    console.log(`任务ID: ${taskId}`);
    
    // 检查任务状态
    const statusUrl = `${baseUrl}/tasks/${taskId}`;
    let status = "PENDING";
    
    while (status === "PENDING" || status === "RUNNING") {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 等待3秒
      
      const statusResponse = await axios.get(statusUrl, {
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      });
      
      status = statusResponse.data.output.task_status;
      console.log(`任务状态: ${status}`);
      
      if (status === "SUCCEEDED") {
        // 下载生成的图片
        for (let i = 0; i < statusResponse.data.output.results.length; i++) {
          const imageUrl = statusResponse.data.output.results[i].url;
          let fileName = outputPath;
          
          if (n > 1) {
            const ext = path.extname(outputPath);
            const baseName = path.basename(outputPath, ext);
            const dir = path.dirname(outputPath);
            fileName = path.join(dir, `${baseName}_${i}${ext}`);
          }
          
          // 创建目录
          await mkdirp(path.dirname(fileName));
          
          // 下载图片
          const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          fs.writeFileSync(fileName, imageResponse.data);
          console.log(`图片已保存: ${fileName}`);
        }
      } else if (status !== "PENDING" && status !== "RUNNING") {
        console.log(`任务失败: ${statusResponse.data.output.task_status_message}`);
        break;
      }
    }
  } catch (error) {
    console.error('生成图片时出错:', error.message);
  }
}

// 缩略图生成提示词
const thumbnails = {
  "memory": {
    prompt: "一个人物正在记忆数字和图形的抽象概念图，使用蓝色渐变色调，现代简约风格，干净清晰的线条，无文字",
    output: path.join(thumbnailsDir, "memory_thumbnail.png")
  },
  "attention": {
    prompt: "一个人在聚精会神专注于任务的抽象概念图，使用绿色渐变色调，现代简约风格，干净清晰的线条，无文字",
    output: path.join(thumbnailsDir, "attention_thumbnail.png")
  },
  "executive": {
    prompt: "表示计划、组织和执行任务的抽象概念图，使用紫色渐变色调，现代简约风格，干净清晰的线条，无文字",
    output: path.join(thumbnailsDir, "executive_thumbnail.png")
  },
  "language": {
    prompt: "表示语言理解和交流的抽象概念图，使用黄色渐变色调，现代简约风格，干净清晰的线条，无文字",
    output: path.join(thumbnailsDir, "language_thumbnail.png")
  },
  "logic": {
    prompt: "表示逻辑思维和解决问题的抽象概念图，使用橙色渐变色调，现代简约风格，干净清晰的线条，无文字",
    output: path.join(thumbnailsDir, "logic_thumbnail.png")
  },
  "emotion": {
    prompt: "表示情绪识别和管理的抽象概念图，使用红色渐变色调，现代简约风格，干净清晰的线条，无文字",
    output: path.join(thumbnailsDir, "emotion_thumbnail.png")
  }
};

// 练习图片生成提示词
const exercises = {
  "family_scene": {
    prompt: "一个温馨的家庭场景，有老人、年轻夫妇和孩子们在客厅互动，细节丰富，高清逼真风格",
    output: path.join(exercisesDir, "family_scene.png")
  },
  "busy_street": {
    prompt: "一个繁忙的城市街道场景，有各种行人、车辆和店铺，细节丰富，高清逼真风格",
    output: path.join(exercisesDir, "busy_street.png")
  },
  "park_scene_1": {
    prompt: "公园场景A：一个美丽的公园，有湖泊、树木、长椅和几个散步的人，细节丰富，高清逼真风格",
    output: path.join(exercisesDir, "park_scene_1.png")
  },
  "park_scene_2": {
    prompt: "公园场景B：与场景A相同的公园，但有5-7处细微的差异，如少了一个长椅，多了一个人，或某处颜色变化等，细节丰富，高清逼真风格",
    output: path.join(exercisesDir, "park_scene_2.png")
  },
  "happy_face": {
    prompt: "一个明显表现出快乐情绪的人脸，微笑，眼睛明亮，高清逼真风格",
    output: path.join(exercisesDir, "happy_face.png")
  },
  "sad_face": {
    prompt: "一个明显表现出悲伤情绪的人脸，眉头紧锁，嘴角下垂，高清逼真风格",
    output: path.join(exercisesDir, "sad_face.png")
  },
  "angry_face": {
    prompt: "一个明显表现出愤怒情绪的人脸，眉毛紧皱，嘴唇紧闭，高清逼真风格",
    output: path.join(exercisesDir, "angry_face.png")
  },
  "surprised_face": {
    prompt: "一个明显表现出惊讶情绪的人脸，眼睛睁大，嘴巴张开，高清逼真风格",
    output: path.join(exercisesDir, "surprised_face.png")
  },
  "placeholder": {
    prompt: "一个简单的占位图片，中央有一个问号图标，简约设计，浅灰色背景",
    output: path.join(exercisesDir, "placeholder.png")
  }
};

// 主函数
async function main() {
  // 创建保存目录
  await createDirectories();
  
  // 生成缩略图
  console.log("开始生成缩略图...");
  for (const [key, thumbnail] of Object.entries(thumbnails)) {
    await generateImage(thumbnail.prompt, thumbnail.output);
  }
  
  // 生成练习图片
  console.log("开始生成练习图片...");
  for (const [key, exercise] of Object.entries(exercises)) {
    await generateImage(exercise.prompt, exercise.output);
  }
  
  console.log("所有图片生成完成！");
}

// 运行主函数
main().catch(error => {
  console.error('程序执行出错:', error);
}); 