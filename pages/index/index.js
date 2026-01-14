// pages/index/index.js
// pages/index/index.js
// pages/index/index.js
const storyManager = require('../../utils/storyManager.js')

Page({
  data: {
    currentCategory: 'all',
    filteredStories: [],
    allStories: [],
    userInfo: null,
    stats: {
      created: 0,
      participating: 0,
      completed: 0
    },
    quickActions: [
      {
        id: 'create',
        icon: '✨',
        title: '创建故事',
        desc: '开启新的创作旅程',
        bgColor: '#FF6B95'
      },
      {
        id: 'join',
        icon: '🔍',
        title: '加入故事',
        desc: '输入ID参与创作',
        bgColor: '#36CFC9'
      },
      {
        id: 'discover',
        icon: '🌍',
        title: '发现故事',
        desc: '浏览热门故事',
        bgColor: '#597EF7'
      }
    ]
  },

  onLoad() {
    this.loadUserInfo()
    this.loadStories()
    this.calculateStats()
  },

  onShow() {
    this.loadStories()
    this.calculateStats()
  },

  // 加载用户信息
  async loadUserInfo() {
    const app = getApp()
    const userInfo = app.globalData.userInfo
    this.setData({ userInfo })
  },

  // 加载故事数据
  loadStories() {
    const stories = storyManager.getUserStories(this.data.userInfo?.nickName || '当前用户')
    
    const formattedStories = stories.map(story => {
      const progress = this.calculateProgress(story)
      const createTime = this.formatTime(story.createdAt)
      const currentWriter = story.participants[story.currentTurn]?.nickName || '等待开始'
      
      return {
        ...story,
        progress,
        createTime,
        currentWriter
      }
    })

    this.setData({ 
      allStories: formattedStories 
    }, () => {
      this.filterStories()
      this.calculateStats()
    })
  },

  // 计算故事进度
  calculateProgress(story) {
    const maxTurns = 5 // 假设5轮完成
    return Math.min(Math.round((story.turns.length / maxTurns) * 100), 100)
  },

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 24 * 60 * 60 * 1000) {
      // 今天
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      // 一周内
      const days = Math.floor(diff / (24 * 60 * 60 * 1000))
      return `${days}天前`
    } else {
      // 更早
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
  },

  // 计算统计数据
  calculateStats() {
    const stories = this.data.allStories
    const stats = {
      created: stories.filter(s => s.creator.nickName === this.data.userInfo?.nickName).length,
      participating: stories.filter(s => s.status === 'playing').length,
      completed: stories.filter(s => s.status === 'completed').length,
      likes: Math.floor(Math.random() * 100) + 20, // 模拟数据
      followers: Math.floor(Math.random() * 50) + 10 // 模拟数据
    }
    this.setData({ stats })
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category }, () => {
      this.filterStories()
    })
  },

  // 过滤故事
  filterStories() {
    const { allStories, currentCategory } = this.data
    
    let filteredStories = allStories
    
    if (currentCategory === 'ongoing') {
      filteredStories = allStories.filter(story => 
        story.status === 'waiting' || story.status === 'playing'
      )
    } else if (currentCategory === 'completed') {
      filteredStories = allStories.filter(story => story.status === 'completed')
    }
    
    this.setData({ filteredStories })
  },

  // 快速操作
  onQuickAction(e) {
    const actionId = e.currentTarget.dataset.id
    
    switch (actionId) {
      case 'create':
        this.createStory()
        break
      case 'join':
        this.joinStory()
        break
      case 'discover':
        this.goToDiscover()
        break
    }
  },

  // 创建新故事
  createStory() {
    wx.navigateTo({
      url: '/pages/create/create'
    })
  },

  // 加入故事
  joinStory() {
    wx.showModal({
      title: '加入故事',
      content: '请输入故事ID',
      editable: true,
      placeholderText: '输入6位故事ID',
      confirmText: '加入',
      success: (res) => {
        if (res.confirm && res.content) {
          this.joinStoryById(res.content.trim())
        }
      }
    })
  },

  // 通过ID加入故事
  joinStoryById(storyId) {
    const success = storyManager.joinStory(storyId, this.data.userInfo)
    if (success) {
      wx.showToast({
        title: '加入成功',
        success: () => {
          setTimeout(() => {
            wx.navigateTo({
              url: `/pages/room/room?storyId=${storyId}`
            })
          }, 1500)
        }
      })
    } else {
      wx.showToast({
        title: '加入失败',
        icon: 'none'
      })
    }
  },

  // 前往发现页
  goToDiscover() {
    wx.switchTab({
      url: '/pages/discover/discover'
    })
  },

  // 进入故事
  enterStory(e) {
    const storyId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/room/room?storyId=${storyId}`
    })
  },

  // 查看统计数据
  viewStats() {
    const { stats } = this.data
    wx.showModal({
      title: '创作统计',
      content: `创作故事: ${stats.created}个\n参与中: ${stats.participating}个\n已完成: ${stats.completed}个\n获得点赞: ${stats.likes}个\n粉丝数量: ${stats.followers}个`,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadStories()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '快来和我一起创作故事吧！',
      path: '/pages/discover/discover'
    }
  }
})
