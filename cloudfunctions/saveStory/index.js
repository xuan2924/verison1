// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, storyId, storyData } = event

  try {
    switch (action) {
      case 'saveToCloud': {
        // 保存故事到云端
        if (!storyId || !storyData) {
          return {
            success: false,
            error: '缺少必要参数'
          }
        }

        // 检查是否已存在
        const existingStory = await db.collection('stories').where({
          storyId
        }).get()

        if (existingStory.data.length > 0) {
          // 更新已存在的故事
          await db.collection('stories').doc(existingStory.data[0]._id).update({
            data: {
              ...storyData,
              updateTime: new Date()
            }
          })
        } else {
          // 创建新故事记录
          await db.collection('stories').add({
            data: {
              ...storyData,
              storyId,
              createTime: new Date(),
              updateTime: new Date(),
              _openid: wxContext.OPENID
            }
          })
        }

        return {
          success: true
        }
      }

      case 'getUserStories': {
        // 获取用户的所有故事
        const stories = await db.collection('stories').where({
          _openid: wxContext.OPENID
        }).orderBy('updateTime', 'desc').get()

        return {
          success: true,
          stories: stories.data
        }
      }

      case 'getStoryById': {
        // 根据ID获取故事
        if (!storyId) {
          return {
            success: false,
            error: '缺少故事ID'
          }
        }

        const story = await db.collection('stories').where({
          storyId
        }).get()

        return {
          success: true,
          story: story.data.length > 0 ? story.data[0] : null
        }
      }

      default:
        return {
          success: false,
          error: '未知操作'
        }
    }
  } catch (error) {
    console.error('保存故事云函数错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
