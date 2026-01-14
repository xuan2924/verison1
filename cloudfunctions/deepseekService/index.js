// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const { mode, content } = event; // 接收前端传来的模式和内容

  // 配置 Prompt
  const systemPrompt = mode === 'polish' 
    ? "你是一个文案润色专家。" 
    : "你是一个写作灵感助手。";

  try {
    const res = await axios.post('https://api.deepseek.com/chat/completions', {
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content }
      ],
      stream: false
    }, {
      headers: {
        'Authorization': 'sk-d08379ac04d0f71a', // 替换成你的Key
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: res.data.choices[0].message.content
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}