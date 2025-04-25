#!/usr/bin/env python3
# 通义万相文生图 API 图片生成脚本 (使用DashScope SDK)
# 该脚本使用通义万相文生图API生成认知训练应用所需的图片

import os
import time
from http import HTTPStatus
from urllib.parse import urlparse, unquote
from pathlib import Path, PurePosixPath
import requests

# 导入DashScope SDK
try:
    from dashscope import ImageSynthesis
except ImportError:
    print("Error: DashScope SDK 未安装")
    print("请使用以下命令安装: pip install dashscope")
    exit(1)

# API配置
API_KEY = "sk-dc4c46fb88d44ff69071d14c0df52d7b"
os.environ["DASHSCOPE_API_KEY"] = API_KEY
MODEL = "wanx2.1-t2i-turbo"

# 检查并创建保存目录
THUMBNAILS_DIR = Path("client/web/public/assets/thumbnails")
EXERCISES_DIR = Path("client/web/public/assets/exercises")

def create_directories():
    """创建保存图片的目录"""
    print("创建必要的目录...")
    
    THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"创建目录: {THUMBNAILS_DIR}")
    
    EXERCISES_DIR.mkdir(parents=True, exist_ok=True)
    print(f"创建目录: {EXERCISES_DIR}")

def generate_image(prompt, output_path, size="1024*1024", n=1):
    """使用DashScope SDK生成图片并保存到指定路径"""
    print(f"正在生成图片: {prompt}")
    
    try:
        # 创建异步任务
        response = ImageSynthesis.async_call(
            api_key=API_KEY,
            model=MODEL,
            prompt=prompt,
            n=n,
            size=size
        )
        
        if response.status_code == HTTPStatus.OK:
            print(f"任务创建成功: {response.output}")
            
            # 等待任务完成
            print("等待任务完成...")
            result = ImageSynthesis.wait(response)
            
            if result.status_code == HTTPStatus.OK:
                print("任务完成，开始下载图片...")
                
                # 创建输出目录
                output_file = Path(output_path)
                output_file.parent.mkdir(parents=True, exist_ok=True)
                
                # 下载和保存图片
                for i, image_result in enumerate(result.output.results):
                    # 获取图片URL
                    image_url = image_result.url
                    
                    # 确定保存路径
                    if n > 1:
                        file_path = output_file.parent / f"{output_file.stem}_{i}{output_file.suffix}"
                    else:
                        file_path = output_file
                    
                    # 下载图片
                    with open(file_path, 'wb') as f:
                        f.write(requests.get(image_url).content)
                    
                    print(f"图片已保存: {file_path}")
            else:
                print(f"任务执行失败: {result.status_code} {result.code} {result.message}")
        else:
            print(f"任务创建失败: {response.status_code} {response.code} {response.message}")
            
    except Exception as e:
        print(f"生成图片时出错: {str(e)}")

# 缩略图生成提示词
thumbnails = {
    "memory": {
        "prompt": "一个人物正在记忆数字和图形的抽象概念图，使用蓝色渐变色调，现代简约风格，干净清晰的线条，无文字",
        "output": str(THUMBNAILS_DIR / "memory_thumbnail.png")
    },
    "attention": {
        "prompt": "一个人在聚精会神专注于任务的抽象概念图，使用绿色渐变色调，现代简约风格，干净清晰的线条，无文字",
        "output": str(THUMBNAILS_DIR / "attention_thumbnail.png")
    },
    "executive": {
        "prompt": "表示计划、组织和执行任务的抽象概念图，使用紫色渐变色调，现代简约风格，干净清晰的线条，无文字",
        "output": str(THUMBNAILS_DIR / "executive_thumbnail.png")
    },
    "language": {
        "prompt": "表示语言理解和交流的抽象概念图，使用黄色渐变色调，现代简约风格，干净清晰的线条，无文字",
        "output": str(THUMBNAILS_DIR / "language_thumbnail.png")
    },
    "logic": {
        "prompt": "表示逻辑思维和解决问题的抽象概念图，使用橙色渐变色调，现代简约风格，干净清晰的线条，无文字",
        "output": str(THUMBNAILS_DIR / "logic_thumbnail.png")
    },
    "emotion": {
        "prompt": "表示情绪识别和管理的抽象概念图，使用红色渐变色调，现代简约风格，干净清晰的线条，无文字",
        "output": str(THUMBNAILS_DIR / "emotion_thumbnail.png")
    }
}

# 练习图片生成提示词
exercises = {
    "family_scene": {
        "prompt": "一个温馨的家庭场景，有老人、年轻夫妇和孩子们在客厅互动，细节丰富，高清逼真风格",
        "output": str(EXERCISES_DIR / "family_scene.png")
    },
    "busy_street": {
        "prompt": "一个繁忙的城市街道场景，有各种行人、车辆和店铺，细节丰富，高清逼真风格",
        "output": str(EXERCISES_DIR / "busy_street.png")
    },
    "park_scene_1": {
        "prompt": "公园场景A：一个美丽的公园，有湖泊、树木、长椅和几个散步的人，细节丰富，高清逼真风格",
        "output": str(EXERCISES_DIR / "park_scene_1.png")
    },
    "park_scene_2": {
        "prompt": "公园场景B：与场景A相同的公园，但有5-7处细微的差异，如少了一个长椅，多了一个人，或某处颜色变化等，细节丰富，高清逼真风格",
        "output": str(EXERCISES_DIR / "park_scene_2.png")
    },
    "happy_face": {
        "prompt": "一个明显表现出快乐情绪的人脸，微笑，眼睛明亮，高清逼真风格",
        "output": str(EXERCISES_DIR / "happy_face.png")
    },
    "sad_face": {
        "prompt": "一个明显表现出悲伤情绪的人脸，眉头紧锁，嘴角下垂，高清逼真风格",
        "output": str(EXERCISES_DIR / "sad_face.png")
    },
    "angry_face": {
        "prompt": "一个明显表现出愤怒情绪的人脸，眉毛紧皱，嘴唇紧闭，高清逼真风格",
        "output": str(EXERCISES_DIR / "angry_face.png")
    },
    "surprised_face": {
        "prompt": "一个明显表现出惊讶情绪的人脸，眼睛睁大，嘴巴张开，高清逼真风格",
        "output": str(EXERCISES_DIR / "surprised_face.png")
    },
    "placeholder": {
        "prompt": "一个简单的占位图片，中央有一个问号图标，简约设计，浅灰色背景",
        "output": str(EXERCISES_DIR / "placeholder.png")
    }
}

def main():
    """主函数"""
    # 创建保存目录
    create_directories()
    
    # 生成缩略图
    print("开始生成缩略图...")
    for key, thumbnail in thumbnails.items():
        generate_image(thumbnail["prompt"], thumbnail["output"])
        time.sleep(1)  # 添加短暂延迟，避免API限流
    
    # 生成练习图片
    print("开始生成练习图片...")
    for key, exercise in exercises.items():
        generate_image(exercise["prompt"], exercise["output"])
        time.sleep(1)  # 添加短暂延迟，避免API限流
    
    print("所有图片生成完成！")

if __name__ == "__main__":
    main() 