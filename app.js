// app.js
App({
  globalData: {
    userInfo: null
  },
  
  onLaunch() {
    // 初始化用户信息
    this.initUserInfo()
  },
  onLaunch: function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-1g9uvu9if6c615e0', // 替换为刚才记下的环境ID
        traceUser: true,
      });
    }
  },
  // 同步初始化用户信息
  initUserInfo() {
    try {
      let userInfo = wx.getStorageSync('userInfo')
      if (!userInfo) {
        userInfo = {
          nickName: '创作者' + Math.floor(Math.random() * 1000),
          avatarUrl: ''
        }
        wx.setStorageSync('userInfo', userInfo)
      }
      this.globalData.userInfo = userInfo
    } catch (e) {
      console.error('初始化用户信息失败:', e)
    }
  }
})
