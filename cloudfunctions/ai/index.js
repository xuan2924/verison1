// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const { title, theme, content } = event; // 接收前端传来的标题、主题和内容

  // 构建润色提示词
  let prompt = '';
  if (content && content.trim()) {
    // 如果有内容，则进行润色
    prompt = `请润色以下${theme}主题的故事开头，保持原意但使其更加生动有趣：\n\n${content}`;
  } else {
    // 如果没有内容，则根据标题和主题生成开头
    prompt = `请为"${title}"这个${theme}主题的故事生成一个引人入胜的开头段落`;
  }

  try {
    // 调用deepseekService云函数
    const result = await cloud.callFunction({
      name: 'deepseekService',
      data: {
        mode: 'polish',
        content: prompt
      }
    });

    console.log('deepseekService调用结果:', JSON.stringify(result));

    // 检查返回结果结构
    if (result && result.result && result.result.success && result.result.data) {
      // 直接返回润色后的内容
      return {
        success: true,
        polishedContent: result.result.data
      };
    } else {
      console.error('deepseekService返回错误:', result);
      return {
        success: false,
        error: result.result ? result.result.error || '润色服务返回未知错误' : '润色服务调用失败'
      };
    }
  } catch (error) {
    console.error('云函数调用异常:', error);
    return {
      success: false,
      error: error.message || '云函数调用异常'
    };
  }
}
