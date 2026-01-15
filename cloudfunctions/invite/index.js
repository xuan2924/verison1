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
  const { action, storyId, inviterId } = event

  try {
    switch (action) {
      case 'generateInviteCode': {
        // 生成邀请码
        const code = generateInviteCode()
        const inviteData = {
          code,
          storyId,
          inviterId,
          createTime: new Date(),
          expireTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
          status: 'active' // active, used, expired
        }

        // 存储邀请码到数据库
        await db.collection('invites').add({
          data: inviteData
        })

        return {
          success: true,
          code
        }
      }

      case 'verifyInviteCode': {
        // 验证邀请码
        const { code } = event
        const now = new Date()

        const inviteRecord = await db.collection('invites').where({
          code,
          status: 'active',
          expireTime: _.gt(now)
        }).get()

        if (inviteRecord.data.length === 0) {
          return {
            success: false,
            error: '邀请码无效或已过期'
          }
        }

        const invite = inviteRecord.data[0]

        // 更新邀请码状态为已使用
        await db.collection('invites').doc(invite._id).update({
          data: {
            status: 'used',
            usedBy: wxContext.OPENID,
            usedTime: now
          }
        })

        return {
          success: true,
          storyId: invite.storyId
        }
      }

      case 'getInvitesByStory': {
        // 获取故事的所有邀请记录
        const invites = await db.collection('invites').where({
          storyId,
          status: _.in(['active', 'used'])
        }).orderBy('createTime', 'desc').get()

        return {
          success: true,
          invites: invites.data
        }
      }

      default:
        return {
          success: false,
          error: '未知操作'
        }
    }
  } catch (error) {
    console.error('邀请云函数错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 生成随机邀请码
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
