# 通义万相文生图 API 图片生成脚本
# 该脚本使用通义万相文生图API生成认知训练应用所需的图片

# API配置
$apiKey = "sk-dc4c46fb88d44ff69071d14c0df52d7b"
$model = "wanx2.1-t2i-turbo"
$baseUrl = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis"

# 检查并创建保存目录
$thumbnailsDir = "client\web\public\assets\thumbnails"
$exercisesDir = "client\web\public\assets\exercises"

if (-not (Test-Path $thumbnailsDir)) {
    New-Item -ItemType Directory -Path $thumbnailsDir -Force
    Write-Host "创建目录: $thumbnailsDir"
}

if (-not (Test-Path $exercisesDir)) {
    New-Item -ItemType Directory -Path $exercisesDir -Force
    Write-Host "创建目录: $exercisesDir"
}

# 图片生成函数
function Generate-Image {
    param(
        [string]$prompt,
        [string]$outputPath,
        [string]$size = "1024*1024",
        [int]$n = 1
    )
    
    Write-Host "正在生成图片: $prompt"
    
    # 创建API请求正文
    $body = @{
        model = $model
        input = @{
            prompt = $prompt
        }
        parameters = @{
            size = $size
            n = $n
        }
    } | ConvertTo-Json -Depth 10
    
    # 发送API请求创建任务
    $headers = @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type" = "application/json"
        "X-DashScope-Async" = "enable"
    }
    
    $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Headers $headers -Body $body
    $taskId = $response.output.task_id
    
    Write-Host "任务ID: $taskId"
    
    # 检查任务状态
    $statusUrl = "$baseUrl/tasks/$taskId"
    $status = "PENDING"
    
    while ($status -eq "PENDING" -or $status -eq "RUNNING") {
        Start-Sleep -Seconds 3
        
        $statusResponse = Invoke-RestMethod -Uri $statusUrl -Method Get -Headers @{
            "Authorization" = "Bearer $apiKey"
        }
        
        $status = $statusResponse.output.task_status
        Write-Host "任务状态: $status"
    }
    
    if ($status -eq "SUCCEEDED") {
        # 下载生成的图片
        for ($i = 0; $i -lt $statusResponse.output.results.Count; $i++) {
            $imageUrl = $statusResponse.output.results[$i].url
            $fileName = if ($n -eq 1) { $outputPath } else { [System.IO.Path]::Combine([System.IO.Path]::GetDirectoryName($outputPath), [System.IO.Path]::GetFileNameWithoutExtension($outputPath) + "_$i" + [System.IO.Path]::GetExtension($outputPath)) }
            
            Invoke-WebRequest -Uri $imageUrl -OutFile $fileName
            Write-Host "图片已保存: $fileName"
        }
    } else {
        Write-Host "任务失败: $($statusResponse.output.task_status_message)"
    }
}

# 缩略图生成提示词
$thumbnails = @{
    "memory" = @{
        prompt = "一个人物正在记忆数字和图形的抽象概念图，使用蓝色渐变色调，现代简约风格，干净清晰的线条，无文字"
        output = "$thumbnailsDir\memory_thumbnail.png"
    }
    "attention" = @{
        prompt = "一个人在聚精会神专注于任务的抽象概念图，使用绿色渐变色调，现代简约风格，干净清晰的线条，无文字"
        output = "$thumbnailsDir\attention_thumbnail.png"
    }
    "executive" = @{
        prompt = "表示计划、组织和执行任务的抽象概念图，使用紫色渐变色调，现代简约风格，干净清晰的线条，无文字"
        output = "$thumbnailsDir\executive_thumbnail.png"
    }
    "language" = @{
        prompt = "表示语言理解和交流的抽象概念图，使用黄色渐变色调，现代简约风格，干净清晰的线条，无文字"
        output = "$thumbnailsDir\language_thumbnail.png"
    }
    "logic" = @{
        prompt = "表示逻辑思维和解决问题的抽象概念图，使用橙色渐变色调，现代简约风格，干净清晰的线条，无文字"
        output = "$thumbnailsDir\logic_thumbnail.png"
    }
    "emotion" = @{
        prompt = "表示情绪识别和管理的抽象概念图，使用红色渐变色调，现代简约风格，干净清晰的线条，无文字"
        output = "$thumbnailsDir\emotion_thumbnail.png"
    }
}

# 练习图片生成提示词
$exercises = @{
    "family_scene" = @{
        prompt = "一个温馨的家庭场景，有老人、年轻夫妇和孩子们在客厅互动，细节丰富，高清逼真风格"
        output = "$exercisesDir\family_scene.png"
    }
    "busy_street" = @{
        prompt = "一个繁忙的城市街道场景，有各种行人、车辆和店铺，细节丰富，高清逼真风格"
        output = "$exercisesDir\busy_street.png"
    }
    "park_scene_1" = @{
        prompt = "公园场景A：一个美丽的公园，有湖泊、树木、长椅和几个散步的人，细节丰富，高清逼真风格"
        output = "$exercisesDir\park_scene_1.png"
    }
    "park_scene_2" = @{
        prompt = "公园场景B：与场景A相同的公园，但有5-7处细微的差异，如少了一个长椅，多了一个人，或某处颜色变化等，细节丰富，高清逼真风格"
        output = "$exercisesDir\park_scene_2.png"
    }
    "happy_face" = @{
        prompt = "一个明显表现出快乐情绪的人脸，微笑，眼睛明亮，高清逼真风格"
        output = "$exercisesDir\happy_face.png"
    }
    "sad_face" = @{
        prompt = "一个明显表现出悲伤情绪的人脸，眉头紧锁，嘴角下垂，高清逼真风格"
        output = "$exercisesDir\sad_face.png"
    }
    "angry_face" = @{
        prompt = "一个明显表现出愤怒情绪的人脸，眉毛紧皱，嘴唇紧闭，高清逼真风格"
        output = "$exercisesDir\angry_face.png"
    }
    "surprised_face" = @{
        prompt = "一个明显表现出惊讶情绪的人脸，眼睛睁大，嘴巴张开，高清逼真风格"
        output = "$exercisesDir\surprised_face.png"
    }
    "placeholder" = @{
        prompt = "一个简单的占位图片，中央有一个问号图标，简约设计，浅灰色背景"
        output = "$exercisesDir\placeholder.png"
    }
}

# 生成缩略图
Write-Host "开始生成缩略图..."
foreach ($thumbnail in $thumbnails.GetEnumerator()) {
    Generate-Image -prompt $thumbnail.Value.prompt -outputPath $thumbnail.Value.output
}

# 生成练习图片
Write-Host "开始生成练习图片..."
foreach ($exercise in $exercises.GetEnumerator()) {
    Generate-Image -prompt $exercise.Value.prompt -outputPath $exercise.Value.output
}

Write-Host "所有图片生成完成！" 