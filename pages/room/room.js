// pages/room/room.js
// pages/room/room.js
const storyManager = require('../../utils/storyManager.js')

Page({
  data: {
    storyId: '',
    story: null,
    isMyTurn: false,
    currentWriter: '',
    userInfo: null,
    likeCount: 0,
    showInviteModal: false,
    statusText: {
      'waiting': '等待开始',
      'playing': '进行中', 
      'completed': '已完成'
    },
    timeLimits: {
      '5分钟': '5分钟',
      '10分钟': '10分钟',
      '30分钟': '30分钟',
      '1小时': '1小时',
      '无限制': '无限制'
    }
  },

  onLoad(options) {
    this.setData({ storyId: options.storyId })
    this.loadUserInfo()
    this.loadStory()
  },

  onShow() {
    this.loadStory()
  },

  onPullDownRefresh() {
    this.loadStory()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  async loadUserInfo() {
    const app = getApp()
    const userInfo = app.globalData.userInfo
    this.setData({ userInfo })
    this.checkTurn()
  },

  loadStory() {
    const story = storyManager.getStoryById(this.data.storyId)
    if (story) {
      // 计算空位
      const emptySlots = Array.from(
        { length: story.maxParticipants - story.participants.length }, 
        (_, i) => i
      )
      
      this.setData({ 
        story: story,
        emptySlots,
        currentWriter: story.participants[story.currentTurn]?.nickName || ''
      })
      this.checkTurn()
    } else {
      wx.showToast({
        title: '故事不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  checkTurn() {
    if (this.data.story && this.data.userInfo) {
      const currentWriter = this.data.story.participants[this.data.story.currentTurn]
      const isMyTurn = currentWriter && currentWriter.nickName === this.data.userInfo.nickName
      this.setData({ 
        isMyTurn,
        currentWriter: currentWriter?.nickName || ''
      })
    }
  },

  // 获取按钮文本
  getButtonText() {
    const { story, isMyTurn } = this.data
    
    if (!story) return '加载中...'
    
    switch (story.status) {
      case 'waiting':
        return '等待开始'
      case 'playing':
        return isMyTurn ? '轮到我了 ✍️' : `等待${this.data.currentWriter}`
      case 'completed':
        return '查看完整故事'
      default:
        return '开始写作'
    }
  },

  // 开始写作
  startWriting() {
    if (this.data.isMyTurn && this.data.story.status === 'playing') {
      wx.navigateTo({
        url: `/pages/write/write?storyId=${this.data.storyId}`
      })
    } else if (this.data.story.status === 'waiting') {
      wx.showToast({
        title: '等待更多参与者',
        icon: 'none'
      })
    } else if (this.data.story.status === 'completed') {
      this.viewCompleteStory()
    }
  },

  // 邀请好友
  inviteFriend() {
    wx.showActionSheet({
      itemList: ['生成邀请二维码', '分享给微信好友'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.generateQRCode()
        } else if (res.tapIndex === 1) {
          this.shareToWeChat()
        }
      }
    })
  },

  // 生成邀请二维码
  async generateQRCode() {
    wx.showLoading({ title: '生成中...' })
    
    try {
      // 调用云函数生成二维码
      const res = await wx.cloud.callFunction({
        name: 'qrcode',
        data: {
          path: `/pages/invite/invite?code=${this.data.inviteCode || this.data.story.id}`
        }
      })
      
      if (res.result.success) {
        // 将二维码保存为临时文件
        const fs = wx.getFileSystemManager()
        const filePath = `${wx.env.USER_DATA_PATH}/invite_qrcode.png`
        
        fs.writeFileSync(filePath, res.result.buffer, 'binary')
        
        // 预览二维码
        wx.previewImage({
          urls: [filePath],
          current: filePath
        })
        
        // 保存到相册
        wx.showModal({
          title: '保存二维码',
          content: '是否保存邀请二维码到相册？',
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.saveImageToPhotosAlbum({
                filePath: filePath,
                success: () => {
                  wx.showToast({
                    title: '已保存到相册',
                    icon: 'success'
                  })
                },
                fail: () => {
                  wx.showToast({
                    title: '保存失败，请检查相册权限',
                    icon: 'none'
                  })
                }
              })
            }
          }
        })
      } else {
        wx.showToast({
          title: '生成失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('生成二维码失败:', error)
      wx.showToast({
        title: '生成失败，请重试',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 分享给微信好友
  shareToWeChat() {
    // 触发分享
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 隐藏邀请弹窗
  hideInviteModal() {
    this.setData({ showInviteModal: false })
  },

  // 复制房间号
  copyRoomCode() {
    wx.setClipboardData({
      data: this.data.story.id,
      success: () => {
        wx.showToast({
          title: '已复制房间ID'
        })
      }
    })
  },

  // 分享给好友
  shareToFriend() {
    wx.showShareMenu({
      withShareTicket: true
    })
    
    wx.showToast({
      title: '已开启分享',
      icon: 'success'
    })
    this.hideInviteModal()
  },

  // 分享房间
  shareRoom() {
    this.setData({ showInviteModal: true })
  },

  // 显示设置
  showSettings() {
    wx.showActionSheet({
      itemList: ['举报故事', '退出故事', '取消'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.reportStory()
        } else if (res.tapIndex === 1) {
          this.leaveStory()
        }
      }
    })
  },

  // 举报故事
  reportStory() {
    wx.showToast({
      title: '已举报',
      icon: 'success'
    })
  },

  // 离开故事
  leaveStory() {
    wx.showModal({
      title: '确认退出',
      content: '退出后将无法继续参与这个故事',
      confirmColor: '#FF4757',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  },

  // 查看故事规则
  viewStoryRules() {
    wx.showModal({
      title: '故事规则',
      content: `1. 按顺序轮流写作\n2. 每轮有${this.data.story.timeLimit}时间\n3. 完成5轮后故事结束\n4. 尊重他人创作，文明用语`,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 查看完整故事
  viewCompleteStory() {
    if (this.data.story.status === 'completed') {
      wx.showModal({
        title: '完整故事',
        content: this.data.story.turns.map(turn => `${turn.user}: ${turn.content}`).join('\n\n'),
        showCancel: false,
        confirmText: '好的'
      })
    }
  },

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60 * 1000) {
      return '刚刚'
    } else if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes}分钟前`
    } else if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000))
      return `${hours}小时前`
    } else {
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: `快来加入我的故事《${this.data.story.title}》`,
      path: `/pages/invite/invite?code=${this.data.inviteCode || this.data.story.id}`,
      imageUrl: '/images/share-cover.jpg'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: `我在创作一个有趣的故事《${this.data.story.title}》，快来一起玩！`,
      query: `code=${this.data.inviteCode || this.data.story.id}`,
      imageUrl: '/images/share-cover.jpg'
    }
  },

  // 保存故事到云端
  async saveStoryToCloud() {
    if (!this.data.story) return
    
    wx.showLoading({ title: '保存中...' })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'saveStory',
        data: {
          action: 'saveToCloud',
          storyId: this.data.story.id,
          storyData: this.data.story
        }
      })
      
      if (res.result.success) {
        wx.showToast({
          title: '已保存到云端',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: res.result.error || '保存失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('保存到云端失败:', error)
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  }
})