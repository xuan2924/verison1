// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { path } = event

  try {
    // 获取小程序码
    const result = await cloud.openapi.wxacode.get({
      path: path,
      width: 280
    })

    return {
      success: true,
      buffer: result.buffer
    }
  } catch (error) {
    console.error('获取小程序码失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
