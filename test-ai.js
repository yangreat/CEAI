const axios = require('axios');

// LLM API configuration - SiliconFlow
const LLM_API_KEY = 'sk-lzvswlngvlsvgadnmptmbbqmqsigmiidkskfszoakxjumkkq';
const LLM_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const LLM_MODEL = 'Pro/deepseek-ai/DeepSeek-V3';

// Test function
async function testAI() {
  console.log('开始测试AI功能...');
  
  try {
    // Prepare message
    const messages = [
      { 
        role: 'system', 
        content: '你是一个认知训练助手，帮助用户提高认知能力。'
      },
      { 
        role: 'user', 
        content: '能给我提供一些提高注意力的方法吗？'
      }
    ];
    
    console.log('发送请求到SiliconFlow API...');
    
    // Call SiliconFlow LLM API
    const response = await axios.post(
      LLM_API_URL,
      {
        model: LLM_MODEL,
        messages,
        stream: false,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        frequency_penalty: 0.5,
        n: 1,
        stop: []
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLM_API_KEY}`
        }
      }
    );
    
    // Extract LLM response
    const llmResponse = response.data.choices[0].message.content;
    
    console.log('\n测试成功！AI回复:\n');
    console.log(llmResponse);
    console.log('\n');
    
  } catch (error) {
    console.error('测试失败:', error);
    if (error.response) {
      console.error('API响应:', error.response.data);
    }
  }
}

// Run the test
testAI(); 