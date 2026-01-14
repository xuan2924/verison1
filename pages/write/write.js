// pages/write/write.js
// pages/write/write.js
const storyManager = require('../../utils/storyManager.js')

Page({
  data: {
    storyId: '',
    content: '',
    previousTurns: [],
    suggestions: [],
    usedSuggestions: [],
    userInfo: null,
    useAIEnhanced: true,
    gettingSuggestions: false,
    submitting: false,
    showPreviewModal: false,
    previewContent: '',
    estimateReadingTime: 0
  },

  onLoad(options) {
    this.setData({ storyId: options.storyId })
    this.loadUserInfo()
    this.loadStoryContext()
  },

  async loadUserInfo() {
    const app = getApp()
    const userInfo = app.globalData.userInfo
    this.setData({ userInfo })
  },

  loadStoryContext() {
    const story = storyManager.getStoryById(this.data.storyId)
    if (story) {
      this.setData({ previousTurns: story.turns })
    }
  },

  // 内容输入
  onContentInput(e) {
    const content = e.detail.value
    const readingTime = Math.ceil(content.length / 3) // 估算阅读时间
    
    this.setData({ 
      content,
      estimateReadingTime: readingTime
    })
  },

  // 文本区域聚焦
  onTextareaFocus() {
    // 可以添加一些动画效果
  },

  // 文本区域失焦
  onTextareaBlur() {
    // 可以添加一些动画效果
  },

  // 清空内容
  clearContent() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空已写的内容吗？',
      confirmColor: '#FF4757',
      success: (res) => {
        if (res.confirm) {
          this.setData({ content: '' })
        }
      }
    })
  },

  // 切换AI润色
  toggleAIEnhanced() {
    this.setData({ useAIEnhanced: !this.data.useAIEnhanced })
  },

  // 获取AI建议
  async getAISuggestions() {
    if (this.data.gettingSuggestions) return

    this.setData({ gettingSuggestions: true })

    try {
      const story = storyManager.getStoryById(this.data.storyId)
      const storyText = story.turns.map(turn => turn.content).join('\n')
      
      const suggestions = await storyManager.generateSuggestions(storyText)
      
      this.setData({ 
        suggestions,
        usedSuggestions: new Array(suggestions.length).fill(false),
        gettingSuggestions: false
      })
      
      wx.showToast({
        title: 'AI建议已生成',
        icon: 'success'
      })
    } catch (error) {
      this.setData({ gettingSuggestions: false })
      wx.showToast({
        title: '获取建议失败',
        icon: 'none'
      })
    }
  },

  // 使用建议
  useSuggestion(e) {
    const index = e.currentTarget.dataset.index
    const suggestion = this.data.suggestions[index]
    
    if (this.data.usedSuggestions[index]) return

    // 将建议添加到内容中
    const newContent = this.data.content + (this.data.content ? '\n' : '') + suggestion
    this.setData({ 
      content: newContent,
      [`usedSuggestions[${index}]`]: true
    })
  },

  // 计算段落数
  getParagraphCount() {
    if (!this.data.content) return 0
    return this.data.content.split('\n').filter(line => line.trim()).length
  },

  // 预览故事
  previewStory() {
    if (!this.data.content.trim()) {
      wx.showToast({
        title: '请先填写内容',
        icon: 'none'
      })
      return
    }

    this.setData({
      previewContent: this.data.content,
      showPreviewModal: true
    })
  },

  // 隐藏预览模态框
  hidePreviewModal() {
    this.setData({ showPreviewModal: false })
  },

  // 确认提交
  async confirmSubmit() {
    this.hidePreviewModal()
    await this.submitStory()
  },

  // 提交故事
  async submitStory() {
    if (!this.data.content.trim()) {
      wx.showToast({
        title: '请填写内容',
        icon: 'none'
      })
      return
    }

    if (this.data.content.length < 50) {
      wx.showModal({
        title: '内容过短',
        content: '建议至少写50字以上，让故事更精彩！是否确认提交？',
        confirmText: '确认提交',
        cancelText: '继续修改',
        success: (res) => {
          if (!res.confirm) return
          this.doSubmit()
        }
      })
    } else {
      this.doSubmit()
    }
  },

  // 执行提交
  async doSubmit() {
    this.setData({ submitting: true })

    try {
      let finalContent = this.data.content

      // 如果开启了AI润色
      if (this.data.useAIEnhanced) {
        wx.showLoading({ title: 'AI润色中...' })
        finalContent = await storyManager.enhanceWithAI(this.data.content)
        wx.hideLoading()
      }

      // 保存到故事
      const success = storyManager.addStoryTurn(
        this.data.storyId, 
        finalContent, 
        this.data.userInfo
      )

      if (success) {
        wx.showToast({
          title: '提交成功！',
          icon: 'success',
          duration: 2000,
          success: () => {
            setTimeout(() => {
              wx.navigateBack()
            }, 2000)
          }
        })
      } else {
        throw new Error('提交失败')
      }

    } catch (error) {
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 返回
  goBack() {
    if (this.data.content.trim()) {
      wx.showModal({
        title: '确认返回',
        content: '返回后未保存的内容将丢失，是否确认？',
        confirmColor: '#FF4757',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
    } else {
      wx.navigateBack()
    }
  },

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  },

  // 计算属性：是否可以提交
  get canSubmit() {
    return this.data.content.trim().length > 0 && !this.data.submitting
  }
})