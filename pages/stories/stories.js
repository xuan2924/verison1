// pages/stories/stories.js
const storyManager = require('../../utils/storyManager.js')

Page({
  data: {
    stories: [],
    loading: false,
    activeTab: 'local', // local, cloud
    emptyText: {
      local: '暂无本地故事',
      cloud: '暂无云端故事'
    },
    statusText: {
      'waiting': '等待开始',
      'playing': '进行中',
      'completed': '已完成'
    }
  },

  onLoad() {
    this.loadStories()
  },

  onShow() {
    this.loadStories()
  },

  onPullDownRefresh() {
    this.loadStories()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 加载故事列表
  async loadStories() {
    this.setData({ loading: true })

    try {
      if (this.data.activeTab === 'local') {
        // 加载本地故事
        const stories = storyManager.getAllStories()
        this.setData({ stories })
      } else {
        // 加载云端故事
        const res = await wx.cloud.callFunction({
          name: 'saveStory',
          data: {
            action: 'getUserStories'
          }
        })

        if (res.result.success) {
          this.setData({ stories: res.result.stories })
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      }
    } catch (error) {
      console.error('加载故事失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab !== this.data.activeTab) {
      this.setData({ activeTab: tab })
      this.loadStories()
    }
  },

  // 打开故事
  openStory(e) {
    const story = e.currentTarget.dataset.story
    const storyId = story.storyId || story.id

    wx.navigateTo({
      url: `/pages/room/room?storyId=${storyId}`
    })
  },

  // 删除本地故事
  deleteLocalStory(e) {
    const story = e.currentTarget.dataset.story
    const index = e.currentTarget.dataset.index

    wx.showModal({
      title: '确认删除',
      content: '删除后将无法恢复，是否确认？',
      confirmColor: '#FF4757',
      success: (res) => {
        if (res.confirm) {
          storyManager.deleteStory(story.id)

          const stories = [...this.data.stories]
          stories.splice(index, 1)
          this.setData({ stories })

          wx.showToast({
            title: '已删除',
            icon: 'success'
          })
        }
      }
    })
  },

  // 删除云端故事
  async deleteCloudStory(e) {
    const story = e.currentTarget.dataset.story
    const index = e.currentTarget.dataset.index

    wx.showModal({
      title: '确认删除',
      content: '删除后将无法恢复，是否确认？',
      confirmColor: '#FF4757',
      success: async (res) => {
        if (res.confirm) {
          try {
            const res = await wx.cloud.callFunction({
              name: 'saveStory',
              data: {
                action: 'deleteStory',
                storyId: story.storyId
              }
            })

            if (res.result.success) {
              const stories = [...this.data.stories]
              stories.splice(index, 1)
              this.setData({ stories })

              wx.showToast({
                title: '已删除',
                icon: 'success'
              })
            } else {
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('删除云端故事失败:', error)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 保存到云端
  async saveToCloud(e) {
    const story = e.currentTarget.dataset.story

    wx.showLoading({ title: '保存中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'saveStory',
        data: {
          action: 'saveToCloud',
          storyId: story.id,
          storyData: story
        }
      })

      if (res.result.success) {
        wx.showToast({
          title: '已保存到云端',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('保存到云端失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 下载到本地
  async downloadToLocal(e) {
    const story = e.currentTarget.dataset.story

    wx.showLoading({ title: '下载中...' })

    try {
      // 转换数据格式
      const localStory = {
        id: story.storyId,
        title: story.title,
        theme: story.theme,
        creator: story.creator,
        participants: story.participants,
        maxParticipants: story.maxParticipants,
        turns: story.turns,
        currentTurn: story.currentTurn,
        status: story.status,
        createdAt: story.createTime
      }

      // 保存到本地
      storyManager.saveStory(localStory)

      wx.showToast({
        title: '已下载到本地',
        icon: 'success'
      })
    } catch (error) {
      console.error('下载到本地失败:', error)
      wx.showToast({
        title: '下载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  }
})
