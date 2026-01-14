// pages/create/create.js
const storyManager = require('../../utils/storyManager.js')

Page({
  data: {
    title: '',
    selectedTheme: '悬疑惊悚',
    themes: ['悬疑惊悚', '浪漫爱情', '科幻未来', '奇幻冒险', '现实生活', '搞笑喜剧'],
    themeIcons: {
      '悬疑惊悚': '🔮',
      '浪漫爱情': '💖',
      '科幻未来': '🚀',
      '奇幻冒险': '🧙‍♂️',
      '现实生活': '🏙️',
      '搞笑喜剧': '😂'
    },
    participants: 3,
    timeLimits: ['5分钟', '10分钟', '30分钟', '1小时', '无限制'],
    timeLimitIndex: 1,
    opening: '',
    openingTemplates: [
      '深夜，我独自走在回家的路上...',
      '当我醒来时，发现自己在一个陌生的地方...',
      '那封信改变了我的一生...',
      '在古老的阁楼里，我发现了一个秘密...',
      '如果时间可以重来，我会...'
    ],
    creating: false,
    canCreate: false
  },

  onLoad() {
    // 页面加载时初始化
  },

  // 标题输入
  onTitleInput(e) {
    const title = e.detail.value
    this.setData({
      title,
      canCreate: title.length > 0
    })
  },

  // 选择主题
  selectTheme(e) {
    const theme = e.currentTarget.dataset.theme
    this.setData({ selectedTheme: theme })
  },

  // 参与人数变化
  onParticipantsChange(e) {
    this.setData({ participants: e.detail.value })
  },

  // 时间限制变化
  onTimeLimitChange(e) {
    this.setData({ timeLimitIndex: parseInt(e.detail.value) })
  },

  // 开头内容输入
  onOpeningInput(e) {
    this.setData({ opening: e.detail.value })
  },

  // 使用模板
  useTemplate(e) {
    const template = e.currentTarget.dataset.template
    this.setData({ opening: template })
  },

  // AI生成开头
  generateOpening() {
    wx.showLoading({
      title: 'AI思考中...',
    })

    // 准备发送给云函数的数据
    const requestData = {
      title: this.data.title,
      theme: this.data.selectedTheme,
      content: this.data.opening
    }

    // 调用云函数润色内容
    wx.cloud.callFunction({
      name: 'ai',
      data: requestData,
      success: res => {
        wx.hideLoading()
        console.log('云函数调用成功，返回数据：', JSON.stringify(res))
        
        // 尝试多种可能的数据结构
        let polishedContent = null;
        
        // 检查标准结构
        if (res.result && res.result.polishedContent) {
          polishedContent = res.result.polishedContent;
        } 
        // 检查直接返回结构
        else if (res.polishedContent) {
          polishedContent = res.polishedContent;
        }
        // 检查是否有数据但没有polishedContent字段
        else if (res.result && res.result.data) {
          polishedContent = res.result.data;
        }
        // 最后检查直接返回的数据
        else if (res.data) {
          polishedContent = res.data;
        }
        
        if (polishedContent) {
          this.setData({ opening: polishedContent })
          wx.showToast({
            title: 'AI润色成功',
            icon: 'success'
          })
        } else {
          console.error('无法解析润色内容，返回数据：', JSON.stringify(res))
          wx.showToast({
            title: '未获取到润色内容',
            icon: 'none'
          })
        }
      },
      fail: err => {
        wx.hideLoading()
        console.error('云函数调用失败', err)

        wx.showToast({
          title: '调用失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  // 创建故事
  async createStory() {
    if (!this.data.canCreate || this.data.creating) {
      return
    }

    if (!this.data.title.trim()) {
      wx.showToast({
        title: '请输入故事标题',
        icon: 'none'
      })
      return
    }
		const app = getApp()
		let userInfo = app.globalData.userInfo
		
		if (!userInfo) {
			// 如果用户信息不存在，尝试重新初始化
			app.initUserInfo()
			userInfo = app.globalData.userInfo
			
			// 如果仍然没有用户信息，使用默认值
			if (!userInfo) {
				userInfo = {
					nickName: '创作者' + Math.floor(Math.random() * 1000),
					avatarUrl: ''
				}
			}
		}
    this.setData({ creating: true })

    try {
      const app = getApp()
      const userInfo = app.globalData.userInfo

      // 准备故事数据
      const storyData = {
        title: this.data.title.trim(),
        theme: this.data.selectedTheme,
        creator: userInfo,
        maxParticipants: this.data.participants,
        timeLimit: this.data.timeLimits[this.data.timeLimitIndex],
        opening: this.data.opening.trim()
      }

      // 创建故事
      const newStory = storyManager.createStory(storyData)

      wx.showToast({
        title: '创建成功',
        icon: 'success',
        success: () => {
          setTimeout(() => {
            this.setData({ creating: false })
            // 跳转到故事房间
            wx.navigateTo({
              url: `/pages/room/room?storyId=${newStory.id}`
            })
          }, 1500)
        }
      })

    } catch (error) {
      this.setData({ creating: false })
      wx.showToast({
        title: '创建失败',
        icon: 'none'
      })
      console.error('创建故事失败:', error)
    }
  },

  // 表单验证
  validateForm() {
    const { title } = this.data
    return title && title.trim().length > 0
  }
})
