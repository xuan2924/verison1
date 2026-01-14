// logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: [],
    userInput: '',
    aiResponse: '',
    isLoading: false
  },
  onLoad() {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return {
          date: util.formatTime(new Date(log)),
          timeStamp: log
        }
      })
    })
  },
  // 输入框内容变化事件
  onInputChange(e) {
    this.setData({
      userInput: e.detail.value
    })
  },
  // 调用AI云函数
  callAI() {
    if (!this.data.userInput.trim()) {
      wx.showToast({
        title: '请输入问题',
        icon: 'none'
      })
      return
    }

    this.setData({ isLoading: true })

    wx.cloud.callFunction({
      name: 'ai',
      data: {
        prompt: this.data.userInput
      },
      success: res => {
        console.log('云函数调用成功', res)
        if (res.result && res.result.reply) {
          this.setData({
            aiResponse: res.result.reply
          })
        } else {
          wx.showToast({
            title: '未获取到有效回复',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('云函数调用失败', err)
        wx.showToast({
          title: '调用失败，请重试',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    })
  }
})
