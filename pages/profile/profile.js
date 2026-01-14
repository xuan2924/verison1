// pages/profile/profile.js
// pages/profile/profile.js
Page({
  data: {
    userInfo: null,
    stats: {
      created: 0,
      participating: 0,
      completed: 0,
      likes: 0,
      followers: 0
    }
  },

  onLoad() {
    this.loadUserInfo()
    this.loadStats()
  },

  onShow() {
    this.loadUserInfo()
    this.loadStats()
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp()
    const userInfo = app.globalData.userInfo
    this.setData({ userInfo })
  },

  // 加载统计数据
  loadStats() {
    // 模拟数据
    const stats = {
      created: 3,
      participating: 2,
      completed: 1,
      likes: 24,
      followers: 15
    }
    this.setData({ stats })
  },

  // 编辑资料
  editProfile() {
    wx.showToast({
      title: '编辑资料功能开发中',
      icon: 'none'
    })
  },

  // 导航到页面
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({
        url: url
      })
    }
  },

  // 查看草稿
  viewDrafts() {
    wx.showToast({
      title: '暂无草稿',
      icon: 'none'
    })
  },

  // 查看收藏
  viewFavorites() {
    wx.showToast({
      title: '收藏功能开发中',
      icon: 'none'
    })
  },

  // 查看历史
  viewHistory() {
    wx.showToast({
      title: '浏览历史功能开发中',
      icon: 'none'
    })
  },

  // 显示设置
  showSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    })
  },

  // 意见反馈
  showFeedback() {
    wx.showToast({
      title: '反馈功能开发中',
      icon: 'none'
    })
  },

  // 关于我们
  showAbout() {
    wx.showModal({
      title: '关于故事叠叠乐',
      content: '版本: 1.0.0\n一个有趣的多人故事创作平台，让每个人都能成为创作者！',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 清理缓存
  clearCache() {
    wx.showModal({
      title: '清理缓存',
      content: '确定要清理缓存吗？这将清除本地存储的数据。',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.showToast({
            title: '缓存已清理',
            icon: 'success'
          })
        }
      }
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmColor: '#FF4757',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          wx.removeStorageSync('userInfo')
          getApp().globalData.userInfo = null
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            success: () => {
              setTimeout(() => {
                wx.reLaunch({
                  url: '/pages/discover/discover'
                })
              }, 1500)
            }
          })
        }
      }
    })
  }
})