// pages/invite/invite.js
const storyManager = require('../../utils/storyManager.js')

Page({
  data: {
    inviteCode: '',
    loading: false,
    story: null,
    showStoryPreview: false,
    generatingCode: false,
    statusText: {
      'waiting': '等待开始',
      'playing': '进行中',
      'completed': '已完成'
    }
  },

  onLoad(options) {
    // 如果通过分享链接进入，可能带有邀请码
    if (options.code) {
      this.setData({ inviteCode: options.code })
      this.verifyInviteCode()
    }
    
    // 如果是从房间页面进入，获取当前房间的故事ID
    const pages = getCurrentPages()
    if (pages.length > 1) {
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.route && prevPage.route.includes('room')) {
        // 从房间页面进入，显示当前房间信息
        const storyId = prevPage.data.storyId
        if (storyId) {
          const story = storyManager.getStoryById(storyId)
          if (story) {
            this.setData({
              story,
              showStoryPreview: true
            })
          }
        }
      }
    }
  },

  // 输入邀请码
  onCodeInput(e) {
    this.setData({
      inviteCode: e.detail.value.toUpperCase()
    })
  },

  // 验证邀请码
  async verifyInviteCode() {
    if (!this.data.inviteCode.trim()) {
      wx.showToast({
        title: '请输入邀请码',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    try {
      // 调用云函数验证邀请码
      const res = await wx.cloud.callFunction({
        name: 'invite',
        data: {
          action: 'verifyInviteCode',
          code: this.data.inviteCode
        }
      })

      if (res.result.success) {
        const storyId = res.result.storyId
        const story = storyManager.getStoryById(storyId)

        if (story) {
          this.setData({
            story,
            showStoryPreview: true
          })
        } else {
          wx.showToast({
            title: '故事不存在',
            icon: 'none'
          })
        }
      } else {
        wx.showToast({
          title: res.result.error || '邀请码无效',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('验证邀请码失败:', error)
      wx.showToast({
        title: '验证失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加入故事
  async joinStory() {
    if (!this.data.story) return

    try {
      const app = getApp()
      const userInfo = app.globalData.userInfo

      // 调用storyManager加入故事
      const success = storyManager.joinStory(this.data.story.id, userInfo)

      if (success) {
        wx.showToast({
          title: '加入成功',
          icon: 'success'
        })

        // 跳转到故事房间
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/room/room?storyId=${this.data.story.id}`
          })
        }, 1500)
      } else {
        wx.showToast({
          title: '加入失败，房间已满',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加入故事失败:', error)
      wx.showToast({
        title: '加入失败，请重试',
        icon: 'none'
      })
    }
  },

  // 关闭预览
  closePreview() {
    this.setData({
      showStoryPreview: false,
      story: null
    })
  },

  // 生成邀请码
  async generateInviteCode() {
    if (!this.data.story || this.data.generatingCode) return
    
    this.setData({ generatingCode: true })
    
    try {
      const app = getApp()
      const userInfo = app.globalData.userInfo
      
      // 调用云函数生成邀请码
      const res = await wx.cloud.callFunction({
        name: 'invite',
        data: {
          action: 'generateInviteCode',
          storyId: this.data.story.id,
          inviterId: userInfo.nickName
        }
      })
      
      if (res.result.success) {
        this.setData({
          inviteCode: res.result.code
        })
        
        wx.showToast({
          title: '邀请码生成成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: res.result.error || '生成失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('生成邀请码失败:', error)
      wx.showToast({
        title: '生成失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ generatingCode: false })
    }
  },

  // 复制邀请码
  copyInviteCode() {
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: () => {
        wx.showToast({
          title: '已复制邀请码',
          icon: 'success'
        })
      }
    })
  },

  // 扫描二维码
  scanQRCode() {
    wx.scanCode({
      success: (res) => {
        // 假设二维码内容为邀请码
        const code = res.result
        if (code && code.length === 6) {
          this.setData({ inviteCode: code })
          this.verifyInviteCode()
        } else {
          wx.showToast({
            title: '无效的二维码',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '扫描失败',
          icon: 'none'
        })
      }
    })
  }
})
